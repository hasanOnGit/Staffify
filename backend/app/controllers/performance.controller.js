const express = require("express");
const apiRoutes = express.Router();
const Goal = require("../models/goal.model");
const Appraisal = require("../models/appraisal.model");
const OneOnOne = require("../models/oneOnOne.model");
const Employee = require("../models/employees.model");

module.exports = function (app) {
  /* ==========================================================
     1. GOALS & OKRS ENDPOINTS
     ========================================================== */

  // Get goals list
  apiRoutes.get("/goals", async (req, res) => {
    try {
      const { employeeId, cycle, status } = req.query;
      const query = {};

      if (employeeId) query.employeeId = employeeId;
      if (cycle) query.cycle = cycle;
      if (status && status !== "All") query.status = status;

      let goals = await Goal.find(query).sort({ createdAt: -1 });

      // Seed standard demo goals if empty for active employees
      if (goals.length === 0 && employeeId) {
        const emp = await Employee.findOne({ employeeId });
        if (emp) {
          const sampleGoals = [
            {
              goalId: `GOL-${Date.now()}-1`,
              employeeId: emp.employeeId,
              employeeName: emp.name,
              department: emp.department || "Engineering",
              title: "Deliver High-Availability Cloud Infrastructure MVP",
              description: "Architect and implement multi-region failover with 99.9% uptime SLA.",
              category: "Core Deliverable",
              cycle: "Q4 2026",
              weightage: 40,
              progressPercentage: 75,
              status: "On Track",
              dueDate: "2026-11-30",
              managerFeedback: "Excellent progress on Kubernetes configuration.",
            },
            {
              goalId: `GOL-${Date.now()}-2`,
              employeeId: emp.employeeId,
              employeeName: emp.name,
              department: emp.department || "Engineering",
              title: "Complete Enterprise Security & Compliance Certification",
              description: "Achieve SOC-2 and ISO 27001 internal compliance readiness.",
              category: "Skill Development",
              cycle: "Q4 2026",
              weightage: 30,
              progressPercentage: 50,
              status: "In Progress",
              dueDate: "2026-12-15",
              managerFeedback: "Modules 1 and 2 completed.",
            },
            {
              goalId: `GOL-${Date.now()}-3`,
              employeeId: emp.employeeId,
              employeeName: emp.name,
              department: emp.department || "Engineering",
              title: "Sprint Retrospective Velocity Optimization",
              description: "Improve agile story point completion rate by 15% across sprints.",
              category: "Operational Excellence",
              cycle: "Q4 2026",
              weightage: 30,
              progressPercentage: 90,
              status: "Completed",
              dueDate: "2026-10-31",
              managerFeedback: "Target exceeded ahead of schedule.",
            },
          ];

          goals = await Goal.insertMany(sampleGoals);
        }
      }

      return res.status(200).json({ success: true, data: goals });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create Goal
  apiRoutes.post("/goals", async (req, res) => {
    try {
      const {
        employeeId,
        employeeName,
        department,
        title,
        description,
        category,
        cycle,
        weightage,
        progressPercentage,
        status,
        dueDate,
      } = req.body;

      if (!employeeId || !title) {
        return res
          .status(400)
          .json({ success: false, error: "employeeId and title are required." });
      }

      const goalId = `GOL-${Date.now()}`;
      const newGoal = await Goal.create({
        goalId,
        employeeId,
        employeeName: employeeName || "Employee",
        department: department || "General",
        title,
        description: description || "",
        category: category || "Core Deliverable",
        cycle: cycle || "Q4 2026",
        weightage: weightage || 25,
        progressPercentage: progressPercentage || 0,
        status: status || "In Progress",
        dueDate: dueDate || "",
      });

      return res.status(201).json({ success: true, data: newGoal });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update Goal Progress & Status
  apiRoutes.patch("/goals/:goalId", async (req, res) => {
    try {
      const { goalId } = req.params;
      const { progressPercentage, status, managerFeedback } = req.body;

      const updates = {};
      if (progressPercentage !== undefined) {
        updates.progressPercentage = Number(progressPercentage);
        if (updates.progressPercentage >= 100) updates.status = "Completed";
      }
      if (status) updates.status = status;
      if (managerFeedback !== undefined) updates.managerFeedback = managerFeedback;

      const updated = await Goal.findOneAndUpdate({ goalId }, updates, { new: true });
      if (!updated) {
        return res.status(404).json({ success: false, error: "Goal not found." });
      }

      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete Goal
  apiRoutes.delete("/goals/:goalId", async (req, res) => {
    try {
      const { goalId } = req.params;
      await Goal.findOneAndDelete({ goalId });
      return res.status(200).json({ success: true, message: "Goal deleted successfully." });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     2. APPRAISAL REVIEW CYCLES ENDPOINTS
     ========================================================== */

  // Get Appraisals list (Auto-initializes current cycle for active employees)
  apiRoutes.get("/appraisals", async (req, res) => {
    try {
      const { employeeId, cycleName } = req.query;
      const activeCycle = cycleName || "Q4 2026 Performance Appraisal Cycle";

      // Seed/ensure appraisal records exist for all active employees
      const employees = await Employee.find({ isActive: true });
      for (const emp of employees) {
        const exists = await Appraisal.findOne({
          employeeId: emp.employeeId,
          cycleName: activeCycle,
        });

        if (!exists) {
          const appraisalId = `APR-2026Q4-${emp.employeeId}`;
          await Appraisal.create({
            appraisalId,
            cycleName: activeCycle,
            employeeId: emp.employeeId,
            employeeName: emp.name,
            designation: emp.designation,
            department: emp.department,
            managerId: emp.managerId || "EMP-MGR-02",
            managerName: emp.managerName || "Manager User",
            status: "Pending Self Review",
          });
        }
      }

      const query = { cycleName: activeCycle };
      if (employeeId) query.employeeId = employeeId;

      const appraisals = await Appraisal.find(query).sort({ employeeName: 1 });
      return res.status(200).json({ success: true, data: appraisals });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Submit Self Appraisal
  apiRoutes.post("/appraisals/self-submit", async (req, res) => {
    try {
      const { appraisalId, rating, achievements, challenges, developmentGoals } = req.body;

      if (!appraisalId || !rating) {
        return res
          .status(400)
          .json({ success: false, error: "appraisalId and rating are required." });
      }

      const updated = await Appraisal.findOneAndUpdate(
        { appraisalId },
        {
          "selfAppraisal.rating": Number(rating),
          "selfAppraisal.achievements": achievements || "",
          "selfAppraisal.challenges": challenges || "",
          "selfAppraisal.developmentGoals": developmentGoals || "",
          "selfAppraisal.submittedAt": new Date(),
          status: "Pending Manager Review",
        },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ success: false, error: "Appraisal not found." });
      }

      return res.status(200).json({
        success: true,
        message: "Self-appraisal submitted successfully and sent for manager review.",
        data: updated,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Submit Manager Review
  apiRoutes.post("/appraisals/manager-submit", async (req, res) => {
    try {
      const { appraisalId, rating, strengths, growthAreas, recommendation } = req.body;

      if (!appraisalId || !rating) {
        return res
          .status(400)
          .json({ success: false, error: "appraisalId and rating are required." });
      }

      const existing = await Appraisal.findOne({ appraisalId });
      if (!existing) {
        return res.status(404).json({ success: false, error: "Appraisal not found." });
      }

      // Compute final score: 40% self + 60% manager (or manager rating directly)
      const selfRating = existing.selfAppraisal?.rating || rating;
      const finalScore = parseFloat(((selfRating * 0.4) + (Number(rating) * 0.6)).toFixed(1));

      const updated = await Appraisal.findOneAndUpdate(
        { appraisalId },
        {
          "managerReview.rating": Number(rating),
          "managerReview.strengths": strengths || "",
          "managerReview.growthAreas": growthAreas || "",
          "managerReview.recommendation": recommendation || "Continue in Role",
          "managerReview.submittedAt": new Date(),
          finalScore,
          status: "Completed",
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Manager review submitted successfully. Appraisal marked as Completed.",
        data: updated,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     3. 1-ON-1 CONTINUOUS FEEDBACK ENDPOINTS
     ========================================================== */

  // Get 1-on-1s list
  apiRoutes.get("/one-on-one", async (req, res) => {
    try {
      const { employeeId, managerId } = req.query;
      const query = {};

      if (employeeId) query.employeeId = employeeId;
      if (managerId) query.managerId = managerId;

      let meetings = await OneOnOne.find(query).sort({ meetingDate: -1 });

      // Seed sample meeting if empty
      if (meetings.length === 0 && employeeId) {
        const sampleMeeting = await OneOnOne.create({
          meetingId: `1ON1-${Date.now()}`,
          employeeId,
          employeeName: "Employee User",
          designation: "Software Engineer",
          managerId: "EMP-MGR-02",
          managerName: "Manager User",
          meetingDate: "2026-10-12",
          talkingPoints:
            "Discussed sprint velocity, microservices refactoring goals, and quarterly career roadmap.",
          actionItems: [
            { text: "Complete architecture document for Payroll module", isCompleted: true },
            { text: "Review PR for attendance regularization flow", isCompleted: false },
          ],
          feedbackType: "Growth & Career Check-in",
          status: "Completed",
        });

        meetings = [sampleMeeting];
      }

      return res.status(200).json({ success: true, data: meetings });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create 1-on-1 meeting note
  apiRoutes.post("/one-on-one", async (req, res) => {
    try {
      const {
        employeeId,
        employeeName,
        designation,
        managerId,
        managerName,
        meetingDate,
        talkingPoints,
        actionItems,
        feedbackType,
      } = req.body;

      if (!employeeId || !meetingDate) {
        return res
          .status(400)
          .json({ success: false, error: "employeeId and meetingDate are required." });
      }

      const meetingId = `1ON1-${Date.now()}`;
      const newMeeting = await OneOnOne.create({
        meetingId,
        employeeId,
        employeeName: employeeName || "Employee",
        designation: designation || "Engineer",
        managerId: managerId || "EMP-MGR-02",
        managerName: managerName || "Manager",
        meetingDate,
        talkingPoints: talkingPoints || "",
        actionItems: actionItems || [],
        feedbackType: feedbackType || "Growth & Career Check-in",
        status: "Completed",
      });

      return res.status(201).json({ success: true, data: newMeeting });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     4. PERFORMANCE ANALYTICS & BELL CURVE ENDPOINT
     ========================================================== */
  apiRoutes.get("/analytics", async (req, res) => {
    try {
      const cycleName = req.query.cycleName || "Q4 2026 Performance Appraisal Cycle";

      const [goals, appraisals] = await Promise.all([
        Goal.find({}),
        Appraisal.find({ cycleName }),
      ]);

      // Goal statistics
      const totalGoals = goals.length;
      let totalProgress = 0;
      const statusCounts = {
        Completed: 0,
        "On Track": 0,
        "In Progress": 0,
        "At Risk": 0,
        "Not Started": 0,
      };

      goals.forEach((g) => {
        totalProgress += g.progressPercentage || 0;
        if (statusCounts[g.status] !== undefined) {
          statusCounts[g.status]++;
        }
      });

      const avgGoalProgress = totalGoals > 0 ? Math.round(totalProgress / totalGoals) : 0;

      // Appraisal statistics
      const totalAppraisals = appraisals.length;
      let completedCount = 0;
      let pendingManagerCount = 0;
      let pendingSelfCount = 0;

      const ratingDistribution = {
        5: 0, // Outstanding
        4: 0, // Exceeds
        3: 0, // Meets
        2: 0, // Developing
        1: 0, // Needs Improvement
      };

      appraisals.forEach((a) => {
        if (a.status === "Completed") {
          completedCount++;
          const score = Math.round(a.finalScore || a.managerReview?.rating || 3);
          if (ratingDistribution[score] !== undefined) {
            ratingDistribution[score]++;
          }
        } else if (a.status === "Pending Manager Review") {
          pendingManagerCount++;
        } else {
          pendingSelfCount++;
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          goals: {
            total: totalGoals,
            averageProgress: avgGoalProgress,
            statusCounts,
          },
          appraisals: {
            total: totalAppraisals,
            completed: completedCount,
            pendingManager: pendingManagerCount,
            pendingSelf: pendingSelfCount,
            ratingDistribution,
          },
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.use("/api/performance", apiRoutes);
};
