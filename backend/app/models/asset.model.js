const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    assetTag: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Laptop", "Monitor", "Peripherals", "Mobile Device", "Access Badge", "License"],
      default: "Laptop",
      index: true,
    },
    serialNumber: {
      type: String,
      default: "",
    },
    model: {
      type: String,
      default: "",
    },
    specification: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Available", "Allocated", "In Repair", "Retired"],
      default: "Available",
      index: true,
    },
    condition: {
      type: String,
      enum: ["Brand New", "Good", "Fair", "Needs Repair"],
      default: "Good",
    },
    allocatedToId: {
      type: String,
      default: "",
      index: true,
    },
    allocatedToName: {
      type: String,
      default: "",
    },
    allocatedAt: {
      type: Date,
      default: null,
    },
    purchaseDate: {
      type: String,
      default: "",
    },
    warrantyExpiry: {
      type: String,
      default: "",
    },
    purchaseValue: {
      type: Number,
      default: 0,
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

module.exports = mongoose.model("Asset", assetSchema);
