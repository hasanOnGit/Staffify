const mongoose = require("mongoose");

const LeaveDelegationSchema = new mongoose.Schema(
  {
    delegationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    delegatorId: {
      type: String,
      required: true,
      index: true,
    },
    delegatorName: {
      type: String,
      required: true,
    },
    delegateId: {
      type: String,
      required: true,
      index: true,
    },
    delegateName: {
      type: String,
      required: true,
    },
    delegateEmail: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      default: "Out of Office / Annual Leave Delegation",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LeaveDelegation", LeaveDelegationSchema);
