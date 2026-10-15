const mongoose = require("mongoose");

const salaryStructureSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    annualCtc: {
      type: Number,
      required: true,
      default: 600000,
    },
    monthlyCtc: {
      type: Number,
      required: true,
      default: 50000,
    },
    // Earnings (Monthly)
    basicSalary: {
      type: Number,
      required: true,
      default: 22500, // 45% of monthly
    },
    hra: {
      type: Number,
      required: true,
      default: 11250, // 50% of Basic
    },
    conveyance: {
      type: Number,
      default: 1600,
    },
    medicalAllowance: {
      type: Number,
      default: 1250,
    },
    specialAllowance: {
      type: Number,
      default: 13400, // Balancing figure
    },
    // Statutory settings
    epfApplicable: {
      type: Boolean,
      default: true,
    },
    epfCapped: {
      type: Boolean,
      default: true, // Cap at statutory Rs 1,800/mo
    },
    esiApplicable: {
      type: Boolean,
      default: false,
    },
    ptApplicable: {
      type: Boolean,
      default: true, // Standard Rs 200/mo
    },
    tdsMonthly: {
      type: Number,
      default: 0,
    },
    taxRegime: {
      type: String,
      enum: ["New", "Old"],
      default: "New",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SalaryStructure", salaryStructureSchema);
