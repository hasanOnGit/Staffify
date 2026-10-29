const express = require("express");
const router = express.Router();
const Worker = require("../models/worker.model");
const Deployment = require("../models/deployment.model");

// GET /api/workers - List with trade, bench status & search
router.get("/", async (req, res) => {
  try {
    const { tradeCategory, status, search } = req.query;
    const filter = {};

    if (tradeCategory && tradeCategory !== "All") filter.tradeCategory = tradeCategory;
    if (status && status !== "All") filter.status = status;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { workerId: { $regex: search, $options: "i" } },
        { primarySkill: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { "kycDetails.aadhaarNumber": { $regex: search, $options: "i" } },
      ];
    }

    const workers = await Worker.find(filter).sort({ createdAt: -1 }).lean();

    const total = await Worker.countDocuments();
    const available = await Worker.countDocuments({ status: "Available" });
    const deployed = await Worker.countDocuments({ status: "Deployed" });
    const onLeave = await Worker.countDocuments({ status: "On Leave" });

    res.json({
      success: true,
      data: workers,
      stats: {
        total,
        available,
        deployed,
        onLeave,
      },
    });
  } catch (err) {
    console.error("Error fetching workers:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/workers - Add worker to talent bench
router.post("/", async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      tradeCategory,
      primarySkill,
      experienceYears,
      wagePerDayOrMonth,
      billingUnit,
      kycDetails,
    } = req.body;

    if (!fullName || !phone || !primarySkill || !wagePerDayOrMonth) {
      return res.status(400).json({
        success: false,
        message: "Full name, phone, primary skill, and base wage are required.",
      });
    }

    const count = await Worker.countDocuments();
    const workerId = "WRK-" + String(8100 + count + 1).padStart(4, "0");

    const newWorker = new Worker({
      workerId,
      fullName,
      phone,
      email: email || "",
      tradeCategory: tradeCategory || "General",
      primarySkill,
      experienceYears: Number(experienceYears) || 1,
      wagePerDayOrMonth: Number(wagePerDayOrMonth),
      billingUnit: billingUnit || "Monthly",
      kycDetails: kycDetails || {},
      status: "Available",
    });

    await newWorker.save();

    res.status(201).json({
      success: true,
      message: "Worker enrolled to talent bench successfully.",
      data: newWorker,
    });
  } catch (err) {
    console.error("Error creating worker:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/workers/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await Worker.findOne({
      $or: [{ workerId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }).lean();

    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found." });
    }

    const deploymentHistory = await Deployment.find({
      $or: [{ workerId: worker.workerId }, { workerName: worker.fullName }],
    }).sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      data: {
        ...worker,
        deploymentHistory,
      },
    });
  } catch (err) {
    console.error("Error fetching worker dossier:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/workers/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Worker.findOneAndUpdate(
      { $or: [{ workerId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Worker not found." });
    }

    res.json({
      success: true,
      message: "Worker profile updated.",
      data: updated,
    });
  } catch (err) {
    console.error("Error updating worker:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
