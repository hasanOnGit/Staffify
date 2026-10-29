# StaffifyGo — Implementation Status & Architecture Blueprint

## 1. Foundation Audit: Real vs Mocked & Missing Relationships

### Current Connected Status (100% Real Database Persistence)
- **Vendors & Agencies**: 100% connected to MongoDB Atlas (`Vendor` collection). CRUD operations, categories, bank details persisted.
- **Clients & Sites**: 100% connected (`Client` collection). Hierarchical physical sites with contact persons persisted.
- **Commercials & POs**: 100% connected (`Contract` & `PurchaseOrder` collections). Rate card calculations, PO utilization burn rates persisted.
- **Deployments**: 100% connected (`Deployment` collection). Active worker allocations under POs persisted.
- **Talent Bench & KYC**: 100% connected (`Worker` collection). Aadhaar, PAN, police verification badges, direct bank details persisted.
- **Site Muster Roll**: 100% connected (`MusterRoll` collection). Monthly site shifts, standard daily rate proration, 1.5x OT hourly multiplier, supervisor approval lock persisted.
- **Payroll & Salary Engine**: 100% connected (`Payroll` collection). Wages, statutory EPF (12%), ESIC (0.75%), PT (₹200), net salary, and printable payslips persisted.
- **Client Invoices & Collections**: 100% connected (`VendorInvoice` collection). 18% GST calculation, line items, partial collections, TDS tracking, balance reconciliation, and PO write-down persisted.
- **Executive Dashboard**: 100% connected via real MongoDB `$count` and `$facet` aggregations.

### Architectural Milestones Delivered
1. **Tenant / Agency Workspace Isolation**:
   - `WorkspaceContext.jsx` with persistent localStorage and Axios `x-vendor-id` header injection.
   - Atlassian Workspace Switcher dropdown in `Navbar.jsx` enabling instant toggle between "Platform Admin (Global)" and Private Agency Workspaces (e.g. *Infiniti TechStaffing*, *Apex Security*).
2. **Agency Receivables vs Platform Payables & Collections**:
   - Separated Client Invoicing (Agency Receivables) from Settlements.
   - Added partial payment modal (`RecordPaymentModal.jsx`) recording client receipts with TDS deductions, balance reconciliation, and PO write-down.
3. **Payroll & Salary Engine**:
   - Built calculation engine consuming approved site muster rolls.
   - Computes base wages, 1.5x overtime allowances, statutory EPF (12%), ESIC (0.75%), and Professional Tax (₹200).
   - Generates printable corporate salary payslips with employer contribution transparency (`PayslipModal.jsx`).

---

## 2. End-to-End Acceptance Test Verification

Verified via `backend/scripts/testAcceptanceWorkflow.js` with **100% real database records**:
1. **Onboard Worker**: Successfully created `WRK-ACC-xxxx` with KYC status `Verified` on Agency Bench.
2. **Deploy to Site**: Deployed worker under active Purchase Order `PO-5001` at client work site `E-City Campus Alpha`.
3. **Site Muster Roll**: Recorded 26 standard days + 10h overtime (1.5x multiplier = Rs 1,350/hr), approved by supervisor.
4. **Run Payroll**: Processed wages (Gross: Rs 1,67,250 - EPF 12%: Rs 18,720 - PT: Rs 200 = Net Take-Home: Rs 1,48,330).
5. **Generate Client Invoice**: Computed subtotal Rs 2,00,700 + 18% GST (Rs 36,126) = Grand Total Rs 2,36,826.
6. **Record Partial Payment**: Received Rs 1,50,000 + Rs 3,000 TDS credit; verified status shifted to `Partially Paid` with remaining balance Rs 83,826 and written down PO utilization.
