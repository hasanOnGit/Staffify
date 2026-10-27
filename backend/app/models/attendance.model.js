const mongoose = require("mongoose");

const punchSchema = new mongoose.Schema({
  time: {
    type: Date,
    default: Date.now,
  },
  timeStr: {
    type: String, // e.g. "09:30 AM"
  },
  type: {
    type: String,
    enum: ["IN", "OUT"],
    required: true,
  },
  location: {
    latitude: Number,
    longitude: Number,
    zoneName: String,
    distanceMeters: Number,
    isWithinGeofence: Boolean,
  },
  ipAddress: {
    type: String,
    default: "",
  },
  ipVerified: {
    type: Boolean,
    default: true,
  },
  networkType: {
    type: String,
    default: "Office / Verified IP",
  },
});

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      index: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
      index: true,
    },
    firstIn: {
      type: Date,
    },
    lastOut: {
      type: Date,
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Half Day", "On Leave", "WFH"],
      default: "Present",
    },
    ipAddress: {
      type: String,
      default: "",
    },
    geofenceZone: {
      type: String,
      default: "",
    },
    punches: [punchSchema],
    regularization: {
      requested: { type: Boolean, default: false },
      reason: { type: String },
      proposedIn: { type: String },
      proposedOut: { type: String },
      status: {
        type: String,
        enum: ["None", "Pending", "Approved", "Rejected"],
        default: "None",
      },
      approvedBy: { type: String },
      reviewedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attendance records for the same employee on the same date
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
module.exports = Attendance;
