const express = require("express");
const router = express.Router();
const VendorInvoice = require("../models/vendorInvoice.model");
const Deployment = require("../models/deployment.model");
const PurchaseOrder = require("../models/purchaseOrder.model");
const Vendor = require("../models/vendor.model");
const Client = require("../models/client.model");
const Contract = require("../models/contract.model");

// GET /api/vendor-invoices - List with filters
router.get("/", async (req, res) => {
  try {
    const { vendorId, clientId, status, month, year, search } = req.query;
    const filter = {};

    if (vendorId && vendorId !== "All") filter.vendorId = vendorId;
    if (clientId && clientId !== "All") filter.clientId = clientId;
    if (status && status !== "All") filter.status = status;
    if (month && month !== "All") filter["billingPeriod.month"] = month;
    if (year && year !== "All") filter["billingPeriod.year"] = Number(year);
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { vendorName: { $regex: search, $options: "i" } },
        { clientName: { $regex: search, $options: "i" } },
        { poNumber: { $regex: search, $options: "i" } },
      ];
    }

    const invoices = await VendorInvoice.find(filter).sort({ createdAt: -1 }).lean();

    const totalInvoiced = invoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
    const totalGst = invoices.reduce((acc, inv) => acc + (inv.gstAmount || 0), 0);
    const paidAmount = invoices
      .filter((inv) => inv.status === "Paid")
      .reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
    const pendingPayout = totalInvoiced - paidAmount;

    res.json({
      success: true,
      data: invoices,
      stats: {
        totalInvoices: invoices.length,
        totalInvoiced,
        totalGst,
        paidAmount,
        pendingPayout,
      },
    });
  } catch (err) {
    console.error("Error fetching vendor invoices:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/vendor-invoices/generate - Auto-generate invoice from deployed workers & active PO
router.post("/generate", async (req, res) => {
  try {
    const { vendorId, clientId, contractId, poNumber, month, year, customDaysWorked } = req.body;

    if (!vendorId || !clientId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "Vendor, client, billing month, and year are required.",
      });
    }

    const vendor = await Vendor.findOne({ vendorId });
    const client = await Client.findOne({ clientId });
    const contract = await Contract.findOne({
      $or: [{ contractNumber: contractId }, { clientId, vendorId }],
    });
    const po = await PurchaseOrder.findOne({
      $or: [{ poNumber }, { clientId, contractId: contract?.contractNumber }],
    });

    // Find active deployments for this vendor and client
    const deployments = await Deployment.find({
      vendorId,
      clientId,
      status: "Active",
    }).lean();

    if (deployments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No active worker deployments found for this vendor and client combination.",
      });
    }

    // Default working days in a month is 26
    const standardDays = 26;
    let subtotal = 0;

    const lineItems = deployments.map((dep) => {
      const daysWorked = customDaysWorked?.[dep.workerId] || standardDays;
      let lineTotal = 0;

      if (dep.billingUnit === "Hourly") {
        const hours = daysWorked * 8;
        lineTotal = Math.round(hours * dep.billableRate);
      } else if (dep.billingUnit === "Daily") {
        lineTotal = Math.round(daysWorked * dep.billableRate);
      } else {
        // Monthly pro-rated
        lineTotal = Math.round((daysWorked / standardDays) * dep.billableRate);
      }

      subtotal += lineTotal;

      return {
        workerId: dep.workerId,
        workerName: dep.workerName,
        designation: dep.designation,
        billingUnit: dep.billingUnit || "Monthly",
        daysOrHoursWorked: daysWorked,
        rate: dep.billableRate,
        lineTotal,
      };
    });

    const gstRate = 18;
    const gstAmount = Math.round((subtotal * gstRate) / 100);
    const grandTotal = subtotal + gstAmount;

    const invoiceCount = await VendorInvoice.countDocuments();
    const invoiceNumber = `INV-${year}-${String(invoiceCount + 1).padStart(4, "0")}`;

    const newInvoice = new VendorInvoice({
      invoiceNumber,
      vendorId,
      vendorName: vendor?.legalName || "Vendor",
      clientId,
      clientName: client?.legalName || "Client",
      contractId: contract?.contractNumber || contractId || "CNT-DEFAULT",
      contractNumber: contract?.contractNumber || contractId || "CNT-DEFAULT",
      poNumber: po?.poNumber || poNumber || "PO-UNASSIGNED",
      billingPeriod: {
        month,
        year: Number(year),
      },
      lineItems,
      subtotal,
      gstRate,
      gstAmount,
      grandTotal,
      status: "Draft",
      issueDate: new Date(),
      dueDate: new Date(Date.now() + (client?.paymentTermsDays || 30) * 86400000),
    });

    await newInvoice.save();

    res.status(201).json({
      success: true,
      message: `Invoice ${invoiceNumber} generated successfully.`,
      data: newInvoice,
    });
  } catch (err) {
    console.error("Error generating vendor invoice:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/vendor-invoices/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await VendorInvoice.findOne({
      $or: [{ invoiceNumber: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }).lean();

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found." });
    }

    // Attach current PO status & remaining balance
    const po = await PurchaseOrder.findOne({ poNumber: invoice.poNumber }).lean();
    const vendor = await Vendor.findOne({ vendorId: invoice.vendorId }).lean();
    const client = await Client.findOne({ clientId: invoice.clientId }).lean();

    res.json({
      success: true,
      data: {
        ...invoice,
        purchaseOrder: po,
        vendorDetails: vendor,
        clientDetails: client,
      },
    });
  } catch (err) {
    console.error("Error fetching invoice details:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/vendor-invoices/:id/status - Approve or Pay invoice (with PO budget deduction!)
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentReference } = req.body;

    if (!["Draft", "Submitted", "Approved", "Paid", "Cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid invoice status." });
    }

    const invoice = await VendorInvoice.findOne({
      $or: [{ invoiceNumber: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found." });
    }

    const previousStatus = invoice.status;
    invoice.status = status;

    if (status === "Paid") {
      invoice.paymentDate = new Date();
      invoice.paymentReference = paymentReference || `UTR-${Date.now().toString().slice(-8)}`;

      // Deduct from PO budget if moving to Paid
      if (previousStatus !== "Paid" && invoice.poNumber) {
        const po = await PurchaseOrder.findOne({ poNumber: invoice.poNumber });
        if (po) {
          po.utilizedAmount = (po.utilizedAmount || 0) + invoice.grandTotal;
          if (po.utilizedAmount >= po.poValue) {
            po.status = "Exhausted";
          }
          await po.save();
        }
      }
    }

    await invoice.save();

    res.json({
      success: true,
      message: `Invoice marked as ${status}.`,
      data: invoice,
    });
  } catch (err) {
    console.error("Error updating invoice status:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
