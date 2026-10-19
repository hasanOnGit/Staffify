const mongoose = require("mongoose");

const TaxDeclarationSchema = new mongoose.Schema(
  {
    declarationId: {
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
    financialYear: {
      type: String,
      required: true,
      default: "2024-2025",
      index: true,
    },
    regime: {
      type: String,
      enum: ["New", "Old"],
      default: "New",
    },
    status: {
      type: String,
      enum: ["Draft", "Submitted", "Verified", "Rejected"],
      default: "Draft",
    },
    // Section 80C Deductions (Max 1,50,000)
    section80C: {
      ppf: { type: Number, default: 0 },
      elss: { type: Number, default: 0 },
      lifeInsurance: { type: Number, default: 0 },
      epfVoluntary: { type: Number, default: 0 },
      tuitionFees: { type: Number, default: 0 },
      housingLoanPrincipal: { type: Number, default: 0 },
      sukanyaSamriddhi: { type: Number, default: 0 },
      nsc: { type: Number, default: 0 },
      total80C: { type: Number, default: 0 },
    },
    // Section 80D Medical Insurance
    section80D: {
      selfAndFamily: { type: Number, default: 0 },
      parents: { type: Number, default: 0 },
      parentsSeniorCitizen: { type: Boolean, default: false },
      preventiveHealthCheckup: { type: Number, default: 0 },
      total80D: { type: Number, default: 0 },
    },
    // Section 24(b) - Interest on Housing Loan
    section24B: {
      interestAmount: { type: Number, default: 0 },
      lenderName: { type: String, default: "" },
      lenderPan: { type: String, default: "" },
    },
    // House Rent Allowance (HRA) Exemption Details
    hraDetails: {
      monthlyRent: { type: Number, default: 0 },
      annualRent: { type: Number, default: 0 },
      landlordName: { type: String, default: "" },
      landlordPan: { type: String, default: "" },
      cityType: { type: String, enum: ["Metro", "Non-Metro"], default: "Metro" },
      rentalAddress: { type: String, default: "" },
    },
    // Other Chapter VI-A Deductions
    otherDeductions: {
      section80E: { type: Number, default: 0 },
      section80G: { type: Number, default: 0 },
      section80CCD1B: { type: Number, default: 0 },
      section80TTA: { type: Number, default: 0 },
    },
    // Proof Attachments / Records
    proofs: [
      {
        proofId: { type: String, default: () => "PRF-" + Date.now() },
        section: { type: String, required: true },
        documentTitle: { type: String, required: true },
        declaredAmount: { type: Number, required: true },
        verifiedAmount: { type: Number, default: 0 },
        documentUrl: { type: String, default: "" },
        status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
        remarks: { type: String, default: "" },
      },
    ],
    // Estimated Tax Comparison
    taxEstimate: {
      grossAnnualIncome: { type: Number, default: 0 },
      oldRegimeTax: { type: Number, default: 0 },
      newRegimeTax: { type: Number, default: 0 },
      recommendedRegime: { type: String, default: "New" },
      taxSavings: { type: Number, default: 0 },
    },
    adminRemarks: { type: String, default: "" },
    verifiedBy: { type: String, default: "" },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TaxDeclaration", TaxDeclarationSchema);
