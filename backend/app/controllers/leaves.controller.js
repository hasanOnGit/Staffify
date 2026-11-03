const express = require("express");
const apiRoutes = express.Router();
const Leaves = require("../models/leave.model");
const LeaveBalance = require("../models/employeeLeaveBalance.model");
const LeavePolicy = require("../models/leavePolicy.model");
const Holiday = require("../models/holiday.model");
const Employee = require("../models/employees.model");
const LeaveDelegation = require("../models/leaveDelegation.model");

// Ensure default leave policy exists
async function getOrCreatePolicy() {
  let policy = await LeavePolicy.findOne({ policyId: "DEFAULT_LEAVE_POLICY" });
  if (!policy) {
    policy = await LeavePolicy.create({
      policyId: "DEFAULT_LEAVE_POLICY",
      sandwichPolicyEnabled: true,
      includeWeekends: true,
      includeStatutoryHolidays: true,
      applicableLeaveTypes: ["casual", "sick", "earned"],
    });
  }
  return policy;
}

// Helper to get or initialize yearly balance
const getOrCreateBalance = async (employeeId, year = new Date().getFullYear()) => {
  let balance = await LeaveBalance.findOne({ employeeId, year });
  if (!balance || !balance.leaveAllocation) {
    if (balance) {
      await LeaveBalance.deleteOne({ _id: balance._id });
    }
    balance = await LeaveBalance.create({
      employeeId,
      year,
      leaveAllocation: {
        earned: { totalAllocated: 15, used: 0 },
        casual: { totalAllocated: 12, used: 0 },
        sick: { totalAllocated: 10, used: 0 },
        paid: { totalAllocated: 12, used: 0 },
        halfDay: { totalAllocated: 6, used: 0 },
        maternity: { totalAllocated: 180, used: 0 },
        paternity: { totalAllocated: 15, used: 0 },
        lop: { totalAllocated: 999, used: 0 },
      },
    });
  }
  return balance;
};

// Calculate days between dates with optional Sandwich rule inspection
const calculateDaysWithSandwich = async (from, to, isHalfDay, leaveType, policy) => {
  if (isHalfDay) return { daysCount: 0.5, isSandwiched: false, interveningDays: 0 };

  const fromD = new Date(from);
  fromD.setHours(0, 0, 0, 0);
  const toD = new Date(to);
  toD.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(toD - fromD);
  const rawCalendarDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // If single day or sandwich rule disabled
  if (!policy?.sandwichPolicyEnabled || !policy.applicableLeaveTypes?.includes(leaveType)) {
    return { daysCount: rawCalendarDays > 0 ? rawCalendarDays : 1, isSandwiched: false, interveningDays: 0 };
  }

  // Check if dates span across weekend (Saturday & Sunday)
  let weekendDays = 0;
  let cur = new Date(fromD);
  while (cur <= toD) {
    const day = cur.getDay();
    if (day === 0 || day === 6) {
      weekendDays++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  const isSandwiched = weekendDays > 0 && rawCalendarDays > weekendDays;

  return {
    daysCount: rawCalendarDays,
    isSandwiched,
    interveningDays: weekendDays,
  };
};

module.exports = function (app) {
  /* ==========================================================
     APPLY FOR LEAVE (WITH BALANCE VERIFICATION)
     ========================================================== */
  apiRoutes.post("/applyLeave", async (req, res) => {
    try {
      const {
        employeeId,
        employeeName,
        leaveType,
        isHalfDay,
        halfDaySession,
        fromDate,
        toDate,
        reason,
        contactDetailsDuringLeave,
      } = req.body;

      if (!employeeId || !leaveType || !fromDate || !toDate || !reason) {
        return res.status(400).json({
          error: "Employee ID, leave type, from date, to date, and reason are required.",
        });
      }

      const from = new Date(fromDate);
      const to = new Date(toDate);

      if (from > to) {
        return res.status(400).json({ error: "From date cannot be after To date." });
      }

      const policy = await getOrCreatePolicy();
      const { daysCount, isSandwiched, interveningDays } = await calculateDaysWithSandwich(
        from,
        to,
        isHalfDay,
        leaveType,
        policy
      );
      const year = from.getFullYear();

      // Check balance
      const balance = await getOrCreateBalance(employeeId, year);
      const allocation = balance.leaveAllocation[leaveType];

      if (!allocation && leaveType !== "lop") {
        return res.status(400).json({ error: `Invalid leave type: ${leaveType}` });
      }

      if (leaveType !== "lop") {
        const available = allocation.totalAllocated - allocation.used;
        if (daysCount > available) {
          return res.status(400).json({
            error: `Insufficient ${leaveType} leave balance. Available: ${available} days, Requested: ${daysCount} days${
              isSandwiched ? ` (including ${interveningDays} sandwiched weekend/holiday days)` : ""
            }.`,
          });
        }
      }

      const leaveId = "LV-" + Date.now();

      const leave = await Leaves.create({
        leaveId,
        employeeId,
        employeeName: employeeName || "Employee",
        leaveType,
        isHalfDay: !!isHalfDay,
        halfDaySession: isHalfDay ? halfDaySession || "Session 1 (First Half)" : "None",
        daysCount,
        fromDate: from,
        toDate: to,
        reason,
        contactDetailsDuringLeave,
        status: "Pending",
      });

      return res.status(201).json({
        message: "Leave applied successfully and sent for approval",
        data: leave,
      });
    } catch (error) {
      console.error("Apply leave error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  /* ==========================================================
     GET LEAVES (FILTERABLE BY EMPLOYEE AND STATUS)
     ========================================================== */
  apiRoutes.get("/getLeaves", async (req, res) => {
    try {
      const { employeeId, status } = req.query;
      const filter = {};

      if (employeeId) filter.employeeId = employeeId;
      if (status && status !== "All") filter.status = status;

      const leaves = await Leaves.find(filter).sort({ createdAt: -1 });

      return res.status(200).json({
        message: "Leaves fetched successfully",
        data: leaves,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  /* ==========================================================
     UPDATE LEAVE STATUS (APPROVE / REJECT)
     ========================================================== */
  apiRoutes.post("/updateLeave", async (req, res) => {
    try {
      const { leaveId, status, approvedBy, rejectionReason, proxyFor } = req.body;

      const leave = await Leaves.findOne({ leaveId });
      if (!leave) {
        return res.status(404).json({ message: "Leave request not found." });
      }

      if (leave.status === "Approved") {
        return res.status(400).json({ message: "Leave has already been approved." });
      }
      if (leave.status === "Cancelled") {
        return res.status(400).json({ message: "Cannot modify a cancelled leave request." });
      }

      leave.status = status;
      if (proxyFor) {
        leave.approvedBy = `${approvedBy || "Manager"} (Proxy for ${proxyFor})`;
      } else {
        leave.approvedBy = approvedBy || "Manager";
      }
      if (status === "Rejected" && rejectionReason) {
        leave.rejectionReason = rejectionReason;
      }
      await leave.save();

      // Deduct balance when Approved
      if (status === "Approved") {
        const year = new Date(leave.fromDate).getFullYear();
        const balance = await getOrCreateBalance(leave.employeeId, year);

        if (balance.leaveAllocation[leave.leaveType]) {
          balance.leaveAllocation[leave.leaveType].used += leave.daysCount;
          balance.lastUpdated = new Date();
          await balance.save();
        }
      }

      return res.status(200).json({
        message: `Leave request ${status.toLowerCase()} successfully`,
        data: leave,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  /* ==========================================================
     LEAVE APPROVAL DELEGATIONS (OUT-OF-OFFICE PROXY WORKFLOW)
     ========================================================== */
  const getDelegationsHandler = async (req, res) => {
    try {
      const { delegatorId, delegateId, activeOnly } = req.query;
      const query = {};
      if (delegatorId) query.delegatorId = delegatorId;
      if (delegateId) query.delegateId = delegateId;
      if (activeOnly === "true") {
        query.isActive = true;
        query.endDate = { $gte: new Date() };
      }

      const delegations = await LeaveDelegation.find(query).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, delegations, count: delegations.length });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };

  const createDelegationHandler = async (req, res) => {
    try {
      const {
        delegatorId,
        delegatorName,
        delegateId,
        delegateName,
        delegateEmail,
        startDate,
        endDate,
        reason,
      } = req.body;

      if (!delegatorId || !delegateId || !startDate || !endDate) {
        return res.status(400).json({ error: "Missing required delegation fields." });
      }

      const delegationId = `DEL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const delegation = await LeaveDelegation.create({
        delegationId,
        delegatorId,
        delegatorName: delegatorName || "Manager",
        delegateId,
        delegateName: delegateName || "Proxy Manager",
        delegateEmail: delegateEmail || "",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: reason || "Out of Office / Annual Leave Delegation",
        isActive: true,
      });

      return res.status(201).json({
        success: true,
        message: `Leave approvals successfully delegated to ${delegateName}`,
        delegation,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };

  const revokeDelegationHandler = async (req, res) => {
    try {
      const id = req.params.id || req.body.delegationId || req.body.id;
      const delegation = await LeaveDelegation.findOne({
        $or: [{ _id: id }, { delegationId: id }],
      });

      if (!delegation) {
        return res.status(404).json({ error: "Delegation record not found." });
      }

      delegation.isActive = false;
      await delegation.save();

      return res.status(200).json({
        success: true,
        message: "Delegation revoked successfully.",
        delegation,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };

  apiRoutes.get("/delegations", getDelegationsHandler);
  apiRoutes.get("/leave/delegations", getDelegationsHandler);
  apiRoutes.post("/delegations", createDelegationHandler);
  apiRoutes.post("/leave/delegations", createDelegationHandler);
  apiRoutes.delete("/delegations/:id", revokeDelegationHandler);
  apiRoutes.delete("/leave/delegations/:id", revokeDelegationHandler);
  apiRoutes.post("/revokeDelegation", revokeDelegationHandler);

  /* ==========================================================
     CANCEL LEAVE (EMPLOYEE WITHDRAWAL)
     ========================================================== */
  apiRoutes.post("/cancelLeave", async (req, res) => {
    try {
      const { leaveId, employeeId } = req.body;

      const leave = await Leaves.findOne({ leaveId });
      if (!leave) {
        return res.status(404).json({ message: "Leave request not found." });
      }

      // If already cancelled
      if (leave.status === "Cancelled") {
        return res.status(400).json({ message: "Leave is already cancelled." });
      }

      const wasApproved = leave.status === "Approved";
      leave.status = "Cancelled";
      await leave.save();

      // If it was already approved, refund the days back to employee quota!
      if (wasApproved) {
        const year = new Date(leave.fromDate).getFullYear();
        const balance = await getOrCreateBalance(leave.employeeId, year);
        if (balance.leaveAllocation[leave.leaveType]) {
          balance.leaveAllocation[leave.leaveType].used = Math.max(
            0,
            balance.leaveAllocation[leave.leaveType].used - leave.daysCount
          );
          balance.lastUpdated = new Date();
          await balance.save();
        }
      }

      return res.status(200).json({
        message: "Leave request cancelled successfully and balance adjusted.",
        data: leave,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  /* ==========================================================
     GET LEAVE BALANCE (AUTO-INITIALIZES IF MISSING)
     ========================================================== */
  const handleGetBalance = async (req, res) => {
    try {
      const employeeId =
        req.query?.employeeId ||
        req.body?.employeeId ||
        req.user?.employeeId ||
        req.user?.userId ||
        "EMP-ADMIN-01";
      const year = Number(req.query?.year || req.body?.year) || new Date().getFullYear();

      const balance = await getOrCreateBalance(employeeId, year);

      // Structure nicely with remaining counts
      const formatted = {};
      const allocMap = balance?.leaveAllocation || {};
      Object.keys(allocMap).forEach((type) => {
        const alloc = allocMap[type] || { totalAllocated: 0, used: 0 };
        formatted[type] = {
          total: alloc.totalAllocated || 0,
          used: alloc.used || 0,
          available: Math.max(0, (alloc.totalAllocated || 0) - (alloc.used || 0)),
        };
      });

      return res.status(200).json({
        message: "Leave balance fetched successfully",
        year,
        employeeId,
        data: formatted,
        raw: balance,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

  apiRoutes.get("/getLeaveBalance", handleGetBalance);
  apiRoutes.post("/getLeaveBalance", handleGetBalance);

  apiRoutes.get("/team-on-leave", async (req, res) => {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const leaves = await Leaves.find({
        status: "Approved",
        fromDate: { $lte: endOfDay },
        toDate: { $gte: startOfDay },
      }).select("employeeId employeeName leaveType fromDate toDate isHalfDay");

      return res.status(200).json({
        message: "Team members on leave today",
        data: leaves,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  /* ==========================================================
     LEAVE POLICY SETTINGS (SANDWICH RULE & ACCRUAL CONFIG)
     ========================================================== */
  apiRoutes.get("/policy", async (req, res) => {
    try {
      const policy = await getOrCreatePolicy();
      return res.status(200).json({ success: true, data: policy });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  apiRoutes.put("/policy", async (req, res) => {
    try {
      const { sandwichPolicyEnabled, includeWeekends, includeStatutoryHolidays, applicableLeaveTypes, annualRolloverRules } = req.body;
      const policy = await getOrCreatePolicy();

      if (sandwichPolicyEnabled !== undefined) policy.sandwichPolicyEnabled = !!sandwichPolicyEnabled;
      if (includeWeekends !== undefined) policy.includeWeekends = !!includeWeekends;
      if (includeStatutoryHolidays !== undefined) policy.includeStatutoryHolidays = !!includeStatutoryHolidays;
      if (applicableLeaveTypes) policy.applicableLeaveTypes = applicableLeaveTypes;
      if (annualRolloverRules) policy.annualRolloverRules = { ...policy.annualRolloverRules, ...annualRolloverRules };

      await policy.save();
      return res.status(200).json({ success: true, message: "Leave policy updated successfully", data: policy });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     ANNUAL LEAVE ROLLOVER & CARRY-FORWARD BATCH ENGINE
     ========================================================== */
  apiRoutes.post("/rollover", async (req, res) => {
    try {
      const {
        executedBy = "HR Admin",
        targetYear,
        dryRun = false,
        encashOverLimit = false,
        maxCarryForwardOverride,
        compOffPolicy = "preserve", // "preserve" or "lapse"
      } = req.body;

      const nextYear = Number(targetYear) || new Date().getFullYear() + 1;
      const prevYear = nextYear - 1;

      const policy = await getOrCreatePolicy();
      let prevBalances = await LeaveBalance.find({ year: prevYear });

      // If no prevBalances found, fall back to current year if targetYear is next year
      if (prevBalances.length === 0) {
        prevBalances = await LeaveBalance.find();
      }

      // Preload employee records for names, departments and salary (for encashment)
      const employees = await Employee.find({}, "employeeId firstName lastName department basicSalary totalSalary").lean();
      const empMap = new Map();
      for (const emp of employees) {
        empMap.set(emp.employeeId, emp);
      }

      const maxElCf = maxCarryForwardOverride !== undefined
        ? Number(maxCarryForwardOverride)
        : (policy.annualRolloverRules?.earnedLeave?.maxCarryForward || 30);
      const annualCreditEl = policy.annualRolloverRules?.earnedLeave?.annualCredit || 15;

      const maxSlCf = policy.annualRolloverRules?.sickLeave?.maxCarryForward || 10;
      const annualCreditSl = policy.annualRolloverRules?.sickLeave?.annualCredit || 10;
      const annualCreditCl = policy.annualRolloverRules?.casualLeave?.annualCredit || 12;

      let rolloverCount = 0;
      let totalCarriedOverEL = 0;
      let totalEncashedEL = 0;
      let totalLapsedEL = 0;
      let totalCarriedOverSL = 0;
      let totalLapsedCL = 0;
      let totalEncashmentPayout = 0;
      const details = [];

      for (const pb of prevBalances) {
        const emp = empMap.get(pb.employeeId) || {};
        const empName = [emp.firstName, emp.lastName].filter(Boolean).join(" ") || pb.employeeId;
        const dept = emp.department || "General";
        const basicSalary = Number(emp.basicSalary) || 25000;
        const perDaySalary = Math.round(basicSalary / 30);

        // Earned Leave calculation
        const elAlloc = pb.leaveAllocation?.earned || { totalAllocated: 15, used: 0 };
        const elRemaining = Math.max(0, elAlloc.totalAllocated - elAlloc.used);
        const carriedOverEl = Math.min(maxElCf, elRemaining);
        const surplusEl = Math.max(0, elRemaining - maxElCf);

        let encashedEl = 0;
        let lapsedEl = 0;
        if (encashOverLimit && surplusEl > 0) {
          encashedEl = surplusEl;
        } else {
          lapsedEl = surplusEl;
        }
        const encashmentAmount = encashedEl * perDaySalary;

        // Sick Leave calculation
        const slAlloc = pb.leaveAllocation?.sick || { totalAllocated: 10, used: 0 };
        const slRemaining = Math.max(0, slAlloc.totalAllocated - slAlloc.used);
        const carriedOverSl = Math.min(maxSlCf, slRemaining);
        const lapsedSl = Math.max(0, slRemaining - maxSlCf);

        // Casual Leave lapses under Indian labor laws
        const clAlloc = pb.leaveAllocation?.casual || { totalAllocated: 12, used: 0 };
        const clRemaining = Math.max(0, clAlloc.totalAllocated - clAlloc.used);
        const lapsedCl = clRemaining;

        // Comp-Off preservation or reset
        const compOffAlloc = pb.leaveAllocation?.compOff || { totalAllocated: 0, used: 0 };
        const compOffRemaining = Math.max(0, compOffAlloc.totalAllocated - compOffAlloc.used);
        const carriedOverCompOff = compOffPolicy === "preserve" ? compOffRemaining : 0;

        totalCarriedOverEL += carriedOverEl;
        totalEncashedEL += encashedEl;
        totalLapsedEL += lapsedEl;
        totalCarriedOverSL += carriedOverSl;
        totalLapsedCL += lapsedCl;
        totalEncashmentPayout += encashmentAmount;

        details.push({
          employeeId: pb.employeeId,
          employeeName: empName,
          department: dept,
          elRemaining,
          carriedOverEl,
          encashedEl,
          lapsedEl,
          encashmentAmount,
          slRemaining,
          carriedOverSl,
          lapsedSl,
          clRemaining,
          lapsedCl,
          compOffRemaining,
          carriedOverCompOff,
          newElAllocated: carriedOverEl + annualCreditEl,
          newSlAllocated: carriedOverSl + annualCreditSl,
          newClAllocated: annualCreditCl,
        });

        if (!dryRun) {
          let nextBal = await LeaveBalance.findOne({ employeeId: pb.employeeId, year: nextYear });
          if (!nextBal) {
            nextBal = new LeaveBalance({
              employeeId: pb.employeeId,
              year: nextYear,
            });
          }

          nextBal.leaveAllocation = {
            earned: { totalAllocated: carriedOverEl + annualCreditEl, used: 0 },
            casual: { totalAllocated: annualCreditCl, used: 0 },
            sick: { totalAllocated: carriedOverSl + annualCreditSl, used: 0 },
            compOff: { totalAllocated: carriedOverCompOff, used: 0 },
            paid: { totalAllocated: 12, used: 0 },
            halfDay: { totalAllocated: 6, used: 0 },
            maternity: { totalAllocated: 180, used: 0 },
            paternity: { totalAllocated: 15, used: 0 },
            lop: { totalAllocated: 999, used: 0 },
          };
          nextBal.lastUpdated = new Date();
          await nextBal.save();
        }

        rolloverCount++;
      }

      if (!dryRun) {
        policy.lastRolloverExecutedAt = new Date();
        policy.lastRolloverExecutedBy = executedBy;
        await policy.save();
      }

      return res.status(200).json({
        success: true,
        dryRun: Boolean(dryRun),
        message: dryRun
          ? `Year-End Rollover Simulation completed for ${rolloverCount} employees into FY ${nextYear}`
          : `Annual leave rollover executed successfully for ${rolloverCount} employees into FY ${nextYear}`,
        targetYear: nextYear,
        rolloverCount,
        summary: {
          totalEmployees: rolloverCount,
          totalCarriedOverEL,
          totalEncashedEL,
          totalLapsedEL,
          totalCarriedOverSL,
          totalLapsedCL,
          totalEncashmentPayout,
        },
        details,
      });
    } catch (err) {
      console.error("Rollover error:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  app.use("/api/leaves", apiRoutes);
  app.use("/api", apiRoutes);
  app.use("/", apiRoutes);
};
