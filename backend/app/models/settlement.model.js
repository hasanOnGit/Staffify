const mongoose = require("mongoose");

const SettlementSchema = new mongoose.Schema(
  {
    settlementId: {
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
    designation: {
      type: String,
      default: "Employee",
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    resignationDate: {
      type: Date,
      required: true,
    },
    lastWorkingDate: {
      type: Date,
      required: true,
    },
    noticePeriodDays: {
      type: Number,
      default: 30,
    },
    servedNoticeDays: {
      type: Number,
      default: 30,
    },
    noticeShortfallDays: {
      type: Number,
      default: 0,
    },
    settlementStatus: {
      type: String,
      enum: ["Draft", "Clearance_In_Progress", "Settled", "Paid"],
      default: "Clearance_In_Progress",
    },
    // Multi-Department NOC Clearance
    clearances: {
      itDepartment: {
        status: { type: String, enum: ["Pending", "Cleared"], default: "Pending" },
        returnedAssets: [{ type: String }],
        remarks: { type: String, default: "" },
        clearedBy: { type: String, default: "" },
        clearedAt: { type: Date },
      },
      financeDepartment: {
        status: { type: String, enum: ["Pending", "Cleared"], default: "Pending" },
        outstandingAdvances: { type: Number, default: 0 },
        salaryHold: { type: Boolean, default: false },
        remarks: { type: String, default: "" },
        clearedBy: { type: String, default: "" },
        clearedAt: { type: Date },
      },
      adminDepartment: {
        status: { type: String, enum: ["Pending", "Cleared"], default: "Pending" },
        accessCardReturned: { type: Boolean, default: false },
        idCardReturned: { type: Boolean, default: false },
        remarks: { type: String, default: "" },
        clearedBy: { type: String, default: "" },
        clearedAt: { type: Date },
      },
      hrDepartment: {
        status: { type: String, enum: ["Pending", "Cleared"], default: "Pending" },
        exitInterviewDone: { type: Boolean, default: false },
        resignationAccepted: { type: Boolean, default: true },
        remarks: { type: String, default: "" },
        clearedBy: { type: String, default: "" },
        clearedAt: { type: Date },
      },
    },
    // Earnings Components
    earnings: {
      payableDaysInMonth: { type: Number, default: 0 },
      proratedBasicSalary: { type: Number, default: 0 },
      leaveEncashmentDays: { type: Number, default: 0 },
      leaveEncashmentAmount: { type: Number, default: 0 }, // (Basic / 30) * leaveDays
      gratuityEligible: { type: Boolean, default: false }, // >= 5 years of service
      yearsOfService: { type: Number, default: 0 },
      gratuityAmount: { type: Number, default: 0 }, // (15 * Basic * years) / 26
      bonusOrIncentives: { type: Number, default: 0 },
      otherEarnings: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
    },
    // Deductions Components
    deductions: {
      noticeShortfallDeduction: { type: Number, default: 0 }, // (Basic / 30) * shortfallDays
      unreturnedAssetCost: { type: Number, default: 0 },
      pendingLoanOrAdvance: { type: Number, default: 0 },
      tdsDeduction: { type: Number, default: 0 },
      otherDeductions: { type: Number, default: 0 },
      totalDeductions: { type: Number, default: 0 },
    },
    netPayable: {
      type: Number,
      default: 0,
    },
    paymentDetails: {
      mode: { type: String, enum: ["Direct Bank Transfer", "Cheque"], default: "Direct Bank Transfer" },
      transactionRef: { type: String, default: "" },
      disbursedAt: { type: Date },
    },
    initiatedBy: {
      type: String,
      default: "HR Admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settlement", SettlementSchema);
