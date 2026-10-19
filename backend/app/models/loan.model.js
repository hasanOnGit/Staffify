const mongoose = require("mongoose");

const LoanSchema = new mongoose.Schema(
  {
    loanId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: true,
      index: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: "General",
    },
    loanType: {
      type: String,
      enum: ["Salary Advance", "Emergency Personal Loan", "Education Assistance", "Home Appliance Loan"],
      default: "Salary Advance",
    },
    principalAmount: {
      type: Number,
      required: true,
      min: 1000,
    },
    tenureMonths: {
      type: Number,
      required: true,
      min: 1,
      max: 24,
      default: 5,
    },
    monthlyEmi: {
      type: Number,
      required: true,
    },
    interestRatePercent: {
      type: Number,
      default: 0, // Standard 0% interest for salary advance
    },
    disbursedDate: {
      type: Date,
      default: Date.now,
    },
    repaymentStartMonth: {
      type: Number,
      required: true,
      default: () => new Date().getMonth() + 1,
    },
    repaymentStartYear: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear(),
    },
    totalRepaid: {
      type: Number,
      default: 0,
    },
    remainingBalance: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending_Approval", "Active", "Fully_Paid", "Rejected"],
      default: "Active",
      index: true,
    },
    reason: {
      type: String,
      required: true,
    },
    approvedBy: {
      type: String,
      default: "Finance Admin",
    },
    repayments: [
      {
        repaymentId: { type: String, default: () => "REP-" + Date.now() },
        month: { type: Number, required: true },
        year: { type: Number, required: true },
        amountPaid: { type: Number, required: true },
        emiIndex: { type: Number, required: true },
        payslipId: { type: String, default: "" },
        deductedAt: { type: Date, default: Date.now },
        mode: { type: String, default: "Payroll Auto-Deduction" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", LoanSchema);
