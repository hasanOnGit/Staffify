const mongoose = require("mongoose");

const BiometricLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    machineId: {
      type: String,
      required: true,
      index: true,
    },
    serialNumber: {
      type: String,
      default: "",
    },
    employeeId: {
      type: String,
      required: true,
      index: true,
    },
    employeeName: {
      type: String,
      default: "",
    },
    punchTime: {
      type: Date,
      required: true,
      index: true,
    },
    punchDirection: {
      type: String,
      enum: ["IN", "OUT", "AUTO"],
      default: "AUTO",
    },
    verificationMode: {
      type: String,
      enum: ["Fingerprint", "Facial Recognition", "RFID Card", "PIN", "Palm"],
      default: "Fingerprint",
    },
    rawPayload: {
      type: String,
      default: "",
    },
    syncStatus: {
      type: String,
      enum: ["Pending", "Synced", "Failed", "Ignored"],
      default: "Pending",
      index: true,
    },
    syncedAttendanceDate: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BiometricLog", BiometricLogSchema);
