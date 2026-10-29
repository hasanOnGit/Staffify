const express = require("express");
const router = express.Router();
const Contract = require("../models/contract.model");
const PurchaseOrder = require("../models/purchaseOrder.model");
const Client = require("../models/client.model");
const Vendor = require("../models/vendor.model");

/* ==========================================================
   CONTRACTS & RATE CARDS
   ========================================================== */

// GET /api/commercials/contracts
router.get("/contracts", async (req, res) => {
  try {
    const { clientId, vendorId, status, search } = req.query;
    const filter = {};

    if (clientId && clientId !== "All") filter.clientId = clientId;
    if (vendorId && vendorId !== "All") filter.vendorId = vendorId;
    if (status && status !== "All") filter.status = status;
    if (search) {
      filter.$or = [
        { contractNumber: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { clientName: { $regex: search, $options: "i" } },
        { vendorName: { $regex: search, $options: "i" } },
      ];
    }

    const contracts = await Contract.find(filter).sort({ createdAt: -1 }).lean();

    // Attach active PO count and total PO value per contract
    const enrichedContracts = await Promise.all(
      contracts.map(async (c) => {
        const pos = await PurchaseOrder.find({ contractId: c.contractNumber }).lean();
        const totalPoBudget = pos.reduce((acc, p) => acc + (p.poValue || 0), 0);
        const totalPoUtilized = pos.reduce((acc, p) => acc + (p.utilizedAmount || 0), 0);
        return {
          ...c,
          poCount: pos.length,
          totalPoBudget,
          totalPoUtilized,
        };
      })
    );

    res.json({ success: true, data: enrichedContracts });
  } catch (err) {
    console.error("Error fetching contracts:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/commercials/contracts
router.post("/contracts", async (req, res) => {
  try {
    const {
      title,
      clientId,
      vendorId,
      startDate,
      endDate,
      rateCards,
      termsAndConditions,
      status,
    } = req.body;

    if (!clientId || !vendorId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Client ID, Vendor ID, start date, and end date are required.",
      });
    }

    const client = await Client.findOne({ clientId });
    const vendor = await Vendor.findOne({ vendorId });

    const contractCount = await Contract.countDocuments();
    const contractNumber = "CNT-" + String(2001 + contractCount).padStart(4, "0");

    // Compute billableRate = baseCost * (1 + markupPercent / 100) if not explicitly set
    const formattedRateCards = (rateCards || []).map((rc) => {
      const baseCost = Number(rc.baseCost) || 0;
      const markupPercent = Number(rc.markupPercent) || 0;
      const calculatedBillableRate =
        Number(rc.billableRate) || Math.round(baseCost * (1 + markupPercent / 100));

      return {
        designation: rc.designation || "Staff",
        billingUnit: rc.billingUnit || "Monthly",
        baseCost,
        markupPercent,
        billableRate: calculatedBillableRate,
      };
    });

    const newContract = new Contract({
      contractNumber,
      title: title || `${vendor?.legalName || "Vendor"} - ${client?.legalName || "Client"} Staffing Agreement`,
      clientId,
      clientName: client?.legalName || "Client",
      vendorId,
      vendorName: vendor?.legalName || "Vendor",
      startDate,
      endDate,
      status: status || "Active",
      rateCards: formattedRateCards,
      termsAndConditions: termsAndConditions || "",
    });

    await newContract.save();

    res.status(201).json({
      success: true,
      message: "Contract created successfully.",
      data: newContract,
    });
  } catch (err) {
    console.error("Error creating contract:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ==========================================================
   PURCHASE ORDERS & BUDGET UTILIZATION
   ========================================================== */

// GET /api/commercials/purchase-orders
router.get("/purchase-orders", async (req, res) => {
  try {
    const { clientId, contractId, status, search } = req.query;
    const filter = {};

    if (clientId && clientId !== "All") filter.clientId = clientId;
    if (contractId && contractId !== "All") filter.contractId = contractId;
    if (status && status !== "All") filter.status = status;
    if (search) {
      filter.$or = [
        { poNumber: { $regex: search, $options: "i" } },
        { clientName: { $regex: search, $options: "i" } },
        { contractNumber: { $regex: search, $options: "i" } },
      ];
    }

    const pos = await PurchaseOrder.find(filter).sort({ createdAt: -1 }).lean();

    // Enrich with utilization percentage
    const enrichedPos = pos.map((p) => {
      const utilizationPercent =
        p.poValue > 0 ? Math.min(100, Math.round((p.utilizedAmount / p.poValue) * 100)) : 0;
      return {
        ...p,
        utilizationPercent,
        remainingBalance: Math.max(0, p.poValue - p.utilizedAmount),
      };
    });

    const totalPoBudget = pos.reduce((acc, p) => acc + (p.poValue || 0), 0);
    const totalUtilized = pos.reduce((acc, p) => acc + (p.utilizedAmount || 0), 0);
    const activePoCount = pos.filter((p) => p.status === "Active").length;

    res.json({
      success: true,
      data: enrichedPos,
      stats: {
        totalPOs: pos.length,
        activePOs: activePoCount,
        totalBudget: totalPoBudget,
        totalUtilized: totalUtilized,
        totalRemaining: Math.max(0, totalPoBudget - totalUtilized),
        averageUtilization:
          totalPoBudget > 0 ? Math.round((totalUtilized / totalPoBudget) * 100) : 0,
      },
    });
  } catch (err) {
    console.error("Error fetching purchase orders:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/commercials/purchase-orders
router.post("/purchase-orders", async (req, res) => {
  try {
    const {
      contractId,
      clientId,
      poValue,
      startDate,
      expiryDate,
      description,
      status,
    } = req.body;

    if (!contractId || !clientId || !poValue || !startDate || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Contract ID, Client ID, PO value, start date, and expiry date are required.",
      });
    }

    const client = await Client.findOne({ clientId });
    const contract = await Contract.findOne({
      $or: [{ contractNumber: contractId }, { _id: contractId.match(/^[0-9a-fA-F]{24}$/) ? contractId : null }],
    });

    const poCount = await PurchaseOrder.countDocuments();
    const poNumber = "PO-" + String(5001 + poCount).padStart(4, "0");

    const newPO = new PurchaseOrder({
      poNumber,
      contractId: contract?.contractNumber || contractId,
      contractNumber: contract?.contractNumber || contractId,
      clientId,
      clientName: client?.legalName || "Client",
      poValue: Number(poValue),
      utilizedAmount: 0,
      startDate,
      expiryDate,
      status: status || "Active",
      description: description || "",
    });

    await newPO.save();

    res.status(201).json({
      success: true,
      message: "Purchase order created successfully.",
      data: newPO,
    });
  } catch (err) {
    console.error("Error creating purchase order:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
