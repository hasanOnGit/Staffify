const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    shiftCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: String, // HH:mm
      required: true,
    },
    endTime: {
      type: String, // HH:mm
      required: true,
    },
    fullDayHours: {
      type: Number,
      default: 8,
    },
    isNightShift: {
      type: Boolean,
      default: false,
    },
    nightAllowance: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: "#0052CC",
    },
    bgColor: {
      type: String,
      default: "#DEEBFF",
    },
    textColor: {
      type: String,
      default: "#0747A6",
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Shift", shiftSchema);
