const express = require("express");
const apiRoutes = express.Router();
const Loan = require("../models/loan.model");
const Employees = require("../models/employees.model");

// Seed default active salary advance if none exist
async function seedDefaultLoans() {
  const count = await Loan.countDocuments();
  if (count === 0) {
    await Loan.create([
      {
        loanId: "LOAN-DEV-001",
        employeeId: "EMP-DEV-03",
        employeeName: "Employee User",
        department: "Engineering",
        loanType: "Salary Advance",
        principalAmount: 50000,
        tenureMonths: 5,
        monthlyEmi: 10000,
        interestRatePercent: 0,
        disbursedDate: new Date(Date.now() - 86400000 * 30),
        repaymentStartMonth: 10,
        repaymentStartYear: 2026,
        totalRepaid: 10000,
        remainingBalance: 40000,
        status: "Active",
        reason: "Medical emergency hospital admission advance.",
        approvedBy: "Finance Admin",
        repayments: [
          {
            repaymentId: "REP-001",
            month: 10,
            year: 2026,
            amountPaid: 10000,
            emiIndex: 1,
            payslipId: "PS-OCT-2026",
            deductedAt: new Date(),
            mode: "Payroll Auto-Deduction",
          },
        ],
      },
    ]);
  }
}

module.exports = function (app) {
  seedDefaultLoans().catch((err) => console.error("Loan seed error:", err));

  /**
   * GET /api/loans
   * List all loans or filter by employeeId / status
   */
  apiRoutes.get("/", async (req, res) => {
    try {
      const { employeeId, status } = req.query;
      const filter = {};
      if (employeeId) filter.employeeId = employeeId;
      if (status && status !== "All") filter.status = status;

      const loans = await Loan.find(filter).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: loans });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/loans/summary
   * Aggregated active loan statistics
   */
  apiRoutes.get("/summary", async (req, res) => {
    try {
      const { employeeId } = req.query;
      const filter = employeeId ? { employeeId } : {};

      const loans = await Loan.find(filter);

      let totalPrincipal = 0;
      let totalOutstanding = 0;
      let totalRepaid = 0;
      let activeCount = 0;

      loans.forEach((l) => {
        totalPrincipal += l.principalAmount || 0;
        totalOutstanding += l.remainingBalance || 0;
        totalRepaid += l.totalRepaid || 0;
        if (l.status === "Active") activeCount++;
      });

      return res.status(200).json({
        success: true,
        data: {
          totalLoansCount: loans.length,
          activeCount,
          totalPrincipal,
          totalOutstanding,
          totalRepaid,
        },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/loans/apply
   * Apply for a salary advance or loan
   */
  apiRoutes.post("/apply", async (req, res) => {
    try {
      const {
        employeeId,
        loanType = "Salary Advance",
        principalAmount,
        tenureMonths = 5,
        reason,
        repaymentStartMonth,
        repaymentStartYear,
      } = req.body;

      if (!employeeId || !principalAmount || !reason) {
        return res.status(400).json({ error: "employeeId, principalAmount, and reason are required" });
      }

      const emp = await Employees.findOne({ employeeId });
      if (!emp) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const pAmount = Number(principalAmount);
      const tenure = Math.max(1, Number(tenureMonths));
      const monthlyEmi = Math.round(pAmount / tenure);
      const loanId = "LOAN-" + Date.now().toString().slice(-6);

      const loan = await Loan.create({
        loanId,
        employeeId,
        employeeName: emp.name,
        department: emp.department || "General",
        loanType,
        principalAmount: pAmount,
        tenureMonths: tenure,
        monthlyEmi,
        interestRatePercent: 0,
        repaymentStartMonth: Number(repaymentStartMonth) || new Date().getMonth() + 1,
        repaymentStartYear: Number(repaymentStartYear) || new Date().getFullYear(),
        totalRepaid: 0,
        remainingBalance: pAmount,
        status: "Active", // Auto-approved for standard salary advance
        reason,
        approvedBy: "Finance Admin",
      });

      return res.status(201).json({
        success: true,
        message: "Salary advance approved and EMI schedule established",
        data: loan,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/loans/repay
   * Record manual or payroll-triggered EMI deduction
   */
  apiRoutes.post("/repay", async (req, res) => {
    try {
      const { loanId, amount, month, year, payslipId } = req.body;
      const loan = await Loan.findOne({ loanId });
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }

      const emiPaid = Math.min(loan.remainingBalance, Number(amount || loan.monthlyEmi));
      loan.totalRepaid += emiPaid;
      loan.remainingBalance = Math.max(0, loan.remainingBalance - emiPaid);

      if (loan.remainingBalance === 0) {
        loan.status = "Fully_Paid";
      }

      loan.repayments.push({
        repaymentId: "REP-" + Date.now(),
        month: Number(month) || new Date().getMonth() + 1,
        year: Number(year) || new Date().getFullYear(),
        amountPaid: emiPaid,
        emiIndex: loan.repayments.length + 1,
        payslipId: payslipId || "",
        deductedAt: new Date(),
        mode: "Payroll Auto-Deduction",
      });

      await loan.save();

      return res.status(200).json({
        success: true,
        message: `EMI repayment of ₹${emiPaid} recorded. Remaining: ₹${loan.remainingBalance}`,
        data: loan,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.use("/api/loans", apiRoutes);
};
