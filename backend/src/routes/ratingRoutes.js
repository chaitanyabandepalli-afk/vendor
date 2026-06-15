import express from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateRatingScore, recalculateVendorStats } from '../services/scoreCalculator.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET all ratings
router.get('/', async (req, res) => {
  try {
    const ratings = await prisma.rating.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        vendor: {
          select: { name: true, category: true }
        }
      }
    });
    res.json(ratings);
  } catch (error) {
    console.error("GET /api/ratings error:", error);
    res.status(500).json({ error: "Failed to fetch ratings" });
  }
});

// GET single rating by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rating = await prisma.rating.findUnique({
      where: { id },
      include: {
        vendor: true
      }
    });

    if (!rating) {
      return res.status(404).json({ error: "Rating not found" });
    }

    res.json(rating);
  } catch (error) {
    console.error(`GET /api/ratings/${req.params.id} error:`, error);
    res.status(500).json({ error: "Failed to fetch rating" });
  }
});

// POST submit new rating
router.post('/', async (req, res) => {
  try {
    const {
      vendorId,
      eventName,
      eventDate,
      eventType,
      clientName,
      venue,
      ratedBy,
      punctuality,
      quality,
      professionalism,
      costBehavior,
      communication,
      wouldRebook,
      issues, // Array or comma-separated string
      feedback,
      adminNotes
    } = req.body;

    // Validation
    if (!vendorId || !eventName || !eventDate || !eventType || !clientName || !venue || !ratedBy) {
      return res.status(400).json({ error: "Missing required general event fields" });
    }

    if (
      punctuality === undefined ||
      quality === undefined ||
      professionalism === undefined ||
      costBehavior === undefined ||
      communication === undefined
    ) {
      return res.status(400).json({ error: "Missing required scores parameters" });
    }

    // Check if vendor exists
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    // Process issues into a comma-separated string if passed as array
    let issuesStr = "";
    if (Array.isArray(issues)) {
      issuesStr = issues.filter(Boolean).join(", ");
    } else if (typeof issues === 'string') {
      issuesStr = issues;
    }

    // Calculate rating score
    const scores = { punctuality, quality, professionalism, costBehavior, communication };
    const { finalScore, scorePercentage } = await calculateRatingScore(scores);

    // Save Rating
    const newRating = await prisma.rating.create({
      data: {
        vendorId,
        eventName,
        eventDate: new Date(eventDate),
        eventType,
        clientName,
        venue,
        ratedBy,
        punctuality: parseInt(punctuality),
        quality: parseInt(quality),
        professionalism: parseInt(professionalism),
        costBehavior: parseInt(costBehavior),
        communication: parseInt(communication),
        finalScore,
        scorePercentage,
        wouldRebook: wouldRebook === true || wouldRebook === "true" || wouldRebook === "Yes",
        issues: issuesStr,
        feedback,
        adminNotes: adminNotes || null
      }
    });

    // Recalculate vendor statistics and update status
    const updatedVendor = await recalculateVendorStats(vendorId, `Rating submit by ${ratedBy}`);

    res.status(201).json({
      rating: newRating,
      vendor: updatedVendor
    });
  } catch (error) {
    console.error("POST /api/ratings error:", error);
    res.status(500).json({ error: "Failed to submit rating and recalculate scores" });
  }
});

// GET ratings by vendor ID
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const ratings = await prisma.rating.findMany({
      where: { vendorId },
      orderBy: { eventDate: 'desc' }
    });
    res.json(ratings);
  } catch (error) {
    console.error(`GET /api/ratings/vendor/${req.params.vendorId} error:`, error);
    res.status(500).json({ error: "Failed to fetch vendor ratings" });
  }
});

export default router;
