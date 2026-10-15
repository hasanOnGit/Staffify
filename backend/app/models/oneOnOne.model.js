const mongoose = require("mongoose");

const actionItemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
  },
  { _id: false }
);

const oneOnOneSchema = new mongoose.Schema(
  {
    meetingId: {
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
    designation: {
      type: String,
      default: "Employee",
    },
    managerId: {
      type: String,
      required: true,
    },
    managerName: {
      type: String,
      required: true,
    },
    meetingDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    talkingPoints: {
      type: String,
      default: "",
    },
    actionItems: {
      type: [actionItemSchema],
      default: [],
    },
    feedbackType: {
      type: String,
      enum: [
        "Growth & Career Check-in",
        "Quarterly Goal Alignment",
        "Recognition & Praise",
        "Performance Guidance",
      ],
      default: "Growth & Career Check-in",
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed"],
      default: "Completed",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OneOnOne", oneOnOneSchema);
