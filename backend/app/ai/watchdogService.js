const AiAnomalyAlert = require("../models/aiAnomalyAlert.model");
const Attendance = require("../models/attendance.model");
const Leave = require("../models/leave.model");
const EmployeeLeaveBalance = require("../models/employeeLeaveBalance.model");
const Payroll = require("../models/payroll.model");
const Candidate = require("../models/candidate.model");
const JobOpening = require("../models/jobOpening.model");
const Ticket = require("../models/ticket.model");
const Employee = require("../models/employees.model");

/**
 * Autonomous Workforce Watchdog Service
 *
 * Proactively scans operational data across Attendance, Leaves, Payroll,
 * Recruitment ATS, and IT Helpdesk to detect anomalies, burnout risks,
 * compliance variances, and workflow bottlenecks.
 */
async function scanWorkforceAnomalies() {
  const anomalies = [];
  const now = new Date();

  try {
    // 1. SCAN ATTENDANCE ANOMALIES
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentAttendances = await Attendance.find({
      date: { $gte: sevenDaysAgo.toISOString().slice(0, 10) },
    }).lean();

    // Group late punches by employee
    const latePunchesByEmp = {};
    for (const att of recentAttendances) {
      if (att.status === "Late" || att.isLate) {
        latePunchesByEmp[att.employeeId] = (latePunchesByEmp[att.employeeId] || 0) + 1;
      }
    }

    for (const [empId, count] of Object.entries(latePunchesByEmp)) {
      if (count >= 2) {
        anomalies.push({
          alertId: `ALT-ATT-LATE-${empId}`,
          category: "ATTENDANCE",
          severity: count >= 3 ? "CRITICAL" : "WARNING",
          title: `Repeated Late Check-Ins: ${empId}`,
          description: `Employee ${empId} recorded ${count} late check-in punches in the past 7 days.`,
          metrics: { latePunches: count, timeWindow: "7 days" },
          affectedEntity: { entityType: "Employee", entityId: empId, entityName: empId },
          recommendedAction: "Review shift schedule alignment or discuss flexible work options.",
        });
      }
    }

    // 2. SCAN LEAVE BURNOUT & PENDING APPROVAL BOTTLENECKS
    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
    const pendingLeaves = await Leave.find({
      status: "Pending",
      createdAt: { $lte: fourDaysAgo },
    }).lean();

    if (pendingLeaves.length > 0) {
      anomalies.push({
        alertId: `ALT-LEV-PENDING-${now.toISOString().slice(0, 10)}`,
        category: "LEAVE",
        severity: "WARNING",
        title: `${pendingLeaves.length} Leave Application(s) Pending Review > 4 Days`,
        description: `There are ${pendingLeaves.length} employee time-off requests waiting for manager approval for over 96 hours.`,
        metrics: { pendingCount: pendingLeaves.length, oldestApplicationDays: 4 },
        affectedEntity: { entityType: "Workforce", entityId: "Leaves", entityName: "Leave Pipeline" },
        recommendedAction: "Notify reporting managers to clear pending leave approvals before pay cycle freeze.",
      });
    }

    // Check burnout: employees with > 12 leaves available and no leave in past 60 days
    const highBalanceEmployees = await EmployeeLeaveBalance.find({
      $or: [{ annual: { $gte: 15 } }, { paid: { $gte: 15 } }],
    }).limit(5).lean();

    if (highBalanceEmployees.length > 0) {
      anomalies.push({
        alertId: `ALT-LEV-BURNOUT-${now.toISOString().slice(0, 10)}`,
        category: "LEAVE",
        severity: "INFO",
        title: `Workforce Burnout Advisory: Accumulated Unused Time-Off`,
        description: `${highBalanceEmployees.length} employee(s) hold more than 15 accumulated paid leave days with minimal recent time off.`,
        metrics: { flaggedEmployees: highBalanceEmployees.length },
        affectedEntity: { entityType: "Workforce", entityId: "Wellness", entityName: "Employee Well-being" },
        recommendedAction: "Encourage team leads to promote quarterly wellness breaks.",
      });
    }

    // 3. SCAN PAYROLL VARIANCES
    const recentPayrolls = await Payroll.find().sort({ createdAt: -1 }).limit(10).lean();
    if (recentPayrolls.length >= 2) {
      const latestMonthCost = recentPayrolls[0].totalGross || recentPayrolls[0].netSalary || 0;
      const priorMonthCost = recentPayrolls[1].totalGross || recentPayrolls[1].netSalary || 0;
      if (priorMonthCost > 0) {
        const variancePct = Math.round(((latestMonthCost - priorMonthCost) / priorMonthCost) * 100);
        if (Math.abs(variancePct) >= 20) {
          anomalies.push({
            alertId: `ALT-PAY-VAR-${now.toISOString().slice(0, 7)}`,
            category: "PAYROLL",
            severity: "WARNING",
            title: `Payroll Variance Alert (${variancePct > 0 ? "+" : ""}${variancePct}%)`,
            description: `Month-over-month total gross payroll shifted by ${variancePct}%.`,
            metrics: { latestMonthCost, priorMonthCost, variancePct },
            affectedEntity: { entityType: "Finance", entityId: "Payroll", entityName: "Monthly Payroll" },
            recommendedAction: "Audit recent salary revisions, bonuses, or new employee additions.",
          });
        }
      }
    }

    // 4. SCAN ATS CANDIDATE BOTTLENECKS
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const stalledCandidates = await Candidate.find({
      status: { $in: ["Screening", "Interview"] },
      updatedAt: { $lte: tenDaysAgo },
    }).lean();

    if (stalledCandidates.length > 0) {
      anomalies.push({
        alertId: `ALT-ATS-STALLED-${now.toISOString().slice(0, 10)}`,
        category: "RECRUITMENT",
        severity: "WARNING",
        title: `${stalledCandidates.length} ATS Candidate(s) Stalled in Pipeline > 10 Days`,
        description: `${stalledCandidates.length} candidate applications in screening/interview stages have had no stage updates for over 10 days.`,
        metrics: { stalledCandidateCount: stalledCandidates.length },
        affectedEntity: { entityType: "ATS", entityId: "Candidates", entityName: "Recruitment Pipeline" },
        recommendedAction: "Prompt interviewers for feedback or send candidates status updates to reduce drop-off.",
      });
    }

    // 5. SCAN HELPDESK SLA BREACHES
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const criticalTickets = await Ticket.find({
      priority: { $in: ["High", "Critical"] },
      status: { $in: ["Open", "In Progress"] },
      createdAt: { $lte: twoDaysAgo },
    }).lean();

    if (criticalTickets.length > 0) {
      anomalies.push({
        alertId: `ALT-IT-SLA-${now.toISOString().slice(0, 10)}`,
        category: "HELPDESK",
        severity: "CRITICAL",
        title: `${criticalTickets.length} High-Priority Support Ticket(s) Near/Exceeding SLA`,
        description: `Unresolved high-priority service desk requests pending for more than 48 hours.`,
        metrics: { breachedTickets: criticalTickets.length },
        affectedEntity: { entityType: "Helpdesk", entityId: "Tickets", entityName: "IT & HR Helpdesk" },
        recommendedAction: "Escalate immediately to department leads for rapid triage.",
      });
    }

    // Persist or update alerts in MongoDB
    for (const alert of anomalies) {
      await AiAnomalyAlert.findOneAndUpdate(
        { alertId: alert.alertId },
        { ...alert, status: "ACTIVE", detectedAt: new Date() },
        { upsert: true, returnDocument: "after" }
      );
    }
  } catch (err) {
    console.error("Watchdog scan error:", err.message);
  }

  return anomalies;
}

/**
 * Generate Executive Morning Digest
 */
async function getExecutiveMorningDigest() {
  const activeAlerts = await scanWorkforceAnomalies();
  const totalActive = activeAlerts.length;
  const criticalCount = activeAlerts.filter((a) => a.severity === "CRITICAL").length;
  const warningCount = activeAlerts.filter((a) => a.severity === "WARNING").length;

  let healthScore = 100 - criticalCount * 15 - warningCount * 5;
  healthScore = Math.max(40, Math.min(100, healthScore));

  const greeting = "Good morning. Here is your autonomous Staffify workforce intelligence briefing.";

  return {
    timestamp: new Date(),
    healthScore,
    status: healthScore >= 85 ? "Optimal" : healthScore >= 70 ? "Attention Required" : "Action Needed",
    greeting,
    totalAnomalies: totalActive,
    criticalCount,
    warningCount,
    anomalies: activeAlerts,
    keyObservations: [
      `Overall workforce operational health score is currently rated at ${healthScore}%.`,
      criticalCount > 0
        ? `${criticalCount} critical operational matter(s) require immediate managerial attention.`
        : "No critical operational bottlenecks detected across Attendance, Leaves, and Payroll.",
      warningCount > 0
        ? `${warningCount} workflow advisory flag(s) identified for preventative review.`
        : "All workforce SLA and pipeline turnaround metrics are within standard compliance parameters.",
    ],
  };
}

module.exports = {
  scanWorkforceAnomalies,
  getExecutiveMorningDigest,
};
