const mongoose = require("mongoose");

const payrollLineItemSchema = new mongoose.Schema(
  {
    workerId: { type: String, required: true },
    workerName: { type: String, required: true },
    designation: { type: String, required: true },
    payableDays: { type: Number, required: true, default: 26 },
    normalDailyRate: { type: Number, required: true },
    overtimeHours: { type: Number, default: 0 },
    otHourlyRate: { type: Number, default: 0 },
    basePay: { type: Number, required: true },
    overtimePay: { type: Number, default: 0 },
    grossSalary: { type: Number, required: true },
    statutoryDeductions: {
      employeePf: { type: Number, default: 0 },
      esic: { type: Number, default: 0 },
      professionalTax: { type: Number, default: 200 },
      tds: { type: Number, default: 0 },
      totalDeductions: { type: Number, required: true },
    },
    employerContributions: {
      employerPf: { type: Number, default: 0 },
      employerEsic: { type: Number, default: 0 },
    },
    netSalary: { type: Number, required: true },
    bankDetails: {
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      bankName: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["Pending", "Disbursed"],
      default: "Pending",
    },
  },
  { _id: true }
);

const payrollSchema = new mongoose.Schema(
  {
    payrollId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    payslipId: {
      type: String,
      default: function () {
        return this.payrollId;
      },
    },
    vendorId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    vendorName: {
      type: String,
      default: "",
    },
    clientId: {
      type: String,
      required: true,
      trim: true,
    },
    clientName: {
      type: String,
      default: "",
    },
    siteId: {
      type: String,
      required: true,
      trim: true,
    },
    siteName: {
      type: String,
      default: "",
    },
    musterRollId: {
      type: String,
      required: true,
      trim: true,
    },
    month: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    records: [payrollLineItemSchema],
    totalHeadcount: {
      type: Number,
      default: 0,
    },
    totalGrossPay: {
      type: Number,
      default: 0,
    },
    totalDeductions: {
      type: Number,
      default: 0,
    },
    totalNetPayable: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Draft", "Approved", "Disbursed"],
      default: "Draft",
    },
    approvedBy: {
      type: String,
      default: "",
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    disbursedAt: {
      type: Date,
      default: null,
    },
    disbursementReference: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payroll", payrollSchema);
