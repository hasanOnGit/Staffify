const express = require("express");
const apiRoutes = express.Router();
const Attendance = require("../models/attendance.model");
const newEmployee = require("../models/employees.model");

// Helper to get local YYYY-MM-DD
const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper to format time
const formatTimeStr = (d = new Date()) => {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

module.exports = function (app) {
  /* ==========================================================
     PUNCH IN / PUNCH OUT
     ========================================================== */
  apiRoutes.post("/punch", async (req, res) => {
    try {
      const { employeeId, employeeName, type } = req.body;

      if (!employeeId || !type) {
        return res.status(400).json({ error: "employeeId and type (IN/OUT) are required" });
      }

      const today = getTodayStr();
      const now = new Date();
      const timeStr = formatTimeStr(now);

      let record = await Attendance.findOne({ employeeId, date: today });

      if (!record) {
        record = new Attendance({
          employeeId,
          employeeName: employeeName || "Employee",
          date: today,
          firstIn: type === "IN" ? now : undefined,
          lastOut: type === "OUT" ? now : undefined,
          punches: [],
          status: "Present",
        });
      }

      // Check for late arrival on first IN (after 9:30 AM)
      if (type === "IN" && !record.firstIn) {
        record.firstIn = now;
        const hour = now.getHours();
        const minute = now.getMinutes();
        if (hour > 9 || (hour === 9 && minute > 30)) {
          record.status = "Late";
        }
      }

      if (type === "OUT") {
        record.lastOut = now;
      }

      // Add punch
      record.punches.push({
        time: now,
        timeStr,
        type,
      });

      // Compute total hours
      if (record.punches.length >= 2) {
        let totalMs = 0;
        let lastInTime = null;

        for (const p of record.punches) {
          if (p.type === "IN") {
            lastInTime = new Date(p.time);
          } else if (p.type === "OUT" && lastInTime) {
            totalMs += new Date(p.time) - lastInTime;
            lastInTime = null;
          }
        }

        // If currently still in, add elapsed time till now
        if (lastInTime) {
          totalMs += now - lastInTime;
        }

        const calculatedHours = Number((totalMs / (1000 * 60 * 60)).toFixed(2));
        record.totalHours = calculatedHours;

        if (calculatedHours >= 8) {
          if (record.status !== "Late") record.status = "Present";
        } else if (calculatedHours >= 4) {
          record.status = "Half Day";
        }
      }

      await record.save();

      return res.status(200).json({
        message: `Successfully clocked ${type}`,
        data: record,
      });
    } catch (err) {
      console.error("Attendance punch error:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     GET TODAY'S STATUS FOR EMPLOYEE
     ========================================================== */
  apiRoutes.get("/today", async (req, res) => {
    try {
      const { employeeId } = req.query;
      const today = getTodayStr();

      if (!employeeId) {
        return res.status(400).json({ error: "employeeId is required" });
      }

      const record = await Attendance.findOne({ employeeId, date: today });
      const lastPunch = record?.punches?.length
        ? record.punches[record.punches.length - 1]
        : null;

      const isClockedIn = lastPunch?.type === "IN";

      return res.status(200).json({
        record: record || null,
        isClockedIn,
        lastPunch,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     GET ATTENDANCE RECORDS BY DATE (MANAGER / HR VIEW)
     ========================================================== */
  apiRoutes.get("/", async (req, res) => {
    try {
      const date = req.query.date || getTodayStr();
      const records = await Attendance.find({ date }).sort({ createdAt: -1 });

      return res.status(200).json(records);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     GET EMPLOYEE ATTENDANCE HISTORY (MONTHLY CALENDAR)
     ========================================================== */
  apiRoutes.get("/history", async (req, res) => {
    try {
      const { employeeId, month } = req.query; // month in format "YYYY-MM"
      if (!employeeId) {
        return res.status(400).json({ error: "employeeId is required" });
      }

      const query = { employeeId };
      if (month) {
        query.date = { $regex: `^${month}` };
      }

      const records = await Attendance.find(query).sort({ date: 1 });
      return res.status(200).json(records);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     REQUEST ATTENDANCE REGULARIZATION (FOR MISSED PUNCHES)
     ========================================================== */
  apiRoutes.post("/regularize", async (req, res) => {
    try {
      const { employeeId, date, reason, proposedIn, proposedOut } = req.body;

      if (!employeeId || !date || !reason) {
        return res.status(400).json({ error: "employeeId, date, and reason are required" });
      }

      let record = await Attendance.findOne({ employeeId, date });
      if (!record) {
        record = new Attendance({
          employeeId,
          employeeName: req.body.employeeName || "Employee",
          date,
          status: "Absent",
        });
      }

      record.regularization = {
        requested: true,
        reason,
        proposedIn: proposedIn || "09:00",
        proposedOut: proposedOut || "18:00",
        status: "Pending",
      };

      await record.save();

      return res.status(200).json({
        message: "Regularization request submitted successfully",
        data: record,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     APPROVE / REJECT REGULARIZATION (MANAGER ACTION)
     ========================================================== */
  apiRoutes.post("/approve-regularization", async (req, res) => {
    try {
      const { attendanceId, status, approvedBy } = req.body;

      if (!attendanceId || !status) {
        return res.status(400).json({ error: "attendanceId and status are required" });
      }

      const record = await Attendance.findById(attendanceId);
      if (!record) {
        return res.status(404).json({ error: "Attendance record not found" });
      }

      record.regularization.status = status;
      record.regularization.approvedBy = approvedBy || "Manager";
      record.regularization.reviewedAt = new Date();

      if (status === "Approved") {
        record.status = "Present";
        record.totalHours = 8;
      }

      await record.save();

      return res.status(200).json({
        message: `Regularization request ${status.toLowerCase()}`,
        data: record,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.use("/api/attendance", apiRoutes);
};
