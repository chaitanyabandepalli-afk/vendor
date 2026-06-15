import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET vendor recommendations based on category and score parameters
router.get('/', async (req, res) => {
  try {
    const { category, minScore, eventType } = req.query;

    const where = {
      status: "Active" // Only recommend Active/Reliable vendors
    };

    if (category) {
      where.category = category;
    }

    if (minScore) {
      where.averageScore = {
        gte: parseFloat(minScore)
      };
    }

    // Fetch candidate vendors
    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        ratings: {
          select: {
            eventType: true,
            finalScore: true,
            wouldRebook: true
          }
        }
      }
    });

    // Score and rank candidates based on rule-based recommendation logic
    const recommendations = vendors.map(vendor => {
      // Calculate relevance for the eventType if specified
      let eventTypeScore = 0;
      let eventTypeCount = 0;

      if (eventType && vendor.ratings.length > 0) {
        const matchingRatings = vendor.ratings.filter(r => r.eventType === eventType);
        eventTypeCount = matchingRatings.length;
        if (eventTypeCount > 0) {
          const sum = matchingRatings.reduce((s, r) => s + r.finalScore, 0);
          eventTypeScore = parseFloat((sum / eventTypeCount).toFixed(2));
        }
      }

      // Reliability Score: Penalize for no-rebook and severe issues
      const penalty = (vendor.noRebookCount * 0.2) + (vendor.severeIssueCount * 0.4);
      const reliabilityScore = parseFloat(Math.max(0, vendor.averageScore - penalty).toFixed(2));

      return {
        id: vendor.id,
        name: vendor.name,
        category: vendor.category,
        contactPerson: vendor.contactPerson,
        phone: vendor.phone,
        email: vendor.email,
        location: vendor.location,
        averageScore: vendor.averageScore,
        scorePercentage: vendor.scorePercentage,
        riskLevel: vendor.riskLevel,
        totalEvents: vendor.totalEvents,
        severeIssueCount: vendor.severeIssueCount,
        noRebookCount: vendor.noRebookCount,
        eventTypeMatches: eventTypeCount,
        eventTypeAverageScore: eventTypeScore,
        reliabilityScore // Customized ranking score
      };
    });

    // Sort by:
    // 1. Reliability Score (highest first)
    // 2. Average Score (highest first)
    // 3. Event Type Experience (if matches present, higher first)
    // 4. Total Events (higher experience first)
    recommendations.sort((a, b) => {
      if (b.reliabilityScore !== a.reliabilityScore) {
        return b.reliabilityScore - a.reliabilityScore;
      }
      if (b.eventTypeAverageScore !== a.eventTypeAverageScore) {
        return b.eventTypeAverageScore - a.eventTypeAverageScore;
      }
      if (b.averageScore !== a.averageScore) {
        return b.averageScore - a.averageScore;
      }
      return b.totalEvents - a.totalEvents;
    });

    res.json(recommendations);
  } catch (error) {
    console.error("GET /api/recommendations error:", error);
    res.status(500).json({ error: "Failed to load vendor recommendations" });
  }
});

export default router;
