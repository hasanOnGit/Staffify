const mongoose = require("mongoose");

const assignedWorkerSchema = new mongoose.Schema(
  {
    workerId: { type: String, required: true },
    workerName: { type: String, required: true },
    deploymentId: { type: String, required: true },
    assignedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const requisitionSchema = new mongoose.Schema(
  {
    requisitionId: {
      type: String,
      required: true,
      unique: true,
    },
    vendorId: {
      type: String,
      required: true,
      default: "VND-1002",
    },
    vendorName: {
      type: String,
      required: true,
      default: "Infiniti TechStaffing",
    },
    clientId: {
      type: String,
      required: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    siteId: {
      type: String,
      required: true,
    },
    siteName: {
      type: String,
      required: true,
    },
    poNumber: {
      type: String,
      default: "",
    },
    contractNumber: {
      type: String,
      default: "",
    },
    jobTitle: {
      type: String,
      required: true,
    },
    tradeCategory: {
      type: String,
      enum: ["Security", "IT", "Facilities", "Logistics", "General"],
      default: "General",
    },
    requiredHeadcount: {
      type: Number,
      required: true,
      min: 1,
    },
    fulfilledHeadcount: {
      type: Number,
      default: 0,
      min: 0,
    },
    urgency: {
      type: String,
      enum: ["Normal", "High", "Critical"],
      default: "Normal",
    },
    billingRate: {
      type: Number,
      required: true,
      min: 0,
    },
    billingUnit: {
      type: String,
      enum: ["Hourly", "Daily", "Monthly"],
      default: "Monthly",
    },
    targetWorkerPay: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Fulfilled", "Cancelled"],
      default: "Open",
    },
    skillsRequired: [
      {
        type: String,
      },
    ],
    experienceYears: {
      type: Number,
      default: 1,
    },
    assignedWorkers: [assignedWorkerSchema],
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Requisition", requisitionSchema);
