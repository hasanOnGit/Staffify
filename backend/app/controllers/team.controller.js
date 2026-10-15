const express = require("express");
const apiRoutes = express.Router();
const Team = require("../models/team.model");
const newEmployee = require("../models/employees.model");

// Pre-seeded default teams if empty
const defaultTeams = [
  {
    teamId: "TEAM-101",
    name: "Core Platform & Engineering",
    description: "Builds core APIs, databases, microservices, and backend architecture",
    department: "Engineering",
    managers: [
      { employeeId: "EMP-1001", name: "Amit Kumar", email: "amit.kumar@company.com", role: "Engineering Lead" },
    ],
    members: [
      { employeeId: "EMP-1002", name: "Rahul Sharma", email: "rahul.sharma@company.com", designation: "Backend Engineer", role: "Senior Developer", status: "Active" },
      { employeeId: "EMP-1003", name: "Pooja Verma", email: "pooja.verma@company.com", designation: "QA Automation", role: "SDET", status: "Active" },
    ],
  },
  {
    teamId: "TEAM-102",
    name: "Product Experience & UI",
    description: "Designs, engineers, and maintains web and mobile user interfaces",
    department: "Engineering",
    managers: [
      { employeeId: "EMP-1004", name: "Neha Singh", email: "neha.singh@company.com", role: "Design & UX Manager" },
    ],
    members: [
      { employeeId: "EMP-1005", name: "Suresh Raina", email: "suresh.raina@company.com", designation: "Frontend Engineer", role: "Developer", status: "Active" },
    ],
  },
  {
    teamId: "TEAM-103",
    name: "People & Talent Operations",
    description: "Oversees employee experience, hiring, payroll compliance, and relations",
    department: "Human Resources",
    managers: [
      { employeeId: "EMP-1006", name: "Priya Nair", email: "priya.nair@company.com", role: "HR Operations Lead" },
    ],
    members: [],
  },
];

module.exports = function (app) {
  /* ==========================================================
     GET ALL TEAMS (AUTO-SEEDS IF EMPTY)
     ========================================================== */
  apiRoutes.get("/", async (req, res) => {
    try {
      let teams = await Team.find({ isActive: true }).sort({ createdAt: -1 });

      if (teams.length === 0) {
        await Team.insertMany(defaultTeams);
        teams = await Team.find({ isActive: true }).sort({ createdAt: -1 });
      }

      return res.status(200).json(teams);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     GET TEAM BY ID
     ========================================================== */
  apiRoutes.get("/:teamId", async (req, res) => {
    try {
      const { teamId } = req.params;
      const team = await Team.findOne({
        $or: [{ teamId }, { _id: teamId.match(/^[0-9a-fA-F]{24}$/) ? teamId : null }],
      });

      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      return res.status(200).json(team);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     CREATE NEW TEAM
     ========================================================== */
  apiRoutes.post("/", async (req, res) => {
    try {
      const { name, description, department, managerId } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Team name is required" });
      }

      const teamId = "TEAM-" + Math.floor(100 + Math.random() * 900);
      const managers = [];

      if (managerId) {
        const emp = await newEmployee.findOne({ employeeId: managerId });
        if (emp) {
          managers.push({
            employeeId: emp.employeeId,
            name: emp.name,
            email: emp.email,
            role: "Team Manager",
          });
        }
      }

      const newTeam = await Team.create({
        teamId,
        name,
        description: description || "",
        department: department || "Engineering",
        managers,
        members: [],
      });

      return res.status(201).json(newTeam);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     UPDATE TEAM
     ========================================================== */
  apiRoutes.put("/:teamId", async (req, res) => {
    try {
      const { teamId } = req.params;
      const updates = req.body;

      const team = await Team.findOne({
        $or: [{ teamId }, { _id: teamId.match(/^[0-9a-fA-F]{24}$/) ? teamId : null }],
      });

      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      if (updates.name) team.name = updates.name;
      if (updates.description) team.description = updates.description;
      if (updates.department) team.department = updates.department;

      await team.save();

      return res.status(200).json(team);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     DELETE TEAM
     ========================================================== */
  apiRoutes.delete("/:teamId", async (req, res) => {
    try {
      const { teamId } = req.params;

      const team = await Team.findOneAndDelete({
        $or: [{ teamId }, { _id: teamId.match(/^[0-9a-fA-F]{24}$/) ? teamId : null }],
      });

      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      return res.status(200).json({ message: "Team deleted successfully" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     ADD MANAGER TO TEAM
     ========================================================== */
  apiRoutes.post("/:teamId/managers", async (req, res) => {
    try {
      const { teamId } = req.params;
      const { employeeId } = req.body;

      const team = await Team.findOne({
        $or: [{ teamId }, { _id: teamId.match(/^[0-9a-fA-F]{24}$/) ? teamId : null }],
      });
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      const emp = await newEmployee.findOne({ employeeId });
      if (!emp) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const alreadyManager = team.managers.some((m) => m.employeeId === employeeId);
      if (alreadyManager) {
        return res.status(400).json({ error: "Employee is already a manager of this team" });
      }

      team.managers.push({
        employeeId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        role: "Team Manager",
      });

      await team.save();
      return res.status(200).json(team);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     REMOVE MANAGER FROM TEAM
     ========================================================== */
  apiRoutes.delete("/:teamId/managers/:employeeId", async (req, res) => {
    try {
      const { teamId, employeeId } = req.params;

      const team = await Team.findOne({
        $or: [{ teamId }, { _id: teamId.match(/^[0-9a-fA-F]{24}$/) ? teamId : null }],
      });
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      team.managers = team.managers.filter((m) => m.employeeId !== employeeId);
      await team.save();

      return res.status(200).json(team);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     ADD MEMBER TO TEAM
     ========================================================== */
  apiRoutes.post("/:teamId/members", async (req, res) => {
    try {
      const { teamId } = req.params;
      const { employeeId, role } = req.body;

      const team = await Team.findOne({
        $or: [{ teamId }, { _id: teamId.match(/^[0-9a-fA-F]{24}$/) ? teamId : null }],
      });
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      const emp = await newEmployee.findOne({ employeeId });
      if (!emp) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const alreadyMember = team.members.some((m) => m.employeeId === employeeId);
      if (alreadyMember) {
        return res.status(400).json({ error: "Employee is already a member of this team" });
      }

      team.members.push({
        employeeId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        designation: emp.designation,
        role: role || "Member",
        status: "Active",
      });

      await team.save();
      return res.status(200).json(team);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     REMOVE MEMBER FROM TEAM
     ========================================================== */
  apiRoutes.delete("/:teamId/members/:employeeId", async (req, res) => {
    try {
      const { teamId, employeeId } = req.params;

      const team = await Team.findOne({
        $or: [{ teamId }, { _id: teamId.match(/^[0-9a-fA-F]{24}$/) ? teamId : null }],
      });
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      team.members = team.members.filter((m) => m.employeeId !== employeeId);
      await team.save();

      return res.status(200).json(team);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.use("/api/teams", apiRoutes);
};
