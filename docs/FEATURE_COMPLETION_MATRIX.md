# StaffifyGo — Feature Completion Matrix (21 Categories)

This matrix maps StaffifyGo's target architecture across all 21 ERP categories, auditing current status, persistence level, and next steps.

| Category # | Feature Category | Current Status | Database Persistence | Notes & Next Actions |
|---|---|---|---|---|
| **01** | **Dashboard & Business Intelligence** | **Operational** | Real MongoDB Aggregations | Executive metrics, PO Watchdog, live feeds. Supports workspace switching. |
| **02** | **Vendor Organization & Agency Management** | **Operational** | `Vendor` collection | Supports vendor CRUD, GSTIN, bank details, and Private Agency Workspace isolation. |
| **03** | **Clients, Branches & Work Sites** | **Operational** | `Client` collection | Multi-site hierarchy, contact persons, payment terms, client-agency relationship. |
| **04** | **Commercial Contracts, Rate Cards & POs** | **Operational** | `Contract` & `PurchaseOrder` | Rate card base + markup %, PO burn tracking, expiry, and PO write-down on payment. |
| **05** | **Recruitment & Manpower Requisitions** | **Roadmap** | Planned | Candidate sourcing, client requisitions, 1-click candidate-to-worker conversion. |
| **06** | **Workforce Master & Employee Lifecycle** | **Operational** | `Worker` collection | Central talent bench, skills, wages, status, agency ownership, deployment history. |
| **07** | **Workforce Onboarding & Verification** | **Operational** | `kycDetails` on Worker | Aadhaar, PAN, Police Verification, Medical clearance tracking & dossier drawer. |
| **08** | **Workforce Deployment Management** | **Operational** | `Deployment` collection | Maps Worker -> Vendor -> Client -> Site -> PO. Planned vs deployed headcount. |
| **09** | **Attendance, Shifts, Leave & Timesheets** | **Operational** | `MusterRoll` collection | Site muster roll, standard 26d shifts, 1.5x OT calculation, supervisor locking. |
| **10** | **Payroll & Salary Processing** | **Operational** | `Payroll` collection | Runs payroll from approved muster rolls, computes EPF (12%), ESIC (0.75%), PT, Net Pay & printable payslips. |
| **11** | **Multiple Billing Scenarios & Invoices** | **Operational** | `VendorInvoice` collection | Rate-card driven, 18% GST, line item audit trails, partial collections. |
| **12** | **Reimbursements & Mid-Month Payouts** | **Roadmap** | Planned | Expense claims, pass-through billing, salary advances. |
| **13** | **Vendor Invoicing, Payouts & Collections** | **Operational** | `VendorInvoice` collection | Partial payment recording, TDS tracking, balance reconciliation, agency receivables separation. |
| **14** | **Statutory Compliance & Document Expiry** | **Roadmap** | Planned | PF ECR preparation, ESIC return tracking, compliance calendar. |
| **15** | **Worker Self-Service App** | **Roadmap** | Planned | Mobile-first contractor portal for payslips and attendance. |
| **16** | **Client / Customer Portal** | **Roadmap** | Planned | Client supervisor attendance approval, site roster view, invoice payment status. |
| **17** | **Multilingual Letters & Document Generation**| **Roadmap** | Planned | Appointment letters, deployment letters in English/Hindi. |
| **18** | **Reports, MIS & Profitability** | **Roadmap** | Planned | Client-wise gross margins, unbilled revenue, contractor utilization. |
| **19** | **AI Application Assistant** | **Roadmap** | Planned | Permission-aware natural language ERP copilot with tool execution. |
| **20** | **Notifications, Approvals & Workflows** | **Roadmap** | Planned | Maker-checker approval queues, PO expiry email/in-app notifications. |
| **21** | **Platform Administration & Security** | **Operational** | Tenant Scoping & RBAC | Agency workspace switching, platform-admin boundary enforcement. |
