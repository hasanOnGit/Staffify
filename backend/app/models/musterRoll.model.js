const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema(
  {
    workerId: { type: String, required: true },
    workerName: { type: String, required: true },
    designation: { type: String, required: true },
    daysPresent: { type: Number, default: 26, min: 0, max: 31 },
    halfDays: { type: Number, default: 0, min: 0 },
    lossOfPayDays: { type: Number, default: 0, min: 0 },
    overtimeHours: { type: Number, default: 0, min: 0 },
    normalDailyRate: { type: Number, required: true, min: 0 },
    otHourlyRate: { type: Number, default: 0, min: 0 },
    totalEarned: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const musterRollSchema = new mongoose.Schema(
  {
    musterRollId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
    month: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    records: [attendanceRecordSchema],
    totalHeadcount: {
      type: Number,
      default: 0,
    },
    totalDaysBilled: {
      type: Number,
      default: 0,
    },
    totalOtHours: {
      type: Number,
      default: 0,
    },
    totalGrossPay: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Draft", "Submitted", "Approved", "Billed"],
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MusterRoll", musterRollSchema);
