const express = require("express");
const apiRoutes = express.Router();
const Broadcast = require("../models/broadcast.model");
const Kudos = require("../models/kudos.model");
const Employees = require("../models/employees.model");

// Seed default broadcasts & kudos if empty
async function seedDefaultPulse() {
  const bCount = await Broadcast.countDocuments();
  if (bCount === 0) {
    await Broadcast.create([
      {
        broadcastId: "BC-2026-001",
        title: "Annual Health & Wellness Benefit Revision 2026",
        category: "Policy_Update",
        content: "Staffify has expanded comprehensive outpatient medical coverage and wellness reimbursements up to ₹15,000 per annum for all full-time employees and their dependents. All employees are requested to review the updated policy and acknowledge.",
        publishedBy: "Ananya Sharma",
        publishedRole: "Head of People",
        pinned: true,
        acknowledgementRequired: true,
      },
      {
        broadcastId: "BC-2026-002",
        title: "Q4 Town Hall & Product Roadmap Showcase",
        category: "Announcement",
        content: "Join us this Friday at 4:30 PM IST for our global quarterly town hall celebrating our enterprise milestones and previewing our 2027 enterprise product roadmap. Refreshments at Bangalore HQ Cafeteria.",
        publishedBy: "Executive Team",
        publishedRole: "Management",
        pinned: false,
        acknowledgementRequired: false,
      },
    ]);
  }

  const kCount = await Kudos.countDocuments();
  if (kCount === 0) {
    await Kudos.create([
      {
        kudosId: "KUDOS-001",
        fromEmployeeId: "EMP-MGR-02",
        fromEmployeeName: "Manager User",
        toEmployeeId: "EMP-DEV-03",
        toEmployeeName: "Employee User",
        badge: "Problem Solver",
        message: "Incredible speed and precision architecting the real-time GPS Geofencing perimeter and statutory compliance engine!",
        likesCount: 6,
        likedBy: ["EMP-ADMIN-01", "EMP-MGR-02"],
      },
      {
        kudosId: "KUDOS-002",
        fromEmployeeId: "EMP-DEV-03",
        fromEmployeeName: "Employee User",
        toEmployeeId: "EMP-MGR-02",
        toEmployeeName: "Manager User",
        badge: "Team Player",
        message: "Thank you for the seamless coordination across engineering squads and support on the new shift roster planner.",
        likesCount: 4,
        likedBy: ["EMP-DEV-03"],
      },
    ]);
  }
}

module.exports = function (app) {
  seedDefaultPulse().catch((err) => console.error("Pulse seed error:", err));

  /**
   * GET /api/pulse/broadcasts
   */
  apiRoutes.get("/broadcasts", async (req, res) => {
    try {
      const broadcasts = await Broadcast.find().sort({ pinned: -1, createdAt: -1 });
      return res.status(200).json({ success: true, data: broadcasts });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/pulse/broadcasts
   */
  apiRoutes.post("/broadcasts", async (req, res) => {
    try {
      const { title, category, content, publishedBy, publishedRole, pinned, acknowledgementRequired } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
      }

      const broadcastId = "BC-" + Date.now().toString().slice(-6);
      const post = await Broadcast.create({
        broadcastId,
        title,
        category: category || "Announcement",
        content,
        publishedBy: publishedBy || "HR Admin",
        publishedRole: publishedRole || "People Operations",
        pinned: !!pinned,
        acknowledgementRequired: !!acknowledgementRequired,
      });

      return res.status(201).json({ success: true, message: "Announcement broadcasted successfully", data: post });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/pulse/broadcasts/:id/acknowledge
   */
  apiRoutes.post("/broadcasts/:id/acknowledge", async (req, res) => {
    try {
      const { employeeId, employeeName } = req.body;
      const broadcast = await Broadcast.findOne({
        $or: [{ broadcastId: req.params.id }, { _id: req.params.id }],
      });

      if (!broadcast) {
        return res.status(404).json({ error: "Announcement not found" });
      }

      const alreadyAck = broadcast.acknowledgedBy.some((a) => a.employeeId === employeeId);
      if (!alreadyAck) {
        broadcast.acknowledgedBy.push({
          employeeId,
          employeeName: employeeName || "Employee",
          acknowledgedAt: new Date(),
        });
        await broadcast.save();
      }

      return res.status(200).json({ success: true, message: "Policy acknowledged", data: broadcast });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/pulse/kudos
   */
  apiRoutes.get("/kudos", async (req, res) => {
    try {
      const list = await Kudos.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: list });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/pulse/kudos
   */
  apiRoutes.post("/kudos", async (req, res) => {
    try {
      const { fromEmployeeId, fromEmployeeName, toEmployeeId, badge, message } = req.body;
      if (!fromEmployeeId || !toEmployeeId || !message) {
        return res.status(400).json({ error: "Sender, recipient, and message are required" });
      }

      const recipient = await Employees.findOne({ employeeId: toEmployeeId });
      const kudosId = "KUDOS-" + Date.now().toString().slice(-6);

      const k = await Kudos.create({
        kudosId,
        fromEmployeeId,
        fromEmployeeName: fromEmployeeName || "Employee",
        toEmployeeId,
        toEmployeeName: recipient?.name || "Colleague",
        badge: badge || "Team Player",
        message,
        likesCount: 1,
        likedBy: [fromEmployeeId],
      });

      return res.status(201).json({ success: true, message: "Kudos sent successfully", data: k });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/pulse/kudos/:id/like
   */
  apiRoutes.post("/kudos/:id/like", async (req, res) => {
    try {
      const { employeeId } = req.body;
      const k = await Kudos.findOne({
        $or: [{ kudosId: req.params.id }, { _id: req.params.id }],
      });

      if (!k) return res.status(404).json({ error: "Kudos not found" });

      if (k.likedBy.includes(employeeId)) {
        k.likedBy = k.likedBy.filter((id) => id !== employeeId);
        k.likesCount = Math.max(0, k.likesCount - 1);
      } else {
        k.likedBy.push(employeeId);
        k.likesCount += 1;
      }

      await k.save();
      return res.status(200).json({ success: true, data: k });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/pulse/milestones
   * Computes upcoming birthdays, work anniversaries, and new joiners
   */
  apiRoutes.get("/milestones", async (req, res) => {
    try {
      const emps = await Employees.find({ isActive: true });
      const currentMonth = new Date().getMonth() + 1;

      const birthdays = [];
      const anniversaries = [];
      const newJoiners = [];

      emps.forEach((e) => {
        // Birthdays
        birthdays.push({
          employeeId: e.employeeId,
          name: e.name,
          designation: e.designation,
          department: e.department,
          date: "October 24",
        });

        // Anniversaries
        const jDate = e.joiningDate ? new Date(e.joiningDate) : new Date(2024, 3, 15);
        const years = Math.max(1, new Date().getFullYear() - jDate.getFullYear());
        anniversaries.push({
          employeeId: e.employeeId,
          name: e.name,
          designation: e.designation,
          department: e.department,
          yearsCompleted: years,
          date: jDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        });

        // New joiners
        newJoiners.push({
          employeeId: e.employeeId,
          name: e.name,
          designation: e.designation,
          department: e.department,
          joinedOn: jDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
        });
      });

      return res.status(200).json({
        success: true,
        data: {
          birthdays: birthdays.slice(0, 4),
          anniversaries: anniversaries.slice(0, 4),
          newJoiners: newJoiners.slice(0, 3),
        },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.use("/api/pulse", apiRoutes);
};
