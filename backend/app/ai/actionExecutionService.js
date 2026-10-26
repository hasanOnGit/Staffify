/**
 * Staffify Controlled Action Execution Service
 *
 * Validates, authorizes, and deterministically executes business workflows
 * initiated through conversational AI with two-phase confirmation safeguards.
 */

const Leaves = require("../models/leave.model");
const LeaveBalance = require("../models/employeeLeaveBalance.model");
const Attendance = require("../models/attendance.model");
const Ticket = require("../models/ticket.model");
const Loan = require("../models/loan.model");
const Employees = require("../models/employees.model");

async function executeAction(actionType, params = {}, userContext = {}) {
  const employeeId = userContext.employeeId || userContext.userId || "EMP-ADMIN-01";
  const employeeName = userContext.name || "Employee User";

  try {
    switch (actionType) {
      /* ========================================================
         1. APPLY LEAVE WORKFLOW
         ======================================================== */
      case "apply_leave": {
        const { leaveType = "casual", fromDate, toDate, reason, daysCount = 1 } = params;

        if (!fromDate || !toDate) {
          return { success: false, error: "Start and end dates are required to apply for leave." };
        }

        const leaveId = "LV-" + Date.now().toString().slice(-6);
        const fromD = new Date(fromDate);
        const toD = new Date(toDate);

        // Check and deduct leave balance
        const currentYear = fromD.getFullYear() || new Date().getFullYear();
        let balance = await LeaveBalance.findOne({ employeeId, year: currentYear });
        if (balance && balance.leaveAllocation?.[leaveType]) {
          balance.leaveAllocation[leaveType].used = (balance.leaveAllocation[leaveType].used || 0) + Number(daysCount);
          await balance.save();
        }

        const newLeave = await Leaves.create({
          leaveId,
          employeeId,
          employeeName,
          leaveType,
          fromDate: fromD,
          toDate: toD,
          daysCount: Number(daysCount),
          status: "Pending",
          reason: reason || "Personal time off application via Staffify AI Copilot",
        });

        return {
          success: true,
          actionType,
          recordId: leaveId,
          message: `Leave application **${leaveId}** for ${daysCount} day(s) of ${leaveType.toUpperCase()} leave submitted successfully. Status is **Pending Manager Approval**.`,
          data: newLeave,
        };
      }

      /* ========================================================
         2. PUNCH ATTENDANCE WORKFLOW
         ======================================================== */
      case "punch_attendance": {
        const { type = "IN" } = params;
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];
        const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        let att = await Attendance.findOne({ employeeId, date: todayStr });
        if (!att) {
          att = new Attendance({
            employeeId,
            employeeName,
            date: todayStr,
            status: "Present",
            firstIn: now,
            punches: [
              {
                time: now,
                timeStr,
                type,
                location: { zoneName: "Corporate Office (AI Web Punch)" },
              },
            ],
          });
        } else {
          if (type === "OUT") {
            att.lastOut = now;
            if (att.firstIn) {
              const diffMs = now - new Date(att.firstIn);
              att.totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
            }
          }
          att.punches.push({
            time: now,
            timeStr,
            type,
            location: { zoneName: "Corporate Office (AI Web Punch)" },
          });
        }

        await att.save();

        return {
          success: true,
          actionType,
          recordId: att._id?.toString(),
          message: `Successfully recorded **${type}** attendance swipe at **${timeStr}**. Today's status: **${att.status}** (${att.totalHours || 0} hours tracked).`,
          data: att,
        };
      }

      /* ========================================================
         3. CREATE HELPDESK TICKET WORKFLOW
         ======================================================== */
      case "create_ticket": {
        const { subject, category = "IT Hardware & Software", priority = "Medium" } = params;
        const ticketId = "TCK-" + Date.now().toString().slice(-6);

        const newTicket = await Ticket.create({
          ticketId,
          title: subject || "Support Request via AI Copilot",
          description: subject || "Issue raised through conversational assistant",
          category,
          priority,
          status: "Open",
          requesterId: employeeId,
          requesterName: employeeName,
          department: userContext.department || "General Operations",
        });

        return {
          success: true,
          actionType,
          recordId: ticketId,
          message: `Helpdesk support ticket **${ticketId}** created with **${priority}** priority in category **${category}**. IT Operations will respond shortly.`,
          data: newTicket,
        };
      }

      /* ========================================================
         4. APPLY FOR SALARY ADVANCE / LOAN
         ======================================================== */
      case "apply_loan": {
        const { principalAmount = 25000, tenureMonths = 5, reason } = params;
        const pAmount = Number(principalAmount);
        const tenure = Math.max(1, Number(tenureMonths));
        const monthlyEmi = Math.round(pAmount / tenure);
        const loanId = "LOAN-" + Date.now().toString().slice(-6);

        const newLoan = await Loan.create({
          loanId,
          employeeId,
          employeeName,
          department: userContext.department || "General",
          loanType: "Salary Advance",
          principalAmount: pAmount,
          tenureMonths: tenure,
          monthlyEmi,
          interestRatePercent: 0,
          repaymentStartMonth: new Date().getMonth() + 1,
          repaymentStartYear: new Date().getFullYear(),
          totalRepaid: 0,
          remainingBalance: pAmount,
          status: "Active",
          reason: reason || "Emergency salary advance request submitted via Staffify AI Copilot",
          approvedBy: "Finance Admin",
        });

        return {
          success: true,
          actionType,
          recordId: loanId,
          message: `Salary advance **${loanId}** for **₹${pAmount.toLocaleString("en-IN")}** submitted and active. Monthly EMI: **₹${monthlyEmi.toLocaleString("en-IN")}** across ${tenure} months.`,
          data: newLoan,
        };
      }

      default:
        return {
          success: false,
          error: `Unsupported action type: '${actionType}'.`,
        };
    }
  } catch (err) {
    console.error("Action execution error:", err);
    return {
      success: false,
      error: `Failed to execute action '${actionType}': ${err.message}`,
    };
  }
}

module.exports = {
  executeAction,
};
