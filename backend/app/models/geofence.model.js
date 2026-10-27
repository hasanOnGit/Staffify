const mongoose = require("mongoose");

const geofenceSchema = new mongoose.Schema(
  {
    zoneId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      default: "",
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    radiusMeters: {
      type: Number,
      required: true,
      default: 300, // 300m radius
    },
    targetScope: {
      type: String,
      enum: ["All Employees", "Department", "Specific Employees"],
      default: "All Employees",
    },
    targetDepartment: {
      type: String,
      default: "All",
    },
    targetEmployeeIds: {
      type: [String],
      default: [],
    },
    isStrict: {
      type: Boolean,
      default: true, // Strict enforcement locks the swipe button outside radius
    },
    allowedIps: {
      type: [String],
      default: [], // e.g. ["127.0.0.1", "192.168.1.*"]
    },
    ipRestricted: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model("Geofence", geofenceSchema);
