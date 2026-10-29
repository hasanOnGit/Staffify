const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Loan = require("../models/loan.model");
const Worker = require("../models/worker.model");

// Safe ID or loanId lookup helper
function getQueryByIdOrLoanId(param) {
  if (mongoose.isValidObjectId(param)) {
    return { $or: [{ _id: param }, { loanId: param }] };
  }
  return { loanId: param };
}

// GET /api/loans - List all advances with stats
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
        { loanId: { $regex: q, $options: "i" } },
        { workerId: { $regex: q, $options: "i" } },
        { workerName: { $regex: q, $options: "i" } },
        { loanType: { $regex: q, $options: "i" } },
      ];
    }

    const loans = await Loan.find(filter).sort({ createdAt: -1 }).lean();

    // Calculate aggregated portfolio stats
    const allLoans = await Loan.find(
      vendorId && vendorId !== "All" ? { vendorId } : {}
    ).lean();

    const totalDisbursed = allLoans.reduce((sum, l) => sum + (l.principalAmount || 0), 0);
    const totalOutstanding = allLoans
      .filter((l) => l.status === "Active")
      .reduce((sum, l) => sum + (l.remainingBalance || 0), 0);
    const totalRecovered = allLoans.reduce((sum, l) => sum + (l.totalRepaid || 0), 0);
    const activeLoansCount = allLoans.filter((l) => l.status === "Active").length;
    const fullyRepaidCount = allLoans.filter((l) => l.status === "Fully Repaid").length;

    res.json({
      success: true,
      data: loans,
      stats: {
        totalDisbursed,
        totalOutstanding,
        totalRecovered,
        activeLoansCount,
        fullyRepaidCount,
        totalCount: allLoans.length,
      },
    });
  } catch (err) {
    console.error("Error fetching loans:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/loans/:id - Get loan details
router.get("/:id", async (req, res) => {
  try {
    const loan = await Loan.findOne(getQueryByIdOrLoanId(req.params.id)).lean();
    if (!loan) {
      return res.status(404).json({ success: false, message: "Advance record not found." });
    }
    res.json({ success: true, data: loan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/loans - Disburse a new advance
router.post("/", async (req, res) => {
  try {
    const {
      workerId,
      workerName,
      loanType,
      principalAmount,
      tenureMonths,
      reason,
      repaymentStartMonth,
      repaymentStartYear,
    } = req.body;

    if (!workerId || !principalAmount) {
      return res.status(400).json({
        success: false,
        message: "Worker ID and principal advance amount are required.",
      });
    }

    // Lookup worker if workerName not provided
    let resolvedWorkerName = workerName;
    if (!resolvedWorkerName) {
      const worker = await Worker.findOne({ workerId });
      if (worker) {
        resolvedWorkerName =
          worker.fullName || `${worker.firstName || ""} ${worker.lastName || ""}`.trim();
      } else {
        resolvedWorkerName = workerId;
      }
    }

    const principal = Number(principalAmount) || 5000;
    const tenure = Number(tenureMonths) || 3;
    const monthlyEmi = Math.round(principal / Math.max(1, tenure));

    const vendorId = req.headers["x-vendor-id"] || req.body.vendorId || "VND-1002";
    const vendorName = req.body.vendorName || (vendorId === "VND-1002" ? "Infiniti TechStaffing" : "Staffing Agency");

    const count = await Loan.countDocuments();
    const loanId = req.body.loanId || `ADV-${String(count + 101).padStart(4, "0")}`;

    const newLoan = new Loan({
      loanId,
      workerId,
      employeeId: workerId,
      workerName: resolvedWorkerName,
      vendorId,
      vendorName,
      loanType: loanType || "Salary Advance",
      principalAmount: principal,
      tenureMonths: tenure,
      monthlyEmi,
      interestRatePercent: 0,
      disbursedDate: new Date(),
      repaymentStartMonth: repaymentStartMonth || "April",
      repaymentStartYear: Number(repaymentStartYear) || 2026,
      totalRepaid: 0,
      remainingBalance: principal,
      status: "Active",
      reason: reason || "Worker salary advance request",
      repaymentHistory: [],
    });

    await newLoan.save();

    res.status(201).json({
      success: true,
      message: `Advance ${loanId} of Rs ${principal.toLocaleString()} issued to ${resolvedWorkerName}.`,
      data: newLoan,
    });
  } catch (err) {
    console.error("Error creating loan:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/loans/:id/repay - Record a repayment installment
router.post("/:id/repay", async (req, res) => {
  try {
    const { amount, paymentMethod, remarks, payrollId } = req.body;
    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please specify a valid positive repayment amount.",
      });
    }

    const loan = await Loan.findOne(getQueryByIdOrLoanId(req.params.id));
    if (!loan) {
      return res.status(404).json({ success: false, message: "Advance record not found." });
    }

    if (loan.remainingBalance <= 0) {
      return res.status(400).json({
        success: false,
        message: "This advance is already fully settled.",
      });
    }

    const repCount = loan.repaymentHistory.length + 1;
    const repaymentId = `REP-${loan.loanId}-${repCount}`;

    loan.repaymentHistory.push({
      repaymentId,
      date: new Date(),
      amount: paymentAmount,
      paymentMethod: paymentMethod || "Payroll Deduction",
      payrollId: payrollId || "",
      remarks: remarks || "Monthly EMI installment",
      recordedBy: "Finance Lead",
    });

    loan.totalRepaid = (loan.totalRepaid || 0) + paymentAmount;
    loan.remainingBalance = Math.max(0, loan.remainingBalance - paymentAmount);

    if (loan.remainingBalance === 0) {
      loan.status = "Fully Repaid";
    }

    await loan.save();

    res.json({
      success: true,
      message: `Recorded payment of Rs ${paymentAmount.toLocaleString()}. Remaining balance: Rs ${loan.remainingBalance.toLocaleString()}.`,
      data: loan,
    });
  } catch (err) {
    console.error("Error recording loan repayment:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/loans/:id/status - Update loan status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const loan = await Loan.findOneAndUpdate(
      getQueryByIdOrLoanId(req.params.id),
      { $set: { status } },
      { new: true }
    );

    if (!loan) {
      return res.status(404).json({ success: false, message: "Advance not found." });
    }

    res.json({
      success: true,
      message: `Advance status updated to ${status}.`,
      data: loan,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
