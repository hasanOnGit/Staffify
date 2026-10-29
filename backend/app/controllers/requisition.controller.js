const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Requisition = require("../models/requisition.model");
const Worker = require("../models/worker.model");
const Deployment = require("../models/deployment.model");
const Client = require("../models/client.model");
const PurchaseOrder = require("../models/purchaseOrder.model");

const getQueryByIdOrRequisitionId = (param) => {
  return mongoose.isValidObjectId(param)
    ? { $or: [{ _id: param }, { requisitionId: param }] }
    : { requisitionId: param };
};

// GET /api/requisitions - List with tenant filtering and stats
router.get("/", async (req, res) => {
  try {
    const { status, urgency, clientId, search } = req.query;
    const vendorId = req.headers["x-vendor-id"] || req.query.vendorId;

    const filter = {};
    if (vendorId) filter.vendorId = vendorId;
    if (status && status !== "All") filter.status = status;
    if (urgency && urgency !== "All") filter.urgency = urgency;
    if (clientId && clientId !== "All") filter.clientId = clientId;

    if (search) {
      filter.$or = [
        { requisitionId: { $regex: search, $options: "i" } },
        { jobTitle: { $regex: search, $options: "i" } },
        { clientName: { $regex: search, $options: "i" } },
        { siteName: { $regex: search, $options: "i" } },
        { tradeCategory: { $regex: search, $options: "i" } },
      ];
    }

    const requisitions = await Requisition.find(filter).sort({ createdAt: -1 }).lean();

    // Compute stats
    const baseFilter = vendorId ? { vendorId } : {};
    const total = await Requisition.countDocuments(baseFilter);
    const open = await Requisition.countDocuments({ ...baseFilter, status: "Open" });
    const inProgress = await Requisition.countDocuments({ ...baseFilter, status: "In Progress" });
    const fulfilled = await Requisition.countDocuments({ ...baseFilter, status: "Fulfilled" });
    const critical = await Requisition.countDocuments({
      ...baseFilter,
      urgency: "Critical",
      status: { $in: ["Open", "In Progress"] },
    });

    const allReqs = await Requisition.find(baseFilter).select("requiredHeadcount fulfilledHeadcount").lean();
    const totalPositionsNeeded = allReqs.reduce((sum, r) => sum + (r.requiredHeadcount || 0), 0);
    const totalPositionsFilled = allReqs.reduce((sum, r) => sum + (r.fulfilledHeadcount || 0), 0);

    res.json({
      success: true,
      data: requisitions,
      stats: {
        total,
        open,
        inProgress,
        fulfilled,
        critical,
        totalPositionsNeeded,
        totalPositionsFilled,
      },
    });
  } catch (err) {
    console.error("Error fetching requisitions:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/requisitions/:id - Get requisition details
router.get("/:id", async (req, res) => {
  try {
    const requisition = await Requisition.findOne(
      getQueryByIdOrRequisitionId(req.params.id)
    ).lean();

    if (!requisition) {
      return res.status(404).json({ success: false, message: "Requisition not found" });
    }

    res.json({ success: true, data: requisition });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/requisitions - Create new client staffing demand
router.post("/", async (req, res) => {
  try {
    const {
      clientId,
      siteId,
      poNumber,
      contractNumber,
      jobTitle,
      tradeCategory,
      requiredHeadcount,
      urgency,
      billingRate,
      billingUnit,
      targetWorkerPay,
      startDate,
      endDate,
      skillsRequired,
      experienceYears,
      notes,
    } = req.body;

    const vendorId = req.headers["x-vendor-id"] || req.body.vendorId || "VND-1002";
    const vendorName = req.body.vendorName || (vendorId === "VND-1002" ? "Infiniti TechStaffing" : "Staffing Agency");

    // Lookup client and site names
    let clientName = req.body.clientName;
    let siteName = req.body.siteName;

    if (!clientName || !siteName) {
      const client = await Client.findOne({ clientId });
      if (client) {
        clientName = client.legalName;
        const site = client.sites?.find((s) => s.siteId === siteId);
        if (site) siteName = site.siteName;
      }
    }

    const count = await Requisition.countDocuments();
    const requisitionId = req.body.requisitionId || `REQ-${String(count + 101).padStart(4, "0")}`;

    const newReq = new Requisition({
      requisitionId,
      vendorId,
      vendorName,
      clientId,
      clientName: clientName || clientId,
      siteId,
      siteName: siteName || siteId,
      poNumber: poNumber || "",
      contractNumber: contractNumber || "",
      jobTitle,
      tradeCategory: tradeCategory || "General",
      requiredHeadcount: Number(requiredHeadcount) || 1,
      fulfilledHeadcount: 0,
      urgency: urgency || "Normal",
      billingRate: Number(billingRate) || 0,
      billingUnit: billingUnit || "Monthly",
      targetWorkerPay: Number(targetWorkerPay) || 0,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      status: "Open",
      skillsRequired: skillsRequired || [],
      experienceYears: Number(experienceYears) || 1,
      notes: notes || "",
    });

    await newReq.save();

    res.status(201).json({
      success: true,
      message: "Client requisition created successfully.",
      data: newReq,
    });
  } catch (err) {
    console.error("Error creating requisition:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/requisitions/:id/allocate - 1-Click allocate workers from bench
router.post("/:id/allocate", async (req, res) => {
  try {
    const { workerIds } = req.body; // Array of workerIds to allocate
    if (!workerIds || !Array.isArray(workerIds) || workerIds.length === 0) {
      return res.status(400).json({ success: false, message: "Please select at least one worker to allocate." });
    }

    const requisition = await Requisition.findOne(
      getQueryByIdOrRequisitionId(req.params.id)
    );

    if (!requisition) {
      return res.status(404).json({ success: false, message: "Requisition not found." });
    }

    const remainingNeeded = requisition.requiredHeadcount - requisition.fulfilledHeadcount;
    if (remainingNeeded <= 0) {
      return res.status(400).json({ success: false, message: "This requisition has already been completely fulfilled." });
    }

    const workers = await Worker.find({
      workerId: { $in: workerIds },
      status: { $in: ["Available", "On Leave"] },
    });

    if (workers.length === 0) {
      return res.status(400).json({ success: false, message: "None of the selected workers are currently available on the bench." });
    }

    const assignedEntries = [];

    for (const worker of workers) {
      const depCount = await Deployment.countDocuments();
      const deploymentId = `DEP-REQ-${String(depCount + 1001)}`;

      // Create Deployment Record
      const newDeployment = new Deployment({
        deploymentId,
        workerId: worker.workerId,
        workerName: worker.fullName,
        workerPhone: worker.phone,
        vendorId: requisition.vendorId,
        vendorName: requisition.vendorName,
        clientId: requisition.clientId,
        clientName: requisition.clientName,
        siteId: requisition.siteId,
        siteName: requisition.siteName,
        poNumber: requisition.poNumber || "PO-5001",
        contractId: requisition.contractNumber || "CTR-2026-01",
        contractNumber: requisition.contractNumber || "CTR-2026-01",
        designation: requisition.jobTitle,
        billableRate: requisition.billingRate,
        billingUnit: requisition.billingUnit,
        startDate: requisition.startDate || new Date(),
        status: "Active",
        notes: `Allocated against demand ${requisition.requisitionId}`,
      });

      await newDeployment.save();

      // Update Worker Status
      worker.status = "Deployed";
      worker.currentDeployment = {
        deploymentId,
        clientId: requisition.clientId,
        clientName: requisition.clientName,
        siteId: requisition.siteId,
        siteName: requisition.siteName,
        poNumber: requisition.poNumber || "PO-5001",
        billableRate: requisition.billingRate,
        deployedAt: new Date(),
      };

      if (!worker.deploymentHistory) worker.deploymentHistory = [];
      worker.deploymentHistory.push({
        deploymentId,
        clientId: requisition.clientId,
        clientName: requisition.clientName,
        siteName: requisition.siteName,
        designation: requisition.jobTitle,
        startDate: new Date(),
        status: "Active",
      });

      await worker.save();

      assignedEntries.push({
        workerId: worker.workerId,
        workerName: worker.fullName,
        deploymentId,
        assignedAt: new Date(),
      });
    }

    // Update Requisition
    requisition.assignedWorkers.push(...assignedEntries);
    requisition.fulfilledHeadcount += assignedEntries.length;

    if (requisition.fulfilledHeadcount >= requisition.requiredHeadcount) {
      requisition.status = "Fulfilled";
    } else {
      requisition.status = "In Progress";
    }

    await requisition.save();

    res.json({
      success: true,
      message: `Successfully allocated ${assignedEntries.length} worker(s) to ${requisition.jobTitle} on site ${requisition.siteName}.`,
      data: requisition,
      allocated: assignedEntries,
    });
  } catch (err) {
    console.error("Error allocating workers to requisition:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/requisitions/:id/status - Update requisition status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const requisition = await Requisition.findOneAndUpdate(
      getQueryByIdOrRequisitionId(req.params.id),
      { status },
      { new: true }
    );

    if (!requisition) {
      return res.status(404).json({ success: false, message: "Requisition not found" });
    }

    res.json({
      success: true,
      message: `Requisition status updated to ${status}.`,
      data: requisition,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
