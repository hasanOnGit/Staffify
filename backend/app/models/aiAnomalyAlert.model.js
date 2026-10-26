const mongoose = require("mongoose");

const aiAnomalyAlertSchema = new mongoose.Schema(
  {
    alertId: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      enum: ["ATTENDANCE", "PAYROLL", "LEAVE", "RECRUITMENT", "HELPDESK"],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ["CRITICAL", "WARNING", "INFO"],
      default: "WARNING",
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    metrics: { type: mongoose.Schema.Types.Mixed, default: {} },
    affectedEntity: {
      entityType: { type: String, default: "System" },
      entityId: { type: String, default: "" },
      entityName: { type: String, default: "" },
    },
    recommendedAction: { type: String, default: "" },
    status: {
      type: String,
      enum: ["ACTIVE", "ACKNOWLEDGED", "RESOLVED"],
      default: "ACTIVE",
      index: true,
    },
    detectedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AiAnomalyAlert", aiAnomalyAlertSchema);
