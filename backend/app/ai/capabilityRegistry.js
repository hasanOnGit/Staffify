/**
 * Staffify Enterprise Capability Registry
 *
 * Defines business domain metadata, schema references, supported query operations,
 * aggregations, business rules, and actions across all 15+ implemented modules.
 */

const CAPABILITY_REGISTRY = {
  employees: {
    id: "employees",
    displayName: "Employee Directory & Organization",
    description: "Employee profiles, departments, designations, reporting hierarchy, and work statuses.",
    modelName: "Employees",
    entities: ["employee", "staff", "person", "team member", "colleague", "manager", "headcount", "directory"],
    allowedRoles: ["Admin", "Manager", "Employee"],
    primaryKey: "employeeId",
    displayColumns: [
      { key: "employeeId", label: "Employee ID" },
      { key: "name", label: "Full Name" },
      { key: "department", label: "Department" },
      { key: "designation", label: "Designation" },
      { key: "email", label: "Email" },
      { key: "status", label: "Status" },
      { key: "joiningDate", label: "Joining Date", format: "date" },
    ],
    supportedFilters: ["department", "status", "designation", "location", "joiningYear", "search"],
    supportedMetrics: ["totalEmployees", "activeCount", "departmentCounts", "attritionRate"],
    samplePrompts: [
      "Show all employees in Engineering department",
      "Who joined the company this year?",
      "List all managers and department heads",
      "Give me a department-wise employee count",
    ],
  },

  attendance: {
    id: "attendance",
    displayName: "Attendance, Biometrics & Timesheets",
    description: "Daily punches, swipe logs, check-ins, check-outs, work hours, regularization, and biometrics.",
    modelName: "Attendance",
    entities: ["attendance", "swipe", "punch", "check in", "check out", "work hours", "biometric", "regularization", "late"],
    allowedRoles: ["Admin", "Manager", "Employee"],
    primaryKey: "attendanceId",
    displayColumns: [
      { key: "employeeName", label: "Employee" },
      { key: "date", label: "Date", format: "date" },
      { key: "status", label: "Status" },
      { key: "checkIn", label: "Check In", format: "time" },
      { key: "checkOut", label: "Check Out", format: "time" },
      { key: "workHours", label: "Hours Worked" },
      { key: "regularizationStatus", label: "Regularization" },
    ],
    supportedFilters: ["date", "period", "status", "employeeId", "department", "lateOnly"],
    supportedMetrics: ["presentCount", "absentCount", "lateArrivals", "averageWorkHours", "totalOvertime"],
    samplePrompts: [
      "Who checked in late today?",
      "Show my attendance records for this month",
      "How many employees are present today?",
      "List pending attendance regularizations",
    ],
  },

  leaves: {
    id: "leaves",
    displayName: "Leave Management & Time Off",
    description: "Leave balances, applications, approvals, sandwich policy inspection, and team calendar.",
    modelName: "Leaves",
    entities: ["leave", "time off", "vacation", "sick leave", "casual leave", "earned leave", "maternity", "paternity", "lop"],
    allowedRoles: ["Admin", "Manager", "Employee"],
    primaryKey: "leaveId",
    displayColumns: [
      { key: "employeeName", label: "Employee" },
      { key: "leaveType", label: "Leave Type" },
      { key: "startDate", label: "From", format: "date" },
      { key: "endDate", label: "To", format: "date" },
      { key: "daysCount", label: "Days" },
      { key: "status", label: "Status" },
      { key: "reason", label: "Reason" },
    ],
    supportedFilters: ["status", "leaveType", "employeeId", "period", "pendingOnly"],
    supportedMetrics: ["pendingApprovals", "approvedLeavesCount", "leaveUtilizationByType", "teamOnLeaveCount"],
    supportedActions: ["apply_leave", "approve_leave", "reject_leave"],
    samplePrompts: [
      "What is my current leave balance?",
      "Show all pending leave approval requests",
      "Who is on leave today or this week?",
      "How many sick leave days have been used this year?",
    ],
  },

  payroll: {
    id: "payroll",
    displayName: "Payroll, Salary & Statutory Deductions",
    description: "Salary structures, monthly payroll runs, EPF, ESIC, Professional Tax, CTC, and payslips.",
    modelName: "Payroll",
    entities: ["payroll", "salary", "payslip", "ctc", "epf", "pf", "esi", "esic", "deductions", "net pay", "tax"],
    allowedRoles: ["Admin", "Manager", "Employee"],
    primaryKey: "payrollId",
    displayColumns: [
      { key: "employeeName", label: "Employee" },
      { key: "month", label: "Month" },
      { key: "year", label: "Year" },
      { key: "grossEarnings", label: "Gross Salary", format: "currency" },
      { key: "totalDeductions", label: "Deductions", format: "currency" },
      { key: "netPayable", label: "Net Payable", format: "currency" },
      { key: "status", label: "Status" },
    ],
    supportedFilters: ["month", "year", "employeeId", "status", "department"],
    supportedMetrics: ["totalPayrollDisbursed", "averageSalary", "totalEpfContribution", "totalEsicContribution", "totalTaxDeducted"],
    samplePrompts: [
      "Show this month's payroll summary and total disbursed amount",
      "Compare this month's payroll with last month",
      "What is the total EPF and ESIC contribution for October?",
      "Show my latest payslip breakdown",
    ],
  },

  performance: {
    id: "performance",
    displayName: "Performance Management & OKRs",
    description: "Quarterly OKRs, employee goals, annual appraisals, 1-on-1 meeting notes, and ratings.",
    modelName: "Goal",
    entities: ["performance", "goal", "okr", "appraisal", "rating", "review", "one on one", "1-on-1", "kpi"],
    allowedRoles: ["Admin", "Manager", "Employee"],
    primaryKey: "goalId",
    displayColumns: [
      { key: "employeeName", label: "Employee" },
      { key: "title", label: "Goal Title" },
      { key: "category", label: "Category" },
      { key: "progressPercent", label: "Progress (%)" },
      { key: "targetDate", label: "Target Date", format: "date" },
      { key: "status", label: "Status" },
    ],
    supportedFilters: ["quarter", "year", "status", "employeeId", "progressLessThan"],
    supportedMetrics: ["averageGoalCompletion", "completedGoalsCount", "pendingReviewsCount", "topPerformers"],
    samplePrompts: [
      "Show active goals with progress below 50%",
      "How many performance appraisals are pending review?",
      "List all 1-on-1 meetings scheduled this month",
      "What is the average goal completion rate in Engineering?",
    ],
  },

  recruitment: {
    id: "recruitment",
    displayName: "Recruitment ATS & Candidate Pipeline",
    description: "Job requisitions, candidate pipeline Kanban, interview rounds, offers, and hiring velocity.",
    modelName: "JobOpening",
    entities: ["recruitment", "job", "candidate", "applicant", "pipeline", "ats", "interview", "hired", "offer"],
    allowedRoles: ["Admin", "Manager"],
    primaryKey: "jobId",
    displayColumns: [
      { key: "jobTitle", label: "Position" },
      { key: "department", label: "Department" },
      { key: "openings", label: "Openings" },
      { key: "applicantsCount", label: "Candidates" },
      { key: "status", label: "Job Status" },
      { key: "targetDate", label: "Target Close", format: "date" },
    ],
    supportedFilters: ["department", "status", "stage", "jobId"],
    supportedMetrics: ["openJobsCount", "totalCandidates", "hiredCount", "averageTimeToHire", "offerAcceptanceRate"],
    samplePrompts: [
      "How many active candidates are in the Interview stage?",
      "Show all open job requisitions for Engineering",
      "What is our average time-to-hire across departments?",
      "List candidates offered a position this month",
    ],
  },

  helpdesk: {
    id: "helpdesk",
    displayName: "IT Helpdesk & Asset Inventory",
    description: "Support tickets, incident queues, SLA response times, and company hardware asset allocation.",
    modelName: "Ticket",
    entities: ["helpdesk", "ticket", "issue", "support", "incident", "asset", "laptop", "hardware", "macbook", "it request"],
    allowedRoles: ["Admin", "Manager", "Employee"],
    primaryKey: "ticketId",
    displayColumns: [
      { key: "ticketId", label: "Ticket ID" },
      { key: "title", label: "Subject" },
      { key: "category", label: "Category" },
      { key: "priority", label: "Priority" },
      { key: "status", label: "Status" },
      { key: "assignedTo", label: "Assignee" },
      { key: "createdAt", label: "Raised At", format: "date" },
    ],
    supportedFilters: ["status", "priority", "category", "employeeId", "unassignedOnly"],
    supportedMetrics: ["openTicketsCount", "urgentTicketsCount", "averageResolutionHours", "allocatedAssetsCount"],
    supportedActions: ["create_ticket"],
    samplePrompts: [
      "List all High and Critical priority open tickets",
      "Which IT assets are currently assigned to me?",
      "How many laptops are available in inventory?",
      "Show tickets that have breached SLA response time",
    ],
  },

  loans: {
    id: "loans",
    displayName: "Salary Advances & Employee Loans",
    description: "Salary advance disbursements, EMI deduction schedules, interest rates, and loan balances.",
    modelName: "Loan",
    entities: ["loan", "advance", "salary advance", "emi", "borrowing", "repayment", "repaid"],
    allowedRoles: ["Admin", "Manager", "Employee"],
    primaryKey: "loanId",
    displayColumns: [
      { key: "loanId", label: "Loan ID" },
      { key: "employeeName", label: "Employee" },
      { key: "principalAmount", label: "Principal", format: "currency" },
      { key: "monthlyEmi", label: "Monthly EMI", format: "currency" },
      { key: "totalRepaid", label: "Repaid", format: "currency" },
      { key: "remainingBalance", label: "Outstanding", format: "currency" },
      { key: "status", label: "Status" },
    ],
    supportedFilters: ["status", "employeeId", "loanType"],
    supportedMetrics: ["totalDisbursed", "totalOutstanding", "activeLoansCount", "totalRepaid"],
    supportedActions: ["apply_loan"],
    samplePrompts: [
      "Show all active salary advances and total outstanding balance",
      "What is my remaining loan balance and next monthly EMI?",
      "List advances approved this quarter",
    ],
  },

  expenses: {
    id: "expenses",
    displayName: "Expense Claims & Travel Reimbursements",
    description: "Employee business expense claims, receipt attachments, travel per diems, and approvals.",
    modelName: "ExpenseClaim",
    entities: ["expense", "claim", "reimbursement", "receipt", "travel", "per diem", "food", "hotel"],
    allowedRoles: ["Admin", "Manager", "Employee"],
    primaryKey: "claimId",
    displayColumns: [
      { key: "claimId", label: "Claim ID" },
      { key: "employeeName", label: "Employee" },
      { key: "category", label: "Category" },
      { key: "amount", label: "Amount", format: "currency" },
      { key: "merchantName", label: "Merchant" },
      { key: "status", label: "Status" },
      { key: "claimDate", label: "Date", format: "date" },
    ],
    supportedFilters: ["status", "category", "employeeId", "period"],
    supportedMetrics: ["pendingClaimsTotal", "approvedClaimsTotal", "reimbursedTotal", "topCategory"],
    samplePrompts: [
      "Show pending expense reimbursement claims",
      "What is the total travel expense approved this month?",
      "List my submitted expense claims",
    ],
  },

  roster: {
    id: "roster",
    displayName: "Shift Planning & Roster Schedules",
    description: "Weekly shifts (General, Morning, Night), roster matrix, and shift swap requests.",
    modelName: "Shift",
    entities: ["roster", "shift", "schedule", "timetable", "night shift", "shift swap", "timing"],
    allowedRoles: ["Admin", "Manager", "Employee"],
    primaryKey: "shiftId",
    displayColumns: [
      { key: "shiftName", label: "Shift Name" },
      { key: "startTime", label: "Start Time" },
      { key: "endTime", label: "End Time" },
      { key: "isNightShift", label: "Night Shift" },
      { key: "color", label: "Color" },
    ],
    supportedFilters: ["department", "date", "shiftId", "employeeId"],
    supportedMetrics: ["totalShiftsConfigured", "nightShiftWorkersCount", "pendingSwapRequests"],
    samplePrompts: [
      "What shift am I assigned to this week?",
      "List all available shift timings in the company",
      "Are there any pending shift swap requests?",
    ],
  },

  compliance: {
    id: "compliance",
    displayName: "Statutory Compliance & Legal Filings",
    description: "Indian statutory compliance (EPF ECR, ESIC Return, PT Form 5, Form 24Q TDS), health audit.",
    modelName: "Payroll",
    entities: ["compliance", "statutory", "epf return", "esic return", "pt filing", "tds", "form 24q", "ecr", "audit"],
    allowedRoles: ["Admin"],
    primaryKey: "month",
    displayColumns: [
      { key: "challanType", label: "Filing Challan" },
      { key: "authority", label: "Statutory Body" },
      { key: "amount", label: "Total Remittance", format: "currency" },
      { key: "dueDate", label: "Statutory Due Date", format: "date" },
      { key: "status", label: "Compliance Status" },
    ],
    supportedFilters: ["month", "year"],
    supportedMetrics: ["complianceHealthScore", "totalStatutoryLiability", "filingsCompleted"],
    samplePrompts: [
      "Show the statutory compliance summary for this month",
      "What is our total EPF ECR liability and due date?",
      "Check our overall compliance health score",
    ],
  },

  documents: {
    id: "documents",
    displayName: "Official HR Letters & Document Templates",
    description: "Appointment letters, bonafide certificates, salary revisions, and exit experience letters.",
    modelName: "HrDocument",
    entities: ["document", "letter", "appointment letter", "bonafide", "experience letter", "relieving", "template"],
    allowedRoles: ["Admin", "Manager", "Employee"],
    primaryKey: "documentId",
    displayColumns: [
      { key: "documentId", label: "Doc ID" },
      { key: "title", label: "Title" },
      { key: "templateType", label: "Template" },
      { key: "employeeName", label: "Employee" },
      { key: "status", label: "Status" },
      { key: "issuedDate", label: "Issued Date", format: "date" },
    ],
    supportedFilters: ["templateType", "employeeId", "status"],
    supportedMetrics: ["totalIssuedDocuments", "pendingSignatureCount"],
    samplePrompts: [
      "What official HR document templates are available?",
      "List documents issued to me",
      "Show generated appointment letters this month",
    ],
  },

  timesheets: {
    id: "timesheets",
    displayName: "Project Timesheets & Client Hours",
    description: "Weekly project timesheets, task-level time logs, billable hours, and approvals.",
    modelName: "Timesheet",
    entities: ["timesheet", "project hours", "billable", "time log", "client hours", "task hours"],
    allowedRoles: ["Admin", "Manager", "Employee"],
    primaryKey: "timesheetId",
    displayColumns: [
      { key: "employeeName", label: "Employee" },
      { key: "projectName", label: "Project" },
      { key: "weekStartDate", label: "Week Start", format: "date" },
      { key: "totalHours", label: "Total Hours" },
      { key: "billableHours", label: "Billable Hours" },
      { key: "status", label: "Status" },
    ],
    supportedFilters: ["status", "employeeId", "projectName", "period"],
    supportedMetrics: ["totalHoursLogged", "averageBillableRatio", "pendingTimesheets"],
    samplePrompts: [
      "Show pending timesheets waiting for approval",
      "How many billable hours were logged this week?",
      "What is my submitted timesheet status?",
    ],
  },

  offboarding: {
    id: "offboarding",
    displayName: "Offboarding, Exits & Settlements",
    description: "Resignation notices, exit clearance checklist, KT handover, and full & final settlements.",
    modelName: "Offboarding",
    entities: ["offboarding", "resignation", "exit", "notice period", "clearance", "settlement", "handover"],
    allowedRoles: ["Admin", "Manager"],
    primaryKey: "offboardingId",
    displayColumns: [
      { key: "employeeName", label: "Employee" },
      { key: "department", label: "Department" },
      { key: "resignationDate", label: "Resignation Date", format: "date" },
      { key: "lastWorkingDay", label: "LWD", format: "date" },
      { key: "exitStage", label: "Exit Stage" },
      { key: "clearanceStatus", label: "Clearance Status" },
    ],
    supportedFilters: ["exitStage", "department", "clearanceStatus"],
    supportedMetrics: ["activeExitsCount", "averageNoticePeriodDays", "completedSettlements"],
    samplePrompts: [
      "Show employees currently serving notice period",
      "List pending department clearance checklists",
      "What are the scheduled exit dates for this month?",
    ],
  },

  pulse: {
    id: "pulse",
    displayName: "Pulse, Culture & Announcements",
    description: "Company-wide broadcasts, peer-to-peer kudos recognitions, and work anniversary milestones.",
    modelName: "Broadcast",
    entities: ["pulse", "broadcast", "announcement", "kudos", "recognition", "milestone", "anniversary", "birthday"],
    allowedRoles: ["Admin", "Manager", "Employee"],
    primaryKey: "broadcastId",
    displayColumns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "authorName", label: "Posted By" },
      { key: "createdAt", label: "Date", format: "date" },
    ],
    supportedFilters: ["category"],
    supportedMetrics: ["activeBroadcastsCount", "totalKudosGivenThisMonth"],
    samplePrompts: [
      "Show latest company broadcast announcements",
      "Who received kudos recognitions recently?",
      "Are there any upcoming work anniversaries this week?",
    ],
  },
};

module.exports = {
  CAPABILITY_REGISTRY,

  /**
   * Resolve user prompt to the best matching capability
   */
  resolveCapability(queryText = "") {
    const text = queryText.toLowerCase();

    // Check entity matches
    let bestMatch = null;
    let highestScore = 0;

    Object.values(CAPABILITY_REGISTRY).forEach((cap) => {
      let score = 0;
      cap.entities.forEach((entity) => {
        if (text.includes(entity)) {
          score += entity.length; // weight longer specific words higher
        }
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatch = cap;
      }
    });

    return bestMatch || CAPABILITY_REGISTRY.employees;
  },

  /**
   * Return list of capabilities accessible for a given user role
   */
  getCapabilitiesForRole(role = "Employee") {
    return Object.values(CAPABILITY_REGISTRY).filter((c) =>
      c.allowedRoles.includes(role)
    );
  },
};
