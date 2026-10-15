const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    goalId: {
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
    department: {
      type: String,
      default: "Engineering",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: [
        "Core Deliverable",
        "Skill Development",
        "Operational Excellence",
        "Leadership & Culture",
      ],
      default: "Core Deliverable",
    },
    cycle: {
      type: String, // e.g. "Q4 2026", "Annual 2026-27"
      required: true,
      default: "Q4 2026",
    },
    weightage: {
      type: Number, // Percentage 10-100
      default: 25,
    },
    progressPercentage: {
      type: Number, // 0 - 100
      default: 0,
    },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "On Track", "At Risk", "Completed"],
      default: "In Progress",
    },
    dueDate: {
      type: String,
      default: "",
    },
    managerFeedback: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Goal", goalSchema);
