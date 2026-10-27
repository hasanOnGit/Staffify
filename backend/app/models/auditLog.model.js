const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["Human Resources", "Payroll & Statutory", "Access & Security", "Governance", "AI Studio"],
      default: "Governance",
      index: true,
    },
    actorId: {
      type: String,
      default: "SYSTEM",
    },
    actorName: {
      type: String,
      default: "System Automator",
    },
    actorRole: {
      type: String,
      default: "Admin",
    },
    targetEntity: {
      type: String,
      default: "General",
    },
    targetId: {
      type: String,
      default: "",
    },
    targetName: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
    status: {
      type: String,
      enum: ["SUCCESS", "WARNING", "DENIED", "FAILED"],
      default: "SUCCESS",
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

AuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", AuditLogSchema);
