const express = require("express");
const bcrypt = require("bcryptjs");
const JobOpening = require("../models/jobOpening.model");
const Candidate = require("../models/candidate.model");
const Employee = require("../models/employees.model");
const User = require("../models/user.model");

// Helper to seed initial recruitment data
async function ensureRecruitmentSeed() {
  const jobCount = await JobOpening.countDocuments();
  if (jobCount === 0) {
    await JobOpening.create([
      {
        jobId: "JOB-101",
        title: "Senior Backend Engineer",
        department: "Engineering",
        location: "Bangalore, India",
        employmentType: "Full-time",
        openings: 2,
        experienceRequired: "4-7 Years",
        salaryRange: "₹18L - ₹26L PA",
        description:
          "Architect robust microservices, distributed workflows, and high-throughput transaction engines in Node.js and MongoDB.",
        requirements: "Node.js, Express, MongoDB Atlas, Redis, Kafka, Microservices architecture",
        status: "Active",
        hiringManagerId: "EMP-MGR-02",
        hiringManagerName: "Manager User",
      },
      {
        jobId: "JOB-102",
        title: "Staff Frontend Architect",
        department: "Engineering",
        location: "Bangalore, India",
        employmentType: "Full-time",
        openings: 1,
        experienceRequired: "5-8 Years",
        salaryRange: "₹20L - ₹30L PA",
        description:
          "Lead design systems, enterprise frontend performance optimization, and modular UI engineering with React and Tailwind.",
        requirements: "React 19, Vite, Tailwind CSS, State Management, Core Web Vitals optimization",
        status: "Active",
        hiringManagerId: "EMP-MGR-02",
        hiringManagerName: "Manager User",
      },
      {
        jobId: "JOB-103",
        title: "People Operations & HR Lead",
        department: "Human Resources",
        location: "Mumbai, India",
        employmentType: "Full-time",
        openings: 1,
        experienceRequired: "3-6 Years",
        salaryRange: "₹10L - ₹15L PA",
        description:
          "Drive talent acquisition, employee experience, performance cycles, and statutory HR compliance.",
        requirements: "Talent Acquisition, Indian Labor Laws, EPF/ESIC, Employee Engagement",
        status: "Active",
        hiringManagerId: "EMP-ADMIN-01",
        hiringManagerName: "Admin User",
      },
    ]);
  }

  const candidateCount = await Candidate.countDocuments();
  if (candidateCount === 0) {
    await Candidate.create([
      {
        candidateId: "CND-1001",
        jobId: "JOB-101",
        jobTitle: "Senior Backend Engineer",
        department: "Engineering",
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        phone: "+91 98765 43210",
        currentCompany: "Infosys Cloud Labs",
        currentDesignation: "Software Engineer",
        totalExperienceYears: 4,
        stage: "Applied",
        summary: "Specializes in high concurrency APIs, event-driven architecture, and caching layers.",
        feedback: [],
      },
      {
        candidateId: "CND-1002",
        jobId: "JOB-102",
        jobTitle: "Staff Frontend Architect",
        department: "Engineering",
        name: "Ananya Iyer",
        email: "ananya.iyer@example.com",
        phone: "+91 98450 11223",
        currentCompany: "Razorpay",
        currentDesignation: "Senior UI Engineer",
        totalExperienceYears: 5,
        stage: "Screening",
        summary: "Expertise in building scalable design systems and accessible web interfaces.",
        feedback: [
          {
            roundName: "Initial Screening",
            interviewerName: "Manager User",
            rating: 4,
            recommendation: "Strong Yes",
            notes: "Excellent grasp of browser rendering pipelines and modern state management.",
          },
        ],
      },
      {
        candidateId: "CND-1003",
        jobId: "JOB-101",
        jobTitle: "Senior Backend Engineer",
        department: "Engineering",
        name: "Vikramaditya Roy",
        email: "vikram.roy@example.com",
        phone: "+91 97112 33445",
        currentCompany: "Swiggy Core Systems",
        currentDesignation: "Lead Engineer",
        totalExperienceYears: 6.5,
        stage: "Technical Round",
        summary: "Deep knowledge of database indexing, distributed locking, and Kubernetes clusters.",
        feedback: [
          {
            roundName: "System Architecture",
            interviewerName: "Employee User",
            rating: 5,
            recommendation: "Strong Yes",
            notes: "Outstanding performance in real-time order matching architecture challenge.",
          },
        ],
      },
      {
        candidateId: "CND-1004",
        jobId: "JOB-102",
        jobTitle: "Staff Frontend Architect",
        department: "Engineering",
        name: "Neha Verma",
        email: "neha.verma@example.com",
        phone: "+91 99201 55667",
        currentCompany: "Zomato Design",
        currentDesignation: "Lead UI Developer",
        totalExperienceYears: 6,
        stage: "HR Interview",
        summary: "Culture champion with rich experience mentoring frontend squads.",
        feedback: [
          {
            roundName: "Technical Round",
            interviewerName: "Manager User",
            rating: 5,
            recommendation: "Strong Yes",
            notes: "Clean modular code and excellent communication.",
          },
        ],
      },
      {
        candidateId: "CND-1005",
        jobId: "JOB-101",
        jobTitle: "Senior Backend Engineer",
        department: "Engineering",
        name: "Siddharth Menon",
        email: "siddharth.menon@example.com",
        phone: "+91 98110 88990",
        currentCompany: "Flipkart Engineering",
        currentDesignation: "Senior SDE",
        totalExperienceYears: 5,
        stage: "Offered",
        offeredCtc: 2200000,
        expectedJoiningDate: "2026-11-01",
        summary: "Offer extended. Candidate accepted terms and undergoing background verification.",
        feedback: [
          {
            roundName: "Cultural Fit & Leadership",
            interviewerName: "Admin User",
            rating: 5,
            recommendation: "Strong Yes",
            notes: "Visionary engineer aligned with organizational values.",
          },
        ],
      },
    ]);
  }
}

module.exports = function (app) {
  const apiRoutes = express.Router();

  /* ==========================================================
     0. RECRUITMENT ATS ANALYTICS & STATS
     ========================================================== */
  apiRoutes.get("/stats", async (req, res) => {
    try {
      await ensureRecruitmentSeed();
      const totalJobs = await JobOpening.countDocuments();
      const openJobs = await JobOpening.countDocuments({ status: "Open" });
      const totalCandidates = await Candidate.countDocuments();
      const hiredCount = await Candidate.countDocuments({ stage: "Hired" });
      const activeCandidates = await Candidate.countDocuments({ stage: { $nin: ["Hired", "Rejected"] } });

      const stageBreakdown = await Candidate.aggregate([
        { $group: { _id: "$stage", count: { $sum: 1 } } },
      ]);

      return res.status(200).json({
        success: true,
        data: {
          totalJobs,
          openJobs,
          totalCandidates,
          activeCandidates,
          hiredCount,
          timeToHireDays: 18,
          offerAcceptanceRate: 85,
          stageBreakdown: stageBreakdown.map((s) => ({ stage: s._id, count: s.count })),
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     1. JOB REQUISITIONS
     ========================================================== */
  apiRoutes.get("/jobs", async (req, res) => {
    try {
      await ensureRecruitmentSeed();
      const { department, status } = req.query;
      const query = {};

      if (department && department !== "All") query.department = department;
      if (status && status !== "All") query.status = status;

      const jobs = await JobOpening.find(query).sort({ createdAt: -1 });

      // Count candidates per job
      const candidateCounts = await Candidate.aggregate([
        { $group: { _id: "$jobId", count: { $sum: 1 } } },
      ]);
      const countMap = {};
      candidateCounts.forEach((c) => {
        countMap[c._id] = c.count;
      });

      const enrichedJobs = jobs.map((j) => ({
        ...j.toObject(),
        applicantCount: countMap[j.jobId] || 0,
      }));

      return res.status(200).json({ success: true, data: enrichedJobs });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRoutes.post("/jobs", async (req, res) => {
    try {
      const {
        title,
        department,
        location,
        employmentType,
        openings,
        experienceRequired,
        salaryRange,
        description,
        requirements,
        hiringManagerId,
        hiringManagerName,
      } = req.body;

      if (!title || !department) {
        return res.status(400).json({ success: false, error: "Title and department are required." });
      }

      const count = await JobOpening.countDocuments();
      const jobId = `JOB-${100 + count + 1}`;

      const newJob = await JobOpening.create({
        jobId,
        title,
        department,
        location: location || "Bangalore, India",
        employmentType: employmentType || "Full-time",
        openings: Number(openings) || 1,
        experienceRequired: experienceRequired || "2-5 Years",
        salaryRange: salaryRange || "Negotiable",
        description: description || "",
        requirements: requirements || "",
        status: "Active",
        hiringManagerId: hiringManagerId || "EMP-MGR-02",
        hiringManagerName: hiringManagerName || "Manager User",
      });

      return res.status(201).json({
        success: true,
        message: "Job opening published successfully.",
        data: newJob,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRoutes.patch("/jobs/:jobId", async (req, res) => {
    try {
      const { jobId } = req.params;
      const updated = await JobOpening.findOneAndUpdate({ jobId }, req.body, {
        new: true,
      });

      if (!updated) {
        return res.status(404).json({ success: false, error: "Job opening not found." });
      }

      return res.status(200).json({
        success: true,
        message: "Job opening updated successfully.",
        data: updated,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     2. CANDIDATES & KANBAN PIPELINE
     ========================================================== */
  apiRoutes.get("/candidates", async (req, res) => {
    try {
      await ensureRecruitmentSeed();
      const { jobId, stage } = req.query;
      const query = {};

      if (jobId && jobId !== "All") query.jobId = jobId;
      if (stage && stage !== "All") query.stage = stage;

      const candidates = await Candidate.find(query).sort({ updatedAt: -1 });
      return res.status(200).json({ success: true, data: candidates });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRoutes.post("/candidates", async (req, res) => {
    try {
      const {
        jobId,
        name,
        email,
        phone,
        currentCompany,
        currentDesignation,
        totalExperienceYears,
        summary,
      } = req.body;

      if (!jobId || !name || !email) {
        return res.status(400).json({ success: false, error: "jobId, name, and email are required." });
      }

      const job = await JobOpening.findOne({ jobId });
      const jobTitle = job ? job.title : "Open Role";
      const department = job ? job.department : "Engineering";

      const count = await Candidate.countDocuments();
      const candidateId = `CND-${1000 + count + 1}`;

      const newCandidate = await Candidate.create({
        candidateId,
        jobId,
        jobTitle,
        department,
        name,
        email,
        phone: phone || "",
        currentCompany: currentCompany || "",
        currentDesignation: currentDesignation || "",
        totalExperienceYears: Number(totalExperienceYears) || 0,
        stage: "Applied",
        summary: summary || "",
      });

      return res.status(201).json({
        success: true,
        message: "Candidate application registered.",
        data: newCandidate,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRoutes.patch("/candidates/:candidateId/stage", async (req, res) => {
    try {
      const { candidateId } = req.params;
      const { stage, offeredCtc, expectedJoiningDate } = req.body;

      const validStages = [
        "Applied",
        "Screening",
        "Technical Round",
        "HR Interview",
        "Offered",
        "Hired",
        "Rejected",
      ];

      if (!validStages.includes(stage)) {
        return res.status(400).json({ success: false, error: "Invalid pipeline stage." });
      }

      const updateData = { stage };
      if (offeredCtc !== undefined) updateData.offeredCtc = Number(offeredCtc);
      if (expectedJoiningDate !== undefined) updateData.expectedJoiningDate = expectedJoiningDate;

      const updated = await Candidate.findOneAndUpdate({ candidateId }, updateData, {
        new: true,
      });

      if (!updated) {
        return res.status(404).json({ success: false, error: "Candidate not found." });
      }

      return res.status(200).json({
        success: true,
        message: `Candidate moved to ${stage} stage.`,
        data: updated,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRoutes.post("/candidates/:candidateId/feedback", async (req, res) => {
    try {
      const { candidateId } = req.params;
      const { roundName, interviewerName, rating, recommendation, notes } = req.body;

      if (!roundName || !rating) {
        return res
          .status(400)
          .json({ success: false, error: "roundName and rating (1-5) are required." });
      }

      const candidate = await Candidate.findOne({ candidateId });
      if (!candidate) {
        return res.status(404).json({ success: false, error: "Candidate not found." });
      }

      candidate.feedback.push({
        roundName,
        interviewerName: interviewerName || "Interviewer",
        rating: Number(rating),
        recommendation: recommendation || "Yes",
        notes: notes || "",
        submittedAt: new Date(),
      });

      await candidate.save();

      return res.status(200).json({
        success: true,
        message: "Interview evaluation scorecard recorded.",
        data: candidate,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     3. 1-CLICK HIRE & ONBOARDING CONVERSION
     ========================================================== */
  apiRoutes.post("/candidates/:candidateId/convert-to-employee", async (req, res) => {
    try {
      const { candidateId } = req.params;
      const { dateOfJoining, annualCtc } = req.body;

      const candidate = await Candidate.findOne({ candidateId });
      if (!candidate) {
        return res.status(404).json({ success: false, error: "Candidate not found." });
      }

      if (candidate.stage === "Hired" && candidate.hiredEmployeeId) {
        return res.status(400).json({
          success: false,
          error: `Candidate already converted to employee (${candidate.hiredEmployeeId}).`,
        });
      }

      // Generate next employeeId
      const empCount = await Employee.countDocuments();
      const newEmployeeId = `EMP-DEV-${String(empCount + 1).padStart(2, "0")}`;

      // Create Employee Record in Staffify 360
      const doj = dateOfJoining || candidate.expectedJoiningDate || new Date().toISOString().split("T")[0];
      const newEmployee = await Employee.create({
        employeeId: newEmployeeId,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone || "+91 98765 00000",
        department: candidate.department,
        designation: candidate.jobTitle,
        employmentType: "Full-time",
        dateOfJoining: doj,
        managerId: "EMP-MGR-02",
        managerName: "Manager User",
        status: "Active",
        salary: Number(annualCtc || candidate.offeredCtc || 1200000),
        statutoryDetails: {
          pan: "ABCDE1234F",
          pfUan: `1010${Date.now().toString().slice(-8)}`,
          taxRegime: "New",
        },
      });

      // Create login User account if not exists
      const existingUser = await User.findOne({ email: candidate.email.toLowerCase() });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash("Password@123", 10);
        await User.create({
          employeeId: newEmployeeId,
          name: candidate.name,
          email: candidate.email.toLowerCase(),
          password: hashedPassword,
          role: "Employee",
        });
      }

      // Update candidate record
      candidate.stage = "Hired";
      candidate.hiredEmployeeId = newEmployeeId;
      await candidate.save();

      return res.status(200).json({
        success: true,
        message: `Candidate ${candidate.name} successfully onboarded as ${newEmployeeId}! Login account initialized.`,
        data: {
          employee: newEmployee,
          candidate,
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.use("/api/recruitment", apiRoutes);
};
