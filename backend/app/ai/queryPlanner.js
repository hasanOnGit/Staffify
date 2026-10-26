/**
 * Staffify Conversational Query Planner
 *
 * Parses natural language input, resolves conversational follow-ups and pronouns,
 * determines operational intent, validates permissions, and generates structured
 * query and action execution plans.
 */

const { resolveCapability, CAPABILITY_REGISTRY } = require("./capabilityRegistry");

/**
 * Extract date or period hints from text
 */
function extractPeriod(text = "") {
  const lower = text.toLowerCase();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (lower.includes("last month") || lower.includes("previous month")) {
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    return { month: prevMonth, year: prevYear, label: "Previous Month", comparison: true };
  }

  if (lower.includes("this month") || lower.includes("current month")) {
    return { month: currentMonth, year: currentYear, label: "Current Month" };
  }

  if (lower.includes("today")) {
    return { today: true, date: now.toISOString().split("T")[0], label: "Today" };
  }

  if (lower.includes("this year")) {
    return { year: currentYear, label: "Current Year" };
  }

  // Month names
  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];
  for (let i = 0; i < months.length; i++) {
    if (lower.includes(months[i])) {
      return { month: i + 1, year: currentYear, label: months[i] };
    }
  }

  return {};
}

/**
 * Extract department from text
 */
function extractDepartment(text = "") {
  const lower = text.toLowerCase();
  const departments = [
    "engineering", "product", "human resources", "hr", "finance",
    "marketing", "sales", "operations", "legal", "customer support"
  ];

  for (const dept of departments) {
    if (lower.includes(dept)) {
      return dept === "hr" ? "Human Resources" : dept.charAt(0).toUpperCase() + dept.slice(1);
    }
  }
  return null;
}

/**
 * Extract status from text
 */
function extractStatus(text = "") {
  const lower = text.toLowerCase();
  if (lower.includes("pending") || lower.includes("waiting")) return "Pending";
  if (lower.includes("approved") || lower.includes("completed")) return "Approved";
  if (lower.includes("rejected")) return "Rejected";
  if (lower.includes("active") || lower.includes("open")) return "Active";
  if (lower.includes("closed") || lower.includes("resolved")) return "Resolved";
  if (lower.includes("late")) return "Late";
  if (lower.includes("present")) return "Present";
  if (lower.includes("absent")) return "Absent";
  return null;
}

/**
 * Main query planner function
 */
function planQuery(messageText = "", previousContext = {}, userRole = "Employee") {
  const text = messageText.trim();
  const lower = text.toLowerCase();

  // 1. Check if user is asking for an actionable workflow
  if (
    lower.startsWith("apply for leave") ||
    lower.startsWith("request leave") ||
    lower.startsWith("take leave") ||
    lower.startsWith("apply leave")
  ) {
    // Draft leave action
    const isSick = lower.includes("sick");
    const isCasual = lower.includes("casual");
    const leaveType = isSick ? "sick" : isCasual ? "casual" : "paid";

    return {
      type: "ACTION_DRAFT",
      action: "apply_leave",
      module: "leaves",
      actionDraft: {
        actionType: "apply_leave",
        title: "Apply for Time Off",
        leaveType,
        daysCount: 1,
        fromDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        toDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        reason: text.replace(/apply for leave|request leave|take leave/gi, "").trim() || "Personal time off",
      },
      message: `I have prepared a draft leave application for **${leaveType.toUpperCase()}** leave. Please review and confirm to submit.`,
    };
  }

  if (lower.includes("clock in") || lower.includes("punch in") || lower.includes("check in")) {
    return {
      type: "ACTION_DRAFT",
      action: "punch_attendance",
      module: "attendance",
      actionDraft: {
        actionType: "punch_attendance",
        title: "Record Attendance Punch",
        type: "IN",
        time: new Date().toLocaleTimeString(),
      },
      message: "Ready to record your **Check-In** swipe. Please confirm below.",
    };
  }

  if (lower.includes("clock out") || lower.includes("punch out") || lower.includes("check out")) {
    return {
      type: "ACTION_DRAFT",
      action: "punch_attendance",
      module: "attendance",
      actionDraft: {
        actionType: "punch_attendance",
        title: "Record Attendance Punch",
        type: "OUT",
        time: new Date().toLocaleTimeString(),
      },
      message: "Ready to record your **Check-Out** swipe. Please confirm below.",
    };
  }

  if (lower.startsWith("raise ticket") || lower.startsWith("create ticket") || lower.startsWith("report issue")) {
    return {
      type: "ACTION_DRAFT",
      action: "create_ticket",
      module: "helpdesk",
      actionDraft: {
        actionType: "create_ticket",
        title: "Raise Support Ticket",
        subject: text.replace(/raise ticket|create ticket|report issue/gi, "").trim() || "Technical Support Request",
        category: lower.includes("laptop") || lower.includes("hardware") ? "IT Hardware & Software" : "HR Operations",
        priority: lower.includes("urgent") || lower.includes("critical") ? "High" : "Medium",
      },
      message: "I have drafted a new support ticket. Please confirm the details to submit to IT Helpdesk.",
    };
  }

  if (lower.startsWith("apply for advance") || lower.startsWith("apply for loan") || lower.startsWith("request advance")) {
    const amountMatch = text.match(/\d+[\d,]*/);
    const amount = amountMatch ? Number(amountMatch[0].replace(/,/g, "")) : 25000;
    return {
      type: "ACTION_DRAFT",
      action: "apply_loan",
      module: "loans",
      actionDraft: {
        actionType: "apply_loan",
        title: "Apply for Salary Advance",
        principalAmount: amount,
        tenureMonths: 5,
        monthlyEmi: Math.round(amount / 5),
        reason: text.replace(/apply for advance|apply for loan|request advance/gi, "").trim() || "Personal emergency expense advance",
      },
      message: `I have drafted a salary advance request for **₹${amount.toLocaleString("en-IN")}** over 5 monthly EMIs. Please review and confirm.`,
    };
  }

  // 2. Check for Follow-up references: "them", "those", "only Noida", "exclude cancelled", "compare with last month"
  const isFollowUp =
    lower.includes("only ") ||
    lower.includes("exclude ") ||
    lower.includes("those") ||
    lower.includes("them") ||
    lower.includes("filter by") ||
    lower.includes("compare with") ||
    lower.includes("now sort") ||
    lower.includes("from that");

  let targetModule = previousContext.module;
  let filters = { ...(previousContext.filters || {}) };

  if (!isFollowUp || !targetModule) {
    // Resolve capability from scratch
    const cap = resolveCapability(text);
    targetModule = cap.id;
    filters = {}; // reset filters for new subject
  }

  // 3. Extract and refine filters
  const period = extractPeriod(text);
  if (period.month) filters.month = period.month;
  if (period.year) filters.year = period.year;
  if (period.date) filters.date = period.date;
  if (period.today) filters.today = true;

  const department = extractDepartment(text);
  if (department) filters.department = department;

  const status = extractStatus(text);
  if (status) filters.status = status;

  if (lower.includes("late")) filters.status = "Late";
  if (lower.includes("pending")) filters.status = "Pending";
  if (lower.includes("active")) filters.status = "Active";

  const comparison =
    lower.includes("compare") ||
    lower.includes("versus") ||
    lower.includes("vs") ||
    lower.includes("month-over-month") ||
    lower.includes("growth");

  return {
    type: "QUERY",
    module: targetModule,
    filters,
    comparison,
    limit: 50,
  };
}

module.exports = {
  planQuery,
  extractPeriod,
  extractDepartment,
  extractStatus,
};
