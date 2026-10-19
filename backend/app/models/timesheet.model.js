const mongoose = require("mongoose");

const timesheetEntrySchema = new mongoose.Schema(
  {
    projectId: { type: String, default: "PRJ-01" },
    projectName: { type: String, required: true },
    clientName: { type: String, default: "Internal" },
    taskCategory: {
      type: String,
      enum: ["Development", "Code Review", "Architecture", "Client Meeting", "Testing & QA", "Bug Fixes", "Support"],
      default: "Development",
    },
    mon: { type: Number, default: 0, min: 0, max: 24 },
    tue: { type: Number, default: 0, min: 0, max: 24 },
    wed: { type: Number, default: 0, min: 0, max: 24 },
    thu: { type: Number, default: 0, min: 0, max: 24 },
    fri: { type: Number, default: 0, min: 0, max: 24 },
    sat: { type: Number, default: 0, min: 0, max: 24 },
    sun: { type: Number, default: 0, min: 0, max: 24 },
    total: { type: Number, default: 0 },
    isBillable: { type: Boolean, default: true },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const timesheetSchema = new mongoose.Schema(
  {
    timesheetId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: true,
      index: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: "Engineering",
    },
    weekStartDate: {
      type: String,
      required: true,
    },
    weekEndDate: {
      type: String,
      required: true,
    },
    entries: [timesheetEntrySchema],
    totalHours: {
      type: Number,
      default: 0,
    },
    billableHours: {
      type: Number,
      default: 0,
    },
    nonBillableHours: {
      type: Number,
      default: 0,
    },
    utilizationPercent: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Draft", "Submitted", "Approved", "Rejected"],
      default: "Draft",
      index: true,
    },
    submittedAt: {
      type: Date,
    },
    managerApproval: {
      approvedBy: { type: String, default: "" },
      approvedAt: { type: Date },
      remarks: { type: String, default: "" },
    },
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("timesheet", timesheetSchema);
