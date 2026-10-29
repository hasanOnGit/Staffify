const mongoose = require("mongoose");

const rateCardSchema = new mongoose.Schema(
  {
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
    baseCost: {
      type: Number,
      required: true,
      min: 0,
    },
    markupPercent: {
      type: Number,
      required: true,
      default: 15,
      min: 0,
    },
    billableRate: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const contractSchema = new mongoose.Schema(
  {
    contractNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
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
    vendorId: {
      type: String,
      required: true,
      trim: true,
    },
    vendorName: {
      type: String,
      default: "",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Active", "Expired", "Terminated"],
      default: "Active",
    },
    rateCards: [rateCardSchema],
    termsAndConditions: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Contract", contractSchema);
