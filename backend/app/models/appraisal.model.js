const mongoose = require("mongoose");

const appraisalSchema = new mongoose.Schema(
  {
    appraisalId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    cycleName: {
      type: String,
      required: true,
      default: "Q4 2026 Performance Appraisal Cycle",
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
      default: "Software Engineer",
    },
    department: {
      type: String,
      default: "Engineering",
    },
    managerId: {
      type: String,
      default: "EMP-MGR-02",
    },
    managerName: {
      type: String,
      default: "Manager User",
    },
    selfAppraisal: {
      rating: { type: Number, default: 0 }, // 1 to 5
      achievements: { type: String, default: "" },
      challenges: { type: String, default: "" },
      developmentGoals: { type: String, default: "" },
      submittedAt: { type: Date },
    },
    managerReview: {
      rating: { type: Number, default: 0 }, // 1 to 5
      strengths: { type: String, default: "" },
      growthAreas: { type: String, default: "" },
      recommendation: {
        type: String,
        enum: ["Promotion", "Merit Increment", "Continue in Role", "PIP", "Pending"],
        default: "Pending",
      },
      submittedAt: { type: Date },
    },
    finalScore: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Pending Self Review", "Pending Manager Review", "Completed"],
      default: "Pending Self Review",
    },
  },
  {
    timestamps: true,
  }
);

appraisalSchema.index({ employeeId: 1, cycleName: 1 }, { unique: true });

module.exports = mongoose.model("Appraisal", appraisalSchema);
