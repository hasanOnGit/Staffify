const mongoose = require("mongoose");

const deploymentSchema = new mongoose.Schema(
  {
    deploymentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    workerId: {
      type: String,
      required: true,
      trim: true,
    },
    workerName: {
      type: String,
      required: true,
      trim: true,
    },
    workerPhone: {
      type: String,
      default: "",
    },
    vendorId: {
      type: String,
      required: true,
      trim: true,
    },
    vendorName: {
      type: String,
      default: "",
    },
    clientId: {
      type: String,
      required: true,
      trim: true,
    },
    clientName: {
      type: String,
      default: "",
    },
    siteId: {
      type: String,
      required: true,
      trim: true,
    },
    siteName: {
      type: String,
      default: "",
    },
    contractId: {
      type: String,
      required: true,
      trim: true,
    },
    contractNumber: {
      type: String,
      default: "",
    },
    poNumber: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    billingUnit: {
      type: String,
      enum: ["Hourly", "Daily", "Monthly"],
      default: "Monthly",
    },
    billableRate: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Terminated"],
      default: "Active",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Deployment", deploymentSchema);
