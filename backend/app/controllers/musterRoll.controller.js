const express = require("express");
const router = express.Router();
const MusterRoll = require("../models/musterRoll.model");
const Deployment = require("../models/deployment.model");
const Client = require("../models/client.model");

// GET /api/muster-rolls - List muster rolls
router.get("/", async (req, res) => {
  try {
    const { clientId, siteId, month, year } = req.query;
    const filter = {};

    if (clientId && clientId !== "All") filter.clientId = clientId;
    if (siteId && siteId !== "All") filter.siteId = siteId;
    if (month && month !== "All") filter.month = month;
    if (year && year !== "All") filter.year = Number(year);

    const musterRolls = await MusterRoll.find(filter).sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      data: musterRolls,
    });
  } catch (err) {
    console.error("Error fetching muster rolls:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/muster-rolls/generate - Pull active workers at site & generate muster roll
router.post("/generate", async (req, res) => {
  try {
    const { clientId, siteId, month, year } = req.body;

    if (!clientId || !siteId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "Client, site, month, and year are required.",
      });
    }

    const client = await Client.findOne({ clientId });
    const siteObj = client?.sites?.find((s) => s.siteId === siteId);

    // Check if muster roll already exists for this site & month
    const existing = await MusterRoll.findOne({
      clientId,
      siteId,
      month,
      year: Number(year),
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Muster roll for ${siteObj?.siteName || siteId} (${month} ${year}) already exists.`,
      });
    }

    // Pull active deployments for this client & site
    const deployments = await Deployment.find({
      clientId,
      siteId,
      status: "Active",
    }).lean();

    if (deployments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No active worker deployments found at this client site.",
      });
    }

    const standardDays = 26;
    let totalGrossPay = 0;
    let totalDaysBilled = 0;
    let totalOtHours = 0;

    const records = deployments.map((dep) => {
      let normalDailyRate = 0;
      if (dep.billingUnit === "Daily") {
        normalDailyRate = dep.billableRate;
      } else if (dep.billingUnit === "Hourly") {
        normalDailyRate = dep.billableRate * 8;
      } else {
        // Monthly pro-rated over 26 days
        normalDailyRate = Math.round(dep.billableRate / standardDays);
      }

      const otHourlyRate = Math.round((normalDailyRate / 8) * 1.5); // 1.5x OT multiplier
      const totalEarned = normalDailyRate * standardDays;

      totalGrossPay += totalEarned;
      totalDaysBilled += standardDays;

      return {
        workerId: dep.workerId,
        workerName: dep.workerName,
        designation: dep.designation,
        daysPresent: standardDays,
        halfDays: 0,
        lossOfPayDays: 0,
        overtimeHours: 0,
        normalDailyRate,
        otHourlyRate,
        totalEarned,
      };
    });

    const count = await MusterRoll.countDocuments();
    const musterRollId = `MR-${year}-${String(count + 1).padStart(4, "0")}`;

    const newMusterRoll = new MusterRoll({
      musterRollId,
      clientId,
      clientName: client?.legalName || "Client",
      siteId,
      siteName: siteObj?.siteName || siteId,
      month,
      year: Number(year),
      records,
      totalHeadcount: records.length,
      totalDaysBilled,
      totalOtHours,
      totalGrossPay,
      status: "Draft",
    });

    await newMusterRoll.save();

    res.status(201).json({
      success: true,
      message: `Muster roll ${musterRollId} generated with ${records.length} site contractors.`,
      data: newMusterRoll,
    });
  } catch (err) {
    console.error("Error generating muster roll:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/muster-rolls/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const musterRoll = await MusterRoll.findOne({
      $or: [{ musterRollId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }).lean();

    if (!musterRoll) {
      return res.status(404).json({ success: false, message: "Muster roll not found." });
    }

    res.json({ success: true, data: musterRoll });
  } catch (err) {
    console.error("Error fetching muster roll:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/muster-rolls/:id - Update attendance records & recalculate math
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { records, status } = req.body;

    const musterRoll = await MusterRoll.findOne({
      $or: [{ musterRollId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!musterRoll) {
      return res.status(404).json({ success: false, message: "Muster roll not found." });
    }

    if (records) {
      let totalGrossPay = 0;
      let totalDaysBilled = 0;
      let totalOtHours = 0;

      musterRoll.records = records.map((r) => {
        const days = Number(r.daysPresent) || 0;
        const halfDays = Number(r.halfDays) || 0;
        const otHours = Number(r.overtimeHours) || 0;
        const effectiveDays = days + halfDays * 0.5;

        const basePay = Math.round(effectiveDays * r.normalDailyRate);
        const otPay = Math.round(otHours * (r.otHourlyRate || Math.round((r.normalDailyRate / 8) * 1.5)));
        const totalEarned = basePay + otPay;

        totalGrossPay += totalEarned;
        totalDaysBilled += effectiveDays;
        totalOtHours += otHours;

        return {
          ...r,
          daysPresent: days,
          halfDays,
          overtimeHours: otHours,
          totalEarned,
        };
      });

      musterRoll.totalGrossPay = totalGrossPay;
      musterRoll.totalDaysBilled = totalDaysBilled;
      musterRoll.totalOtHours = totalOtHours;
    }

    if (status) musterRoll.status = status;

    await musterRoll.save();

    res.json({
      success: true,
      message: "Muster roll updated with recalculated gross earnings.",
      data: musterRoll,
    });
  } catch (err) {
    console.error("Error updating muster roll:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/muster-rolls/:id/approve - Lock & Approve
router.patch("/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const musterRoll = await MusterRoll.findOneAndUpdate(
      { $or: [{ musterRollId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      {
        $set: {
          status: "Approved",
          approvedBy: "Site Supervisor / Operations Lead",
          approvedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!musterRoll) {
      return res.status(404).json({ success: false, message: "Muster roll not found." });
    }

    res.json({
      success: true,
      message: "Muster roll approved and locked for billing.",
      data: musterRoll,
    });
  } catch (err) {
    console.error("Error approving muster roll:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
