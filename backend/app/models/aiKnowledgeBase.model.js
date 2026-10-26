const mongoose = require("mongoose");

const aiKnowledgeBaseSchema = new mongoose.Schema(
  {
    docId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Labor Law & Statutory",
        "Leave & Attendance Policy",
        "Compensation & Benefits",
        "Recruitment & Hiring",
        "Performance & Appraisals",
        "Workplace Governance & POSH",
        "Exit & Separation",
        "General HR Operations",
      ],
      required: true,
      index: true,
    },
    tags: [{ type: String, index: true }],
    content: { type: String, required: true },
    summary: { type: String, required: true },
    source: { type: String, default: "Open-Source HR Governance & Statutory Standards" },
    applicableRoles: [{ type: String, enum: ["Admin", "Manager", "Employee"] }],
    sampleQuestions: [{ type: String }],
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

aiKnowledgeBaseSchema.index({ title: "text", content: "text", tags: "text" });

module.exports = mongoose.model("AiKnowledgeBase", aiKnowledgeBaseSchema);
