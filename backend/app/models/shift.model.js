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
    },
    startTime: {
      type: String, // HH:mm format, e.g. "09:00"
      required: true,
    },
    endTime: {
      type: String, // HH:mm format, e.g. "18:00"
      required: true,
    },
    graceMinutes: {
      type: Number,
      default: 15,
    },
    halfDayHours: {
      type: Number,
      default: 4.5,
    },
    fullDayHours: {
      type: Number,
      default: 8.5,
    },
    isNightShift: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: "#0052CC", // Staffify brand blue
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
