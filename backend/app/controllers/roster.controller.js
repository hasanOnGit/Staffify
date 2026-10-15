const express = require("express");
const Shift = require("../models/shift.model");
const Roster = require("../models/roster.model");
const ShiftSwap = require("../models/shiftSwap.model");
const Employee = require("../models/employees.model");

const DEFAULT_SHIFTS = [
  {
    shiftCode: "GS",
    name: "General Day Shift",
    startTime: "09:00",
    endTime: "18:00",
    graceMinutes: 15,
    halfDayHours: 4.5,
    fullDayHours: 8.5,
    isNightShift: false,
    color: "#0052CC",
    bgColor: "#DEEBFF",
    textColor: "#0747A6",
    description: "Standard corporate daytime working hours",
  },
  {
    shiftCode: "MS",
    name: "Early Morning Shift",
    startTime: "06:00",
    endTime: "15:00",
    graceMinutes: 15,
    halfDayHours: 4.5,
    fullDayHours: 8.5,
    isNightShift: false,
    color: "#00875A",
    bgColor: "#E3FCEF",
    textColor: "#006644",
    description: "Production and infrastructure early monitoring shift",
  },
  {
    shiftCode: "ES",
    name: "Evening Shift",
    startTime: "14:00",
    endTime: "23:00",
    graceMinutes: 15,
    halfDayHours: 4.5,
    fullDayHours: 8.5,
    isNightShift: false,
    color: "#FF8B00",
    bgColor: "#FFF0B3",
    textColor: "#974F0C",
    description: "Afternoon support and European customer overlap",
  },
  {
    shiftCode: "NS",
    name: "Overnight Night Shift",
    startTime: "22:00",
    endTime: "07:00",
    graceMinutes: 15,
    halfDayHours: 4.5,
    fullDayHours: 8.5,
    isNightShift: true,
    color: "#6554C0",
    bgColor: "#EAE6FF",
    textColor: "#403294",
    description: "24/7 mission critical operations with night allowance",
  },
  {
    shiftCode: "WO",
    name: "Weekly Off / Rest Day",
    startTime: "00:00",
    endTime: "00:00",
    graceMinutes: 0,
    halfDayHours: 0,
    fullDayHours: 0,
    isNightShift: false,
    color: "#6B778C",
    bgColor: "#F4F5F7",
    textColor: "#42526E",
    description: "Mandatory statutory weekly rest day",
  },
];

// Helper to seed shifts if empty
async function ensureDefaultShifts() {
  const count = await Shift.countDocuments();
  if (count === 0) {
    for (const s of DEFAULT_SHIFTS) {
      await Shift.create(s);
    }
  }
}

// Helper to format date YYYY-MM-DD
function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper to get Monday of a date
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

module.exports = function (app) {
  const apiRoutes = express.Router();

  /* ==========================================================
     1. SHIFT DEFINITIONS
     ========================================================== */
  apiRoutes.get("/shifts", async (req, res) => {
    try {
      await ensureDefaultShifts();
      const shifts = await Shift.find({ isActive: true }).sort({ shiftCode: 1 });
      return res.status(200).json({ success: true, data: shifts });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     2. WEEKLY ROSTER MATRIX
     ========================================================== */
  apiRoutes.get("/matrix", async (req, res) => {
    try {
      await ensureDefaultShifts();

      const { startDate, department, squadId } = req.query;

      // Determine Monday of week
      let monday;
      if (startDate) {
        monday = new Date(startDate);
      } else {
        monday = getMonday(new Date());
      }

      // Generate 7 consecutive days
      const days = [];
      const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const datesList = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const ymd = formatDate(d);
        datesList.push(ymd);
        days.push({
          date: ymd,
          dayName: dayLabels[i],
          formatted: `${dayLabels[i]}, ${d.getDate()} ${d.toLocaleString("en-US", {
            month: "short",
          })}`,
          isWeekend: i === 5 || i === 6,
        });
      }

      // Get employees
      const empQuery = { isActive: true };
      if (department && department !== "All") empQuery.department = department;

      const employees = await Employee.find(empQuery).sort({ name: 1 });

      // Fetch existing roster assignments for these 7 dates
      const rosterEntries = await Roster.find({
        date: { $in: datesList },
      });

      // Build mapping: { [employeeId]: { [date]: shiftCode } }
      const rosterMap = {};
      rosterEntries.forEach((r) => {
        if (!rosterMap[r.employeeId]) rosterMap[r.employeeId] = {};
        rosterMap[r.employeeId][r.date] = {
          shiftCode: r.shiftCode,
          notes: r.notes || "",
          assignedBy: r.assignedBy || "",
        };
      });

      // Assemble employee roster rows
      const matrix = employees.map((emp) => {
        const schedule = {};
        datesList.forEach((dt, idx) => {
          if (rosterMap[emp.employeeId] && rosterMap[emp.employeeId][dt]) {
            schedule[dt] = rosterMap[emp.employeeId][dt];
          } else {
            // Default fallback: weekends = WO, weekdays = GS
            const isWeekend = idx === 5 || idx === 6;
            schedule[dt] = {
              shiftCode: isWeekend ? "WO" : "GS",
              isDefault: true,
            };
          }
        });

        return {
          employeeId: emp.employeeId,
          name: emp.name,
          designation: emp.designation,
          department: emp.department,
          avatarUrl: emp.avatarUrl,
          schedule,
        };
      });

      const shifts = await Shift.find({ isActive: true });

      return res.status(200).json({
        success: true,
        data: {
          startDate: datesList[0],
          endDate: datesList[6],
          days,
          matrix,
          shifts,
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     3. SINGLE CELL SHIFT ASSIGNMENT
     ========================================================== */
  apiRoutes.post("/assign", async (req, res) => {
    try {
      const { employeeId, date, shiftCode, notes, assignedBy } = req.body;

      if (!employeeId || !date || !shiftCode) {
        return res
          .status(400)
          .json({ success: false, error: "employeeId, date, and shiftCode are required." });
      }

      const emp = await Employee.findOne({ employeeId });
      const employeeName = emp ? emp.name : "Employee";
      const department = emp ? emp.department : "Engineering";

      const rosterId = `RST-${date.replace(/-/g, "")}-${employeeId}`;

      const updated = await Roster.findOneAndUpdate(
        { employeeId, date },
        {
          rosterId,
          employeeId,
          employeeName,
          department,
          date,
          shiftCode: shiftCode.toUpperCase(),
          notes: notes || "",
          assignedBy: assignedBy || "Manager",
        },
        { upsert: true, returnDocument: "after" }
      );

      return res.status(200).json({
        success: true,
        message: "Shift assigned successfully.",
        data: updated,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     4. BULK SHIFT ASSIGNMENT
     ========================================================== */
  apiRoutes.post("/bulk-assign", async (req, res) => {
    try {
      const {
        employeeIds,
        department,
        startDate,
        endDate,
        shiftCode,
        includeWeekends,
        assignedBy,
      } = req.body;

      if (!startDate || !endDate || !shiftCode) {
        return res
          .status(400)
          .json({ success: false, error: "startDate, endDate, and shiftCode are required." });
      }

      // Resolve targeted employees
      let targetEmployees = [];
      if (employeeIds && employeeIds.length > 0) {
        targetEmployees = await Employee.find({ employeeId: { $in: employeeIds } });
      } else if (department && department !== "All") {
        targetEmployees = await Employee.find({ department, isActive: true });
      } else {
        targetEmployees = await Employee.find({ isActive: true });
      }

      // Generate date range
      const dates = [];
      const curr = new Date(startDate);
      const end = new Date(endDate);

      while (curr <= end) {
        const dayOfWeek = curr.getDay(); // 0 is Sunday, 6 is Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        if (includeWeekends || !isWeekend) {
          dates.push(formatDate(curr));
        }
        curr.setDate(curr.getDate() + 1);
      }

      let totalAssigned = 0;
      for (const emp of targetEmployees) {
        for (const dt of dates) {
          const rosterId = `RST-${dt.replace(/-/g, "")}-${emp.employeeId}`;
          await Roster.findOneAndUpdate(
            { employeeId: emp.employeeId, date: dt },
            {
              rosterId,
              employeeId: emp.employeeId,
              employeeName: emp.name,
              department: emp.department,
              date: dt,
              shiftCode: shiftCode.toUpperCase(),
              assignedBy: assignedBy || "Admin",
            },
            { upsert: true, returnDocument: "after" }
          );
          totalAssigned++;
        }
      }

      return res.status(200).json({
        success: true,
        message: `Bulk roster updated. ${totalAssigned} shift assignments processed across ${targetEmployees.length} staff members.`,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     5. SHIFT SWAP REQUESTS
     ========================================================== */
  apiRoutes.get("/swaps", async (req, res) => {
    try {
      const { employeeId, status } = req.query;
      const query = {};

      if (employeeId) {
        query.$or = [{ requesterId: employeeId }, { peerId: employeeId }];
      }
      if (status && status !== "All") {
        query.status = status;
      }

      const swaps = await ShiftSwap.find(query).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: swaps });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRoutes.post("/swaps", async (req, res) => {
    try {
      const {
        requesterId,
        requesterName,
        requesterDate,
        requesterShift,
        peerId,
        peerName,
        peerDate,
        peerShift,
        reason,
      } = req.body;

      if (!requesterId || !peerId || !requesterDate || !peerDate) {
        return res.status(400).json({
          success: false,
          error: "Requester, peer, and dates are required for shift swap.",
        });
      }

      const swapId = `SWP-${Date.now()}`;
      const newSwap = await ShiftSwap.create({
        swapId,
        requesterId,
        requesterName,
        requesterDate,
        requesterShift: requesterShift || "GS",
        peerId,
        peerName,
        peerDate,
        peerShift: peerShift || "GS",
        reason: reason || "",
        status: "Pending Approval",
      });

      return res.status(201).json({
        success: true,
        message: "Shift swap request submitted for managerial review.",
        data: newSwap,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRoutes.patch("/swaps/:swapId", async (req, res) => {
    try {
      const { swapId } = req.params;
      const { status, reviewedBy, reviewComment } = req.body;

      if (!["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({ success: false, error: "Status must be Approved or Rejected." });
      }

      const swap = await ShiftSwap.findOne({ swapId });
      if (!swap) {
        return res.status(404).json({ success: false, error: "Shift swap request not found." });
      }

      swap.status = status;
      swap.reviewedBy = reviewedBy || "Manager";
      swap.reviewComment = reviewComment || "";
      swap.reviewedAt = new Date();
      await swap.save();

      // If approved, swap roster records
      if (status === "Approved") {
        // Swap requester's shift
        await Roster.findOneAndUpdate(
          { employeeId: swap.requesterId, date: swap.requesterDate },
          {
            shiftCode: swap.peerShift,
            notes: `Swapped with ${swap.peerName} via ${swapId}`,
          },
          { upsert: true }
        );

        // Swap peer's shift
        await Roster.findOneAndUpdate(
          { employeeId: swap.peerId, date: swap.peerDate },
          {
            shiftCode: swap.requesterShift,
            notes: `Swapped with ${swap.requesterName} via ${swapId}`,
          },
          { upsert: true }
        );
      }

      return res.status(200).json({
        success: true,
        message: `Shift swap ${status.toLowerCase()} successfully.`,
        data: swap,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.use("/api/roster", apiRoutes);
};
