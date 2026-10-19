const mongoose = require("mongoose");

const WebhookConfigSchema = new mongoose.Schema(
  {
    configId: {
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
    platform: {
      type: String,
      enum: ["Slack", "Teams", "CustomWebhook"],
      default: "Slack",
      required: true,
    },
    webhookUrl: {
      type: String,
      required: true,
      trim: true,
    },
    channelName: {
      type: String,
      default: "#general-notifications",
      trim: true,
    },
    signingSecret: {
      type: String,
      default: () => "whsec_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    },
    environment: {
      type: String,
      enum: ["Production", "Staging", "Sandbox"],
      default: "Production",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscribedEvents: {
      type: [String],
      default: ["LEAVE_REQUEST", "EXPENSE_CLAIM", "ATTENDANCE_REGULARIZATION", "MISSED_PUNCH_NUDGE"],
    },
    totalDispatched: {
      type: Number,
      default: 0,
    },
    lastDispatchedAt: {
      type: Date,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WebhookConfig", WebhookConfigSchema);
