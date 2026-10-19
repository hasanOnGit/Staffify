const express = require("express");
const apiRoutes = express.Router();
const Settlement = require("../models/settlement.model");
const Employees = require("../models/employees.model");
const SalaryStructure = require("../models/salaryStructure.model");
const LeaveBalance = require("../models/employeeLeaveBalance.model");
const Asset = require("../models/asset.model");

/**
 * Helper to compute Gratuity and Leave Encashment under Indian Payment of Gratuity Act 1972
 */
function calculateSettlementAmounts(basicSalary, joiningDate, lastWorkingDate, availableEarnedLeaves, noticeShortfallDays) {
  const start = new Date(joiningDate);
  const end = new Date(lastWorkingDate);
  const diffYears = (end - start) / (1000 * 60 * 60 * 24 * 365.25);
  const serviceYears = Math.round(diffYears * 10) / 10;

  // Gratuity: (15 * Last_Drawn_Basic * Years_Of_Service) / 26
  // Eligible if service >= 5 years (or rounded up past 4.8 years)
  const isGratuityEligible = serviceYears >= 4.8;
  const gratuityAmount = isGratuityEligible ? Math.round((15 * basicSalary * Math.round(serviceYears)) / 26) : 0;

  // Leave Encashment: (BasicSalary / 30) * EligibleEarnedLeaves
  const perDayBasic = basicSalary / 30;
  const leaveEncashmentAmount = Math.round(perDayBasic * (availableEarnedLeaves || 0));

  // Notice Shortfall Recovery: (BasicSalary / 30) * shortfallDays
  const noticeShortfallDeduction = Math.round(perDayBasic * (noticeShortfallDays || 0));

  return {
    serviceYears,
    isGratuityEligible,
    gratuityAmount,
    leaveEncashmentAmount,
    noticeShortfallDeduction,
  };
}

module.exports = function (app) {
  /**
   * GET /api/settlements
   * List all employee settlements
   */
  apiRoutes.get("/", async (req, res) => {
    try {
      const settlements = await Settlement.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: settlements });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/settlements/:employeeId
   * Get single settlement dossier
   */
  apiRoutes.get("/:employeeId", async (req, res) => {
    try {
      const settlement = await Settlement.findOne({ employeeId: req.params.employeeId });
      if (!settlement) {
        return res.status(404).json({ error: "Settlement record not found" });
      }
      return res.status(200).json({ success: true, data: settlement });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/settlements/initiate
   * Initiate separation and auto-calculate provisional F&F statement
   */
  apiRoutes.post("/initiate", async (req, res) => {
    try {
      const {
        employeeId,
        resignationDate,
        lastWorkingDate,
        noticePeriodDays = 30,
        servedNoticeDays = 30,
        initiatedBy = "HR Admin",
      } = req.body;

      if (!employeeId || !resignationDate || !lastWorkingDate) {
        return res.status(400).json({ error: "employeeId, resignationDate, and lastWorkingDate are required" });
      }

      const emp = await Employees.findOne({ employeeId });
      if (!emp) {
        return res.status(404).json({ error: "Employee not found in directory" });
      }

      const struct = await SalaryStructure.findOne({ employeeId });
      const annualCtc = struct?.annualCtc || 600000;
      const basicSalary = struct?.breakdown?.basic || Math.round((annualCtc / 12) * 0.45);

      const currentYear = new Date().getFullYear();
      const leaveBal = await LeaveBalance.findOne({ employeeId, year: currentYear });
      const earnedAlloc = leaveBal?.leaveAllocation?.earned || { totalAllocated: 15, used: 0 };
      const availableEl = Math.max(0, earnedAlloc.totalAllocated - earnedAlloc.used);

      // Fetch any assets assigned to this employee
      const assignedAssets = await Asset.find({ allocatedToId: employeeId, status: "Allocated" });
      const assetList = assignedAssets.map((a) => `${a.name || "Asset"} (${a.assetTag})`);

      const shortfallDays = Math.max(0, Number(noticePeriodDays) - Number(servedNoticeDays));
      const joiningDate = emp.joiningDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000 * 2.5);

      const math = calculateSettlementAmounts(basicSalary, joiningDate, lastWorkingDate, availableEl, shortfallDays);

      // Monthly pro-rated salary for current month days worked
      const lDate = new Date(lastWorkingDate);
      const daysWorked = lDate.getDate();
      const proratedBasic = Math.round((basicSalary / 30) * daysWorked);

      const totalEarnings = proratedBasic + math.leaveEncashmentAmount + math.gratuityAmount;
      const totalDeductions = math.noticeShortfallDeduction;
      const netPayable = Math.max(0, totalEarnings - totalDeductions);

      const settlementId = "SETTLE-" + employeeId + "-" + Date.now();

      const settlement = await Settlement.create({
        settlementId,
        employeeId,
        employeeName: emp.name,
        department: emp.department || "Engineering",
        designation: emp.designation || "Software Engineer",
        joiningDate,
        resignationDate: new Date(resignationDate),
        lastWorkingDate: new Date(lastWorkingDate),
        noticePeriodDays: Number(noticePeriodDays),
        servedNoticeDays: Number(servedNoticeDays),
        noticeShortfallDays: shortfallDays,
        settlementStatus: "Clearance_In_Progress",
        clearances: {
          itDepartment: {
            status: assetList.length === 0 ? "Cleared" : "Pending",
            returnedAssets: [],
            remarks: assetList.length > 0 ? `Pending return: ${assetList.join(", ")}` : "No company assets assigned",
          },
          financeDepartment: {
            status: "Pending",
            outstandingAdvances: 0,
            salaryHold: false,
            remarks: "Standard payroll hold pending clearance",
          },
          adminDepartment: {
            status: "Pending",
            accessCardReturned: false,
            idCardReturned: false,
            remarks: "Awaiting ID and biometric keycard return",
          },
          hrDepartment: {
            status: "Pending",
            exitInterviewDone: false,
            resignationAccepted: true,
            remarks: "Exit survey scheduled",
          },
        },
        earnings: {
          payableDaysInMonth: daysWorked,
          proratedBasicSalary: proratedBasic,
          leaveEncashmentDays: availableEl,
          leaveEncashmentAmount: math.leaveEncashmentAmount,
          gratuityEligible: math.isGratuityEligible,
          yearsOfService: math.serviceYears,
          gratuityAmount: math.gratuityAmount,
          bonusOrIncentives: 0,
          totalEarnings,
        },
        deductions: {
          noticeShortfallDeduction: math.noticeShortfallDeduction,
          unreturnedAssetCost: 0,
          pendingLoanOrAdvance: 0,
          tdsDeduction: 0,
          totalDeductions,
        },
        netPayable,
        initiatedBy,
      });

      return res.status(201).json({
        success: true,
        message: "Full & Final Settlement initiated successfully",
        data: settlement,
      });
    } catch (err) {
      console.error("Settlement initiate error:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * PUT /api/settlements/:id/clearance
   * Update departmental NOC clearance (IT, Finance, Admin, HR)
   */
  apiRoutes.put("/:id/clearance", async (req, res) => {
    try {
      const { department, status, remarks, clearedBy, extraData } = req.body;
      const settlement = await Settlement.findOne({
        $or: [{ settlementId: req.params.id }, { _id: req.params.id }],
      });

      if (!settlement) {
        return res.status(404).json({ error: "Settlement record not found" });
      }

      if (department === "it") {
        settlement.clearances.itDepartment.status = status;
        if (remarks) settlement.clearances.itDepartment.remarks = remarks;
        settlement.clearances.itDepartment.clearedBy = clearedBy || "IT Admin";
        settlement.clearances.itDepartment.clearedAt = new Date();
      } else if (department === "finance") {
        settlement.clearances.financeDepartment.status = status;
        if (remarks) settlement.clearances.financeDepartment.remarks = remarks;
        settlement.clearances.financeDepartment.clearedBy = clearedBy || "Finance Lead";
        settlement.clearances.financeDepartment.clearedAt = new Date();
      } else if (department === "admin") {
        settlement.clearances.adminDepartment.status = status;
        if (remarks) settlement.clearances.adminDepartment.remarks = remarks;
        settlement.clearances.adminDepartment.clearedBy = clearedBy || "Admin Manager";
        settlement.clearances.adminDepartment.clearedAt = new Date();
      } else if (department === "hr") {
        settlement.clearances.hrDepartment.status = status;
        if (remarks) settlement.clearances.hrDepartment.remarks = remarks;
        settlement.clearances.hrDepartment.clearedBy = clearedBy || "HR Lead";
        settlement.clearances.hrDepartment.clearedAt = new Date();
      }

      // Check if all clearances are complete
      const cl = settlement.clearances;
      const allCleared =
        cl.itDepartment.status === "Cleared" &&
        cl.financeDepartment.status === "Cleared" &&
        cl.adminDepartment.status === "Cleared" &&
        cl.hrDepartment.status === "Cleared";

      if (allCleared && settlement.settlementStatus === "Clearance_In_Progress") {
        settlement.settlementStatus = "Settled";
      }

      await settlement.save();

      return res.status(200).json({
        success: true,
        message: `${department.toUpperCase()} department clearance updated`,
        data: settlement,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * PUT /api/settlements/:id/finalize
   * Finalize and disburse payment
   */
  apiRoutes.put("/:id/finalize", async (req, res) => {
    try {
      const { paymentMode = "Direct Bank Transfer", transactionRef = "NEFT-" + Date.now() } = req.body;
      const settlement = await Settlement.findOne({
        $or: [{ settlementId: req.params.id }, { _id: req.params.id }],
      });

      if (!settlement) {
        return res.status(404).json({ error: "Settlement record not found" });
      }

      settlement.settlementStatus = "Paid";
      settlement.paymentDetails = {
        mode: paymentMode,
        transactionRef,
        disbursedAt: new Date(),
      };

      await settlement.save();

      return res.status(200).json({
        success: true,
        message: "Full & Final Settlement finalized and marked as Paid",
        data: settlement,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.use("/api/settlements", apiRoutes);
};
