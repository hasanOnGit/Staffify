const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    payslipId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    month: {
      type: Number, // 1 - 12
      required: true,
    },
    year: {
      type: Number, // e.g. 2026
      required: true,
    },
    periodString: {
      type: String, // e.g. "October 2026"
      required: true,
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
    designation: {
      type: String,
      default: "Employee",
    },
    department: {
      type: String,
      default: "General",
    },
    dateOfJoining: {
      type: String,
      default: "",
    },
    bankDetails: {
      bankName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
    },
    statutoryDetails: {
      panNumber: { type: String, default: "" },
      uanNumber: { type: String, default: "" },
      pfNumber: { type: String, default: "" },
      esiNumber: { type: String, default: "" },
    },
    attendanceSummary: {
      totalDays: { type: Number, default: 30 },
      workedDays: { type: Number, default: 30 },
      paidLeaveDays: { type: Number, default: 0 },
      lopDays: { type: Number, default: 0 },
      payableDays: { type: Number, default: 30 },
    },
    earnings: {
      basic: { type: Number, default: 0 },
      hra: { type: Number, default: 0 },
      conveyance: { type: Number, default: 0 },
      medicalAllowance: { type: Number, default: 0 },
      specialAllowance: { type: Number, default: 0 },
      grossEarnings: { type: Number, default: 0 },
    },
    deductions: {
      epf: { type: Number, default: 0 },
      esi: { type: Number, default: 0 },
      professionalTax: { type: Number, default: 0 },
      tds: { type: Number, default: 0 },
      lopDeduction: { type: Number, default: 0 },
      totalDeductions: { type: Number, default: 0 },
    },
    netPay: {
      type: Number,
      required: true,
      default: 0,
    },
    netPayInWords: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Draft", "Processed", "Paid"],
      default: "Processed",
    },
    processedBy: {
      type: String,
      default: "System Admin",
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

payrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Payroll", payrollSchema);
