const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    queryPlan: { type: mongoose.Schema.Types.Mixed },
    data: { type: mongoose.Schema.Types.Mixed },
    kpis: { type: mongoose.Schema.Types.Mixed },
    actionDraft: { type: mongoose.Schema.Types.Mixed },
    actionResult: { type: mongoose.Schema.Types.Mixed },
    citations: [{ source: String, recordCount: Number, timestamp: Date }],
    error: { type: String },
  },
  { _id: false }
);

const aiConversationSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    employeeId: { type: String, default: "EMP-ADMIN-01" },
    userName: { type: String, default: "User" },
    userRole: { type: String, enum: ["Admin", "Manager", "Employee"], default: "Employee" },
    title: { type: String, default: "New Conversation" },
    messages: [messageSchema],
    lastContext: {
      module: { type: String },
      entity: { type: String },
      filters: { type: mongoose.Schema.Types.Mixed, default: {} },
      reportingPeriod: { type: String },
      lastQueryText: { type: String },
      lastRecordCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AiConversation", aiConversationSchema);
