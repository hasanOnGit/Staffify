const mongoose = require("mongoose");

const LeaveSchema = new mongoose.Schema(
  {
    leaveId: {
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
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending",
      index: true,
    },
    leaveType: {
      type: String,
      enum: ["paid", "sick", "casual", "earned", "maternity", "paternity", "lop", "halfDay"],
      required: true,
    },
    isHalfDay: {
      type: Boolean,
      default: false,
    },
    halfDaySession: {
      type: String,
      enum: ["Session 1 (First Half)", "Session 2 (Second Half)", "None"],
      default: "None",
    },
    daysCount: {
      type: Number,
      required: true,
      default: 1,
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    approvedBy: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
    contactDetailsDuringLeave: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Leaves = mongoose.model("leave", LeaveSchema);
module.exports = Leaves;
