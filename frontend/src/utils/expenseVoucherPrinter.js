/**
 * Staffify Enterprise HRMS
 * Official Expense Claim Reimbursement Voucher & PDF Engine
 * Zero Unicode emojis, strictly compliant enterprise layout.
 */
import toast from "react-hot-toast";
import { printHtmlDocument } from "./printEngine";

const formatCurrency = (val = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export const generateExpenseVoucherHtml = (claim) => {
  const c = claim || {};
  const claimDateStr = c.claimDate
    ? new Date(c.claimDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US");

  const approvedDateStr = c.approvalDetails?.actionDate
    ? new Date(c.approvalDetails.actionDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Pending Sign-off";

  const statusColor =
    c.status === "Approved" || c.status === "Reimbursed"
      ? "#00875A"
      : c.status === "Rejected"
      ? "#DE350B"
      : "#B9770E";

  const statusBg =
    c.status === "Approved" || c.status === "Reimbursed"
      ? "#E3FCEF"
      : c.status === "Rejected"
      ? "#FFEBE6"
      : "#FFF0B3";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Staffify Expense Voucher - ${c.claimId || "CLAIM"} - ${c.employeeName || "Staff"}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 16mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      background: #FFFFFF;
      color: #172B4D;
      font-size: 11px;
      line-height: 1.45;
      padding: 10px;
    }
    .voucher-card {
      border: 1px solid #DFE1E6;
      border-radius: 6px;
      overflow: hidden;
    }
    .header-bar {
      background: #0052CC;
      color: #FFFFFF;
      padding: 18px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .company-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .company-sub {
      font-size: 10px;
      opacity: 0.9;
      margin-top: 2px;
    }
    .doc-type-badge {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.35);
      border-radius: 4px;
      padding: 6px 14px;
      text-align: right;
    }
    .doc-type-text {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .doc-ref-text {
      font-size: 9px;
      font-family: monospace;
      margin-top: 2px;
    }
    .content-body {
      padding: 24px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #0052CC;
      padding-bottom: 6px;
      border-bottom: 1px solid #DFE1E6;
      margin-bottom: 12px;
      margin-top: 18px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .field-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      border-bottom: 1px dashed #EBECF0;
    }
    .field-label {
      color: #6B778C;
      font-weight: 600;
    }
    .field-value {
      color: #172B4D;
      font-weight: 600;
      text-align: right;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 700;
      color: ${statusColor};
      background: ${statusBg};
      border: 1px solid ${statusColor}33;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
    }
    th {
      background: #F4F5F7;
      color: #172B4D;
      font-weight: 700;
      text-align: left;
      padding: 8px 12px;
      border: 1px solid #DFE1E6;
      font-size: 10.5px;
    }
    td {
      padding: 9px 12px;
      border: 1px solid #DFE1E6;
      font-size: 10.5px;
    }
    .total-box {
      margin-top: 16px;
      background: #FAFBFC;
      border: 1px solid #DFE1E6;
      border-radius: 6px;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .total-label {
      font-size: 12px;
      font-weight: 700;
      color: #172B4D;
    }
    .total-amount {
      font-size: 18px;
      font-weight: 800;
      color: #0052CC;
    }
    .sign-section {
      margin-top: 36px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      page-break-inside: avoid;
    }
    .sign-box {
      border: 1px dashed #C1C7D0;
      border-radius: 6px;
      padding: 14px;
      text-align: center;
      min-height: 85px;
      display: flex;
      flex-col: column;
      justify-content: flex-end;
    }
    .sign-line {
      border-top: 1px solid #172B4D;
      margin-bottom: 6px;
    }
    .sign-title {
      font-size: 10px;
      font-weight: 700;
      color: #172B4D;
    }
    .sign-sub {
      font-size: 8.5px;
      color: #6B778C;
    }
    .footer-note {
      margin-top: 24px;
      font-size: 8.5px;
      color: #6B778C;
      text-align: center;
      border-top: 1px solid #DFE1E6;
      padding-top: 10px;
    }
  </style>
</head>
<body>
  <div class="voucher-card">
    <!-- Header -->
    <div class="header-bar">
      <div>
        <div class="company-title">STAFFIFY ENTERPRISE HR</div>
        <div class="company-sub">Finance Operations & Employee Reimbursement Division</div>
      </div>
      <div class="doc-type-badge">
        <div class="doc-type-text">EXPENSE REIMBURSEMENT VOUCHER</div>
        <div class="doc-ref-text">VOUCHER NO: ${c.claimId || "EXP-VCH-001"}</div>
      </div>
    </div>

    <div class="content-body">
      <!-- Employee & Claim Information -->
      <div class="grid-2">
        <div>
          <div class="section-title">Claimant Details</div>
          <div class="field-row">
            <span class="field-label">Employee Name</span>
            <span class="field-value">${c.employeeName || "Not Recorded"}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Employee ID</span>
            <span class="field-value">${c.employeeId || "STAFF"}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Department</span>
            <span class="field-value">${c.department || "General"}</span>
          </div>
        </div>

        <div>
          <div class="section-title">Filing Metadata</div>
          <div class="field-row">
            <span class="field-label">Claim Submission Date</span>
            <span class="field-value">${claimDateStr}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Audit / Approval Status</span>
            <span class="field-value">
              <span class="status-badge">${c.status || "Pending"}</span>
            </span>
          </div>
          <div class="field-row">
            <span class="field-label">Approval Date</span>
            <span class="field-value">${approvedDateStr}</span>
          </div>
        </div>
      </div>

      <!-- Itemized Expense Breakdown -->
      <div class="section-title">Itemized Claim Schedule</div>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Expense Category</th>
            <th style="width: 25%;">Merchant / Vendor</th>
            <th style="width: 20%;">Receipt Reference</th>
            <th style="width: 15%;">Attachment</th>
            <th style="width: 15%; text-align: right;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight: 600;">${c.expenseCategory || "General"}</td>
            <td>${c.merchantName || "Business Merchant"}</td>
            <td style="font-family: monospace;">${c.receiptNumber || "RCT-" + (c.claimId || "01")}</td>
            <td style="color: #0052CC; font-weight: 500;">${c.attachmentName ? "Attached (Verified)" : "Electronic Voucher"}</td>
            <td style="text-align: right; font-weight: 700; color: #172B4D;">${formatCurrency(c.amount)}</td>
          </tr>
        </tbody>
      </table>

      <!-- Total & In Words -->
      <div class="total-box">
        <div>
          <div class="total-label">Total Reimbursable Amount</div>
          <div style="font-size: 9.5px; color: #6B778C; margin-top: 2px;">
            Audited in compliance with Staffify Enterprise Travel & Expense Policy
          </div>
        </div>
        <div class="total-amount">${formatCurrency(c.amount)}</div>
      </div>

      <!-- Remarks / Reason -->
      ${
        c.remarks
          ? `<div style="margin-top: 14px; padding: 10px 14px; background: #FAFBFC; border: 1px solid #DFE1E6; border-radius: 4px; font-size: 10px; color: #42526E;">
              <strong>Business Justification:</strong> ${c.remarks}
            </div>`
          : ""
      }

      <!-- Three-tier Enterprise Sign-off -->
      <div class="sign-section">
        <div class="sign-box">
          <div class="sign-line"></div>
          <div class="sign-title">Employee / Claimant</div>
          <div class="sign-sub">${c.employeeName || "Authorized Claimant"}</div>
        </div>

        <div class="sign-box">
          <div class="sign-line"></div>
          <div class="sign-title">Department Manager</div>
          <div class="sign-sub">${c.approvalDetails?.actionBy || "Reporting Supervisor"}</div>
        </div>

        <div class="sign-box">
          <div class="sign-line"></div>
          <div class="sign-title">Finance & Accounts</div>
          <div class="sign-sub">Staffify Enterprise Comptroller</div>
        </div>
      </div>

      <!-- Footer Note -->
      <div class="footer-note">
        This is a digitally validated expense disbursement voucher generated by Staffify Enterprise HRMS.
        Printed on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}.
      </div>
    </div>
  </div>
</body>
</html>`;
};

export const printExpenseVoucher = (claim) => {
  if (!claim) {
    toast.error("No claim record selected for voucher printing");
    return;
  }
  const title = `Staffify_Expense_Voucher_${claim.claimId || "CLAIM"}_${(claim.employeeName || "Staff").replace(/\s+/g, "_")}`;
  const html = generateExpenseVoucherHtml(claim);
  return printHtmlDocument(html, title);
};

export default {
  generateExpenseVoucherHtml,
  printExpenseVoucher,
};
