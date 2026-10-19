const express = require("express");
const apiRoutes = express.Router();
const Timesheet = require("../models/timesheet.model");
const Employees = require("../models/employees.model");

// Seed default timesheet entries if empty
async function seedDefaultTimesheets() {
  const count = await Timesheet.countDocuments();
  if (count === 0) {
    await Timesheet.create([
      {
        timesheetId: "TS-2026-W42",
        employeeId: "EMP-DEV-03",
        employeeName: "Employee User",
        department: "Engineering",
        weekStartDate: "2026-10-12",
        weekEndDate: "2026-10-18",
        totalHours: 42,
        billableHours: 38,
        nonBillableHours: 4,
        utilizationPercent: 90.5,
        status: "Approved",
        submittedAt: new Date(Date.now() - 86400000 * 2),
        managerApproval: {
          approvedBy: "Manager User",
          approvedAt: new Date(Date.now() - 86400000),
          remarks: "Verified billable client sprint deliverables.",
        },
        entries: [
          {
            projectId: "PRJ-PAYROLL",
            projectName: "Statutory Payroll & Tax Engine",
            clientName: "Enterprise Fintech Corp",
            taskCategory: "Development",
            mon: 8,
            tue: 8,
            wed: 8,
            thu: 7,
            fri: 7,
            sat: 0,
            sun: 0,
            total: 38,
            isBillable: true,
            notes: "Architecting EPF ECR generator and Form 12BB tax proof engine.",
          },
          {
            projectId: "PRJ-INTERNAL",
            projectName: "Engineering All-Hands & Sprint Retro",
            clientName: "Internal",
            taskCategory: "Code Review",
            mon: 0,
            tue: 0,
            wed: 0,
            thu: 2,
            fri: 2,
            sat: 0,
            sun: 0,
            total: 4,
            isBillable: false,
            notes: "Squad code reviews and architecture planning meeting.",
          },
        ],
      },
      {
        timesheetId: "TS-2026-W43",
        employeeId: "EMP-DEV-03",
        employeeName: "Employee User",
        department: "Engineering",
        weekStartDate: "2026-10-19",
        weekEndDate: "2026-10-25",
        totalHours: 40,
        billableHours: 36,
        nonBillableHours: 4,
        utilizationPercent: 90,
        status: "Submitted",
        submittedAt: new Date(),
        entries: [
          {
            projectId: "PRJ-GEOFENCE",
            projectName: "Real-time GPS Perimeter Verification",
            clientName: "Enterprise Mobility",
            taskCategory: "Development",
            mon: 8,
            tue: 8,
            wed: 8,
            thu: 8,
            fri: 4,
            sat: 0,
            sun: 0,
            total: 36,
            isBillable: true,
            notes: "Developing Haversine distance geofence algorithms and swipe locks.",
          },
          {
            projectId: "PRJ-INTERNAL",
            projectName: "Tech Architecture & Refactor",
            clientName: "Internal",
            taskCategory: "Architecture",
            mon: 0,
            tue: 0,
            wed: 0,
            thu: 0,
            fri: 4,
            sat: 0,
            sun: 0,
            total: 4,
            isBillable: false,
            notes: "System modularization and database indexing optimization.",
          },
        ],
      },
    ]);
  }
}

module.exports = function (app) {
  seedDefaultTimesheets().catch((err) => console.error("Timesheet seed error:", err));

  /**
   * GET /api/timesheets
   * List timesheets or filter by employeeId / status
   */
  apiRoutes.get("/", async (req, res) => {
    try {
      const { employeeId, status, weekStartDate } = req.query;
      const filter = {};
      if (employeeId) filter.employeeId = employeeId;
      if (status && status !== "All") filter.status = status;
      if (weekStartDate) filter.weekStartDate = weekStartDate;

      const sheets = await Timesheet.find(filter).sort({ weekStartDate: -1 });
      return res.status(200).json({ success: true, data: sheets });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/timesheets/summary
   * Utilization and hours statistics
   */
  apiRoutes.get("/summary", async (req, res) => {
    try {
      const allSheets = await Timesheet.find().lean();
      let totalHours = 0;
      let billableHours = 0;
      let pendingCount = 0;

      allSheets.forEach((s) => {
        totalHours += s.totalHours || 0;
        billableHours += s.billableHours || 0;
        if (s.status === "Submitted") pendingCount += 1;
      });

      const avgUtilization = totalHours > 0 ? ((billableHours / totalHours) * 100).toFixed(1) : 0;

      return res.status(200).json({
        success: true,
        data: {
          totalHours,
          billableHours,
          nonBillableHours: totalHours - billableHours,
          utilizationPercent: Number(avgUtilization),
          totalSheets: allSheets.length,
          pendingApprovals: pendingCount,
        },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/timesheets/save
   * Create or update draft timesheet
   */
  apiRoutes.post("/save", async (req, res) => {
    try {
      const {
        timesheetId,
        employeeId,
        employeeName,
        department,
        weekStartDate,
        weekEndDate,
        entries = [],
        submitNow = false,
      } = req.body;

      if (!employeeId || !weekStartDate) {
        return res.status(400).json({ error: "employeeId and weekStartDate are required" });
      }

      // Compute hours
      let totalH = 0;
      let billableH = 0;

      const sanitizedEntries = entries.map((entry) => {
        const mon = Number(entry.mon) || 0;
        const tue = Number(entry.tue) || 0;
        const wed = Number(entry.wed) || 0;
        const thu = Number(entry.thu) || 0;
        const fri = Number(entry.fri) || 0;
        const sat = Number(entry.sat) || 0;
        const sun = Number(entry.sun) || 0;
        const rowTotal = mon + tue + wed + thu + fri + sat + sun;

        totalH += rowTotal;
        if (entry.isBillable !== false) {
          billableH += rowTotal;
        }

        return {
          ...entry,
          mon,
          tue,
          wed,
          thu,
          fri,
          sat,
          sun,
          total: rowTotal,
          isBillable: entry.isBillable !== false,
        };
      });

      const nonBillableH = totalH - billableH;
      const utilPercent = totalH > 0 ? Number(((billableH / totalH) * 100).toFixed(1)) : 0;

      const tsId = timesheetId || `TS-${Date.now().toString().slice(-6)}`;
      const status = submitNow ? "Submitted" : "Draft";

      const updated = await Timesheet.findOneAndUpdate(
        { employeeId, weekStartDate },
        {
          timesheetId: tsId,
          employeeId,
          employeeName: employeeName || "Employee",
          department: department || "Engineering",
          weekStartDate,
          weekEndDate: weekEndDate || weekStartDate,
          entries: sanitizedEntries,
          totalHours: totalH,
          billableHours: billableH,
          nonBillableHours: nonBillableH,
          utilizationPercent: utilPercent,
          status,
          submittedAt: submitNow ? new Date() : undefined,
        },
        { upsert: true, new: true }
      );

      return res.status(200).json({
        success: true,
        message: submitNow ? "Timesheet submitted for manager review!" : "Timesheet draft saved successfully",
        data: updated,
      });
    } catch (err) {
      console.error("Timesheet save error:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * PUT /api/timesheets/:id/approve
   * Manager approves timesheet
   */
  apiRoutes.put("/:id/approve", async (req, res) => {
    try {
      const { approvedBy, remarks } = req.body;
      const sheet = await Timesheet.findOne({
        $or: [{ timesheetId: req.params.id }, { _id: req.params.id }],
      });

      if (!sheet) {
        return res.status(404).json({ error: "Timesheet not found" });
      }

      sheet.status = "Approved";
      sheet.managerApproval = {
        approvedBy: approvedBy || "Manager User",
        approvedAt: new Date(),
        remarks: remarks || "Approved billable project hours.",
      };
      await sheet.save();

      return res.status(200).json({
        success: true,
        message: `Timesheet #${sheet.timesheetId} approved successfully`,
        data: sheet,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * PUT /api/timesheets/:id/reject
   * Manager rejects timesheet with reason
   */
  apiRoutes.put("/:id/reject", async (req, res) => {
    try {
      const { rejectionReason } = req.body;
      const sheet = await Timesheet.findOne({
        $or: [{ timesheetId: req.params.id }, { _id: req.params.id }],
      });

      if (!sheet) {
        return res.status(404).json({ error: "Timesheet not found" });
      }

      sheet.status = "Rejected";
      sheet.rejectionReason = rejectionReason || "Hours allocation requires revision.";
      await sheet.save();

      return res.status(200).json({
        success: true,
        message: `Timesheet #${sheet.timesheetId} rejected`,
        data: sheet,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.use("/api/timesheets", apiRoutes);
};
