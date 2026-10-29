const express = require("express");
const router = express.Router();
const Worker = require("../models/worker.model");
const Deployment = require("../models/deployment.model");
const PurchaseOrder = require("../models/purchaseOrder.model");
const VendorInvoice = require("../models/vendorInvoice.model");
const Client = require("../models/client.model");
const Vendor = require("../models/vendor.model");

// GET /api/dashboard/stats - Executive Command Center Aggregates
router.get("/stats", async (req, res) => {
  try {
    const [
      totalWorkers,
      benchWorkers,
      activeDeployments,
      totalClients,
      totalVendors,
      pos,
      invoices,
      recentDeployments,
      recentInvoices,
    ] = await Promise.all([
      Worker.countDocuments(),
      Worker.countDocuments({ status: "Available" }),
      Deployment.countDocuments({ status: "Active" }),
      Client.countDocuments({ status: "Active" }),
      Vendor.countDocuments({ status: "Active" }),
      PurchaseOrder.find().lean(),
      VendorInvoice.find().lean(),
      Deployment.find().sort({ createdAt: -1 }).limit(5).lean(),
      VendorInvoice.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    // Financial aggregates
    const totalPoBudget = pos.reduce((acc, p) => acc + (p.poValue || 0), 0);
    const totalPoBurned = pos.reduce((acc, p) => acc + (p.utilizedAmount || 0), 0);
    const totalPoRemaining = Math.max(0, totalPoBudget - totalPoBurned);

    const totalInvoiced = invoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
    const paidInvoiced = invoices
      .filter((inv) => inv.status === "Paid")
      .reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
    const pendingReceivables = Math.max(0, totalInvoiced - paidInvoiced);

    // PO Watchdog: POs approaching budget cap (> 70% burn rate)
    const atRiskPOs = pos
      .map((p) => {
        const percent = p.poValue > 0 ? Math.round((p.utilizedAmount / p.poValue) * 100) : 0;
        return {
          ...p,
          percent,
          remaining: Math.max(0, p.poValue - p.utilizedAmount),
        };
      })
      .filter((p) => p.percent >= 60 || p.status === "Exhausted")
      .sort((a, b) => b.percent - a.percent);

    res.json({
      success: true,
      stats: {
        activeDeployments,
        benchWorkers,
        totalWorkers,
        totalClients,
        totalVendors,
        totalPoBudget,
        totalPoBurned,
        totalPoRemaining,
        totalInvoiced,
        paidInvoiced,
        pendingReceivables,
        overallPoBurnRate:
          totalPoBudget > 0 ? Math.round((totalPoBurned / totalPoBudget) * 100) : 0,
      },
      atRiskPOs,
      recentDeployments,
      recentInvoices,
    });
  } catch (err) {
    console.error("Error fetching dashboard statistics:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
