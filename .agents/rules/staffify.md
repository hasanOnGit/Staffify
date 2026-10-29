# Staffify & StaffifyGo — Workspace Rules & Context

You are pair programming on **Staffify** and its companion suite **StaffifyGo**. You have full context, repository access, database schema definitions, and design system specifications for this workspace.

---

## 1. Project Overview & Architecture
- **Root Repository**: `/home/mohdhasan/Downloads/Staffify`
- **Frontend**: React + Vite + Tailwind CSS + Lucide React + Native View Transitions API.
- **Backend**: Node.js + Express.js + Mongoose + MongoDB.
- **Master Knowledge Base File**: Refer to `STAFFIFY_KNOWLEDGE_BASE.md` in the project root.

---

## 2. Atlassian Enterprise Design System (Look & Feel)
- **Palette**:
  - Primary Action Blue: `#0052CC` (hover: `#0747A6`, active: `#00388B`, light tint: `#DEEBFF`)
  - Dark Surface Colors: Canvas `#090D14`, Surfaces `#0F131C` & `#151B26`, Borders `#263042`, Accents `#579DFF`
  - Text: Primary `#172B4D` (dark `#F1F5F9`), Secondary `#6B778C` (dark `#94A3B8`)
- **Status Lozenges**:
  - Success (Present/Approved): `#00875A` text, `#E3FCEF` background
  - Warning (Late/Pending): `#B9770E` text, `#FFF0B3` background
  - Danger (Absent/Rejected): `#DE350B` text, `#FFEBE6` background
  - Neutral/Informational: `#0052CC` text, `#DEEBFF` background
- **Theme Transitions**:
  - Native browser View Transitions API with 950ms relaxed circular wave expansion (`cubic-bezier(0.25, 1, 0.4, 1)`) originating from click coordinates.
  - 700ms 360-degree rotation and scale morph on the Sun/Moon toggle.
- **Mobile Touch Ergonomics**:
  - `viewport-fit=cover` in `index.html`.
  - `-webkit-tap-highlight-color: transparent` and `touch-action: manipulation` in `index.css`.
  - Compact icon-only buttons on `< sm` screens, circular floating action button (FAB) for AI copilot.

---

## 3. Database Models & Schema Specifications (39 Mongoose Models)
1. **user.model.js**: `userId`, `employeeId`, `name`, `email`, `password` (hashed), `role` (`Admin`, `Manager`, `Employee`), `avatar`, `lastLogin`, `isActive`.
2. **employees.model.js**: `employeeId`, `firstName`, `lastName`, `email`, `phone`, `department`, `designation`, `dateOfJoining`, `role`, `isActive`, `reportingManagerId`, `bankDetails`, `statutoryDetails` (PAN, Aadhaar, UAN, ESIC), `basicSalary`, `totalSalary`.
3. **attendance.model.js**: `employeeId`, `employeeName`, `date`, `firstIn`, `lastOut`, `totalHours`, `workHours`, `status` (`Present`, `Late`, `Half Day`, `Absent`, `WFH`), `punches` array (`timestamp`, `type`, `ip`, `latitude`, `longitude`, `verifiedByGeofence`, `distanceMeters`, `deviceType`), `regularization`.
4. **geofence.model.js**: GPS perimeters (`name`, `latitude`, `longitude`, `radiusMeters`, `assignedOffice`, `isActive`).
5. **biometricMachine.model.js** & **biometricLog.model.js**: eSSL / ZKTeco biometric IP terminals and push ADMS logs.
6. **leave.model.js** & **employeeLeaveBalance.model.js**: Leave quotas, sandwich rules, applications, manager approvals.
7. **payroll.model.js** & **salaryStructure.model.js**: Salary calculations, gross earnings, statutory deductions (EPF 12%, ESIC 0.75%, PT, TDS), net pay, payslip generation.
8. **expenseClaim.model.js**: Employee travel/office claims, merchant receipts, approvals, payouts.
9. **ticket.model.js** & **asset.model.js**: IT & HR helpdesk tickets, hardware inventory allocation.
10. **goal.model.js**, **appraisal.model.js**, **oneOnOne.model.js**: Performance OKRs, KPIs, 1-on-1 coaching logs.
11. **jobOpening.model.js** & **candidate.model.js**: Recruitment ATS, candidate hiring pipeline.
12. **shift.model.js**, **roster.model.js**, **shiftSwap.model.js**: Squad shift rosters, swap requests.
13. **loan.model.js**: Salary advances, monthly EMI amortization, loan repayments.
14. **settlement.model.js** & **offboarding.model.js**: Resignations, exit clearances, full-and-final settlements.
15. **broadcast.model.js** & **kudos.model.js**: Pulse workplace culture, announcements, peer recognition.
16. **auditLog.model.js**, **webhookConfig.model.js**, **aiAnomalyAlert.model.js**, **aiConversation.model.js**, **aiKnowledgeBase.model.js**.

---

## 4. Coding & Execution Standards
- **Zero Unicode Emojis**: Never use Unicode emojis in code, UI, or commit messages. Always use Lucide React icons or styled SVG/text lozenges.
- **Git Author**: Always use `hasanOnGit <hasanOnGit@users.noreply.github.com>` for commits.
- **Terminal Execution**: Set `BypassSandbox: true` for commands requiring system or network access.
- **RBAC Enforcement**: Parameterized Mongoose queries scoped strictly to user roles; prevent data leaks and over-fetching.

---

## 5. StaffifyGo Scope
When working on **StaffifyGo**, adhere to these principles:
- Maintain complete design, token, and API parity with Staffify.
- Leverage the existing MongoDB backend collections, models, and authentication services.
- Follow mobile-first, lightweight, companion workflows as requested by the user.
