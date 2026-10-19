const mongoose = require("mongoose");

const WebhookAuditLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    configId: {
      type: String,
      default: "",
    },
    configName: {
      type: String,
      default: "Default Webhook",
    },
    platform: {
      type: String,
      enum: ["Slack", "Teams", "CustomWebhook"],
      default: "Slack",
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    targetEntityId: {
      type: String,
      default: "",
    },
    targetEntityTitle: {
      type: String,
      default: "",
    },
    employeeId: {
      type: String,
      default: "",
    },
    employeeName: {
      type: String,
      default: "",
    },
    department: {
      type: String,
      default: "General",
    },
    deliveryStatus: {
      type: String,
      enum: ["Delivered", "Failed", "Simulated"],
      default: "Delivered",
      index: true,
    },
    httpStatusCode: {
      type: Number,
      default: 200,
    },
    responseBody: {
      type: String,
      default: "ok",
    },
    payloadPreview: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    actionResolved: {
      isResolved: {
        type: Boolean,
        default: false,
      },
      actionTaken: {
        type: String,
        enum: ["Approved", "Rejected", "Pending", "Acknowledged"],
        default: "Pending",
      },
      actorName: {
        type: String,
        default: "",
      },
      actorEmail: {
        type: String,
        default: "",
      },
      actorChannel: {
        type: String,
        default: "",
      },
      resolvedAt: {
        type: Date,
      },
      comment: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WebhookAuditLog", WebhookAuditLogSchema);
