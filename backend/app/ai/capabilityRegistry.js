/**
 * Staffify Enterprise Capability Registry
 *
 * Defines business domain metadata, schema references, supported query operations,
 * aggregations, business rules, routes, action routes, tasks, and 1-click navigation
 * across all Staffify and StaffifyGo modules.
 */

const CAPABILITY_REGISTRY = {
  // ==========================================
  // SELF SERVICE (ESS) MODULES
  // ==========================================

  dashboard: {
    id: "dashboard",
    displayName: "Personal Overview & Activity",
    description: "Personal workplace summary, daily check-in status, quick action shortcuts, announcements, and key metrics.",
    section: "Self Service (ESS)",
    route: "/dashboard",
    actionRoute: "/dashboard",
    icon: "LayoutDashboard",
    allowedRoles: ["Admin", "Manager", "Employee"],
    actionLabel: "Open Dashboard",
    entities: ["dashboard", "home", "for you", "overview", "activity", "feed", "summary", "my status"],
    tasks: [
      "view my overview",
      "check today summary",
      "dashboard stats",
      "recent announcements",
      "quick shortcuts",
      "activity feed",
      "view personal overview",
      "go to home",
    ],
    steps: [
      "Open 'For you (Dashboard)' from the top of the left sidebar navigation.",
      "Review your personalized daily punch status, pending items, pulse broadcasts, and quick-action shortcuts.",
    ],
    samplePrompts: [
      "Take me to my dashboard",
      "Show my personal overview",
      "What is on my dashboard today?",
    ],
  },

  copilot: {
    id: "copilot",
    displayName: "AI Copilot Hub",
    description: "Enterprise conversational workforce copilot grounded in verified MongoDB records with zero hallucinations.",
    section: "Self Service (ESS)",
    route: "/copilot",
    actionRoute: "/copilot",
    icon: "Sparkles",
    allowedRoles: ["Admin", "Manager", "Employee"],
    actionLabel: "Open AI Copilot",
    entities: ["copilot", "ai", "assistant", "chat", "bot", "ask ai", "intelligence", "conversational"],
    tasks: [
      "open ai copilot",
      "chat with ai",
      "ask ai",
      "ai assistant",
      "run natural language query",
      "workforce assistant",
      "copilot hub",
    ],
    steps: [
      "Click 'AI Copilot' in the sidebar or press Ctrl + J / Cmd + K anywhere in Staffify.",
      "Ask any question about staff, attendance, leaves, payroll, or statutory rules.",
    ],
    samplePrompts: [
      "Open AI Copilot hub",
      "How does the AI assistant work?",
    ],
  },

  attendance: {
    id: "attendance",
    displayName: "Attendance, Swipes & Biometrics",
    description: "Daily punches, swipe logs, check-ins, check-outs, work hours, regularization, geofences, and biometrics.",
    section: "Self Service (ESS)",
    route: "/attendance",
    actionRoute: "/attendance",
    icon: "Clock",
    allowedRoles: ["Admin", "Manager", "Employee"],
    modelName: "Attendance",
    primaryKey: "attendanceId",
    actionLabel: "Clock In / Check Out",
    entities: ["attendance", "swipe", "punch", "check in", "check out", "work hours", "biometric", "regularization", "late", "clock in", "clock out", "geofence"],
    tasks: [
      "punch in",
      "clock in",
      "punch out",
      "clock out",
      "check in",
      "check out",
      "attendance swipe",
      "work hours",
      "regularization",
      "regularise attendance",
      "geofence punch",
      "biometric swipe",
      "attendance log",
      "attendance history",
      "check punches",
      "record check in",
      "record check out",
    ],
    steps: [
      "Navigate to 'Attendance & Swipes' from the sidebar (or press Alt + P).",
      "Click the 'Check In' or 'Check Out' button to register your GPS/IP-verified punch.",
      "Inspect your daily work hours, punch history, and regularization requests.",
    ],
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
      "Where can I punch in or check my attendance?",
      "Who checked in late today?",
      "Show my attendance records for this month",
      "List pending attendance regularizations",
    ],
  },

  leaves: {
    id: "leaves",
    displayName: "Leave Management & Balances",
    description: "Leave quotas, applications, manager approvals, sandwich policy inspection, and holiday calendar.",
    section: "Self Service (ESS)",
    route: "/leaves",
    actionRoute: "/leaves?apply=true",
    icon: "CalendarCheck",
    allowedRoles: ["Admin", "Manager", "Employee"],
    modelName: "Leaves",
    primaryKey: "leaveId",
    actionLabel: "Apply for Leave",
    entities: ["leave", "time off", "vacation", "sick leave", "casual leave", "earned leave", "maternity", "paternity", "lop", "holiday", "sandwich rule", "chutti"],
    tasks: [
      "apply leave",
      "apply for leave",
      "request leave",
      "take leave",
      "leave balance",
      "check leave balance",
      "vacation request",
      "time off",
      "sick leave",
      "casual leave",
      "earned leave",
      "sandwich leave",
      "leave history",
      "holiday calendar",
      "request time off",
      "cancel leave",
    ],
    steps: [
      "Navigate to 'Leave & Balances' from the sidebar (or press Alt + L).",
      "Click the 'Apply for Leave' button.",
      "Select your leave category (Casual, Sick, Earned), select the dates, enter a reason, and submit.",
    ],
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
      "Where can I apply for leave?",
      "What is my current leave balance?",
      "Show all pending leave approval requests",
      "Who is on leave today or this week?",
    ],
  },

  profile: {
    id: "profile",
    displayName: "My Profile & Personal Dossier",
    description: "Employee profile details, contact numbers, emergency contacts, bank accounts, and statutory identifiers.",
    section: "Self Service (ESS)",
    route: "/profile",
    actionRoute: "/profile",
    icon: "User",
    allowedRoles: ["Admin", "Manager", "Employee"],
    actionLabel: "Edit Profile",
    entities: ["profile", "my profile", "phone", "emergency contact", "address", "bank details", "avatar", "password", "personal info", "aadhaar", "pan"],
    tasks: [
      "my profile",
      "view profile",
      "edit profile",
      "change phone number",
      "emergency contact",
      "update bank details",
      "update address",
      "view personal details",
      "profile picture",
      "change password",
      "update personal info",
    ],
    steps: [
      "Click 'My Profile' in the sidebar or select your profile avatar in the top navbar.",
      "Review your employee profile, statutory numbers (PAN/Aadhaar/UAN), and bank info.",
      "Click 'Edit' to update permitted contact fields and emergency contact details.",
    ],
    samplePrompts: [
      "Where can I change my phone number or update profile?",
      "Show my profile details",
      "Where are my emergency contacts listed?",
    ],
  },

  payslips: {
    id: "payslips",
    displayName: "Payslips & Salary Slips",
    description: "Monthly salary slips, gross earnings, statutory deductions (EPF, ESIC, PT, TDS), and downloadable PDF payslips.",
    section: "Self Service (ESS)",
    route: "/payslips",
    actionRoute: "/payslips",
    icon: "FileText",
    allowedRoles: ["Admin", "Manager", "Employee"],
    modelName: "Payroll",
    primaryKey: "payrollId",
    actionLabel: "View Latest Payslip",
    entities: ["payslip", "salary slip", "pay slip", "monthly salary", "take home", "salary breakdown", "form 16", "salary certificate", "net pay", "salary slip download"],
    tasks: [
      "view payslip",
      "download payslip",
      "salary slip",
      "monthly salary",
      "salary breakdown",
      "take home pay",
      "tax deduction",
      "epf contribution",
      "esic deduction",
      "form 16",
      "salary certificate",
      "check my salary",
      "get payslip",
    ],
    steps: [
      "Navigate to 'Payslips & Salary' in the Self Service section of the sidebar.",
      "Select the desired month and year from the pay cycle dropdown.",
      "Click 'View Slip' or 'Download PDF' to inspect your earnings, statutory deductions, and net credited amount.",
    ],
    samplePrompts: [
      "Where can I download my payslip?",
      "How do I check my monthly salary slip?",
      "Show my latest payslip breakdown",
    ],
  },

  performance: {
    id: "performance",
    displayName: "Performance Management & OKRs",
    description: "Quarterly OKRs, employee goals, annual appraisals, 1-on-1 meeting notes, ratings, and milestone reviews.",
    section: "Self Service (ESS)",
    route: "/performance",
    actionRoute: "/performance",
    icon: "Target",
    allowedRoles: ["Admin", "Manager", "Employee"],
    modelName: "Goal",
    primaryKey: "goalId",
    actionLabel: "Update OKR Goals",
    entities: ["performance", "goal", "okr", "appraisal", "rating", "review", "one on one", "1-on-1", "kpi", "milestone", "self appraisal"],
    tasks: [
      "performance review",
      "okr",
      "goals",
      "appraisal",
      "kpi",
      "1-on-1 meeting",
      "one on one",
      "ratings",
      "quarterly target",
      "self appraisal",
      "update goal progress",
      "track milestones",
    ],
    steps: [
      "Navigate to 'Performance & OKRs' from the sidebar.",
      "Review your active quarterly goals, milestones, and progress percentages.",
      "Click on any goal to log progress, update key results, or submit your self-appraisal review.",
    ],
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
      "Where can I update my performance goals or OKRs?",
      "Show active goals with progress below 50%",
      "How many performance appraisals are pending review?",
    ],
  },

  roster: {
    id: "roster",
    displayName: "Shift Planning & Roster Schedules",
    description: "Weekly squad shifts (Morning, General, Evening, Night), roster matrix, and peer-to-peer shift swap requests.",
    section: "Self Service (ESS)",
    route: "/roster",
    actionRoute: "/roster",
    icon: "Calendar",
    allowedRoles: ["Admin", "Manager", "Employee"],
    modelName: "Shift",
    primaryKey: "shiftId",
    actionLabel: "View Roster / Request Swap",
    entities: ["roster", "shift", "schedule", "timetable", "night shift", "shift swap", "timing", "swap request", "work hours schedule"],
    tasks: [
      "shift schedule",
      "roster",
      "my shift",
      "shift swap",
      "request swap",
      "night shift",
      "work timetable",
      "squad timing",
      "check my shift",
      "swap shift with colleague",
    ],
    steps: [
      "Navigate to 'Shift Roster Planner' in the sidebar.",
      "View the weekly schedule matrix for your squad.",
      "Click 'Request Shift Swap' if you need a peer to cover your assigned shift.",
    ],
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
      "Where can I check my shift roster?",
      "What shift am I assigned to this week?",
      "How do I request a shift swap?",
    ],
  },

  helpdesk: {
    id: "helpdesk",
    displayName: "IT Helpdesk & Asset Inventory",
    description: "Support tickets, incident queues, SLA response times, and company hardware asset allocation.",
    section: "Self Service (ESS)",
    route: "/helpdesk",
    actionRoute: "/helpdesk?ticket=true",
    icon: "LifeBuoy",
    allowedRoles: ["Admin", "Manager", "Employee"],
    modelName: "Ticket",
    primaryKey: "ticketId",
    actionLabel: "Raise Support Ticket",
    entities: ["helpdesk", "ticket", "issue", "support", "incident", "asset", "laptop", "hardware", "macbook", "it request", "service desk", "equipment"],
    tasks: [
      "raise ticket",
      "create ticket",
      "it support",
      "hardware issue",
      "laptop request",
      "macbook",
      "service desk",
      "it asset",
      "repair request",
      "asset allocation",
      "report bug",
      "request laptop",
      "check ticket status",
    ],
    steps: [
      "Navigate to 'Helpdesk & Assets' from the sidebar.",
      "Click 'Raise New Ticket' to submit a hardware, software, or HR operations ticket.",
      "Fill in subject, category, and priority (Low, Medium, High, Urgent) to assign to the IT queue.",
    ],
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
      "Where do I raise an IT support ticket?",
      "Which IT assets are currently assigned to me?",
      "List all High and Critical priority open tickets",
    ],
  },

  orgChart: {
    id: "org-chart",
    displayName: "Organization Tree & Hierarchy",
    description: "Interactive visual organizational tree, manager-employee reporting chains, squad leads, and department structures.",
    section: "Self Service (ESS)",
    route: "/org-chart",
    actionRoute: "/org-chart",
    icon: "Network",
    allowedRoles: ["Admin", "Manager", "Employee"],
    actionLabel: "Explore Org Hierarchy",
    entities: ["org chart", "org tree", "organization", "hierarchy", "reporting", "manager", "chain of command", "tree", "subordinates", "department tree"],
    tasks: [
      "org tree",
      "org chart",
      "reporting hierarchy",
      "manager chain",
      "who reports to whom",
      "company structure",
      "team tree",
      "department hierarchy",
      "organization chart",
      "find manager",
    ],
    steps: [
      "Navigate to 'Organization Tree' in the sidebar.",
      "Pan and zoom across the visual tree of leadership, managers, and squads.",
      "Click on any employee card to expand direct reports or view profile summaries.",
    ],
    samplePrompts: [
      "Where can I view the company org chart?",
      "Who reports to whom in Engineering?",
      "Show me the organization tree",
    ],
  },

  expenses: {
    id: "expenses",
    displayName: "Expense Claims & Reimbursements",
    description: "Employee business expense claims, merchant receipt attachments, travel per diems, and finance approvals.",
    section: "Self Service (ESS)",
    route: "/expenses",
    actionRoute: "/expenses?claim=true",
    icon: "Receipt",
    allowedRoles: ["Admin", "Manager", "Employee"],
    modelName: "ExpenseClaim",
    primaryKey: "claimId",
    actionLabel: "Submit Expense Claim",
    entities: ["expense", "claim", "reimbursement", "receipt", "travel", "per diem", "food", "hotel", "bill", "mileage", "voucher"],
    tasks: [
      "expense claim",
      "submit receipt",
      "travel claim",
      "reimbursement",
      "food bill",
      "hotel stay",
      "per diem",
      "mileage claim",
      "business expense",
      "claim expense",
      "submit expense reimbursement",
    ],
    steps: [
      "Navigate to 'Expenses & Claims' in the sidebar.",
      "Click 'New Expense Claim'.",
      "Enter the merchant, category, amount, upload the invoice receipt, and submit for finance sign-off.",
    ],
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
      "Where do I submit an expense reimbursement claim?",
      "Show pending expense reimbursement claims",
      "What is the total travel expense approved this month?",
    ],
  },

  timesheets: {
    id: "timesheets",
    displayName: "Project Timesheets & Client Hours",
    description: "Weekly project timesheets, task-level time logs, billable vs non-billable hours, and client billing.",
    section: "Self Service (ESS)",
    route: "/timesheets",
    actionRoute: "/timesheets",
    icon: "Clock",
    allowedRoles: ["Admin", "Manager", "Employee"],
    modelName: "Timesheet",
    primaryKey: "timesheetId",
    actionLabel: "Log Project Hours",
    entities: ["timesheet", "project hours", "billable", "time log", "client hours", "task hours", "work log"],
    tasks: [
      "log hours",
      "timesheet",
      "project hours",
      "billable hours",
      "weekly timesheet",
      "client billing",
      "task time log",
      "submit timesheet",
      "enter work hours",
    ],
    steps: [
      "Navigate to 'Project Timesheets' in the sidebar.",
      "Select your assigned client project and target week.",
      "Enter daily hours logged per project task and click 'Submit Timesheet' for manager review.",
    ],
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
      "Where can I log my project timesheet hours?",
      "Show pending timesheets waiting for approval",
      "How many billable hours were logged this week?",
    ],
  },

  loans: {
    id: "loans",
    displayName: "Salary Advances & Employee Loans",
    description: "Salary advance disbursements, monthly EMI deduction amortization, interest rates, and loan balances.",
    section: "Self Service (ESS)",
    route: "/loans",
    actionRoute: "/loans?apply=true",
    icon: "CreditCard",
    allowedRoles: ["Admin", "Manager", "Employee"],
    modelName: "Loan",
    primaryKey: "loanId",
    actionLabel: "Apply for Salary Advance",
    entities: ["loan", "advance", "salary advance", "emi", "borrowing", "repayment", "repaid", "emergency loan"],
    tasks: [
      "salary advance",
      "apply for loan",
      "request advance",
      "emi schedule",
      "loan balance",
      "repayment schedule",
      "emergency funds",
      "apply for advance",
    ],
    steps: [
      "Ask Copilot to draft a loan request or open the advance section.",
      "Specify the principal loan amount and repayment tenure (1 to 12 monthly EMIs).",
      "Review the auto-calculated monthly deductions and submit for finance approval.",
    ],
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
      "Where do I apply for a salary advance?",
      "What is my remaining loan balance and next monthly EMI?",
      "Show all active salary advances and total outstanding balance",
    ],
  },

  // ==========================================
  // MANAGER SERVICES (MSS) MODULES
  // ==========================================

  teams: {
    id: "teams",
    displayName: "Squads & Team Rosters",
    description: "Squad management, cross-functional team structures, team lead assignments, and department rosters.",
    section: "Manager Services",
    route: "/teams",
    actionRoute: "/teams",
    icon: "Users2",
    allowedRoles: ["Admin", "Manager"],
    actionLabel: "Manage Squads & Teams",
    entities: ["team", "squad", "structure", "team members", "lead", "squads", "rosters", "group"],
    tasks: [
      "manage team",
      "squads",
      "team structure",
      "team members",
      "assign squad",
      "create team",
      "team rosters",
      "manager view",
      "view my squad",
    ],
    steps: [
      "Navigate to 'Squads & Rosters' under Manager Services in the sidebar.",
      "Click into any squad to inspect active rosters, assigned members, and squad leads.",
      "Assign or reassign team members and configure squad shift defaults.",
    ],
    samplePrompts: [
      "Where can I manage my team squads and rosters?",
      "Show all squad leads and members",
    ],
  },

  recruitment: {
    id: "recruitment",
    displayName: "Recruitment ATS & Candidate Pipeline",
    description: "Job requisitions, candidate pipeline Kanban, interview rounds, offers, and hiring velocity.",
    section: "Manager Services",
    route: "/recruitment",
    actionRoute: "/recruitment",
    icon: "Briefcase",
    allowedRoles: ["Admin", "Manager"],
    modelName: "JobOpening",
    primaryKey: "jobId",
    actionLabel: "Open Candidate Pipeline",
    entities: ["recruitment", "job", "candidate", "applicant", "pipeline", "ats", "interview", "hired", "offer", "requisition", "resumes"],
    tasks: [
      "post job",
      "candidate pipeline",
      "job openings",
      "ats",
      "interview candidates",
      "hiring pipeline",
      "shortlist candidate",
      "job requisition",
      "offer letter",
      "create job opening",
      "view applicants",
    ],
    steps: [
      "Navigate to 'Recruitment & ATS' under Manager Services.",
      "Review the Kanban pipeline across Applied, Screened, Interview, Offered, and Hired stages.",
      "Click '+ Create Job' to post a new opening or drag candidate cards through interview rounds.",
    ],
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
      "Where can I post a job opening or check candidates?",
      "How many active candidates are in the Interview stage?",
      "Show all open job requisitions for Engineering",
    ],
  },

  analytics: {
    id: "analytics",
    displayName: "Executive Workforce Analytics",
    description: "High-level headcount charts, attendance turnout trends, attrition rates, and executive workforce metrics.",
    section: "Manager Services",
    route: "/analytics",
    actionRoute: "/analytics",
    icon: "BarChart3",
    allowedRoles: ["Admin", "Manager"],
    actionLabel: "View Analytics Hub",
    entities: ["analytics", "charts", "metrics", "headcount", "attrition", "turnout", "workforce analytics", "trends", "kpi report"],
    tasks: [
      "workforce analytics",
      "headcount trends",
      "attrition rate",
      "turnout charts",
      "department distribution",
      "executive report",
      "attendance trends",
      "hr metrics",
      "view company charts",
    ],
    steps: [
      "Navigate to 'Executive Analytics' under Manager Services in the sidebar.",
      "Inspect interactive charts covering Headcount Growth, Turnout Ratios, Leave Utilization, and Attrition.",
      "Filter by department or time range to generate executive summary insights.",
    ],
    samplePrompts: [
      "Where can I view executive workforce analytics?",
      "Show company headcount growth trends",
      "What is our department distribution?",
    ],
  },

  offboarding: {
    id: "offboarding",
    displayName: "Exit Operations & Offboarding",
    description: "Resignation notices, exit clearance checklist, KT handover, and full & final (FnF) settlements.",
    section: "Manager Services",
    route: "/offboarding",
    actionRoute: "/offboarding",
    icon: "UserMinus",
    allowedRoles: ["Admin", "Manager"],
    modelName: "Offboarding",
    primaryKey: "offboardingId",
    actionLabel: "Manage Exit Clearances",
    entities: ["offboarding", "resignation", "exit", "notice period", "clearance", "settlement", "handover", "fnf", "full and final", "lwd"],
    tasks: [
      "offboarding",
      "resignation",
      "exit clearance",
      "kt handover",
      "last working day",
      "notice period",
      "fnf settlement",
      "full and final",
      "exit interview",
      "manage resignation",
      "process exit",
    ],
    steps: [
      "Navigate to 'Exit Operations' under Manager Services in the sidebar.",
      "Review active resignations, notice periods, and clearance checklists (IT, Finance, HR).",
      "Complete departmental clearance sign-offs and initiate Full & Final calculation.",
    ],
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
      "Where do I manage employee exit clearances and offboarding?",
      "Show employees currently serving notice period",
      "List pending department clearance checklists",
    ],
  },

  webhookBridge: {
    id: "webhook-bridge",
    displayName: "Webhook Bridge & Event Subscriptions",
    description: "Outbound HTTP webhook notifications for Slack, Microsoft Teams, and custom ERP integration endpoints.",
    section: "Manager Services",
    route: "/webhook-bridge",
    actionRoute: "/webhook-bridge",
    icon: "Webhook",
    allowedRoles: ["Admin", "Manager"],
    actionLabel: "Configure Webhooks",
    entities: ["webhook", "integration", "slack", "teams", "api", "events", "endpoint", "notifications", "bridge"],
    tasks: [
      "webhook",
      "slack integration",
      "teams integration",
      "api notifications",
      "event trigger",
      "payload logs",
      "integration bridge",
      "configure webhook",
      "connect slack",
    ],
    steps: [
      "Navigate to 'Webhook Bridge' under Manager Services.",
      "Add your target webhook URL (Slack Incoming Webhook, Teams, or custom API).",
      "Select triggering event types (Leave Applied, Punch Recorded, Ticket Created) and test the payload delivery.",
    ],
    samplePrompts: [
      "Where do I configure Slack webhooks or external integrations?",
      "Show configured webhook endpoints",
    ],
  },

  // ==========================================
  // HR & SYSTEM ADMINISTRATION MODULES
  // ==========================================

  employees: {
    id: "employees",
    displayName: "Employee Directory & Administration",
    description: "Employee directory, profiles, departments, designations, onboarding wizard, and statutory records.",
    section: "HR & Administration",
    route: "/employees",
    actionRoute: "/employees?create=true",
    icon: "Users",
    allowedRoles: ["Admin"],
    modelName: "Employees",
    primaryKey: "employeeId",
    actionLabel: "Add New Employee",
    entities: ["employee", "staff", "person", "team member", "colleague", "manager", "headcount", "directory", "onboard", "worker"],
    tasks: [
      "add employee",
      "create employee",
      "employee directory",
      "staff directory",
      "onboard employee",
      "terminate employee",
      "employee records",
      "statutory documents",
      "pan aadhaar",
      "new hire",
      "register employee",
    ],
    steps: [
      "Navigate to 'Employee Directory' under HR & Administration.",
      "Click '+ Add Employee' to open the enterprise onboarding modal.",
      "Enter personal details, department, designation, salary components, and statutory IDs.",
    ],
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
      "Where do I add a new employee?",
      "Show all employees in Engineering department",
      "Who joined the company this year?",
      "Give me a department-wise employee count",
    ],
  },

  payroll: {
    id: "payroll",
    displayName: "Payroll Processing & Statutory",
    description: "Salary structures, monthly payroll runs, EPF 12%, ESIC 0.75%, Professional Tax, TDS, and CTC calculations.",
    section: "HR & Administration",
    route: "/payroll",
    actionRoute: "/payroll",
    icon: "CreditCard",
    allowedRoles: ["Admin"],
    modelName: "Payroll",
    primaryKey: "payrollId",
    actionLabel: "Run Payroll Batch",
    entities: ["payroll", "salary", "payslip", "ctc", "epf", "pf", "esi", "esic", "deductions", "net pay", "tax", "payroll run", "salary process"],
    tasks: [
      "run payroll",
      "process salary",
      "payroll batch",
      "salary structure",
      "epf filing",
      "esic filing",
      "professional tax",
      "tds calculation",
      "disburse salary",
      "statutory compliance",
      "calculate payroll",
    ],
    steps: [
      "Navigate to 'Payroll Processing' under HR & Administration.",
      "Select the payroll cycle month, inspect attendance days and LOP deductions.",
      "Click 'Calculate & Run Payroll' to lock the batch and generate statutory remittance summaries.",
    ],
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
      "Where do I process monthly payroll?",
      "Show this month's payroll summary and total disbursed amount",
      "What is the total EPF and ESIC contribution for October?",
    ],
  },

  auditLogs: {
    id: "audit-logs",
    displayName: "Audit & Governance Trail",
    description: "Immutable enterprise security log, tracking all user logins, HR actions, data exports, and permission alterations.",
    section: "HR & Administration",
    route: "/audit-logs",
    actionRoute: "/audit-logs",
    icon: "ShieldCheck",
    allowedRoles: ["Admin", "Manager"],
    actionLabel: "Inspect Audit Logs",
    entities: ["audit", "log", "trail", "security", "governance", "history", "who did what", "compliance log", "access log", "event trail"],
    tasks: [
      "audit log",
      "security trail",
      "compliance logs",
      "user actions",
      "who did what",
      "system activity",
      "access logs",
      "admin audit",
      "view audit trail",
    ],
    steps: [
      "Navigate to 'Audit & Governance' under HR & Administration.",
      "Filter logs by event category (AUTH, CREATE, UPDATE, DELETE, HR_ACTION) or actor name.",
      "Click into any log entry to view exact IP, user agent, correlation ID, and record diff.",
    ],
    samplePrompts: [
      "Where can I check the system audit logs?",
      "Show recent administrative actions",
    ],
  },

  compliance: {
    id: "compliance",
    displayName: "Statutory Compliance & Filings",
    description: "Indian statutory compliance (EPF ECR, ESIC Return, PT Form 5, Form 24Q TDS), health audit.",
    section: "HR & Administration",
    route: "/payroll",
    actionRoute: "/payroll",
    icon: "CreditCard",
    allowedRoles: ["Admin"],
    modelName: "Payroll",
    primaryKey: "month",
    actionLabel: "View Compliance Reports",
    entities: ["compliance", "statutory", "epf return", "esic return", "pt filing", "tds", "form 24q", "ecr", "audit"],
    tasks: [
      "statutory compliance",
      "epf return",
      "esic return",
      "pt form 5",
      "form 24q",
      "challan",
      "statutory filings",
    ],
    steps: [
      "Navigate to Payroll Processing under HR & Administration.",
      "Review the Statutory Compliance tab for EPF, ESIC, and PT liabilities.",
    ],
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
    ],
  },

  documents: {
    id: "documents",
    displayName: "Official HR Letters & Document Templates",
    description: "Appointment letters, bonafide certificates, salary revisions, and exit experience letters.",
    section: "HR & Administration",
    route: "/employees",
    actionRoute: "/employees",
    icon: "FileText",
    allowedRoles: ["Admin", "Manager", "Employee"],
    modelName: "HrDocument",
    primaryKey: "documentId",
    actionLabel: "Generate HR Letters",
    entities: ["document", "letter", "appointment letter", "bonafide", "experience letter", "relieving", "template"],
    tasks: [
      "generate letter",
      "appointment letter",
      "experience letter",
      "bonafide certificate",
      "relieving letter",
      "hr template",
      "download letter",
    ],
    steps: [
      "Ask Copilot to generate an HR letter or navigate to Employee Directory.",
      "Select the employee profile and click 'Generate Document'.",
      "Choose the letter template (Appointment, Relieving, Bonafide) and export PDF.",
    ],
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
    ],
  },

  pulse: {
    id: "pulse",
    displayName: "Pulse, Culture & Announcements",
    description: "Company-wide broadcasts, peer-to-peer kudos recognitions, and work anniversary milestones.",
    section: "Self Service (ESS)",
    route: "/dashboard",
    actionRoute: "/dashboard",
    icon: "LayoutDashboard",
    allowedRoles: ["Admin", "Manager", "Employee"],
    modelName: "Broadcast",
    primaryKey: "broadcastId",
    actionLabel: "View Announcements",
    entities: ["pulse", "broadcast", "announcement", "kudos", "recognition", "milestone", "anniversary", "birthday"],
    tasks: [
      "company announcement",
      "kudos",
      "give kudos",
      "workplace pulse",
      "birthdays",
      "anniversaries",
      "view broadcasts",
    ],
    steps: [
      "Open Dashboard from the sidebar.",
      "Scroll to the Pulse & Culture feed on the right panel.",
      "Click 'Give Kudos' to recognize a colleague or read official company broadcasts.",
    ],
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
    ],
  },
};

/**
 * Intelligent task-to-module matcher
 * Matches natural user queries (e.g., "where can I apply for leave", "how do I view my payslip")
 * to the exact system module, route, and step-by-step guidance.
 */
function findModuleByTask(queryText = "", userRole = "Employee") {
  const text = queryText.toLowerCase().replace(/[?!.,]/g, "").trim();
  const normalizedRole = (userRole || "Employee").toLowerCase();

  let bestMatch = null;
  let highestScore = 0;
  let matchedTaskPhrase = "";

  Object.values(CAPABILITY_REGISTRY).forEach((mod) => {
    let score = 0;
    let localMatchedTask = "";

    // 1. Direct ID or Display Name match
    if (text.includes(mod.id.toLowerCase())) {
      score += 80;
    }
    const nameLower = mod.displayName.toLowerCase();
    if (text.includes(nameLower)) {
      score += 70;
    }

    // 2. Exact match in tasks array
    if (mod.tasks && Array.isArray(mod.tasks)) {
      for (const t of mod.tasks) {
        const tLower = t.toLowerCase();
        if (text === tLower || text.includes(tLower)) {
          const taskScore = 50 + tLower.length;
          if (taskScore > score) {
            score = taskScore;
            localMatchedTask = t;
          }
        }
      }
    }

    // 3. Match in entities array
    if (mod.entities && Array.isArray(mod.entities)) {
      for (const ent of mod.entities) {
        const entLower = ent.toLowerCase();
        if (text.includes(entLower)) {
          score += entLower.length * 2;
          if (!localMatchedTask) localMatchedTask = ent;
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = mod;
      matchedTaskPhrase = localMatchedTask;
    }
  });

  if (!bestMatch || highestScore < 6) {
    return null;
  }

  // Check authorization
  const allowed = bestMatch.allowedRoles.map((r) => r.toLowerCase());
  const isAuthorized = allowed.includes(normalizedRole);

  return {
    module: bestMatch,
    matchedTask: matchedTaskPhrase,
    score: highestScore,
    isAuthorized,
    steps: bestMatch.steps || [],
  };
}

/**
 * Return categorized directory of all modules accessible for a given user role
 */
function getModulesDirectory(userRole = "Employee") {
  const normalizedRole = (userRole || "Employee").toLowerCase();
  const accessible = Object.values(CAPABILITY_REGISTRY).filter((c) => {
    // Avoid duplicate compliance/documents if they share routes
    if (c.id === "compliance" || c.id === "documents" || c.id === "pulse") return false;
    return c.allowedRoles.map((r) => r.toLowerCase()).includes(normalizedRole);
  });

  const sections = {
    "Self Service (ESS)": [],
    "Manager Services": [],
    "HR & Administration": [],
  };

  accessible.forEach((mod) => {
    const sec = mod.section || "Self Service (ESS)";
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push({
      id: mod.id,
      title: mod.displayName,
      description: mod.description,
      route: mod.route,
      actionRoute: mod.actionRoute || mod.route,
      icon: mod.icon,
      allowedRoles: mod.allowedRoles,
      keyTasks: (mod.tasks || []).slice(0, 4),
    });
  });

  return sections;
}

module.exports = {
  CAPABILITY_REGISTRY,
  findModuleByTask,
  getModulesDirectory,

  /**
   * Resolve user prompt to the best matching capability for querying
   */
  resolveCapability(queryText = "") {
    const text = queryText.toLowerCase();

    let bestMatch = null;
    let highestScore = 0;

    Object.values(CAPABILITY_REGISTRY).forEach((cap) => {
      let score = 0;
      (cap.entities || []).forEach((entity) => {
        if (text.includes(entity)) {
          score += entity.length;
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
    const normalizedRole = (role || "Employee").toLowerCase();
    return Object.values(CAPABILITY_REGISTRY).filter((c) =>
      c.allowedRoles.map((r) => r.toLowerCase()).includes(normalizedRole)
    );
  },
};
