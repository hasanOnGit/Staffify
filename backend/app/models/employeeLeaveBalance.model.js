const mongoose = require("mongoose");

const LeaveBalanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      trim: true,
    },

    year: {
      type: Number,
      required: true,
    },

    leaveAllocation: {
      paid: {
        totalAllocated: { type: Number, default: 12 },
        used: { type: Number, default: 0 },
      },

      sick: {
        totalAllocated: { type: Number, default: 6 },
        used: { type: Number, default: 0 },
      },

      casual: {
        totalAllocated: { type: Number, default: 6 },
        used: { type: Number, default: 0 },
      },

      halfDay: {
        totalAllocated: { type: Number, default: 4 },
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

/* 🔥 Prevent duplicate yearly balance per employee */
LeaveBalanceSchema.index(
  { employeeId: 1, year: 1 },
  { unique: true }
);

const LeaveBalance = mongoose.model("leaveBalance", LeaveBalanceSchema);

module.exports = LeaveBalance;
