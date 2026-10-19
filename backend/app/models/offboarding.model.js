const mongoose = require("mongoose");

const assetClearanceItemSchema = new mongoose.Schema(
  {
    assetName: { type: String, required: true },
    assetCategory: { type: String, default: "IT Hardware" },
    serialNumber: { type: String, default: "" },
    returned: { type: Boolean, default: false },
    verifiedBy: { type: String, default: "" },
    verifiedAt: { type: Date },
    condition: { type: String, default: "Good" },
    remarks: { type: String, default: "" },
  },
  { _id: false }
);

const accountRevocationItemSchema = new mongoose.Schema(
  {
    systemName: { type: String, required: true },
    systemType: { type: String, default: "SaaS / Cloud" },
    revoked: { type: Boolean, default: false },
    revokedBy: { type: String, default: "" },
    revokedAt: { type: Date },
  },
  { _id: false }
);

const exitInterviewSchema = new mongoose.Schema(
  {
    primaryReason: {
      type: String,
      enum: [
        "Better Compensation & Benefits",
        "Career Progression & Growth",
        "Role Alignment & Tech Stack",
        "Work-Life Balance & Commute",
        "Personal / Relocation",
        "Higher Education",
        "Management & Leadership",
      ],
      default: "Career Progression & Growth",
    },
    reasonDetails: { type: String, default: "" },
    compensationRating: { type: Number, min: 1, max: 5, default: 4 },
    workCultureRating: { type: Number, min: 1, max: 5, default: 4 },
    managerSupportRating: { type: Number, min: 1, max: 5, default: 4 },
    growthOpportunitiesRating: { type: Number, min: 1, max: 5, default: 4 },
    wouldRecommendCompany: { type: Boolean, default: true },
    proudMomentsOrLikes: { type: String, default: "" },
    suggestionsForImprovement: { type: String, default: "" },
    conductedBy: { type: String, default: "" },
    conductedAt: { type: Date },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const offboardingSchema = new mongoose.Schema(
  {
    offboardingId: {
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
    designation: {
      type: String,
      default: "Software Engineer",
    },
    resignationDate: {
      type: String,
      required: true,
    },
    lastWorkingDay: {
      type: String,
      required: true,
    },
    noticePeriodDays: {
      type: Number,
      default: 30,
    },
    status: {
      type: String,
      enum: ["Initiated", "In_Progress", "Completed"],
      default: "In_Progress",
      index: true,
    },
    assetClearance: [assetClearanceItemSchema],
    accountRevocation: [accountRevocationItemSchema],
    exitInterview: {
      type: exitInterviewSchema,
      default: () => ({}),
    },
    ktHandoverCompleted: {
      type: Boolean,
      default: false,
    },
    ktReceiverName: {
      type: String,
      default: "",
    },
    hrClearanceGranted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("offboarding", offboardingSchema);
