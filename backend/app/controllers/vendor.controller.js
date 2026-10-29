const express = require("express");
const router = express.Router();
const Vendor = require("../models/vendor.model");
const Contract = require("../models/contract.model");
const Deployment = require("../models/deployment.model");

// GET /api/vendors - List with search, category, status filters & summary stats
router.get("/", async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }
    if (status && status !== "All") {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { legalName: { $regex: search, $options: "i" } },
        { vendorId: { $regex: search, $options: "i" } },
        { spocName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { gstin: { $regex: search, $options: "i" } },
      ];
    }

    const vendors = await Vendor.find(filter).sort({ createdAt: -1 }).lean();

    // Enrich each vendor with contract count and active worker count
    const enrichedVendors = await Promise.all(
      vendors.map(async (v) => {
        const activeContractsCount = await Contract.countDocuments({
          vendorId: v.vendorId,
          status: "Active",
        });
        const activeWorkersCount = await Deployment.countDocuments({
          vendorId: v.vendorId,
          status: "Active",
        });
        return {
          ...v,
          activeContractsCount,
          activeWorkersCount,
        };
      })
    );

    // Summary counts for dashboard KPI chips
    const totalVendors = await Vendor.countDocuments();
    const activeVendors = await Vendor.countDocuments({ status: "Active" });
    const blacklistedVendors = await Vendor.countDocuments({ status: "Blacklisted" });
    const totalWorkers = await Deployment.countDocuments({ status: "Active" });

    res.json({
      success: true,
      data: enrichedVendors,
      stats: {
        total: totalVendors,
        active: activeVendors,
        blacklisted: blacklistedVendors,
        totalActiveWorkers: totalWorkers,
      },
    });
  } catch (err) {
    console.error("Error fetching vendors:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/vendors - Onboard new vendor
router.post("/", async (req, res) => {
  try {
    const {
      legalName,
      gstin,
      pan,
      spocName,
      email,
      phone,
      billingAddress,
      bankDetails,
      category,
      status,
    } = req.body;

    if (!legalName || !gstin || !pan || !spocName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Legal name, GSTIN, PAN, SPOC name, email, and phone are required.",
      });
    }

    // Check duplicate GSTIN or email
    const existing = await Vendor.findOne({
      $or: [{ gstin: gstin.toUpperCase() }, { email: email.toLowerCase() }],
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A vendor with this GSTIN or Email already exists.",
      });
    }

    const vendorCount = await Vendor.countDocuments();
    const vendorId = "VND-" + String(1001 + vendorCount).padStart(4, "0");

    const newVendor = new Vendor({
      vendorId,
      legalName,
      gstin: gstin.toUpperCase(),
      pan: pan.toUpperCase(),
      spocName,
      email: email.toLowerCase(),
      phone,
      billingAddress: billingAddress || {},
      bankDetails: bankDetails || {},
      category: category || "General",
      status: status || "Active",
    });

    await newVendor.save();

    res.status(201).json({
      success: true,
      message: "Vendor onboarded successfully.",
      data: newVendor,
    });
  } catch (err) {
    console.error("Error onboarding vendor:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/vendors/:id - Vendor dossier with contracts & deployments
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findOne({
      $or: [{ vendorId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }).lean();

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found." });
    }

    const contracts = await Contract.find({ vendorId: vendor.vendorId }).lean();
    const deployments = await Deployment.find({ vendorId: vendor.vendorId }).lean();

    res.json({
      success: true,
      data: {
        ...vendor,
        contracts,
        deployments,
      },
    });
  } catch (err) {
    console.error("Error fetching vendor dossier:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/vendors/:id - Update vendor profile
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findOneAndUpdate(
      { $or: [{ vendorId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found." });
    }

    res.json({
      success: true,
      message: "Vendor updated successfully.",
      data: vendor,
    });
  } catch (err) {
    console.error("Error updating vendor:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/vendors/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Vendor.findOneAndDelete({
      $or: [{ vendorId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Vendor not found." });
    }

    res.json({ success: true, message: "Vendor deleted successfully." });
  } catch (err) {
    console.error("Error deleting vendor:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
