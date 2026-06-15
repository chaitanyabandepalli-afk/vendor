import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET vendor performance summary report
router.get('/vendor-summary', async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        _count: {
          select: { ratings: true }
        }
      },
      orderBy: { averageScore: 'desc' }
    });

    const reportData = vendors.map(v => ({
      vendorId: v.id,
      name: v.name,
      category: v.category,
      location: v.location,
      status: v.status,
      riskLevel: v.riskLevel,
      averageScore: v.averageScore,
      scorePercentage: v.scorePercentage,
      totalEvents: v.totalEvents,
      severeIssueCount: v.severeIssueCount,
      noRebookCount: v.noRebookCount,
      rebookPercentage: v.totalEvents > 0
        ? parseFloat((((v.totalEvents - v.noRebookCount) / v.totalEvents) * 100).toFixed(1))
        : 100.0,
      contactPerson: v.contactPerson,
      phone: v.phone,
      email: v.email,
      businessId: v.businessId || 'N/A'
    }));

    res.json(reportData);
  } catch (error) {
    console.error("GET /api/reports/vendor-summary error:", error);
    res.status(500).json({ error: "Failed to generate vendor summary report" });
  }
});

// GET category-wise vendor performance comparison
router.get('/category-performance', async (req, res) => {
  try {
    const categoriesGroup = await prisma.vendor.groupBy({
      by: ['category'],
      _avg: {
        averageScore: true
      },
      _count: {
        id: true
      }
    });

    const ratingsGroup = await prisma.rating.findMany({
      include: {
        vendor: { select: { category: true } }
      }
    });

    // Count ratings per category
    const ratingsCount = {};
    ratingsGroup.forEach(r => {
      const cat = r.vendor.category;
      ratingsCount[cat] = (ratingsCount[cat] || 0) + 1;
    });

    const reportData = categoriesGroup.map(c => ({
      category: c.category,
      vendorCount: c._count.id,
      averageScore: parseFloat((c._avg.averageScore || 0).toFixed(2)),
      scorePercentage: parseFloat(((c._avg.averageScore || 0) / 5.0 * 100).toFixed(2)),
      totalRatings: ratingsCount[c.category] || 0
    })).sort((a, b) => b.averageScore - a.averageScore);

    res.json(reportData);
  } catch (error) {
    console.error("GET /api/reports/category-performance error:", error);
    res.status(500).json({ error: "Failed to generate category performance report" });
  }
});

// GET event-wise vendor rating report
router.get('/event-ratings', async (req, res) => {
  try {
    const ratings = await prisma.rating.findMany({
      include: {
        vendor: {
          select: { name: true, category: true, status: true }
        }
      },
      orderBy: { eventDate: 'desc' }
    });

    const reportData = ratings.map(r => ({
      ratingId: r.id,
      eventName: r.eventName,
      eventDate: r.eventDate,
      eventType: r.eventType,
      clientName: r.clientName,
      venue: r.venue,
      vendorName: r.vendor.name,
      vendorCategory: r.vendor.category,
      ratedBy: r.ratedBy,
      punctuality: r.punctuality,
      quality: r.quality,
      professionalism: r.professionalism,
      costBehavior: r.costBehavior,
      communication: r.communication,
      finalScore: r.finalScore,
      scorePercentage: r.scorePercentage,
      wouldRebook: r.wouldRebook ? "Yes" : "No",
      issues: r.issues || "None",
      feedback: r.feedback,
      adminNotes: r.adminNotes || "N/A"
    }));

    res.json(reportData);
  } catch (error) {
    console.error("GET /api/reports/event-ratings error:", error);
    res.status(500).json({ error: "Failed to generate event ratings report" });
  }
});

export default router;
