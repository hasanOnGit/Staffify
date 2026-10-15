const mongoose = require("mongoose");

const LeaveBalanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    leaveAllocation: {
      earned: {
        totalAllocated: { type: Number, default: 15 },
        used: { type: Number, default: 0 },
      },
      casual: {
        totalAllocated: { type: Number, default: 12 },
        used: { type: Number, default: 0 },
      },
      sick: {
        totalAllocated: { type: Number, default: 10 },
        used: { type: Number, default: 0 },
      },
      paid: {
        totalAllocated: { type: Number, default: 12 },
        used: { type: Number, default: 0 },
      },
      halfDay: {
        totalAllocated: { type: Number, default: 6 },
        used: { type: Number, default: 0 },
      },
      maternity: {
        totalAllocated: { type: Number, default: 180 },
        used: { type: Number, default: 0 },
      },
      paternity: {
        totalAllocated: { type: Number, default: 15 },
        used: { type: Number, default: 0 },
      },
      lop: {
        totalAllocated: { type: Number, default: 999 }, // Uncapped
        used: { type: Number, default: 0 },
      },
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate yearly balance per employee
LeaveBalanceSchema.index({ employeeId: 1, year: 1 }, { unique: true });

const LeaveBalance = mongoose.model("leaveBalance", LeaveBalanceSchema);
module.exports = LeaveBalance;
