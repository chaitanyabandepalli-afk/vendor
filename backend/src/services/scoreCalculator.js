import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEVERE_ISSUES = ["Last-minute cancellation", "Client complaint", "Damaged items", "Rude behavior"];

/**
 * Recalculates statistics, score, risk level, and status for a given vendor.
 * @param {string} vendorId - The ID of the vendor to recalculate
 * @param {string} changedBy - The actor who initiated the change (e.g. "System Rating Submit", "Admin Override")
 * @returns {Promise<object>} The updated vendor object
 */
export async function recalculateVendorStats(vendorId, changedBy = "System") {
  // 1. Fetch settings from DB or fallback to defaults
  const dbSettings = await prisma.setting.findMany();
  const settings = {};
  dbSettings.forEach(s => {
    settings[s.id] = parseFloat(s.value);
  });

  const blacklistThreshold = settings['blacklist_threshold'] ?? 2.5;
  const warningThreshold = settings['warning_threshold'] ?? 3.2;

  // 2. Fetch the vendor along with their ratings
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: { ratings: true }
  });

  if (!vendor) {
    throw new Error(`Vendor with ID ${vendorId} not found`);
  }

  const ratings = vendor.ratings;
  const count = ratings.length;

  if (count === 0) {
    const oldStatus = vendor.status;
    const newStatus = "Active";
    const riskLevel = "Low";
    
    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        averageScore: 0.0,
        scorePercentage: 0.0,
        totalEvents: 0,
        noRebookCount: 0,
        severeIssueCount: 0,
        status: newStatus,
        riskLevel,
        blacklistReason: null
      }
    });

    if (oldStatus !== newStatus) {
      await prisma.statusHistory.create({
        data: {
          vendorId,
          oldStatus,
          newStatus,
          reason: "All ratings cleared. Resetting to active.",
          changedBy
        }
      });
    }

    return updatedVendor;
  }

  // 3. Compute sums and metrics
  let totalScoreSum = 0;
  let noRebookCount = 0;
  let severeIssueCount = 0;
  let hasCancellation = false;
  let hasComplaint = false;

  ratings.forEach(r => {
    totalScoreSum += r.finalScore;
    if (!r.wouldRebook) {
      noRebookCount++;
    }

    const ratingIssues = r.issues.split(',').map(s => s.trim()).filter(Boolean);
    ratingIssues.forEach(issue => {
      if (SEVERE_ISSUES.includes(issue)) {
        severeIssueCount++;
      }
      if (issue === "Last-minute cancellation") hasCancellation = true;
      if (issue === "Client complaint") hasComplaint = true;
    });
  });

  const averageScore = parseFloat((totalScoreSum / count).toFixed(2));
  const scorePercentage = parseFloat(((averageScore / 5.0) * 100).toFixed(2));

  // 4. Status determination logic based on rules
  let status = "Active";
  let riskLevel = "Low";
  let blacklistReason = null;

  if (averageScore < blacklistThreshold) {
    status = "Blacklisted";
    riskLevel = "High";
    blacklistReason = `Average performance score (${averageScore}) fell below the blacklist threshold of ${blacklistThreshold}.`;
  } else if (hasCancellation && hasComplaint) {
    status = "Blacklisted";
    riskLevel = "High";
    blacklistReason = "Vendor has both a 'Last-minute cancellation' and 'Client complaint' in rating history.";
  } else if (averageScore >= blacklistThreshold && averageScore < warningThreshold) {
    status = "Warning";
    riskLevel = "Medium";
    blacklistReason = `Average performance score (${averageScore}) is in warning range (< ${warningThreshold}).`;
  } else if (severeIssueCount >= 2) {
    status = "Warning";
    riskLevel = "Medium";
    blacklistReason = `Accumulated ${severeIssueCount} severe service issues (cancellation, complaint, damage, rude behavior) in rating history.`;
  } else if (noRebookCount >= 3) {
    status = "Warning";
    riskLevel = "Medium";
    blacklistReason = `Marked as 'Would not rebook' for ${noRebookCount} events.`;
  }

  // Adjust risk level for Active vendors
  if (status === "Active") {
    if (averageScore >= 4.0) {
      riskLevel = "Low";
    } else {
      riskLevel = "Medium"; // Score is between 3.2 and 4.0
    }
  }

  const oldStatus = vendor.status;

  const updatedVendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      averageScore,
      scorePercentage,
      totalEvents: count,
      noRebookCount,
      severeIssueCount,
      status,
      riskLevel,
      blacklistReason
    }
  });

  // 5. Track history if status changes
  if (oldStatus !== status) {
    await prisma.statusHistory.create({
      data: {
        vendorId,
        oldStatus,
        newStatus: status,
        reason: blacklistReason || "Auto-calculated based on rating submission.",
        changedBy
      }
    });
  }

  return updatedVendor;
}

/**
 * Calculates a single rating's score based on weights from settings.
 * @param {object} ratingInput - Contains punctuality, quality, professionalism, costBehavior, communication
 * @returns {Promise<object>} Contains finalScore and scorePercentage
 */
export async function calculateRatingScore(ratingInput) {
  // Load weights from settings table
  const dbSettings = await prisma.setting.findMany();
  const settings = {};
  dbSettings.forEach(s => {
    settings[s.id] = parseFloat(s.value);
  });

  const wPunctuality = settings['weight_punctuality'] ?? 0.25;
  const wQuality = settings['weight_quality'] ?? 0.25;
  const wProfessionalism = settings['weight_professionalism'] ?? 0.20;
  const wCostBehavior = settings['weight_cost_behavior'] ?? 0.15;
  const wCommunication = settings['weight_communication'] ?? 0.15;

  const { punctuality, quality, professionalism, costBehavior, communication } = ratingInput;

  const finalScore = 
    punctuality * wPunctuality +
    quality * wQuality +
    professionalism * wProfessionalism +
    costBehavior * wCostBehavior +
    communication * wCommunication;

  const scorePercentage = (finalScore / 5.0) * 100;

  return {
    finalScore: parseFloat(finalScore.toFixed(2)),
    scorePercentage: parseFloat(scorePercentage.toFixed(2))
  };
}
