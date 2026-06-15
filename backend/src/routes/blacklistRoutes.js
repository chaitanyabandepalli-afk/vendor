import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET all flagged vendors (Warning or Blacklisted)
router.get('/', async (req, res) => {
  try {
    const flaggedVendors = await prisma.vendor.findMany({
      where: {
        status: { in: ["Warning", "Blacklisted"] }
      },
      include: {
        statusHistories: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { ratings: true }
        }
      },
      orderBy: { averageScore: 'asc' }
    });

    // We can also separate them into auto-flagged vs manual overrides by inspecting status histories.
    // An override has a changedBy field that is not "System Setup" or "System Rating Submit" or "Auto-calculated"
    const enriched = flaggedVendors.map(vendor => {
      const lastHistory = vendor.statusHistories[0];
      const isManual = lastHistory && !lastHistory.changedBy.startsWith("System") && !lastHistory.changedBy.startsWith("Auto");
      return {
        ...vendor,
        isManualOverride: isManual,
        lastChangedBy: lastHistory ? lastHistory.changedBy : "System",
        lastChangedAt: lastHistory ? lastHistory.createdAt : vendor.updatedAt
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error("GET /api/blacklist error:", error);
    res.status(500).json({ error: "Failed to fetch blacklist records" });
  }
});

export default router;
