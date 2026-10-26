const mongoose = require("mongoose");

const aiQueryLogSchema = new mongoose.Schema(
  {
    logId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, default: "User" },
    userRole: { type: String, enum: ["Admin", "Manager", "Employee"], default: "Employee", index: true },
    conversationId: { type: String, required: true, index: true },
    queryText: { type: String, required: true, index: "text" },
    intentType: {
      type: String,
      enum: ["QUERY", "ACTION_DRAFT", "CONVERSATIONAL", "KNOWLEDGE_BASE"],
      default: "QUERY",
      index: true,
    },
    resolvedModule: { type: String, default: "employees", index: true },
    responseSummary: { type: String },
    detailedDescription: { type: String },
    recordCount: { type: Number, default: 0 },
    executionTimeMs: { type: Number, default: 0 },
    modelUsed: { type: String, default: "dsqe-deterministic" },
    clientRoute: { type: String, default: "" },
    feedback: { type: String, enum: ["up", "down", null], default: null },
    isTrainingSample: { type: Boolean, default: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AiQueryLog", aiQueryLogSchema);
