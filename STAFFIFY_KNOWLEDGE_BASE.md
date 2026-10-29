# Staffify & StaffifyGo Master Knowledge Base & Context Dossier

## 1. Project Overview & Architecture
- **Application**: Staffify (Enterprise HRMS, Workforce Operations & Intelligence Platform)
- **New Project**: StaffifyGo (Mobile-first / lightweight / companion workforce suite)
- **Frontend**: React 18 + Vite + Tailwind CSS + Lucide React + Native View Transitions API.
- **Backend**: Node.js + Express.js + Mongoose (MongoDB Atlas / Local MongoDB).
- **Authentication**: JWT (JSON Web Tokens) with 3-tier Role-Based Access Control (RBAC): `Admin`, `Manager`, `Employee`.
- **UI Design System**: Enterprise Atlassian Jira / Confluence Design Language:
  - Primary Action Blue: `#0052CC` (hover: `#0747A6`, active: `#00388B`, soft tint: `#DEEBFF`)
  - Dark Surface Colors: Canvas `#090D14`, Surfaces `#0F131C` & `#151B26`, Borders `#263042`, Accents `#579DFF`
  - Text & Accents: Text primary `#172B4D` (dark `#F1F5F9`), secondary `#6B778C` (dark `#94A3B8`)
  - Status Lozenges:
    - Success (Present/Approved): `#00875A` / `#E3FCEF`
    - Warning (Late/Pending): `#B9770E` / `#FFF0B3`
    - Danger (Absent/Rejected): `#DE350B` / `#FFEBE6`
    - Neutral: `#42526E` / `#EBECF0`
  - Animations: Native View Transitions API with 950ms relaxed circular wave expansion (`cubic-bezier(0.25, 1, 0.4, 1)`) originating from click coordinates, 700ms 360-deg Sun/Moon morph, tactile active feedback (`scale(0.98)`).
  - Mobile Ergonomics: `viewport-fit=cover`, `-webkit-tap-highlight-color: transparent`, `touch-action: manipulation`, compact icon buttons on `< sm`, circular AI Floating Action Button (FAB).

---

## 2. All 39 Mongoose Database Collections & Schemas
1. **user.model.js**: `userId`, `employeeId`, `name`, `email`, `password` (hashed), `role` (`Admin`, `Manager`, `Employee`), `avatar`, `lastLogin`, `isActive`.
2. **employees.model.js**: `employeeId`, `firstName`, `lastName`, `email`, `phone`, `department`, `designation`, `dateOfJoining`, `role`, `isActive`, `reportingManagerId`, `bankDetails` (`accountNumber`, `bankName`, `ifscCode`, `accountHolderName`), `statutoryDetails` (`pan`, `aadhaar`, `uan`, `esicNumber`), `basicSalary`, `totalSalary`.
3. **attendance.model.js**: `employeeId`, `employeeName`, `date` (`YYYY-MM-DD`), `firstIn`, `lastOut`, `totalHours`, `workHours`, `status` (`Present`, `Late`, `Half Day`, `Absent`, `WFH`), `punches` array (`timestamp`, `type`, `ip`, `latitude`, `longitude`, `verifiedByGeofence`, `distanceMeters`, `deviceType`), `regularization` (`requested`, `reason`, `inTime`, `outTime`, `status`: `Pending` | `Approved` | `Rejected`, `reviewedBy`).
4. **geofence.model.js**: Office GPS perimeters (`name`, `latitude`, `longitude`, `radiusMeters`, `assignedOffice`, `isActive`).
5. **biometricMachine.model.js** & **biometricLog.model.js**: eSSL / ZKTeco / Matrix hardware terminals, push ADMS sync, raw machine logs.
6. **leave.model.js** & **employeeLeaveBalance.model.js**: Leave requests, quota deduction, balances (`Casual`, `Sick`, `Earned`, `Loss of Pay`), sandwich policy inspection, multi-level approvals.
7. **leavePolicy.model.js**: Sandwich rules, probation lockouts, monthly accrual quotas.
8. **payroll.model.js** & **salaryStructure.model.js**: Monthly payroll runs, gross earnings (Basic, HRA, Special Allowances), statutory deductions (EPF 12%, ESIC 0.75%, Professional Tax, TDS), net take-home, bank disbursement batches.
9. **expenseClaim.model.js**: Employee travel/office reimbursements, category, receipts, manager approval, finance settlement.
10. **ticket.model.js** & **asset.model.js**: IT & HR helpdesk tickets, hardware asset inventory assignments (laptops, monitors, serial numbers).
11. **goal.model.js**, **appraisal.model.js**, **oneOnOne.model.js**: OKRs, quarterly KPIs, appraisals, 1-on-1 coaching logs.
12. **jobOpening.model.js** & **candidate.model.js**: Recruitment ATS, job postings, candidate stages (`Applied`, `Screening`, `Interview`, `Offered`, `Hired`).
13. **shift.model.js**, **roster.model.js**, **shiftSwap.model.js**: Squad shift assignments (Morning, General, Night), weekly rosters, peer swap requests.
14. **loan.model.js**: Salary advances, loans, interest, monthly EMI amortizations, balance deductions.
15. **taxDeclaration.model.js**: Regime selection (Old vs New), Section 80C, 80D, HRA rent receipts.
16. **settlement.model.js** & **offboarding.model.js**: Resignations, notice period tracking, asset handovers, gratuity, full-and-final (FnF) settlements.
17. **broadcast.model.js** & **kudos.model.js**: Pulse workplace culture, company announcements, peer recognition badges.
18. **auditLog.model.js**: Immutable security audit trail of all administrative and financial changes.
19. **webhookConfig.model.js** & **webhookAuditLog.model.js**: External webhooks, triggers, payloads.
20. **aiConversation.model.js**, **aiKnowledgeBase.model.js**, **aiQueryLog.model.js**, **aiAnomalyAlert.model.js**: Staffify AI Copilot data, queries, knowledge embeddings, executive morning digest anomaly alerts.

---

## 3. Frontend Architecture & Page Registry (23 Pages)
- `/dashboard` -> Executive summary, pulse metrics, KPI cards, quick action tiles, live morning watchdog digest.
- `/attendance` -> Biometric punch logs, personal vs workforce register, GPS boundary verification, regularization modal.
- `/leaves` -> Quota overview, calendar holiday matrix, application modal, manager approval queue, sandwich rule badge.
- `/payroll` & `/payslips` -> Payroll processing dashboard, tax deductions, PDF payslip generation and download.
- `/employees` & `/profile` -> 360-degree workforce directory, hiring, statutory onboarding, HR document issuance.
- `/teams` & `/org-chart` -> Squad configurations, departments, interactive SVG hierarchy tree.
- `/performance` -> Quarterly OKRs, progress increment buttons, coaching notes.
- `/roster` -> Shift matrices, squad templates, swap approvals.
- `/helpdesk` -> IT ticketing, priority badges, SLA tracking, assigned assets.
- `/recruitment` -> ATS job requisitions and candidate hiring pipeline.
- `/expenses` -> Reimbursement claims, receipt previews, finance settlement flows.
- `/analytics` -> Organization turnover, headcount growth, department distributions, attendance trends.
- `/copilot` -> Fullscreen AI Copilot workspace with chat, audit logs, open knowledge base, and training export.
- `/webhook-bridge` & `/audit-logs` -> Integration webhooks, delivery logs, system audit trail.

---

## 4. Key Rules & Constraints
- Zero Unicode emojis in production code, UI, or commit messages (use Lucide React icons or SVG badges).
- Git Author: `hasanOnGit <hasanOnGit@users.noreply.github.com>`.
- Responsive design: Mobile-first (320px - 768px) and desktop (1024px - 1920px).
- Security: Parameterized Mongoose queries, strict role scoping per user, zero client-side over-fetching.
