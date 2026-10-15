const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    roundName: { type: String, required: true },
    interviewerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    recommendation: {
      type: String,
      enum: ["Strong Yes", "Yes", "Hold", "No"],
      default: "Yes",
    },
    notes: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const candidateSchema = new mongoose.Schema(
  {
    candidateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    jobId: {
      type: String,
      required: true,
      index: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: "Engineering",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
    },
    currentCompany: {
      type: String,
      default: "",
    },
    currentDesignation: {
      type: String,
      default: "",
    },
    totalExperienceYears: {
      type: Number,
      default: 3,
    },
    stage: {
      type: String,
      enum: [
        "Applied",
        "Screening",
        "Technical Round",
        "HR Interview",
        "Offered",
        "Hired",
        "Rejected",
      ],
      default: "Applied",
      index: true,
    },
    resumeUrl: {
      type: String,
      default: "",
    },
    summary: {
      type: String,
      default: "",
    },
    offeredCtc: {
      type: Number,
      default: 0,
    },
    expectedJoiningDate: {
      type: String,
      default: "",
    },
    hiredEmployeeId: {
      type: String,
      default: "",
    },
    feedback: {
      type: [feedbackSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Candidate", candidateSchema);
