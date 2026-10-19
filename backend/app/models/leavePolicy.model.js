const mongoose = require("mongoose");

const LeavePolicySchema = new mongoose.Schema(
  {
    policyId: {
      type: String,
      required: true,
      unique: true,
      default: "DEFAULT_LEAVE_POLICY",
    },
    // Sandwich Policy Configuration
    sandwichPolicyEnabled: {
      type: Boolean,
      default: true,
      description: "Treat intervening weekends/holidays as leaves when leaves are taken on contiguous working days",
    },
    includeWeekends: {
      type: Boolean,
      default: true,
    },
    includeStatutoryHolidays: {
      type: Boolean,
      default: true,
    },
    applicableLeaveTypes: {
      type: [String],
      default: ["casual", "sick", "earned"],
    },
    // Annual Carry-Forward & Rollover Rules
    annualRolloverRules: {
      earnedLeave: {
        maxCarryForward: { type: Number, default: 30 },
        encashmentAllowed: { type: Boolean, default: true },
        annualCredit: { type: Number, default: 15 },
      },
      casualLeave: {
        lapsesAtYearEnd: { type: Boolean, default: true },
        annualCredit: { type: Number, default: 12 },
      },
      sickLeave: {
        maxCarryForward: { type: Number, default: 10 },
        annualCredit: { type: Number, default: 10 },
      },
      halfDayQuota: {
        annualCredit: { type: Number, default: 6 },
      },
    },
    lastRolloverExecutedAt: {
      type: Date,
    },
    lastRolloverExecutedBy: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeavePolicy", LeavePolicySchema);
