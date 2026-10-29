const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Settlement = require("../models/settlement.model");
const Worker = require("../models/worker.model");
const Loan = require("../models/loan.model");
const Deployment = require("../models/deployment.model");

// Safe ID or settlementId lookup helper
function getQueryByIdOrSettlementId(param) {
  if (mongoose.isValidObjectId(param)) {
    return { $or: [{ _id: param }, { settlementId: param }] };
  }
  return { settlementId: param };
}

// GET /api/settlements - List all exits with statistics
router.get("/", async (req, res) => {
  try {
    const vendorId = req.headers["x-vendor-id"] || req.query.vendorId;
    const { status, search } = req.query;

    const filter = {};
    if (vendorId && vendorId !== "All") filter.vendorId = vendorId;
    if (status && status !== "All") filter.status = status;

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { settlementId: { $regex: q, $options: "i" } },
        { workerId: { $regex: q, $options: "i" } },
        { workerName: { $regex: q, $options: "i" } },
        { clientName: { $regex: q, $options: "i" } },
        { siteName: { $regex: q, $options: "i" } },
      ];
    }

    const settlements = await Settlement.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Aggregated stats
    const allSettlements = await Settlement.find(
      vendorId && vendorId !== "All" ? { vendorId } : {}
    ).lean();

    const pendingClearances = allSettlements.filter(
      (s) => s.status === "Clearance In Progress"
    ).length;

    const readyForPayment = allSettlements.filter(
      (s) => s.status === "Ready for Payment"
    ).length;

    const settledList = allSettlements.filter(
      (s) => s.status === "Settled & Paid"
    );
    const settledCount = settledList.length;
    const totalPaidOut = settledList.reduce(
      (sum, s) => sum + (s.netFinalPayout || 0),
      0
    );

    const pendingAmount = allSettlements
      .filter((s) => s.status !== "Settled & Paid")
      .reduce((sum, s) => sum + (s.netFinalPayout || 0), 0);

    res.json({
      success: true,
      data: settlements,
      stats: {
        pendingClearances,
        readyForPayment,
        settledCount,
        totalPaidOut,
        pendingAmount,
        totalCount: allSettlements.length,
      },
    });
  } catch (err) {
    console.error("Error fetching settlements:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settlements",
      error: err.message,
    });
  }
});

// GET /api/settlements/:id - Get settlement voucher by ID
router.get("/:id", async (req, res) => {
  try {
    const settlement = await Settlement.findOne(
      getQueryByIdOrSettlementId(req.params.id)
    ).lean();

    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: "Settlement record not found",
      });
    }

    // Look up worker phone, trade, and bank details for complete voucher statement
    const worker = await Worker.findOne({ workerId: settlement.workerId }).lean();

    res.json({
      success: true,
      data: {
        ...settlement,
        workerDetails: worker
          ? {
              phone: worker.phone,
              tradeCategory: worker.tradeCategory,
              primarySkill: worker.primarySkill,
              kycDetails: worker.kycDetails,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("Error retrieving settlement voucher:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve settlement voucher",
      error: err.message,
    });
  }
});

// POST /api/settlements - Record worker exit and calculate settlement statement
router.post("/", async (req, res) => {
  try {
    const {
      workerId,
      lastWorkingDate,
      exitReason,
      daysWorkedInExitMonth = 0,
      leaveEncashmentPay = 0,
      bonusOrIncentive = 0,
      unreturnedAssetDeduction = 0,
      otherDeductions = 0,
      notes = "",
      vendorId: inputVendorId,
    } = req.body;

    if (!workerId) {
      return res.status(400).json({
        success: false,
        message: "Worker ID is required to create an exit record",
      });
    }

    const worker = await Worker.findOne({ workerId });
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: `Worker with ID ${workerId} not found`,
      });
    }

    // Check if an unsettled record already exists for this worker
    const existingActive = await Settlement.findOne({
      workerId,
      status: { $in: ["Clearance In Progress", "Ready for Payment"] },
    });
    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: `An exit settlement (${existingActive.settlementId}) is already pending clearance for ${worker.fullName}`,
      });
    }

    const vendorId = inputVendorId || worker.vendorId || "VND-1002";
    const vendorName = worker.vendorName || "Infiniti TechStaffing";
    const clientId = worker.currentDeployment?.clientId || "";
    const clientName = worker.currentDeployment?.clientName || "Direct / Bench";
    const siteId = worker.currentDeployment?.siteId || "";
    const siteName = worker.currentDeployment?.siteName || "Headquarters";

    // Calculate daily rate based on worker wage
    let dailyRate = 650;
    if (worker.billingUnit === "Daily" && worker.wagePerDayOrMonth > 0) {
      dailyRate = worker.wagePerDayOrMonth;
    } else if (worker.billingUnit === "Monthly" && worker.wagePerDayOrMonth > 0) {
      dailyRate = Math.round(worker.wagePerDayOrMonth / 26);
    } else if (worker.wagePerDayOrMonth > 0) {
      dailyRate = Math.round(worker.wagePerDayOrMonth / 26);
    }

    const earnedWages = Math.round(Number(daysWorkedInExitMonth) * dailyRate);
    const totalEarnings =
      earnedWages +
      Number(leaveEncashmentPay || 0) +
      Number(bonusOrIncentive || 0);

    // Fetch active loans to auto-deduct outstanding balance
    const activeLoans = await Loan.find({ workerId, status: "Active" });
    const outstandingAdvanceDeducted = activeLoans.reduce(
      (sum, l) => sum + (l.remainingBalance || 0),
      0
    );

    const totalDeductions =
      outstandingAdvanceDeducted +
      Number(unreturnedAssetDeduction || 0) +
      Number(otherDeductions || 0);

    const netFinalPayout = Math.max(0, totalEarnings - totalDeductions);

    // Generate unique settlement identifier
    const settlementId = `SET-${Date.now().toString().slice(-6)}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    const newSettlement = new Settlement({
      settlementId,
      workerId: worker.workerId,
      employeeId: worker.workerId,
      workerName: worker.fullName,
      vendorId,
      vendorName,
      clientId,
      clientName,
      siteId,
      siteName,
      lastWorkingDate: lastWorkingDate ? new Date(lastWorkingDate) : new Date(),
      exitReason: exitReason || "Tour Completed",
      status: "Clearance In Progress",
      clearances: {
        idCardReturned: false,
        uniformReturned: false,
        toolsEquipmentReturned: false,
        siteSupervisorApproved: false,
        remarks: "",
      },
      earnings: {
        daysWorkedInExitMonth: Number(daysWorkedInExitMonth),
        dailyRate,
        earnedWages,
        leaveEncashmentPay: Number(leaveEncashmentPay || 0),
        bonusOrIncentive: Number(bonusOrIncentive || 0),
        totalEarnings,
      },
      deductions: {
        outstandingAdvanceDeducted,
        unreturnedAssetDeduction: Number(unreturnedAssetDeduction || 0),
        otherDeductions: Number(otherDeductions || 0),
        totalDeductions,
      },
      netFinalPayout,
      paymentDetails: {
        paymentMode: "Direct Bank Transfer",
        transactionRef: "",
      },
      notes: notes || `Exit initiated for ${worker.fullName}`,
    });

    const saved = await newSettlement.save();

    res.status(201).json({
      success: true,
      message: "Worker exit settlement initiated successfully",
      data: saved,
    });
  } catch (err) {
    console.error("Error creating settlement:", err);
    res.status(500).json({
      success: false,
      message: "Failed to initiate exit settlement",
      error: err.message,
    });
  }
});

// PATCH /api/settlements/:id/clearance - Update equipment & access clearances
router.patch("/:id/clearance", async (req, res) => {
  try {
    const {
      idCardReturned,
      uniformReturned,
      toolsEquipmentReturned,
      siteSupervisorApproved,
      remarks,
    } = req.body;

    const settlement = await Settlement.findOne(
      getQueryByIdOrSettlementId(req.params.id)
    );

    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: "Settlement record not found",
      });
    }

    if (settlement.status === "Settled & Paid") {
      return res.status(400).json({
        success: false,
        message: "Cannot modify clearance for an already settled and paid payout",
      });
    }

    if (idCardReturned !== undefined)
      settlement.clearances.idCardReturned = Boolean(idCardReturned);
    if (uniformReturned !== undefined)
      settlement.clearances.uniformReturned = Boolean(uniformReturned);
    if (toolsEquipmentReturned !== undefined)
      settlement.clearances.toolsEquipmentReturned = Boolean(toolsEquipmentReturned);
    if (siteSupervisorApproved !== undefined)
      settlement.clearances.siteSupervisorApproved = Boolean(siteSupervisorApproved);
    if (remarks !== undefined) settlement.clearances.remarks = remarks;

    // Auto-update status: If all 4 clearances are signed off, status becomes "Ready for Payment"
    const allCleared =
      settlement.clearances.idCardReturned &&
      settlement.clearances.uniformReturned &&
      settlement.clearances.toolsEquipmentReturned &&
      settlement.clearances.siteSupervisorApproved;

    if (allCleared) {
      settlement.status = "Ready for Payment";
    } else {
      settlement.status = "Clearance In Progress";
    }

    const updated = await settlement.save();

    res.json({
      success: true,
      message: allCleared
        ? "All clearances verified. Ready for final payout disbursement."
        : "Clearance checklist updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("Error updating clearance:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update clearance checklist",
      error: err.message,
    });
  }
});

// POST /api/settlements/:id/pay - Disburse final payout and close deployments & loans
router.post("/:id/pay", async (req, res) => {
  try {
    const { paymentMode, transactionRef, paidBy, notes } = req.body;

    const settlement = await Settlement.findOne(
      getQueryByIdOrSettlementId(req.params.id)
    );

    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: "Settlement record not found",
      });
    }

    if (settlement.status === "Settled & Paid") {
      return res.status(400).json({
        success: false,
        message: "This settlement has already been disbursed and marked as Settled & Paid",
      });
    }

    const txRef =
      transactionRef && transactionRef.trim()
        ? transactionRef.trim()
        : `TXN-SET-${Date.now().toString().slice(-8)}`;

    settlement.status = "Settled & Paid";
    settlement.paymentDetails = {
      paymentMode: paymentMode || "Direct Bank Transfer",
      transactionRef: txRef,
      paidAt: new Date(),
      paidBy: paidBy || "Finance Accounts",
    };
    if (notes) {
      settlement.notes = settlement.notes
        ? `${settlement.notes} | ${notes}`
        : notes;
    }

    const saved = await settlement.save();

    // 1. Close any active loans if deducted in this settlement
    if (settlement.deductions.outstandingAdvanceDeducted > 0) {
      const activeLoans = await Loan.find({
        workerId: settlement.workerId,
        status: "Active",
      });

      for (const loan of activeLoans) {
        const balanceToClear = loan.remainingBalance || 0;
        loan.status = "Fully Repaid";
        loan.totalRepaid = (loan.totalRepaid || 0) + balanceToClear;
        if (!loan.repaymentHistory) loan.repaymentHistory = [];
        if (balanceToClear > 0) {
          loan.repaymentHistory.push({
            repaymentId: `REP-SET-${Date.now().toString().slice(-6)}`,
            date: new Date(),
            amount: balanceToClear,
            paymentMethod: "Payroll Deduction",
            payrollId: settlement.settlementId,
            remarks: `Deducted upon worker exit settlement ${settlement.settlementId}`,
            recordedBy: paidBy || "Settlement Disbursal",
          });
        }
        loan.remainingBalance = 0;
        await loan.save();
      }
    }

    // 2. Mark active deployments as Completed
    await Deployment.updateMany(
      { workerId: settlement.workerId, status: "Active" },
      {
        $set: {
          status: "Completed",
          endDate: settlement.lastWorkingDate || new Date(),
          notes: `Deployment completed upon exit settlement ${settlement.settlementId}`,
        },
      }
    );

    // 3. Update worker status and clear current deployment
    await Worker.updateOne(
      { workerId: settlement.workerId },
      {
        $set: {
          status:
            settlement.exitReason === "Resignation" ? "Inactive" : "Available",
          currentDeployment: {
            clientId: "",
            clientName: "",
            siteId: "",
            siteName: "",
            poNumber: "",
            contractId: "",
            billableRate: 0,
            startDate: null,
          },
        },
      }
    );

    res.json({
      success: true,
      message: `Final payout of ₹${settlement.netFinalPayout.toLocaleString(
        "en-IN"
      )} recorded and disbursed successfully.`,
      data: saved,
    });
  } catch (err) {
    console.error("Error processing settlement payout:", err);
    res.status(500).json({
      success: false,
      message: "Failed to process settlement payout",
      error: err.message,
    });
  }
});

module.exports = router;
