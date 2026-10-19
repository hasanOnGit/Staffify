const mongoose = require("mongoose");

const BiometricMachineSchema = new mongoose.Schema(
  {
    machineId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    machineName: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      enum: ["eSSL", "ZKTeco", "Matrix", "Realtime", "Anviz"],
      default: "eSSL",
    },
    modelNumber: {
      type: String,
      default: "SilkBio-101",
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
    },
    ipAddress: {
      type: String,
      required: true,
      default: "192.168.1.201",
    },
    port: {
      type: Number,
      default: 4370,
    },
    location: {
      type: String,
      default: "Bangalore HQ - Main Turnstile",
    },
    directionDefault: {
      type: String,
      enum: ["IN", "OUT", "AUTO"],
      default: "AUTO",
    },
    status: {
      type: String,
      enum: ["Online", "Offline", "Syncing"],
      default: "Online",
    },
    lastHeartbeat: {
      type: Date,
      default: Date.now,
    },
    lastSyncTime: {
      type: Date,
    },
    totalPunchesRecorded: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BiometricMachine", BiometricMachineSchema);
