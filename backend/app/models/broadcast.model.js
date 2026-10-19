const mongoose = require("mongoose");

const BroadcastSchema = new mongoose.Schema(
  {
    broadcastId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Policy_Update", "Announcement", "Celebration", "Event", "Urgent"],
      default: "Announcement",
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    publishedBy: {
      type: String,
      default: "People Operations Team",
    },
    publishedRole: {
      type: String,
      default: "HR Admin",
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    acknowledgementRequired: {
      type: Boolean,
      default: false,
    },
    acknowledgedBy: [
      {
        employeeId: { type: String, required: true },
        employeeName: { type: String, required: true },
        acknowledgedAt: { type: Date, default: Date.now },
      },
    ],
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Broadcast", BroadcastSchema);
