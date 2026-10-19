const express = require("express");
const apiRoutes = express.Router();
const Offboarding = require("../models/offboarding.model");
const Employees = require("../models/employees.model");

// Seed default offboarding case
async function seedDefaultOffboarding() {
  const count = await Offboarding.countDocuments();
  if (count === 0) {
    await Offboarding.create([
      {
        offboardingId: "OFF-2026-001",
        employeeId: "EMP-DEV-04",
        employeeName: "Rohan Varma",
        department: "Engineering",
        designation: "Senior Backend Engineer",
        resignationDate: "2026-09-15",
        lastWorkingDay: "2026-10-15",
        noticePeriodDays: 30,
        status: "Completed",
        assetClearance: [
          {
            assetName: "MacBook Pro 16-inch M3",
            assetCategory: "Laptop",
            serialNumber: "C02XYZ882910",
            returned: true,
            verifiedBy: "IT Admin",
            verifiedAt: new Date(Date.now() - 86400000 * 4),
            condition: "Excellent",
            remarks: "Device factory reset and hardware diagnostics passed.",
          },
          {
            assetName: "Dell 27-inch 4K Monitor",
            assetCategory: "Peripheral",
            serialNumber: "DL-MN-49281",
            returned: true,
            verifiedBy: "IT Admin",
            verifiedAt: new Date(Date.now() - 86400000 * 4),
            condition: "Good",
            remarks: "Returned with power and HDMI cables.",
          },
          {
            assetName: "RFID Office Access Badge",
            assetCategory: "Security",
            serialNumber: "BDG-0921",
            returned: true,
            verifiedBy: "Security Reception",
            verifiedAt: new Date(Date.now() - 86400000 * 4),
            condition: "Good",
            remarks: "Badge deactivated in turnstile access system.",
          },
        ],
        accountRevocation: [
          { systemName: "Google Workspace / Corporate Email", systemType: "Email", revoked: true, revokedBy: "IT Admin", revokedAt: new Date() },
          { systemName: "Slack Workspace", systemType: "Chat", revoked: true, revokedBy: "IT Admin", revokedAt: new Date() },
          { systemName: "GitHub & Code Repositories", systemType: "DevOps", revoked: true, revokedBy: "Lead DevOps", revokedAt: new Date() },
          { systemName: "AWS Production Cloud IAM", systemType: "Cloud", revoked: true, revokedBy: "Cloud Admin", revokedAt: new Date() },
          { systemName: "Corporate VPN & Zero Trust", systemType: "Network", revoked: true, revokedBy: "Network Admin", revokedAt: new Date() },
        ],
        exitInterview: {
          primaryReason: "Better Compensation & Benefits",
          reasonDetails: "Accepted a Principal Architect role with higher overseas compensation.",
          compensationRating: 4,
          workCultureRating: 5,
          managerSupportRating: 5,
          growthOpportunitiesRating: 4,
          wouldRecommendCompany: true,
          proudMomentsOrLikes: "The incredible engineering culture, autonomy, and supportive leadership team.",
          suggestionsForImprovement: "Introduce higher annual learning stipend allowances for international conferences.",
          conductedBy: "Ananya Sharma",
          conductedAt: new Date(Date.now() - 86400000 * 5),
          completed: true,
        },
        ktHandoverCompleted: true,
        ktReceiverName: "Employee User",
        hrClearanceGranted: true,
        completedAt: new Date(Date.now() - 86400000 * 4),
      },
      {
        offboardingId: "OFF-2026-002",
        employeeId: "EMP-DEV-03",
        employeeName: "Employee User",
        department: "Engineering",
        designation: "Software Engineer",
        resignationDate: "2026-10-01",
        lastWorkingDay: "2026-10-31",
        noticePeriodDays: 30,
        status: "In_Progress",
        assetClearance: [
          {
            assetName: "ThinkPad X1 Carbon Gen 11",
            assetCategory: "Laptop",
            serialNumber: "TP-X1-889102",
            returned: false,
            condition: "Pending return on Last Working Day",
            remarks: "Employee in active notice handover.",
          },
          {
            assetName: "RFID Access Keycard",
            assetCategory: "Security",
            serialNumber: "BDG-1044",
            returned: false,
            condition: "Pending",
            remarks: "In active daily office use.",
          },
        ],
        accountRevocation: [
          { systemName: "Google Workspace / Email", systemType: "Email", revoked: false },
          { systemName: "Slack Workspace", systemType: "Chat", revoked: false },
          { systemName: "GitHub Organization", systemType: "DevOps", revoked: false },
          { systemName: "Corporate VPN & Network", systemType: "Network", revoked: false },
        ],
        exitInterview: {
          primaryReason: "Career Progression & Growth",
          reasonDetails: "Moving towards a specialized Distributed Systems Lead position.",
          compensationRating: 4,
          workCultureRating: 5,
          managerSupportRating: 5,
          growthOpportunitiesRating: 4,
          wouldRecommendCompany: true,
          proudMomentsOrLikes: "Delivering core platform compliance architecture under tight sprint deadlines.",
          suggestionsForImprovement: "Expand team sizes across engineering squads.",
          conductedBy: "Ananya Sharma",
          conductedAt: new Date(),
          completed: true,
        },
        ktHandoverCompleted: true,
        ktReceiverName: "Manager User",
        hrClearanceGranted: false,
      },
    ]);
  }
}

module.exports = function (app) {
  seedDefaultOffboarding().catch((err) => console.error("Offboarding seed error:", err));

  /**
   * GET /api/offboarding
   * List all offboarding cases
   */
  apiRoutes.get("/", async (req, res) => {
    try {
      const cases = await Offboarding.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: cases });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/offboarding/analytics
   * Aggregated exit interview insights & offboarding health
   */
  apiRoutes.get("/analytics", async (req, res) => {
    try {
      const allCases = await Offboarding.find().lean();

      const reasonCounts = {};
      let totalCulture = 0;
      let totalManager = 0;
      let totalCompensation = 0;
      let totalGrowth = 0;
      let surveyCount = 0;
      let recommendCount = 0;

      let totalAssets = 0;
      let returnedAssets = 0;

      let totalAccounts = 0;
      let revokedAccounts = 0;

      allCases.forEach((c) => {
        if (c.exitInterview && c.exitInterview.completed) {
          const r = c.exitInterview.primaryReason || "Other";
          reasonCounts[r] = (reasonCounts[r] || 0) + 1;

          totalCulture += c.exitInterview.workCultureRating || 4;
          totalManager += c.exitInterview.managerSupportRating || 4;
          totalCompensation += c.exitInterview.compensationRating || 4;
          totalGrowth += c.exitInterview.growthOpportunitiesRating || 4;
          surveyCount += 1;
          if (c.exitInterview.wouldRecommendCompany) recommendCount += 1;
        }

        if (c.assetClearance) {
          c.assetClearance.forEach((a) => {
            totalAssets += 1;
            if (a.returned) returnedAssets += 1;
          });
        }

        if (c.accountRevocation) {
          c.accountRevocation.forEach((acc) => {
            totalAccounts += 1;
            if (acc.revoked) revokedAccounts += 1;
          });
        }
      });

      const avgCulture = surveyCount > 0 ? (totalCulture / surveyCount).toFixed(1) : "4.8";
      const avgManager = surveyCount > 0 ? (totalManager / surveyCount).toFixed(1) : "4.7";
      const avgCompensation = surveyCount > 0 ? (totalCompensation / surveyCount).toFixed(1) : "4.2";
      const avgGrowth = surveyCount > 0 ? (totalGrowth / surveyCount).toFixed(1) : "4.0";
      const npsPercent = surveyCount > 0 ? Math.round((recommendCount / surveyCount) * 100) : 100;

      const assetReturnRate = totalAssets > 0 ? Math.round((returnedAssets / totalAssets) * 100) : 100;
      const accountRevokeRate = totalAccounts > 0 ? Math.round((revokedAccounts / totalAccounts) * 100) : 100;

      return res.status(200).json({
        success: true,
        data: {
          totalOffboardings: allCases.length,
          completedOffboardings: allCases.filter((c) => c.status === "Completed").length,
          inProgressOffboardings: allCases.filter((c) => c.status === "In_Progress").length,
          reasonDistribution: reasonCounts,
          satisfactionScores: {
            culture: Number(avgCulture),
            managerSupport: Number(avgManager),
            compensation: Number(avgCompensation),
            growth: Number(avgGrowth),
            recommendationRate: npsPercent,
          },
          operationalCompliance: {
            assetReturnRate,
            accountRevokeRate,
            totalAssetsTracked: totalAssets,
            totalAccountsTracked: totalAccounts,
          },
        },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * PUT /api/offboarding/:id/asset-clearance
   * Mark asset as returned or update condition
   */
  apiRoutes.put("/:id/asset-clearance", async (req, res) => {
    try {
      const { assetIndex, returned, verifiedBy, remarks, condition } = req.body;
      const c = await Offboarding.findOne({
        $or: [{ offboardingId: req.params.id }, { _id: req.params.id }],
      });

      if (!c) return res.status(404).json({ error: "Offboarding case not found" });

      if (c.assetClearance[assetIndex]) {
        c.assetClearance[assetIndex].returned = returned;
        c.assetClearance[assetIndex].verifiedBy = verifiedBy || "IT Admin";
        c.assetClearance[assetIndex].verifiedAt = new Date();
        if (remarks) c.assetClearance[assetIndex].remarks = remarks;
        if (condition) c.assetClearance[assetIndex].condition = condition;
      }

      await c.save();
      return res.status(200).json({ success: true, message: "Asset clearance updated", data: c });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * PUT /api/offboarding/:id/account-revocation
   * Mark system account as revoked
   */
  apiRoutes.put("/:id/account-revocation", async (req, res) => {
    try {
      const { accountIndex, revoked, revokedBy } = req.body;
      const c = await Offboarding.findOne({
        $or: [{ offboardingId: req.params.id }, { _id: req.params.id }],
      });

      if (!c) return res.status(404).json({ error: "Offboarding case not found" });

      if (c.accountRevocation[accountIndex]) {
        c.accountRevocation[accountIndex].revoked = revoked;
        c.accountRevocation[accountIndex].revokedBy = revokedBy || "Security Admin";
        c.accountRevocation[accountIndex].revokedAt = new Date();
      }

      await c.save();
      return res.status(200).json({ success: true, message: "Account access revocation updated", data: c });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/offboarding/:id/exit-interview
   * Submit structured exit interview survey
   */
  apiRoutes.post("/:id/exit-interview", async (req, res) => {
    try {
      const {
        primaryReason,
        reasonDetails,
        compensationRating,
        workCultureRating,
        managerSupportRating,
        growthOpportunitiesRating,
        wouldRecommendCompany,
        proudMomentsOrLikes,
        suggestionsForImprovement,
        conductedBy,
      } = req.body;

      const c = await Offboarding.findOne({
        $or: [{ offboardingId: req.params.id }, { _id: req.params.id }],
      });

      if (!c) return res.status(404).json({ error: "Offboarding case not found" });

      c.exitInterview = {
        primaryReason,
        reasonDetails,
        compensationRating: Number(compensationRating) || 4,
        workCultureRating: Number(workCultureRating) || 4,
        managerSupportRating: Number(managerSupportRating) || 4,
        growthOpportunitiesRating: Number(growthOpportunitiesRating) || 4,
        wouldRecommendCompany: wouldRecommendCompany !== false,
        proudMomentsOrLikes,
        suggestionsForImprovement,
        conductedBy: conductedBy || "HR Operations",
        conductedAt: new Date(),
        completed: true,
      };

      await c.save();
      return res.status(200).json({ success: true, message: "Exit interview recorded successfully", data: c });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * PUT /api/offboarding/:id/finalize
   * Complete all operational handovers and grant final HR NOC
   */
  apiRoutes.put("/:id/finalize", async (req, res) => {
    try {
      const c = await Offboarding.findOne({
        $or: [{ offboardingId: req.params.id }, { _id: req.params.id }],
      });

      if (!c) return res.status(404).json({ error: "Offboarding case not found" });

      c.status = "Completed";
      c.hrClearanceGranted = true;
      c.completedAt = new Date();
      await c.save();

      return res.status(200).json({ success: true, message: "Offboarding completed and HR NOC granted", data: c });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.use("/api/offboarding", apiRoutes);
};
