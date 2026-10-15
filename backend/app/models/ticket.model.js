const mongoose = require("mongoose");

const ticketCommentSchema = new mongoose.Schema(
  {
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    authorRole: { type: String, default: "Employee" },
    message: { type: String, required: true },
    isInternal: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["IT Hardware & Software", "HR Operations", "Payroll & Taxes", "Facilities & Workplace"],
      default: "IT Hardware & Software",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
      index: true,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
      index: true,
    },
    requesterId: {
      type: String,
      required: true,
      index: true,
    },
    requesterName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: "Engineering",
    },
    assignedToId: {
      type: String,
      default: "",
    },
    assignedToName: {
      type: String,
      default: "Unassigned",
    },
    resolutionNote: {
      type: String,
      default: "",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    comments: {
      type: [ticketCommentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ticket", ticketSchema);
