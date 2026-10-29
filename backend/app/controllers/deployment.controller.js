const express = require("express");
const router = express.Router();
const Deployment = require("../models/deployment.model");
const Vendor = require("../models/vendor.model");
const Client = require("../models/client.model");
const Contract = require("../models/contract.model");
const PurchaseOrder = require("../models/purchaseOrder.model");

// GET /api/deployments - Live Workforce Deployment Matrix
router.get("/", async (req, res) => {
  try {
    const { vendorId, clientId, siteId, status, search } = req.query;
    const filter = {};

    if (vendorId && vendorId !== "All") filter.vendorId = vendorId;
    if (clientId && clientId !== "All") filter.clientId = clientId;
    if (siteId && siteId !== "All") filter.siteId = siteId;
    if (status && status !== "All") filter.status = status;
    if (search) {
      filter.$or = [
        { workerName: { $regex: search, $options: "i" } },
        { workerId: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
        { poNumber: { $regex: search, $options: "i" } },
        { clientName: { $regex: search, $options: "i" } },
        { vendorName: { $regex: search, $options: "i" } },
      ];
    }

    const deployments = await Deployment.find(filter).sort({ createdAt: -1 }).lean();

    const totalDeployments = await Deployment.countDocuments();
    const activeDeployments = await Deployment.countDocuments({ status: "Active" });
    const completedDeployments = await Deployment.countDocuments({ status: "Completed" });
    const terminatedDeployments = await Deployment.countDocuments({ status: "Terminated" });

    res.json({
      success: true,
      data: deployments,
      stats: {
        total: totalDeployments,
        active: activeDeployments,
        completed: completedDeployments,
        terminated: terminatedDeployments,
      },
    });
  } catch (err) {
    console.error("Error fetching deployments:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/deployments - Deploy new worker to client site under active PO
router.post("/", async (req, res) => {
  try {
    const {
      workerName,
      workerPhone,
      vendorId,
      clientId,
      siteId,
      contractId,
      poNumber,
      designation,
      billingUnit,
      billableRate,
      startDate,
      notes,
    } = req.body;

    if (
      !workerName ||
      !vendorId ||
      !clientId ||
      !siteId ||
      !contractId ||
      !poNumber ||
      !designation ||
      !billableRate ||
      !startDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Worker name, vendor, client, site, contract, PO, designation, billable rate, and start date are required.",
      });
    }

    // Verify PO validity and availability
    const po = await PurchaseOrder.findOne({ poNumber });
    if (po && po.status === "Exhausted") {
      return res.status(400).json({
        success: false,
        message: `Purchase Order ${poNumber} is marked as Exhausted. Choose an active PO.`,
      });
    }

    const vendor = await Vendor.findOne({ vendorId });
    const client = await Client.findOne({ clientId });
    const siteObj = client?.sites?.find((s) => s.siteId === siteId);

    const depCount = await Deployment.countDocuments();
    const deploymentId = "DEP-" + String(3001 + depCount).padStart(4, "0");
    const workerId = "WRK-" + String(8001 + depCount).padStart(4, "0");

    const newDeployment = new Deployment({
      deploymentId,
      workerId,
      workerName,
      workerPhone: workerPhone || "",
      vendorId,
      vendorName: vendor?.legalName || "Vendor",
      clientId,
      clientName: client?.legalName || "Client",
      siteId,
      siteName: siteObj?.siteName || siteId,
      contractId,
      contractNumber: contractId,
      poNumber,
      designation,
      billingUnit: billingUnit || "Monthly",
      billableRate: Number(billableRate),
      startDate,
      status: "Active",
      notes: notes || "",
    });

    await newDeployment.save();

    res.status(201).json({
      success: true,
      message: "Worker deployed successfully.",
      data: newDeployment,
    });
  } catch (err) {
    console.error("Error deploying worker:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/deployments/:id/status - Update deployment status
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, endDate, notes } = req.body;

    if (!["Active", "Completed", "Terminated"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    const updateData = { status };
    if (endDate) updateData.endDate = endDate;
    if (status !== "Active" && !endDate) updateData.endDate = new Date();
    if (notes) updateData.notes = notes;

    const deployment = await Deployment.findOneAndUpdate(
      { $or: [{ deploymentId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      { $set: updateData },
      { new: true }
    );

    if (!deployment) {
      return res.status(404).json({ success: false, message: "Deployment not found." });
    }

    res.json({
      success: true,
      message: `Deployment marked as ${status}.`,
      data: deployment,
    });
  } catch (err) {
    console.error("Error updating deployment status:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
