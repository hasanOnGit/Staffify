const mongoose = require("mongoose");

const CompOffGrantSchema = new mongoose.Schema(
  {
    grantId: {
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
    workedDate: {
      type: Date,
      required: true,
    },
    hoursWorked: {
      type: Number,
      required: true,
      default: 8,
    },
    creditsGranted: {
      type: Number,
      default: 1.0, // 0.5 for half day, 1.0 for full day
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },
    reason: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days validity window
      index: true,
    },
    approvedBy: {
      type: String,
      default: "",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompOffGrant", CompOffGrantSchema);
