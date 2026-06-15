import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET dashboard summary stats and charts data
router.get('/summary', async (req, res) => {
  try {
    // 1. Fetch KPI raw counts
    const totalVendors = await prisma.vendor.count();
    const activeVendors = await prisma.vendor.count({ where: { status: "Active" } });
    const warningVendors = await prisma.vendor.count({ where: { status: "Warning" } });
    const blacklistedVendors = await prisma.vendor.count({ where: { status: "Blacklisted" } });
    const totalEventsRated = await prisma.rating.count();

    // Average vendor score (of all rated vendors)
    const vendorsWithRatings = await prisma.vendor.findMany({
      where: { totalEvents: { gt: 0 } },
      select: { averageScore: true }
    });

    const averageVendorScore = vendorsWithRatings.length > 0
      ? parseFloat((vendorsWithRatings.reduce((sum, v) => sum + v.averageScore, 0) / vendorsWithRatings.length).toFixed(2))
      : 0.0;

    // Simulated pending reviews count (since we only record completed ratings)
    const pendingReviewsCount = 4;

    // 2. Score distribution chart data
    // Brackets: < 2.5 (Blacklisted), 2.5 - 3.2 (Warning), 3.2 - 4.0 (Monitor), 4.0 - 5.0 (Reliable)
    const scoreDistribution = [
      { name: '< 2.5 (Blacklisted)', count: 0 },
      { name: '2.5 - 3.2 (Warning)', count: 0 },
      { name: '3.2 - 4.0 (Monitor)', count: 0 },
      { name: '4.0 - 5.0 (Reliable)', count: 0 }
    ];

    const allVendors = await prisma.vendor.findMany({ select: { averageScore: true, totalEvents: true } });
    allVendors.forEach(v => {
      if (v.totalEvents === 0) return;
      if (v.averageScore < 2.5) scoreDistribution[0].count++;
      else if (v.averageScore < 3.2) scoreDistribution[1].count++;
      else if (v.averageScore < 4.0) scoreDistribution[2].count++;
      else scoreDistribution[3].count++;
    });

    // 3. Category performance chart data
    const categoryGroup = await prisma.vendor.groupBy({
      by: ['category'],
      _avg: {
        averageScore: true
      },
      _count: {
        id: true
      },
      where: {
        totalEvents: { gt: 0 }
      }
    });

    const categoryPerformance = categoryGroup.map(g => ({
      category: g.category,
      averageScore: parseFloat((g._avg.averageScore || 0).toFixed(2)),
      vendorCount: g._count.id
    })).sort((a, b) => b.averageScore - a.averageScore);

    // 4. Monthly rating activity chart data (last 6 months)
    const ratings = await prisma.rating.findMany({
      select: { eventDate: true }
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyCountsMap = {};

    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthlyCountsMap[key] = 0;
    }

    ratings.forEach(r => {
      const date = new Date(r.eventDate);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (monthlyCountsMap[key] !== undefined) {
        monthlyCountsMap[key]++;
      }
    });

    const monthlyRatingActivity = Object.keys(monthlyCountsMap).map(key => ({
      month: key,
      ratings: monthlyCountsMap[key]
    }));

    // 5. Section Data Lists
    // Top Performing Vendors
    const topPerforming = await prisma.vendor.findMany({
      where: { status: "Active" },
      orderBy: { averageScore: 'desc' },
      take: 5
    });

    // Vendors at Risk (Warning + Blacklisted or low score)
    const atRisk = await prisma.vendor.findMany({
      where: {
        OR: [
          { status: "Warning" },
          { status: "Blacklisted" }
        ]
      },
      orderBy: { averageScore: 'asc' },
      take: 5
    });

    // Recently Rated Events
    const recentlyRated = await prisma.rating.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        vendor: {
          select: { name: true, category: true }
        }
      }
    });

    // Latest Blacklist Alerts
    const latestAlerts = await prisma.statusHistory.findMany({
      where: {
        newStatus: { in: ["Warning", "Blacklisted"] }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        vendor: {
          select: { name: true, category: true }
        }
      }
    });

    res.json({
      kpis: {
        totalVendors,
        activeVendors,
        warningVendors,
        blacklistedVendors,
        averageVendorScore,
        totalEventsRated,
        pendingReviewsCount
      },
      charts: {
        scoreDistribution,
        categoryPerformance,
        monthlyRatingActivity
      },
      topPerforming,
      atRisk,
      recentlyRated,
      latestAlerts
    });

  } catch (error) {
    console.error("GET /api/dashboard/summary error:", error);
    res.status(500).json({ error: "Failed to generate dashboard summary" });
  }
});

export default router;
