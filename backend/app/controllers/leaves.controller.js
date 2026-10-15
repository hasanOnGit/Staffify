const express = require("express");
const apiRoutes = express.Router();
const Leaves = require("../models/leave.model");
const LeaveBalance = require("../models/employeeLeaveBalance.model");

// Helper to get or initialize yearly balance
const getOrCreateBalance = async (employeeId, year = new Date().getFullYear()) => {
  let balance = await LeaveBalance.findOne({ employeeId, year });
  if (!balance || !balance.leaveAllocation) {
    if (balance) {
      await LeaveBalance.deleteOne({ _id: balance._id });
    }
    balance = await LeaveBalance.create({
      employeeId,
      year,
      leaveAllocation: {
        earned: { totalAllocated: 15, used: 0 },
        casual: { totalAllocated: 12, used: 0 },
        sick: { totalAllocated: 10, used: 0 },
        paid: { totalAllocated: 12, used: 0 },
        halfDay: { totalAllocated: 6, used: 0 },
        maternity: { totalAllocated: 180, used: 0 },
        paternity: { totalAllocated: 15, used: 0 },
        lop: { totalAllocated: 999, used: 0 },
      },
    });
  }
  return balance;
};

// Calculate business days between dates
const calculateDays = (from, to, isHalfDay) => {
  if (isHalfDay) return 0.5;
  const fromD = new Date(from);
  const toD = new Date(to);
  const diffTime = Math.abs(toD - fromD);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 1;
};

module.exports = function (app) {
  /* ==========================================================
     APPLY FOR LEAVE (WITH BALANCE VERIFICATION)
     ========================================================== */
  apiRoutes.post("/applyLeave", async (req, res) => {
    try {
      const {
        employeeId,
        employeeName,
        leaveType,
        isHalfDay,
        halfDaySession,
        fromDate,
        toDate,
        reason,
        contactDetailsDuringLeave,
      } = req.body;

      if (!employeeId || !leaveType || !fromDate || !toDate || !reason) {
        return res.status(400).json({
          error: "Employee ID, leave type, from date, to date, and reason are required.",
        });
      }

      const from = new Date(fromDate);
      const to = new Date(toDate);

      if (from > to) {
        return res.status(400).json({ error: "From date cannot be after To date." });
      }

      const daysCount = calculateDays(from, to, isHalfDay);
      const year = from.getFullYear();

      // Check balance
      const balance = await getOrCreateBalance(employeeId, year);
      const allocation = balance.leaveAllocation[leaveType];

      if (!allocation && leaveType !== "lop") {
        return res.status(400).json({ error: `Invalid leave type: ${leaveType}` });
      }

      if (leaveType !== "lop") {
        const available = allocation.totalAllocated - allocation.used;
        if (daysCount > available) {
          return res.status(400).json({
            error: `Insufficient ${leaveType} leave balance. Available: ${available} days, Requested: ${daysCount} days.`,
          });
        }
      }

      const leaveId = "LV-" + Date.now();

      const leave = await Leaves.create({
        leaveId,
        employeeId,
        employeeName: employeeName || "Employee",
        leaveType,
        isHalfDay: !!isHalfDay,
        halfDaySession: isHalfDay ? halfDaySession || "Session 1 (First Half)" : "None",
        daysCount,
        fromDate: from,
        toDate: to,
        reason,
        contactDetailsDuringLeave,
        status: "Pending",
      });

      return res.status(201).json({
        message: "Leave applied successfully and sent for approval",
        data: leave,
      });
    } catch (error) {
      console.error("Apply leave error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  /* ==========================================================
     GET LEAVES (FILTERABLE BY EMPLOYEE AND STATUS)
     ========================================================== */
  apiRoutes.get("/getLeaves", async (req, res) => {
    try {
      const { employeeId, status } = req.query;
      const filter = {};

      if (employeeId) filter.employeeId = employeeId;
      if (status && status !== "All") filter.status = status;

      const leaves = await Leaves.find(filter).sort({ createdAt: -1 });

      return res.status(200).json({
        message: "Leaves fetched successfully",
        data: leaves,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  /* ==========================================================
     UPDATE LEAVE STATUS (APPROVE / REJECT)
     ========================================================== */
  apiRoutes.post("/updateLeave", async (req, res) => {
    try {
      const { leaveId, status, approvedBy, rejectionReason } = req.body;

      const leave = await Leaves.findOne({ leaveId });
      if (!leave) {
        return res.status(404).json({ message: "Leave request not found." });
      }

      if (leave.status === "Approved") {
        return res.status(400).json({ message: "Leave has already been approved." });
      }
      if (leave.status === "Cancelled") {
        return res.status(400).json({ message: "Cannot modify a cancelled leave request." });
      }

      leave.status = status;
      leave.approvedBy = approvedBy || "Manager";
      if (status === "Rejected" && rejectionReason) {
        leave.rejectionReason = rejectionReason;
      }
      await leave.save();

      // Deduct balance when Approved
      if (status === "Approved") {
        const year = new Date(leave.fromDate).getFullYear();
        const balance = await getOrCreateBalance(leave.employeeId, year);

        if (balance.leaveAllocation[leave.leaveType]) {
          balance.leaveAllocation[leave.leaveType].used += leave.daysCount;
          balance.lastUpdated = new Date();
          await balance.save();
        }
      }

      return res.status(200).json({
        message: `Leave request ${status.toLowerCase()} successfully`,
        data: leave,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  /* ==========================================================
     CANCEL LEAVE (EMPLOYEE WITHDRAWAL)
     ========================================================== */
  apiRoutes.post("/cancelLeave", async (req, res) => {
    try {
      const { leaveId, employeeId } = req.body;

      const leave = await Leaves.findOne({ leaveId });
      if (!leave) {
        return res.status(404).json({ message: "Leave request not found." });
      }

      // If already cancelled
      if (leave.status === "Cancelled") {
        return res.status(400).json({ message: "Leave is already cancelled." });
      }

      const wasApproved = leave.status === "Approved";
      leave.status = "Cancelled";
      await leave.save();

      // If it was already approved, refund the days back to employee quota!
      if (wasApproved) {
        const year = new Date(leave.fromDate).getFullYear();
        const balance = await getOrCreateBalance(leave.employeeId, year);
        if (balance.leaveAllocation[leave.leaveType]) {
          balance.leaveAllocation[leave.leaveType].used = Math.max(
            0,
            balance.leaveAllocation[leave.leaveType].used - leave.daysCount
          );
          balance.lastUpdated = new Date();
          await balance.save();
        }
      }

      return res.status(200).json({
        message: "Leave request cancelled successfully and balance adjusted.",
        data: leave,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  /* ==========================================================
     GET LEAVE BALANCE (AUTO-INITIALIZES IF MISSING)
     ========================================================== */
  const handleGetBalance = async (req, res) => {
    try {
      const employeeId = req.query?.employeeId || req.body?.employeeId;
      const year = Number(req.query?.year || req.body?.year) || new Date().getFullYear();

      if (!employeeId) {
        return res.status(400).json({ error: "employeeId is required" });
      }

      const balance = await getOrCreateBalance(employeeId, year);

      // Structure nicely with remaining counts
      const formatted = {};
      const allocMap = balance?.leaveAllocation || {};
      Object.keys(allocMap).forEach((type) => {
        const alloc = allocMap[type] || { totalAllocated: 0, used: 0 };
        formatted[type] = {
          total: alloc.totalAllocated || 0,
          used: alloc.used || 0,
          available: Math.max(0, (alloc.totalAllocated || 0) - (alloc.used || 0)),
        };
      });

      return res.status(200).json({
        message: "Leave balance fetched successfully",
        year,
        employeeId,
        data: formatted,
        raw: balance,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

  apiRoutes.get("/getLeaveBalance", handleGetBalance);
  apiRoutes.post("/getLeaveBalance", handleGetBalance);

  /* ==========================================================
     TEAM ON LEAVE (TODAY / CURRENT WEEK)
     ========================================================== */
  apiRoutes.get("/team-on-leave", async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const leaves = await Leaves.find({
        status: "Approved",
        fromDate: { $lte: today },
        toDate: { $gte: today },
      }).select("employeeId employeeName leaveType fromDate toDate isHalfDay");

      return res.status(200).json({
        message: "Team members on leave today",
        data: leaves,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.use("/", apiRoutes);
};
