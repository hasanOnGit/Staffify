const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
  {
    workerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    tradeCategory: {
      type: String,
      enum: ["Security", "IT", "Facilities", "Logistics", "General"],
      default: "General",
    },
    primarySkill: {
      type: String,
      required: true,
      trim: true,
    },
    experienceYears: {
      type: Number,
      default: 1,
      min: 0,
    },
    wagePerDayOrMonth: {
      type: Number,
      required: true,
      min: 0,
    },
    billingUnit: {
      type: String,
      enum: ["Hourly", "Daily", "Monthly"],
      default: "Monthly",
    },
    kycDetails: {
      aadhaarNumber: { type: String, default: "" },
      panNumber: { type: String, default: "" },
      policeVerificationStatus: {
        type: String,
        enum: ["Verified", "Pending", "Failed", "Not Submitted"],
        default: "Pending",
      },
      medicalFitnessCleared: {
        type: Boolean,
        default: true,
      },
      bankAccountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      bankName: { type: String, default: "" },
    },
    currentDeployment: {
      clientId: { type: String, default: "" },
      clientName: { type: String, default: "" },
      siteId: { type: String, default: "" },
      siteName: { type: String, default: "" },
      poNumber: { type: String, default: "" },
      contractId: { type: String, default: "" },
      billableRate: { type: Number, default: 0 },
      startDate: { type: Date, default: null },
    },
    status: {
      type: String,
      enum: ["Available", "Deployed", "On Leave", "Inactive"],
      default: "Available",
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Worker", workerSchema);
