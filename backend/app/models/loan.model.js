const mongoose = require("mongoose");

const repaymentItemSchema = new mongoose.Schema(
  {
    repaymentId: { type: String, required: true },
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true, min: 1 },
    paymentMethod: {
      type: String,
      enum: ["Payroll Deduction", "Bank Transfer", "Cash"],
      default: "Payroll Deduction",
    },
    payrollId: { type: String, default: "" },
    remarks: { type: String, default: "" },
    recordedBy: { type: String, default: "Finance Lead" },
  },
  { _id: true }
);

const loanSchema = new mongoose.Schema(
  {
    loanId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    workerId: {
      type: String,
      required: true,
      index: true,
    },
    employeeId: {
      type: String,
      default: function () {
        return this.workerId;
      },
      index: true,
    },
    workerName: {
      type: String,
      required: true,
    },
    vendorId: {
      type: String,
      default: "VND-1002",
      index: true,
    },
    vendorName: {
      type: String,
      default: "Infiniti TechStaffing",
    },
    loanType: {
      type: String,
      enum: [
        "Salary Advance",
        "Festival Advance",
        "Emergency Medical Advance",
        "Equipment / Tool Advance",
      ],
      default: "Salary Advance",
    },
    principalAmount: {
      type: Number,
      required: true,
      min: 500,
    },
    tenureMonths: {
      type: Number,
      required: true,
      min: 1,
      max: 24,
      default: 3,
    },
    monthlyEmi: {
      type: Number,
      required: true,
      min: 1,
    },
    interestRatePercent: {
      type: Number,
      default: 0, // 0% standard advance
    },
    disbursedDate: {
      type: Date,
      default: Date.now,
    },
    repaymentStartMonth: {
      type: String,
      default: "April",
    },
    repaymentStartYear: {
      type: Number,
      default: 2026,
    },
    totalRepaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingBalance: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Fully Repaid", "Pending Approval", "Rejected"],
      default: "Active",
      index: true,
    },
    reason: {
      type: String,
      default: "",
    },
    repaymentHistory: [repaymentItemSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Loan", loanSchema);
