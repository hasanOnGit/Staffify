const mongoose = require("mongoose");

const HrDocumentSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    referenceNumber: {
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
      default: "General",
    },
    designation: {
      type: String,
      default: "Employee",
    },
    templateType: {
      type: String,
      enum: [
        "Appointment_Offer",
        "Bonafide_Certificate",
        "Salary_Revision",
        "Relieving_Experience",
        "Address_Proof",
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    signatoryName: {
      type: String,
      default: "Ananya Sharma",
    },
    signatoryTitle: {
      type: String,
      default: "Head of People & Operations",
    },
    contentHtml: {
      type: String,
      required: true,
    },
    placeholders: {
      type: Map,
      of: String,
      default: {},
    },
    status: {
      type: String,
      enum: ["Generated", "Signed", "Issued", "Archived"],
      default: "Issued",
    },
    generatedBy: {
      type: String,
      default: "HR Admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HrDocument", HrDocumentSchema);
