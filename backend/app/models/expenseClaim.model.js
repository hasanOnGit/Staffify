const mongoose = require("mongoose");

const ExpenseClaimSchema = new mongoose.Schema(
  {
    claimId: {
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
    expenseCategory: {
      type: String,
      enum: [
        "Travel & Fuel",
        "Internet & Mobile",
        "Client Entertainment",
        "Relocation",
        "Training & Certifications",
        "Books & Periodicals",
        "Office Supplies",
        "Health & Wellness",
      ],
      required: true,
      index: true,
    },
    claimDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    merchantName: {
      type: String,
      default: "",
    },
    receiptNumber: {
      type: String,
      default: "",
    },
    receiptUrl: {
      type: String,
      default: "",
    },
    attachmentName: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Submitted", "Manager_Approved", "Finance_Approved", "Paid", "Rejected"],
      default: "Submitted",
      index: true,
    },
    managerApproval: {
      approvedBy: { type: String, default: "" },
      approvedAt: { type: Date },
      remarks: { type: String, default: "" },
    },
    financeApproval: {
      approvedBy: { type: String, default: "" },
      approvedAt: { type: Date },
      remarks: { type: String, default: "" },
      paymentMode: { type: String, default: "Payroll Credit" },
      paymentRef: { type: String, default: "" },
    },
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExpenseClaim", ExpenseClaimSchema);
