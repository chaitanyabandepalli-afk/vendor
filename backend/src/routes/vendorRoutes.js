import express from 'express';
import { PrismaClient } from '@prisma/client';
import { recalculateVendorStats } from '../services/scoreCalculator.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET all vendors (with optional search, category, status filters and sorting)
router.get('/', async (req, res) => {
  try {
    const { search, category, status, sortBy, sortOrder } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { contactPerson: { contains: search } },
        { email: { contains: search } },
        { location: { contains: search } }
      ];
    }
    if (category) {
      where.category = category;
    }
    if (status) {
      where.status = status;
    }

    let orderBy = { createdAt: 'desc' };
    if (sortBy) {
      const order = sortOrder === 'asc' ? 'asc' : 'desc';
      orderBy = { [sortBy]: order };
    }

    const vendors = await prisma.vendor.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: { ratings: true }
        }
      }
    });

    res.json(vendors);
  } catch (error) {
    console.error("GET /api/vendors error:", error);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});

// GET single vendor detail (including ratings and status histories)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        ratings: {
          orderBy: { eventDate: 'desc' }
        },
        statusHistories: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    res.json(vendor);
  } catch (error) {
    console.error(`GET /api/vendors/${req.params.id} error:`, error);
    res.status(500).json({ error: "Failed to fetch vendor details" });
  }
});

// POST new vendor
router.post('/', async (req, res) => {
  try {
    const { name, category, contactPerson, phone, email, location, businessId, notes, status } = req.body;

    if (!name || !category || !contactPerson || !phone || !email || !location) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const initialStatus = status || "Active";
    const riskLevel = initialStatus === "Blacklisted" ? "High" : (initialStatus === "Warning" ? "Medium" : "Low");

    const vendor = await prisma.vendor.create({
      data: {
        name,
        category,
        contactPerson,
        phone,
        email,
        location,
        businessId: businessId || null,
        notes: notes || null,
        status: initialStatus,
        riskLevel
      }
    });

    // If initial status isn't Active, log in status history
    if (initialStatus !== "Active") {
      await prisma.statusHistory.create({
        data: {
          vendorId: vendor.id,
          oldStatus: "Active",
          newStatus: initialStatus,
          reason: "Manual status set on creation",
          changedBy: "Admin / Onboarding"
        }
      });
    }

    res.status(201).json(vendor);
  } catch (error) {
    console.error("POST /api/vendors error:", error);
    res.status(500).json({ error: "Failed to create vendor" });
  }
});

// PUT update vendor
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, contactPerson, phone, email, location, businessId, notes, status } = req.body;

    const existingVendor = await prisma.vendor.findUnique({ where: { id } });
    if (!existingVendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    const data = {
      name,
      category,
      contactPerson,
      phone,
      email,
      location,
      businessId: businessId !== undefined ? businessId : existingVendor.businessId,
      notes: notes !== undefined ? notes : existingVendor.notes
    };

    if (status && status !== existingVendor.status) {
      data.status = status;
      data.riskLevel = status === "Blacklisted" ? "High" : (status === "Warning" ? "Medium" : "Low");

      // Log status change
      await prisma.statusHistory.create({
        data: {
          vendorId: id,
          oldStatus: existingVendor.status,
          newStatus: status,
          reason: "Manual profile status update",
          changedBy: "Admin / Operator"
        }
      });
    }

    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data
    });

    res.json(updatedVendor);
  } catch (error) {
    console.error(`PUT /api/vendors/${req.params.id} error:`, error);
    res.status(500).json({ error: "Failed to update vendor" });
  }
});

// DELETE vendor
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existingVendor = await prisma.vendor.findUnique({ where: { id } });
    if (!existingVendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    await prisma.vendor.delete({ where: { id } });
    res.json({ message: "Vendor deleted successfully" });
  } catch (error) {
    console.error(`DELETE /api/vendors/${req.params.id} error:`, error);
    res.status(500).json({ error: "Failed to delete vendor" });
  }
});

// PUT manual override vendor status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, changedBy } = req.body;

    if (!status || !reason || !changedBy) {
      return res.status(400).json({ error: "Status, reason, and changedBy are required" });
    }

    const vendor = await prisma.vendor.findUnique({ where: { id } });
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    if (vendor.status === status) {
      return res.status(400).json({ error: `Vendor is already in ${status} status` });
    }

    const riskLevel = status === "Blacklisted" ? "High" : (status === "Warning" ? "Medium" : "Low");

    // Update status and log history
    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data: {
        status,
        riskLevel,
        blacklistReason: status !== "Active" ? reason : null
      }
    });

    await prisma.statusHistory.create({
      data: {
        vendorId: id,
        oldStatus: vendor.status,
        newStatus: status,
        reason,
        changedBy
      }
    });

    res.json(updatedVendor);
  } catch (error) {
    console.error(`PUT /api/vendors/${req.params.id}/status error:`, error);
    res.status(500).json({ error: "Failed to override vendor status" });
  }
});

export default router;
