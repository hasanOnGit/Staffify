const mongoose = require("mongoose");

const invoiceLineItemSchema = new mongoose.Schema(
  {
    workerId: { type: String, default: "" },
    workerName: { type: String, required: true },
    designation: { type: String, required: true },
    billingUnit: { type: String, default: "Monthly" },
    daysOrHoursWorked: { type: Number, required: true, min: 0 },
    rate: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const vendorInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    vendorId: {
      type: String,
      required: true,
      trim: true,
    },
    vendorName: {
      type: String,
      default: "",
    },
    clientId: {
      type: String,
      required: true,
      trim: true,
    },
    clientName: {
      type: String,
      default: "",
    },
    contractId: {
      type: String,
      required: true,
      trim: true,
    },
    contractNumber: {
      type: String,
      default: "",
    },
    poNumber: {
      type: String,
      required: true,
      trim: true,
    },
    billingPeriod: {
      month: { type: String, required: true },
      year: { type: Number, required: true },
    },
    lineItems: [invoiceLineItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    gstRate: {
      type: Number,
      default: 18,
      min: 0,
    },
    gstAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Draft", "Submitted", "Approved", "Paid", "Cancelled"],
      default: "Draft",
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    paymentReference: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("VendorInvoice", vendorInvoiceSchema);
