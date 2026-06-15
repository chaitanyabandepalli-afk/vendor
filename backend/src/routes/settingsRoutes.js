import express from 'express';
import { PrismaClient } from '@prisma/client';
import { recalculateVendorStats } from '../services/scoreCalculator.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET all scoring and blacklist settings
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    res.json(settings);
  } catch (error) {
    console.error("GET /api/settings error:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// PUT update scoring settings and optionally trigger recalculation
router.put('/', async (req, res) => {
  try {
    const { settings, triggerRecalculate } = req.body;

    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({ error: "Settings array is required" });
    }

    // Update each setting in a transaction
    await prisma.$transaction(
      settings.map(s =>
        prisma.setting.update({
          where: { id: s.id },
          data: { value: String(s.value) }
        })
      )
    );

    // If triggerRecalculate is true, run recalculations for all vendors
    if (triggerRecalculate) {
      const allVendors = await prisma.vendor.findMany({ select: { id: true } });
      for (const vendor of allVendors) {
        await recalculateVendorStats(vendor.id, "Settings Configuration Change");
      }
    }

    const updatedSettings = await prisma.setting.findMany();
    res.json({
      message: "Settings updated successfully",
      settings: updatedSettings,
      recalculated: !!triggerRecalculate
    });
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;
