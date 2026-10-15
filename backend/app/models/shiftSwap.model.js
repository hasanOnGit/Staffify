const mongoose = require("mongoose");

const shiftSwapSchema = new mongoose.Schema(
  {
    swapId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    requesterId: {
      type: String,
      required: true,
      index: true,
    },
    requesterName: {
      type: String,
      required: true,
    },
    requesterDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    requesterShift: {
      type: String,
      required: true,
    },
    peerId: {
      type: String,
      required: true,
      index: true,
    },
    peerName: {
      type: String,
      required: true,
    },
    peerDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    peerShift: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending Approval", "Approved", "Rejected"],
      default: "Pending Approval",
      index: true,
    },
    reviewedBy: {
      type: String,
      default: "",
    },
    reviewComment: {
      type: String,
      default: "",
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ShiftSwap", shiftSwapSchema);
