const express = require("express");
const router = express.Router();
const Client = require("../models/client.model");
const Contract = require("../models/contract.model");
const Deployment = require("../models/deployment.model");

// GET /api/clients - Listing with site counts & active worker deployment stats
router.get("/", async (req, res) => {
  try {
    const { search, industry, status } = req.query;
    const filter = {};

    if (industry && industry !== "All") {
      filter.industry = industry;
    }
    if (status && status !== "All") {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { legalName: { $regex: search, $options: "i" } },
        { clientId: { $regex: search, $options: "i" } },
        { gstin: { $regex: search, $options: "i" } },
        { "sites.siteName": { $regex: search, $options: "i" } },
        { "sites.location": { $regex: search, $options: "i" } },
      ];
    }

    const clients = await Client.find(filter).sort({ createdAt: -1 }).lean();

    const enrichedClients = await Promise.all(
      clients.map(async (c) => {
        const activeContractsCount = await Contract.countDocuments({
          clientId: c.clientId,
          status: "Active",
        });
        const activeWorkersCount = await Deployment.countDocuments({
          clientId: c.clientId,
          status: "Active",
        });
        return {
          ...c,
          siteCount: c.sites ? c.sites.length : 0,
          activeContractsCount,
          activeWorkersCount,
        };
      })
    );

    const totalClients = await Client.countDocuments();
    const activeClients = await Client.countDocuments({ status: "Active" });
    const allSites = clients.reduce((acc, c) => acc + (c.sites?.length || 0), 0);

    res.json({
      success: true,
      data: enrichedClients,
      stats: {
        total: totalClients,
        active: activeClients,
        totalSites: allSites,
      },
    });
  } catch (err) {
    console.error("Error fetching clients:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/clients - Create new client with physical sites
router.post("/", async (req, res) => {
  try {
    const {
      legalName,
      industry,
      gstin,
      billingAddress,
      sites,
      paymentTermsDays,
      spocName,
      spocEmail,
      spocPhone,
      status,
    } = req.body;

    if (!legalName || !industry || !gstin) {
      return res.status(400).json({
        success: false,
        message: "Legal name, industry, and GSTIN are required.",
      });
    }

    const existing = await Client.findOne({ gstin: gstin.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A client with this GSTIN already exists.",
      });
    }

    const clientCount = await Client.countDocuments();
    const clientId = "CLI-" + String(1001 + clientCount).padStart(4, "0");

    // Format sites with siteIds if provided
    const formattedSites = (sites || []).map((s, idx) => ({
      siteId: s.siteId || `${clientId}-SITE-${String(idx + 1).padStart(2, "0")}`,
      siteName: s.siteName || `Site ${idx + 1}`,
      location: s.location || "Headquarters",
      address: s.address || "",
      contactPerson: s.contactPerson || {},
      isActive: s.isActive !== undefined ? s.isActive : true,
    }));

    const newClient = new Client({
      clientId,
      legalName,
      industry,
      gstin: gstin.toUpperCase(),
      billingAddress: billingAddress || {},
      sites: formattedSites,
      paymentTermsDays: paymentTermsDays || 30,
      spocName: spocName || "",
      spocEmail: spocEmail || "",
      spocPhone: spocPhone || "",
      status: status || "Active",
    });

    await newClient.save();

    res.status(201).json({
      success: true,
      message: "Client registered successfully.",
      data: newClient,
    });
  } catch (err) {
    console.error("Error registering client:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/clients/:id - Client dossier with site deployments & active contracts
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findOne({
      $or: [{ clientId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }).lean();

    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found." });
    }

    const contracts = await Contract.find({ clientId: client.clientId }).lean();
    const deployments = await Deployment.find({ clientId: client.clientId }).lean();

    res.json({
      success: true,
      data: {
        ...client,
        contracts,
        deployments,
      },
    });
  } catch (err) {
    console.error("Error fetching client details:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/clients/:id - Update client and site information
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findOneAndUpdate(
      { $or: [{ clientId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found." });
    }

    res.json({
      success: true,
      message: "Client updated successfully.",
      data: client,
    });
  } catch (err) {
    console.error("Error updating client:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/clients/:id/sites - Add physical site to existing client
router.post("/:id/sites", async (req, res) => {
  try {
    const { id } = req.params;
    const { siteName, location, address, contactPerson } = req.body;

    if (!siteName || !location) {
      return res.status(400).json({
        success: false,
        message: "Site name and location are required.",
      });
    }

    const client = await Client.findOne({
      $or: [{ clientId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found." });
    }

    const nextIndex = client.sites.length + 1;
    const siteId = `${client.clientId}-SITE-${String(nextIndex).padStart(2, "0")}`;

    client.sites.push({
      siteId,
      siteName,
      location,
      address: address || "",
      contactPerson: contactPerson || {},
      isActive: true,
    });

    await client.save();

    res.status(201).json({
      success: true,
      message: "Site added successfully.",
      data: client,
    });
  } catch (err) {
    console.error("Error adding client site:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/clients/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Client.findOneAndDelete({
      $or: [{ clientId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Client not found." });
    }

    res.json({ success: true, message: "Client deleted successfully." });
  } catch (err) {
    console.error("Error deleting client:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
