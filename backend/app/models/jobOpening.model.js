const mongoose = require("mongoose");

const jobOpeningSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      default: "Engineering",
      index: true,
    },
    location: {
      type: String,
      default: "Bangalore, India",
    },
    employmentType: {
      type: String,
      enum: ["Full-time", "Contract", "Internship", "Part-time"],
      default: "Full-time",
    },
    openings: {
      type: Number,
      default: 1,
    },
    experienceRequired: {
      type: String,
      default: "3-5 Years",
    },
    salaryRange: {
      type: String,
      default: "₹12L - ₹18L PA",
    },
    description: {
      type: String,
      default: "",
    },
    requirements: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Draft", "Active", "Closed"],
      default: "Active",
      index: true,
    },
    hiringManagerId: {
      type: String,
      default: "EMP-MGR-02",
    },
    hiringManagerName: {
      type: String,
      default: "Manager User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("JobOpening", jobOpeningSchema);
