const express = require("express");
const apiRoutes = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Candidate = require("../models/candidate.model");
const Employees = require("../models/employees.model");
const User = require("../models/user.model");
const HrDocument = require("../models/hrDocument.model");
const LeaveBalance = require("../models/employeeLeaveBalance.model");

module.exports = function (app) {
  /**
   * POST /api/onboarding/generate-link
   * HR generates a secure magic onboarding token for a candidate
   */
  apiRoutes.post("/generate-link", async (req, res) => {
    try {
      const { candidateId } = req.body;
      const candidate = await Candidate.findOne({ candidateId });
      if (!candidate) return res.status(404).json({ error: "Candidate not found" });

      const token = "OB-" + crypto.randomBytes(16).toString("hex");
      const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      candidate.onboardingToken = token;
      candidate.tokenExpiry = expiry;
      candidate.onboardingStatus = "Invited";
      await candidate.save();

      const onboardingUrl = `/onboard/${token}`;
      return res.status(200).json({
        success: true,
        message: "Onboarding invitation link generated successfully",
        data: {
          token,
          onboardingUrl,
          expiry,
          candidateName: candidate.name,
          email: candidate.email,
        },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/onboarding/verify/:token
   * Public endpoint: Candidate validates magic token to start self-onboarding
   */
  apiRoutes.get("/verify/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const candidate = await Candidate.findOne({ onboardingToken: token });
      if (!candidate) {
        return res.status(404).json({ error: "Invalid or expired onboarding link" });
      }

      if (candidate.tokenExpiry && new Date(candidate.tokenExpiry) < new Date()) {
        return res.status(410).json({ error: "This onboarding link has expired. Please contact HR." });
      }

      if (candidate.onboardingStatus === "Admitted") {
        return res.status(400).json({ error: "Candidate has already been admitted to the organization." });
      }

      return res.status(200).json({
        success: true,
        data: {
          candidateId: candidate.candidateId,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          jobTitle: candidate.jobTitle,
          department: candidate.department,
          offeredCtc: candidate.offeredCtc,
          status: candidate.onboardingStatus,
          existingData: candidate.onboardingData || {},
        },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/onboarding/submit
   * Public endpoint: Candidate submits profile, bank, statutory IDs, and uploaded documents
   */
  apiRoutes.post("/submit", async (req, res) => {
    try {
      const { token, onboardingData } = req.body;
      const candidate = await Candidate.findOne({ onboardingToken: token });
      if (!candidate) {
        return res.status(404).json({ error: "Invalid or expired onboarding session" });
      }

      candidate.onboardingData = onboardingData;
      candidate.onboardingStatus = "Submitted";
      await candidate.save();

      return res.status(200).json({
        success: true,
        message: "Self-onboarding dossier submitted successfully! HR will review and activate your account.",
        data: candidate,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/onboarding/queue
   * Admin/HR endpoint: View all candidate submissions awaiting admission
   */
  apiRoutes.get("/queue", async (req, res) => {
    try {
      const queue = await Candidate.find({
        onboardingStatus: { $in: ["Invited", "Submitted"] },
      }).sort({ updatedAt: -1 });

      return res.status(200).json({ success: true, data: queue });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/onboarding/admit
   * HR verifies submission and officially admits the candidate to Employee Directory
   */
  apiRoutes.post("/admit", async (req, res) => {
    try {
      const { candidateId, dateOfJoining, workLocation = "Bangalore HQ" } = req.body;
      const candidate = await Candidate.findOne({ candidateId });
      if (!candidate) return res.status(404).json({ error: "Candidate record not found" });

      const ob = candidate.onboardingData || {};
      const newEmpId = "EMP-" + (candidate.department ? candidate.department.slice(0, 3).toUpperCase() : "ENG") + "-" + Date.now().toString().slice(-4);
      const defaultPassword = await bcrypt.hash("Employee@123", 10);

      // 1. Create Employee Profile
      const annualSalary = candidate.offeredCtc || 750000;
      const basicSalary = Math.round((annualSalary / 12) * 0.5);

      const newEmployee = new Employees({
        employeeId: newEmpId,
        userId: newEmpId,
        name: candidate.name,
        email: candidate.email,
        phoneNo: ob.phone || candidate.phone || "",
        designation: candidate.jobTitle,
        department: candidate.department || "Engineering",
        gender: ob.gender || "Prefer not to say",
        dob: ob.dob || "1995-01-01",
        bloodGroup: ob.bloodGroup || "O+",
        maritalStatus: ob.maritalStatus || "Single",
        fatherName: ob.fatherName || "",
        presentAddress: ob.presentAddress || "Bangalore",
        permanentAddress: ob.permanentAddress || ob.presentAddress || "Bangalore",
        emergencyContactName: ob.emergencyContactName || "",
        emergencyContactRelation: ob.emergencyContactRelation || "Family",
        emergencyContactNum: ob.emergencyContactNum || "",
        dateOfJoining: dateOfJoining || new Date().toISOString().split("T")[0],
        employmentType: "Full-time",
        probationStatus: "Probation",
        workLocation,
        basicSalary,
        totalSalary: Math.round(annualSalary / 12),
        bankDetails: {
          bankName: ob.bankName || "HDFC Bank",
          accountNumber: ob.accountNumber || "501000000000",
          ifscCode: ob.ifscCode || "HDFC0001234",
          accountHolderName: candidate.name,
        },
        statutoryDetails: {
          panNumber: ob.panNumber || "ABCDE1234F",
          aadhaarNumber: ob.aadhaarNumber || "1234 5678 9012",
          uanNumber: ob.uanNumber || "100900000000",
          pfNumber: ob.pfNumber || "",
          esiNumber: ob.esiNumber || "",
        },
        isActive: true,
      });

      await newEmployee.save();

      // 2. Create User Account
      const newUser = new User({
        userId: newEmpId,
        employeeId: newEmpId,
        name: candidate.name,
        email: candidate.email,
        password: defaultPassword,
        role: "Employee",
        isActive: true,
      });
      await newUser.save();

      // 3. Initialize Leave Balance
      const currentYear = new Date().getFullYear();
      await LeaveBalance.findOneAndUpdate(
        { employeeId: newEmpId, year: currentYear },
        {
          employeeId: newEmpId,
          year: currentYear,
          leaveAllocation: {
            earned: { totalAllocated: 15, used: 0 },
            casual: { totalAllocated: 12, used: 0 },
            sick: { totalAllocated: 10, used: 0 },
            paid: { totalAllocated: 12, used: 0 },
            compOff: { totalAllocated: 0, used: 0 },
          },
        },
        { upsert: true, new: true }
      );

      // 4. Archive Uploaded Documents into Digital Vault
      if (Array.isArray(ob.documents) && ob.documents.length > 0) {
        for (const doc of ob.documents) {
          const hrDoc = new HrDocument({
            documentId: "DOC-" + Date.now().toString().slice(-6),
            employeeId: newEmpId,
            employeeName: candidate.name,
            documentType: doc.type || "Certificate",
            title: doc.title || "Onboarding Document",
            fileUrl: doc.url || "",
            issuedDate: new Date(),
            status: "Verified",
          });
          await hrDoc.save();
        }
      }

      // 5. Update Candidate Record
      candidate.onboardingStatus = "Admitted";
      candidate.stage = "Hired";
      candidate.hiredEmployeeId = newEmpId;
      await candidate.save();

      return res.status(200).json({
        success: true,
        message: `Candidate ${candidate.name} admitted successfully! Employee ID assigned: ${newEmpId}`,
        data: {
          employeeId: newEmpId,
          email: candidate.email,
          designation: candidate.jobTitle,
        },
      });
    } catch (err) {
      console.error("Admit candidate error:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  app.use("/api/onboarding", apiRoutes);
};
