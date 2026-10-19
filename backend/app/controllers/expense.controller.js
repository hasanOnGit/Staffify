const express = require("express");
const apiRoutes = express.Router();
const ExpenseClaim = require("../models/expenseClaim.model");
const Employees = require("../models/employees.model");

// Seed default claims if empty
async function seedDefaultExpenses() {
  const count = await ExpenseClaim.countDocuments();
  if (count === 0) {
    await ExpenseClaim.create([
      {
        claimId: "EXP-DEV-001",
        employeeId: "EMP-DEV-03",
        employeeName: "Employee User",
        department: "Engineering",
        expenseCategory: "Internet & Mobile",
        claimDate: new Date(),
        amount: 1499,
        merchantName: "Airtel Broadband",
        receiptNumber: "INV-AIR-88219",
        receiptUrl: "",
        attachmentName: "airtel_bill_oct2026.pdf",
        description: "Monthly fiber internet broadband reimbursement for remote work setup.",
        status: "Finance_Approved",
        managerApproval: {
          approvedBy: "Manager User",
          approvedAt: new Date(Date.now() - 86400000 * 2),
          remarks: "Verified against WFH policy.",
        },
        financeApproval: {
          approvedBy: "Finance Admin",
          approvedAt: new Date(Date.now() - 86400000),
          remarks: "Approved for October payroll payout.",
          paymentMode: "Payroll Credit",
          paymentRef: "PAYROLL-OCT-2026",
        },
      },
      {
        claimId: "EXP-DEV-002",
        employeeId: "EMP-DEV-03",
        employeeName: "Employee User",
        department: "Engineering",
        expenseCategory: "Training & Certifications",
        claimDate: new Date(Date.now() - 86400000 * 4),
        amount: 8500,
        merchantName: "Amazon Web Services",
        receiptNumber: "AWS-CERT-9041",
        receiptUrl: "",
        attachmentName: "aws_solutions_architect.pdf",
        description: "AWS Certified Solutions Architect Associate exam registration fee.",
        status: "Submitted",
      },
      {
        claimId: "EXP-MGR-001",
        employeeId: "EMP-MGR-02",
        employeeName: "Manager User",
        department: "Management",
        expenseCategory: "Client Entertainment",
        claimDate: new Date(Date.now() - 86400000 * 3),
        amount: 3200,
        merchantName: "The Leela Palace Cafe",
        receiptNumber: "LEELA-FNB-4421",
        receiptUrl: "",
        attachmentName: "client_lunch_receipt.jpg",
        description: "Quarterly review luncheon with enterprise client stakeholders.",
        status: "Submitted",
      },
    ]);
  }
}

module.exports = function (app) {
  seedDefaultExpenses().catch((err) => console.error("Expense seed error:", err));

  /**
   * GET /api/expenses
   * Fetch expenses with optional filters (employeeId, status, category)
   */
  apiRoutes.get("/", async (req, res) => {
    try {
      const { employeeId, status, category } = req.query;
      const filter = {};
      if (employeeId) filter.employeeId = employeeId;
      if (status && status !== "All") filter.status = status;
      if (category && category !== "All") filter.expenseCategory = category;

      const claims = await ExpenseClaim.find(filter).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: claims });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/expenses/summary
   * Aggregated metrics for reimbursement claims
   */
  apiRoutes.get("/summary", async (req, res) => {
    try {
      const { employeeId } = req.query;
      const filter = employeeId ? { employeeId } : {};

      const claims = await ExpenseClaim.find(filter);

      let pendingAmount = 0;
      let approvedAmount = 0;
      let paidAmount = 0;
      let pendingCount = 0;

      claims.forEach((c) => {
        if (c.status === "Submitted" || c.status === "Manager_Approved") {
          pendingAmount += c.amount;
          pendingCount++;
        } else if (c.status === "Finance_Approved") {
          approvedAmount += c.amount;
        } else if (c.status === "Paid") {
          paidAmount += c.amount;
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          totalClaims: claims.length,
          pendingAmount,
          pendingCount,
          approvedAmount,
          paidAmount,
          grandTotal: pendingAmount + approvedAmount + paidAmount,
        },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/expenses
   * Submit a new expense reimbursement claim
   */
  apiRoutes.post("/", async (req, res) => {
    try {
      const {
        employeeId,
        expenseCategory,
        claimDate,
        amount,
        merchantName,
        receiptNumber,
        attachmentName,
        description,
      } = req.body;

      if (!employeeId || !expenseCategory || !amount || !description) {
        return res.status(400).json({ error: "employeeId, category, amount, and description are required" });
      }

      const emp = await Employees.findOne({ employeeId });
      const claimId = "EXP-" + Date.now().toString().slice(-6);

      const claim = await ExpenseClaim.create({
        claimId,
        employeeId,
        employeeName: emp?.name || "Employee",
        department: emp?.department || "General",
        expenseCategory,
        claimDate: claimDate ? new Date(claimDate) : new Date(),
        amount: Number(amount),
        merchantName: merchantName || "",
        receiptNumber: receiptNumber || "",
        attachmentName: attachmentName || "receipt.pdf",
        description,
        status: "Submitted",
      });

      return res.status(201).json({
        success: true,
        message: "Expense claim submitted for manager approval",
        data: claim,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * PUT /api/expenses/:id/approve
   * Manager or Finance approval workflow
   */
  apiRoutes.put("/:id/approve", async (req, res) => {
    try {
      const { level, approvedBy = "Manager User", remarks } = req.body;
      const claim = await ExpenseClaim.findOne({
        $or: [{ claimId: req.params.id }, { _id: req.params.id }],
      });

      if (!claim) {
        return res.status(404).json({ error: "Expense claim not found" });
      }

      if (level === "finance") {
        claim.status = "Finance_Approved";
        claim.financeApproval = {
          approvedBy,
          approvedAt: new Date(),
          remarks: remarks || "Approved for payroll credit disbursement",
          paymentMode: "Payroll Credit",
          paymentRef: "PAYROLL-" + Date.now().toString().slice(-5),
        };
      } else {
        // Manager approval
        claim.status = "Manager_Approved";
        claim.managerApproval = {
          approvedBy,
          approvedAt: new Date(),
          remarks: remarks || "Verified and recommended for finance clearance",
        };
      }

      await claim.save();

      return res.status(200).json({
        success: true,
        message: `Claim marked as ${claim.status.replace("_", " ")}`,
        data: claim,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * PUT /api/expenses/:id/reject
   * Reject expense claim
   */
  apiRoutes.put("/:id/reject", async (req, res) => {
    try {
      const { rejectionReason = "Documentation insufficient" } = req.body;
      const claim = await ExpenseClaim.findOne({
        $or: [{ claimId: req.params.id }, { _id: req.params.id }],
      });

      if (!claim) {
        return res.status(404).json({ error: "Expense claim not found" });
      }

      claim.status = "Rejected";
      claim.rejectionReason = rejectionReason;
      await claim.save();

      return res.status(200).json({
        success: true,
        message: "Expense claim rejected",
        data: claim,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.use("/api/expenses", apiRoutes);
};
