const express = require("express");
const apiRoutes = express.Router();
const Leaves = require("../models/leave.model");
const LeaveBalance = require("../models/employeeLeaveBalance.model");

module.exports = function (app) {

  
  apiRoutes.post("/applyLeave", async (req, res) => {
    try {
      const {
        employeeId,
        employeeName,
        leaveType,
        fromDate,
        toDate,
        reason,
      } = req.body;

      const leaveId = "LV-" + Date.now();

      const leave = await Leaves.create({
        leaveId,
        employeeId,
        employeeName,
        leaveType,
        fromDate,
        toDate,
        reason,
        status: "Pending",
      });

      return res.status(201).json({
        message: "Leave applied successfully",
        data: leave,
      });

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

 
  apiRoutes.get("/getLeaves", async (req, res) => {
    try {
      const leaves = await Leaves.find({}).sort({ createdAt: -1 });

      return res.status(200).json({
        message: "Leaves fetched successfully",
        data: leaves,
      });

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  
  apiRoutes.post("/updateLeave", async (req, res) => {
    try {
      const { leaveId, status, approvedBy } = req.body;

      const leave = await Leaves.findOne({ leaveId });

      if (!leave) {
        return res.status(404).json({
          message: "Leave not found",
        });
      }

      // Prevent double approval
      if (leave.status === "Approved") {
        return res.status(400).json({
          message: "Leave already approved",
        });
      }

      leave.status = status;
      leave.approvedBy = approvedBy;
      await leave.save();

      /* 🔥 If Approved → Deduct Balance */
      if (status === "Approved") {

        const from = new Date(leave.fromDate);
        const to = new Date(leave.toDate);

        const diffDays =
          Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

        const year = from.getFullYear();

        const balance = await LeaveBalance.findOne({
          employeeId: leave.employeeId,
          year,
        });

        if (!balance) {
          return res.status(404).json({
            message: "Leave balance record not found",
          });
        }

        const leaveTypeData =
          balance.leaveAllocation[leave.leaveType];

        if (!leaveTypeData) {
          return res.status(400).json({
            message: "Invalid leave type",
          });
        }

        // Check available balance
        if (
          leaveTypeData.used + diffDays >
          leaveTypeData.totalAllocated
        ) {
          return res.status(400).json({
            message: "Insufficient leave balance",
          });
        }

        leaveTypeData.used += diffDays;

        balance.lastUpdated = new Date();
        await balance.save();
      }

      return res.status(200).json({
        message: "Leave updated successfully",
        data: leave,
      });

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  
  apiRoutes.post("/deleteLeave", async (req, res) => {
    try {
      const { leaveId } = req.body;

      const leave = await Leaves.findOneAndDelete({ leaveId });

      if (!leave) {
        return res.status(404).json({
          message: "Leave not found",
        });
      }

      return res.status(200).json({
        message: "Leave deleted successfully",
      });

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });


   apiRoutes.post("/getLeaveBalance", async (req, res) => {
    try {
      const { employeeId } = req.body;

     
      const leavebalane = await LeaveBalance.find({employeeId});

      return res.status(201).json({
        message: "LeaveBalance fetched successfully",
        data: leavebalane,
      });

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.use("/", apiRoutes);
};
