const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema(
  {
    settlementId: {
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
    clientId: {
      type: String,
      default: "",
    },
    clientName: {
      type: String,
      default: "",
    },
    siteId: {
      type: String,
      default: "",
    },
    siteName: {
      type: String,
      default: "",
    },
    lastWorkingDate: {
      type: Date,
      default: Date.now,
    },
    exitReason: {
      type: String,
      enum: [
        "Tour Completed",
        "Contract End",
        "Resignation",
        "Site Relocation",
        "Personal / Health",
      ],
      default: "Tour Completed",
    },
    status: {
      type: String,
      enum: ["Clearance In Progress", "Ready for Payment", "Settled & Paid"],
      default: "Clearance In Progress",
      index: true,
    },
    // Site equipment and access clearances
    clearances: {
      idCardReturned: { type: Boolean, default: false },
      uniformReturned: { type: Boolean, default: false },
      toolsEquipmentReturned: { type: Boolean, default: false },
      siteSupervisorApproved: { type: Boolean, default: false },
      remarks: { type: String, default: "" },
    },
    // Final earnings
    earnings: {
      daysWorkedInExitMonth: { type: Number, default: 0 },
      dailyRate: { type: Number, default: 0 },
      earnedWages: { type: Number, default: 0 },
      leaveEncashmentPay: { type: Number, default: 0 },
      bonusOrIncentive: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
    },
    // Deductions (including open loan/advance recoveries)
    deductions: {
      outstandingAdvanceDeducted: { type: Number, default: 0 },
      unreturnedAssetDeduction: { type: Number, default: 0 },
      otherDeductions: { type: Number, default: 0 },
      totalDeductions: { type: Number, default: 0 },
    },
    netFinalPayout: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentDetails: {
      paymentMode: {
        type: String,
        enum: ["Direct Bank Transfer", "Cash Deposit", "Cheque"],
        default: "Direct Bank Transfer",
      },
      transactionRef: { type: String, default: "" },
      paidAt: { type: Date },
      paidBy: { type: String, default: "" },
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settlement", settlementSchema);
