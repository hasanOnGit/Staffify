const express = require("express");
const router = express.Router();
const Shift = require("../models/shift.model");
const Roster = require("../models/roster.model");
const Deployment = require("../models/deployment.model");
const Worker = require("../models/worker.model");
const Client = require("../models/client.model");

// Initial standard shifts if empty
const DEFAULT_SHIFTS = [
  {
    shiftCode: "GS",
    name: "General Shift",
    startTime: "09:00",
    endTime: "18:00",
    fullDayHours: 8.5,
    isNightShift: false,
    nightAllowance: 0,
    color: "#0052CC",
    bgColor: "#DEEBFF",
    textColor: "#0747A6",
    description: "Standard daytime shift for corporate and office staff.",
  },
  {
    shiftCode: "MS",
    name: "Morning Shift (First Shift)",
    startTime: "06:00",
    endTime: "14:00",
    fullDayHours: 8,
    isNightShift: false,
    nightAllowance: 0,
    color: "#00875A",
    bgColor: "#E3FCEF",
    textColor: "#006644",
    description: "Early morning operations and plant production shift.",
  },
  {
    shiftCode: "ES",
    name: "Evening Shift (Second Shift)",
    startTime: "14:00",
    endTime: "22:00",
    fullDayHours: 8,
    isNightShift: false,
    nightAllowance: 0,
    color: "#B9770E",
    bgColor: "#FFF0B3",
    textColor: "#8A5408",
    description: "Afternoon to evening handover and warehouse shift.",
  },
  {
    shiftCode: "NS",
    name: "Night Shift (Third Shift)",
    startTime: "22:00",
    endTime: "06:00",
    fullDayHours: 8,
    isNightShift: true,
    nightAllowance: 250,
    color: "#403294",
    bgColor: "#EAE6FF",
    textColor: "#403294",
    description: "Overnight facility security and 24x7 monitoring.",
  },
  {
    shiftCode: "WO",
    name: "Weekly Off",
    startTime: "00:00",
    endTime: "00:00",
    fullDayHours: 0,
    isNightShift: false,
    nightAllowance: 0,
    color: "#6B778C",
    bgColor: "#EBECF0",
    textColor: "#42526E",
    description: "Mandated statutory rest day.",
  },
];

async function ensureDefaultShifts() {
  const count = await Shift.countDocuments();
  if (count === 0) {
    await Shift.insertMany(DEFAULT_SHIFTS);
  }
}

// GET /api/shifts - List all configured shifts
router.get("/", async (req, res) => {
  try {
    await ensureDefaultShifts();
    const shifts = await Shift.find({ isActive: true }).sort({ startTime: 1 }).lean();
    res.json({ success: true, data: shifts });
  } catch (err) {
    console.error("Error fetching shifts:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/shifts - Create or update a shift
router.post("/", async (req, res) => {
  try {
    const {
      shiftCode,
      name,
      startTime,
      endTime,
      fullDayHours,
      isNightShift,
      nightAllowance,
      color,
      bgColor,
      textColor,
      description,
    } = req.body;

    if (!shiftCode || !name || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Shift code, name, start time, and end time are required.",
      });
    }

    const updated = await Shift.findOneAndUpdate(
      { shiftCode: shiftCode.toUpperCase().trim() },
      {
        shiftCode: shiftCode.toUpperCase().trim(),
        name,
        startTime,
        endTime,
        fullDayHours: Number(fullDayHours) || 8,
        isNightShift: Boolean(isNightShift),
        nightAllowance: Number(nightAllowance) || 0,
        color: color || "#0052CC",
        bgColor: bgColor || "#DEEBFF",
        textColor: textColor || "#0747A6",
        description: description || "",
        isActive: true,
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: "Shift configuration saved.",
      data: updated,
    });
  } catch (err) {
    console.error("Error saving shift:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Helper to get 7 days array from startDate
function getDatesArray(startDateStr) {
  const dates = [];
  const start = new Date(startDateStr);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

// GET /api/shifts/roster - Get weekly roster matrix for site
router.get("/roster", async (req, res) => {
  try {
    await ensureDefaultShifts();
    const vendorId = req.headers["x-vendor-id"] || req.query.vendorId;
    const { startDate, clientId, siteId } = req.query;

    const baseDate = startDate || new Date().toISOString().split("T")[0];
    const dates = getDatesArray(baseDate);

    // Filter active deployments for this site / client
    const depFilter = { status: "Active" };
    if (vendorId && vendorId !== "All") depFilter.vendorId = vendorId;
    if (clientId && clientId !== "All") depFilter.clientId = clientId;
    if (siteId && siteId !== "All") depFilter.siteId = siteId;

    const deployments = await Deployment.find(depFilter).lean();

    // Query roster records for these dates
    const rosterRecords = await Roster.find({
      date: { $in: dates },
    }).lean();

    // Group roster records by workerId -> date -> shiftCode
    const rosterMap = {};
    rosterRecords.forEach((r) => {
      if (!rosterMap[r.workerId]) rosterMap[r.workerId] = {};
      rosterMap[r.workerId][r.date] = r.shiftCode;
    });

    // Build worker matrix rows
    let nightShiftCount = 0;
    let weeklyOffCount = 0;
    let totalAssignments = 0;

    const matrix = deployments.map((dep) => {
      const schedule = {};
      dates.forEach((dateStr, dayIdx) => {
        // default to General Shift or Sunday Weekly Off if not explicitly assigned
        const dayOfWeek = new Date(dateStr).getDay(); // 0 is Sunday
        const existing = rosterMap[dep.workerId]?.[dateStr];
        const assignedShift = existing || (dayOfWeek === 0 ? "WO" : "GS");

        schedule[dateStr] = assignedShift;
        totalAssignments++;
        if (assignedShift === "NS") nightShiftCount++;
        if (assignedShift === "WO") weeklyOffCount++;
      });

      return {
        deploymentId: dep.deploymentId,
        workerId: dep.workerId,
        workerName: dep.workerName,
        designation: dep.designation,
        clientId: dep.clientId,
        clientName: dep.clientName,
        siteId: dep.siteId,
        siteName: dep.siteName,
        schedule,
      };
    });

    const shifts = await Shift.find({ isActive: true }).lean();

    res.json({
      success: true,
      dates,
      shifts,
      data: matrix,
      stats: {
        totalWorkers: matrix.length,
        totalAssignments,
        nightShiftCount,
        weeklyOffCount,
        coverageRate: matrix.length > 0 ? 100 : 0,
      },
    });
  } catch (err) {
    console.error("Error fetching roster matrix:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/shifts/roster/assign - Assign or update a worker's shift
router.post("/roster/assign", async (req, res) => {
  try {
    const { workerId, workerName, clientId, clientName, siteId, siteName, date, shiftCode, notes } =
      req.body;

    if (!workerId || !date || !shiftCode) {
      return res.status(400).json({
        success: false,
        message: "Worker ID, date, and shift code are required.",
      });
    }

    const rosterId = `RST-${workerId}-${date}`;

    const rosterEntry = await Roster.findOneAndUpdate(
      { workerId, date },
      {
        rosterId,
        workerId,
        employeeId: workerId,
        workerName: workerName || "Staff Worker",
        clientId: clientId || "CLI-1002",
        clientName: clientName || "Nexus Tech Park",
        siteId: siteId || "SITE-EC-01",
        siteName: siteName || "E-City Campus Alpha",
        date,
        shiftCode: shiftCode.toUpperCase(),
        notes: notes || "",
        assignedBy: "Site Supervisor",
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `Shift ${shiftCode} assigned to ${workerId} for ${date}`,
      data: rosterEntry,
    });
  } catch (err) {
    console.error("Error assigning shift:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/shifts/roster/bulk-apply - 1-Click apply weekly rotation template
router.post("/roster/bulk-apply", async (req, res) => {
  try {
    const { startDate, clientId, siteId, templateType } = req.body;
    const baseDate = startDate || new Date().toISOString().split("T")[0];
    const dates = getDatesArray(baseDate);

    const depFilter = { status: "Active" };
    if (clientId && clientId !== "All") depFilter.clientId = clientId;
    if (siteId && siteId !== "All") depFilter.siteId = siteId;

    const deployments = await Deployment.find(depFilter).lean();

    if (deployments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No active deployments found for the selected client or site.",
      });
    }

    const ops = [];
    deployments.forEach((dep, index) => {
      dates.forEach((dateStr, dayIdx) => {
        const dayOfWeek = new Date(dateStr).getDay(); // 0 = Sun
        let shiftToAssign = "GS";

        if (templateType === "3_SHIFT_ROTATION") {
          // Evenly rotate workers across MS, ES, NS
          const rotationOffset = (index + Math.floor(dayIdx / 2)) % 3;
          if (rotationOffset === 0) shiftToAssign = "MS";
          else if (rotationOffset === 1) shiftToAssign = "ES";
          else shiftToAssign = "NS";

          // 7th day is weekly off
          if (dayOfWeek === 0) shiftToAssign = "WO";
        } else {
          // Default Standard: Monday-Saturday GS, Sunday WO
          shiftToAssign = dayOfWeek === 0 ? "WO" : "GS";
        }

        const rosterId = `RST-${dep.workerId}-${dateStr}`;

        ops.push({
          updateOne: {
            filter: { workerId: dep.workerId, date: dateStr },
            update: {
              $set: {
                rosterId,
                workerId: dep.workerId,
                employeeId: dep.workerId,
                workerName: dep.workerName,
                clientId: dep.clientId,
                clientName: dep.clientName,
                siteId: dep.siteId,
                siteName: dep.siteName,
                date: dateStr,
                shiftCode: shiftToAssign,
                assignedBy: "Auto-Scheduler Engine",
              },
            },
            upsert: true,
          },
        });
      });
    });

    await Roster.bulkWrite(ops);

    res.json({
      success: true,
      message: `Successfully applied ${templateType || "Standard"} rotation template to ${deployments.length} workers across 7 days.`,
      scheduledCount: ops.length,
    });
  } catch (err) {
    console.error("Error bulk applying shift template:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/shifts/roster/swap - Swap shifts between two workers
router.post("/roster/swap", async (req, res) => {
  try {
    const { worker1Id, worker2Id, date } = req.body;

    if (!worker1Id || !worker2Id || !date) {
      return res.status(400).json({
        success: false,
        message: "Worker 1, Worker 2, and target date are required.",
      });
    }

    const r1 = await Roster.findOne({ workerId: worker1Id, date });
    const r2 = await Roster.findOne({ workerId: worker2Id, date });

    const shift1 = r1 ? r1.shiftCode : "GS";
    const shift2 = r2 ? r2.shiftCode : "GS";

    await Roster.findOneAndUpdate(
      { workerId: worker1Id, date },
      { $set: { shiftCode: shift2, employeeId: worker1Id, notes: `Swapped with ${worker2Id}` } },
      { upsert: true }
    );

    await Roster.findOneAndUpdate(
      { workerId: worker2Id, date },
      { $set: { shiftCode: shift1, employeeId: worker2Id, notes: `Swapped with ${worker1Id}` } },
      { upsert: true }
    );

    res.json({
      success: true,
      message: `Shift swapped successfully for ${date}: ${worker1Id} now on ${shift2}, ${worker2Id} now on ${shift1}.`,
    });
  } catch (err) {
    console.error("Error swapping shifts:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
