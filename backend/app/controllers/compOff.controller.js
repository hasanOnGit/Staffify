const express = require("express");
const apiRoutes = express.Router();
const CompOffGrant = require("../models/compOffGrant.model");
const LeaveBalance = require("../models/employeeLeaveBalance.model");
const Employees = require("../models/employees.model");
const Attendance = require("../models/attendance.model");

module.exports = function (app) {
  /**
   * POST /api/comp-off/request
   * Employee requests comp-off credit for working on weekend or holiday
   */
  apiRoutes.post("/request", async (req, res) => {
    try {
      const { employeeId, workedDate, hoursWorked = 8, reason } = req.body;
      if (!employeeId || !workedDate || !reason) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const emp = await Employees.findOne({ employeeId });
      const credits = Number(hoursWorked) >= 7 ? 1.0 : 0.5;

      const grant = new CompOffGrant({
        grantId: "COG-" + Date.now().toString().slice(-6),
        employeeId,
        employeeName: emp ? emp.name : "Employee",
        workedDate: new Date(workedDate),
        hoursWorked: Number(hoursWorked),
        creditsGranted: credits,
        reason,
        status: "Pending",
        expiryDate: new Date(new Date(workedDate).getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days
      });

      await grant.save();
      return res.status(201).json({
        success: true,
        message: "Comp-off grant request submitted successfully for manager approval",
        data: grant,
      });
    } catch (err) {
      console.error("Comp-off request error:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/comp-off/my-grants
   */
  apiRoutes.get("/my-grants", async (req, res) => {
    try {
      const { employeeId } = req.query;
      if (!employeeId) return res.status(400).json({ error: "employeeId is required" });

      const grants = await CompOffGrant.find({ employeeId }).sort({ createdAt: -1 });
      const now = new Date();

      // Check expiry status
      const mapped = grants.map((g) => {
        const obj = g.toObject();
        obj.isExpired = obj.status === "Approved" && new Date(obj.expiryDate) < now;
        return obj;
      });

      return res.status(200).json({ success: true, data: mapped });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/comp-off/all
   * Manager / Admin view of all grants
   */
  apiRoutes.get("/all", async (req, res) => {
    try {
      const grants = await CompOffGrant.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: grants });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * PUT /api/comp-off/approve
   * Manager / Admin approves grant and credits leave balance
   */
  apiRoutes.put("/approve", async (req, res) => {
    try {
      const { grantId, approvedBy } = req.body;
      const grant = await CompOffGrant.findOne({ grantId });
      if (!grant) return res.status(404).json({ error: "Grant record not found" });

      if (grant.status === "Approved") {
        return res.status(400).json({ error: "Grant is already approved" });
      }

      grant.status = "Approved";
      grant.approvedBy = approvedBy || "Manager";
      await grant.save();

      // Credit compOff into LeaveBalance
      const currentYear = new Date().getFullYear();
      let balance = await LeaveBalance.findOne({
        employeeId: grant.employeeId,
        year: currentYear,
      });

      if (!balance) {
        balance = new LeaveBalance({
          employeeId: grant.employeeId,
          year: currentYear,
          leaveAllocation: {},
        });
      }

      if (!balance.leaveAllocation.compOff) {
        balance.leaveAllocation.compOff = { totalAllocated: 0, used: 0 };
      }

      balance.leaveAllocation.compOff.totalAllocated += grant.creditsGranted;
      balance.lastUpdated = new Date();
      await balance.save();

      return res.status(200).json({
        success: true,
        message: `Comp-off grant approved! ${grant.creditsGranted} day(s) credited to leave balance.`,
        data: grant,
        balance,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * PUT /api/comp-off/reject
   */
  apiRoutes.put("/reject", async (req, res) => {
    try {
      const { grantId, rejectionReason, approvedBy } = req.body;
      const grant = await CompOffGrant.findOne({ grantId });
      if (!grant) return res.status(404).json({ error: "Grant record not found" });

      grant.status = "Rejected";
      grant.rejectionReason = rejectionReason || "Denied by supervisor";
      grant.approvedBy = approvedBy || "Manager";
      await grant.save();

      return res.status(200).json({
        success: true,
        message: "Comp-off grant request rejected",
        data: grant,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.use("/api/comp-off", apiRoutes);
};
