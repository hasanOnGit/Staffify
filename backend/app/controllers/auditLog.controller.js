const AuditLog = require("../models/auditLog.model");

// In-memory fallback if Mongo connection is absent or buffering
let inMemoryLogs = [];

const seedInitialAuditLogs = async () => {
  try {
    const count = await AuditLog.countDocuments();
    if (count > 0) return;

    const initialSeeds = [
      {
        logId: "AUD-1001",
        action: "GEOFENCE_RULE_SAVED",
        category: "Access & Security",
        actorId: "ADM-001",
        actorName: "Hasan (Chief Admin)",
        actorRole: "Admin",
        targetEntity: "GeofenceZone",
        targetId: "ZONE-HQ",
        targetName: "Staffify Bangalore Campus",
        ipAddress: "192.168.1.104",
        status: "SUCCESS",
        details: { radiusMeters: 300, subnetWhitelisted: "192.168.1.0/24" },
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        logId: "AUD-1002",
        action: "HR_LETTER_GENERATED",
        category: "AI Studio",
        actorId: "MGR-002",
        actorName: "Priya Sharma (HR Lead)",
        actorRole: "Manager",
        targetEntity: "HrDocument",
        targetId: "DOC-209",
        targetName: "Promotion & Increment Letter (EMP-102)",
        ipAddress: "192.168.1.45",
        status: "SUCCESS",
        details: { templateId: "INCREMENT", effectiveDate: "2026-11-01" },
        createdAt: new Date(Date.now() - 3600000 * 5),
      },
      {
        logId: "AUD-1003",
        action: "LEAVE_BATCH_APPROVED",
        category: "Human Resources",
        actorId: "MGR-002",
        actorName: "Priya Sharma (HR Lead)",
        actorRole: "Manager",
        targetEntity: "LeaveRegister",
        targetId: "BATCH-89",
        targetName: "Q4 Year-End Leave Batch",
        ipAddress: "192.168.1.45",
        status: "SUCCESS",
        details: { totalApproved: 4, deductionMode: "Quota-Automated" },
        createdAt: new Date(Date.now() - 3600000 * 8),
      },
      {
        logId: "AUD-1004",
        action: "SALARY_STRUCTURE_MODIFIED",
        category: "Payroll & Statutory",
        actorId: "ADM-001",
        actorName: "Hasan (Chief Admin)",
        actorRole: "Admin",
        targetEntity: "SalaryStructure",
        targetId: "EMP-104",
        targetName: "Rajesh Kumar (Senior Architect)",
        ipAddress: "192.168.1.104",
        status: "SUCCESS",
        details: { basicPayOld: 85000, basicPayNew: 98000, pfOptOut: false },
        createdAt: new Date(Date.now() - 3600000 * 24),
      },
      {
        logId: "AUD-1005",
        action: "SANDWICH_POLICY_ENABLED",
        category: "Governance",
        actorId: "ADM-001",
        actorName: "Hasan (Chief Admin)",
        actorRole: "Admin",
        targetEntity: "LeavePolicy",
        targetId: "POL-CORP-2026",
        targetName: "Enterprise Sandwich Leave Mandate",
        ipAddress: "192.168.1.104",
        status: "SUCCESS",
        details: { spanWeekends: true, carryForwardLimit: 12 },
        createdAt: new Date(Date.now() - 3600000 * 48),
      },
      {
        logId: "AUD-1006",
        action: "CLIENT_NETWORK_BREACH_FLAGGED",
        category: "Access & Security",
        actorId: "SYSTEM",
        actorName: "Attendance Perimeter Sentinel",
        actorRole: "System Automator",
        targetEntity: "BiometricSwipe",
        targetId: "SWIPE-981",
        targetName: "Remote Clock-In Warning (EMP-119)",
        ipAddress: "49.37.155.21",
        status: "WARNING",
        details: { distanceFromPerimeter: "4.2km", resolution: "Flagged for Manager Verification" },
        createdAt: new Date(Date.now() - 3600000 * 72),
      },
    ];

    await AuditLog.insertMany(initialSeeds);
  } catch (err) {
    console.warn("Audit log seed error:", err.message);
  }
};

// Seed on startup
setTimeout(seedInitialAuditLogs, 2500);

module.exports = function (app) {
  // Helper to record audit log from other controllers or HTTP
  const recordAuditLog = async (data) => {
    try {
      const log = new AuditLog({
        logId: data.logId || `AUD-${Date.now().toString().slice(-6)}`,
        action: data.action || "SYSTEM_MUTATION",
        category: data.category || "Governance",
        actorId: data.actorId || "SYSTEM",
        actorName: data.actorName || "System Automator",
        actorRole: data.actorRole || "Admin",
        targetEntity: data.targetEntity || "General",
        targetId: data.targetId || "",
        targetName: data.targetName || "",
        ipAddress: data.ipAddress || "127.0.0.1",
        status: data.status || "SUCCESS",
        details: data.details || {},
      });
      await log.save();
      return log;
    } catch (e) {
      console.warn("Failed to persist audit log to MongoDB, buffering in-memory:", e.message);
      inMemoryLogs.unshift({
        ...data,
        logId: data.logId || `AUD-${Date.now().toString().slice(-6)}`,
        createdAt: new Date(),
      });
    }
  };

  // Attach to app for internal controller access
  app.set("recordAuditLog", recordAuditLog);

  // GET /api/audit-logs
  app.get("/api/audit-logs", async (req, res) => {
    try {
      const { category, action, search, limit = 50 } = req.query;
      let filter = {};

      if (category && category !== "All") {
        filter.category = category;
      }
      if (action && action !== "All") {
        filter.action = action;
      }
      if (search) {
        filter.$or = [
          { logId: { $regex: search, $options: "i" } },
          { actorName: { $regex: search, $options: "i" } },
          { targetName: { $regex: search, $options: "i" } },
          { action: { $regex: search, $options: "i" } },
        ];
      }

      let logs = [];
      try {
        logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit));
      } catch (dbErr) {
        console.warn("Audit logs find fallback:", dbErr.message);
        logs = inMemoryLogs;
      }

      // If db is empty, return in-memory seeds
      if (!logs || logs.length === 0) {
        logs = inMemoryLogs;
      }

      res.status(200).json({
        success: true,
        total: logs.length,
        data: logs,
      });
    } catch (err) {
      console.error("GET /api/audit-logs error:", err);
      res.status(500).json({ error: "Failed to retrieve audit log repository" });
    }
  });

  // POST /api/audit-logs
  app.post("/api/audit-logs", async (req, res) => {
    try {
      const clientIp = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1";
      const saved = await recordAuditLog({
        ...req.body,
        ipAddress: req.body.ipAddress || clientIp,
      });
      res.status(201).json({ success: true, data: saved });
    } catch (err) {
      res.status(500).json({ error: "Failed to record audit event" });
    }
  });
};
