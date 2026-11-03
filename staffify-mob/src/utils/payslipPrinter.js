import toast from "react-hot-toast";

export const formatCurrency = (val = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export const numberToWords = (num = 0) => {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (n) => {
    if (n === 0) return "";
    if (n < 20) return a[n] + " ";
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "") + " ";
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand " + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh " + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + " Crore " + inWords(n % 10000000);
  };

  const rounded = Math.round(num);
  if (!rounded) return "Zero Rupees Only";
  return ("Rupees " + inWords(rounded).trim() + " Only").replace(/\s+/g, " ");
};

export const generatePayslipHtml = (payslip) => {
  const p = payslip || {};
  const earnings = p.earnings || {};
  const deductions = p.deductions || {};
  const attendance = p.attendanceSummary || {};
  const bank = p.bankDetails || {};
  const statutory = p.statutoryDetails || {};
  const netWords = p.netPayInWords || numberToWords(p.netPay || 0);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <title>Staffify Payslip - ${p.employeeName || "Employee"} - ${p.periodString || "Salary Slip"}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 11.5px;
      line-height: 1.45;
      color: #172B4D;
      background: #F4F5F7;
      padding: 16px;
    }
    .payslip-card {
      max-width: 780px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid #DFE1E6;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(9, 30, 66, 0.08);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0052CC;
      padding-bottom: 14px;
      margin-bottom: 16px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-logo {
      width: 32px;
      height: 32px;
      background: #0052CC;
      color: #FFFFFF;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .company-name {
      font-size: 15px;
      font-weight: 800;
      color: #172B4D;
    }
    .company-sub {
      font-size: 10px;
      color: #6B778C;
      margin-top: 1px;
    }
    .title-block {
      text-align: right;
    }
    .title-pill {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0052CC;
      background: #DEEBFF;
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
    }
    .period-title {
      font-size: 14px;
      font-weight: 800;
      color: #172B4D;
      margin-top: 3px;
    }
    .ref-code {
      font-size: 9px;
      font-family: monospace;
      color: #6B778C;
      margin-top: 2px;
    }
    .grid-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #DFE1E6;
      border-radius: 4px;
      margin-bottom: 14px;
    }
    .grid-table td {
      padding: 6px 10px;
      border: 1px solid #DFE1E6;
      vertical-align: top;
      width: 25%;
    }
    .grid-table .label {
      font-size: 9px;
      text-transform: uppercase;
      font-weight: 700;
      color: #6B778C;
      display: block;
      margin-bottom: 2px;
    }
    .grid-table .val {
      font-size: 11px;
      font-weight: 600;
      color: #172B4D;
    }
    .grid-table .mono {
      font-family: monospace;
    }
    .bg-alt {
      background: #FAFBFC;
    }
    .strip {
      background: #F4F7FB;
      border: 1px solid #D2E3FC;
      border-radius: 6px;
      padding: 8px 12px;
      display: flex;
      justify-content: space-around;
      text-align: center;
      margin-bottom: 14px;
    }
    .strip-item .label {
      font-size: 9px;
      text-transform: uppercase;
      font-weight: 700;
      color: #0747A6;
      display: block;
    }
    .strip-item .val {
      font-size: 13px;
      font-weight: 800;
      color: #172B4D;
      margin-top: 2px;
    }
    .breakdown-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #DFE1E6;
      border-radius: 6px;
      margin-bottom: 14px;
    }
    .breakdown-table th {
      background: #F4F5F7;
      border: 1px solid #DFE1E6;
      padding: 7px 10px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      color: #172B4D;
      width: 50%;
    }
    .breakdown-table td {
      border: 1px solid #DFE1E6;
      padding: 8px 10px;
      vertical-align: top;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      padding: 3.5px 0;
      font-size: 11px;
    }
    .item-row.total {
      font-weight: 800;
      border-top: 1.5px solid #DFE1E6;
      margin-top: 6px;
      padding-top: 6px;
      font-size: 11.5px;
    }
    .net-box {
      background: #E3FCEF;
      border: 1px solid #ABF5D1;
      border-radius: 6px;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    .net-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #006644;
      letter-spacing: 0.5px;
    }
    .net-amount {
      font-size: 20px;
      font-weight: 800;
      color: #006644;
      margin-top: 2px;
    }
    .net-words {
      font-size: 10px;
      color: #006644;
      font-style: italic;
      text-align: right;
      max-width: 320px;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid #DFE1E6;
      padding-top: 12px;
      margin-top: 10px;
      font-size: 9.5px;
      color: #6B778C;
    }
    .auth-badge {
      display: inline-block;
      background: #DEEBFF;
      color: #0052CC;
      font-weight: 700;
      font-size: 9px;
      padding: 2px 6px;
      border-radius: 3px;
      margin-bottom: 3px;
    }
    .sign-box {
      text-align: right;
    }
    .sign-line {
      width: 140px;
      border-bottom: 1px dashed #7A869A;
      margin-bottom: 4px;
      margin-left: auto;
    }
    @media print {
      .no-print {
        display: none !important;
      }
      body {
        background: #FFFFFF !important;
        padding: 0 !important;
      }
      .payslip-card {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
    }
  </style>
</head>
<body>
  <!-- Mobile & Desktop Print / Save Bar -->
  <div class="no-print" style="position: sticky; top: 0; background: #0052CC; color: #FFFFFF; padding: 10px 16px; margin: -16px -16px 16px -16px; display: flex; justify-content: space-between; align-items: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; z-index: 9999; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
    <div style="display: flex; align-items: center; gap: 8px;">
      <strong style="font-weight: 700;">Staffify Official Payslip</strong>
      <span style="opacity: 0.85;">&bull; ${p.periodString || "Salary Statement"} &bull; ${p.employeeName || "Employee"}</span>
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()" style="background: #FFFFFF; color: #0052CC; border: none; padding: 6px 14px; border-radius: 4px; font-weight: 700; font-size: 11px; cursor: pointer;">
        Save as PDF / Print
      </button>
    </div>
  </div>

  <div class="payslip-card">
    <!-- Header -->
    <div class="header">
      <div class="brand">
        <div class="brand-logo">S</div>
        <div>
          <div class="company-name">Staffify Global Inc.</div>
          <div class="company-sub">Global Workforce Platform &bull; Bangalore HQ Campus</div>
        </div>
      </div>
      <div class="title-block">
        <div class="title-pill">Official Salary Slip</div>
        <div class="period-title">${p.periodString || "Salary Slip"}</div>
        <div class="ref-code">Ref: ${p.payslipId || "PS-2026-001"}</div>
      </div>
    </div>

    <!-- Employee & Employment Details -->
    <table class="grid-table">
      <tr>
        <td class="bg-alt"><span class="label">Employee Name</span><span class="val">${p.employeeName || "Employee"}</span></td>
        <td><span class="label">Employee ID</span><span class="val mono">${p.employeeId || "EMP-001"}</span></td>
        <td class="bg-alt"><span class="label">Designation</span><span class="val">${p.designation || "Engineer"}</span></td>
        <td><span class="label">Department</span><span class="val">${p.department || "Technology"}</span></td>
      </tr>
      <tr>
        <td class="bg-alt"><span class="label">Bank Name</span><span class="val">${bank.bankName || "HDFC Bank"}</span></td>
        <td><span class="label">Account No</span><span class="val mono">${bank.accountNumber ? `••••${String(bank.accountNumber).slice(-4)}` : "••••9948"}</span></td>
        <td class="bg-alt"><span class="label">PAN Number</span><span class="val mono">${statutory.panNumber || "ABCDE1234F"}</span></td>
        <td><span class="label">EPFO UAN</span><span class="val mono">${statutory.uanNumber || "101489201948"}</span></td>
      </tr>
    </table>

    <!-- Attendance / Working Days Strip -->
    <div class="strip">
      <div class="strip-item"><span class="label">Total Days</span><span class="val">${attendance.totalDays || 31}</span></div>
      <div class="strip-item"><span class="label">Worked Days</span><span class="val">${attendance.workedDays || 31}</span></div>
      <div class="strip-item"><span class="label">Paid Leaves</span><span class="val">${attendance.paidLeaveDays || 0}</span></div>
      <div class="strip-item"><span class="label">LOP Days</span><span class="val" style="color: ${attendance.lopDays > 0 ? '#DE350B' : '#172B4D'};">${attendance.lopDays || 0}</span></div>
      <div class="strip-item"><span class="label">Payable Days</span><span class="val" style="color: #00875A;">${attendance.payableDays || 31}</span></div>
    </div>

    <!-- Earnings vs Deductions Breakdown -->
    <table class="breakdown-table">
      <thead>
        <tr>
          <th>Earnings (Gross Remuneration)</th>
          <th>Statutory & Voluntary Deductions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="item-row"><span>Basic Salary</span><span>${formatCurrency(earnings.basic || 42500)}</span></div>
            <div class="item-row"><span>House Rent Allowance (HRA)</span><span>${formatCurrency(earnings.hra || 21250)}</span></div>
            <div class="item-row"><span>Special Allowance</span><span>${formatCurrency(earnings.specialAllowance || 21250)}</span></div>
            ${earnings.conveyance ? `<div class="item-row"><span>Conveyance Allowance</span><span>${formatCurrency(earnings.conveyance)}</span></div>` : ""}
            ${earnings.medicalAllowance ? `<div class="item-row"><span>Medical Allowance</span><span>${formatCurrency(earnings.medicalAllowance)}</span></div>` : ""}
            <div class="item-row total">
              <span style="color: #00875A;">Gross Earnings</span>
              <span style="color: #00875A;">${formatCurrency(earnings.grossEarnings || 85000)}</span>
            </div>
          </td>
          <td>
            <div class="item-row"><span>Employees' Provident Fund (EPF 12%)</span><span>${formatCurrency(deductions.epf || 5100)}</span></div>
            <div class="item-row"><span>Professional Tax (PT)</span><span>${formatCurrency(deductions.professionalTax || 200)}</span></div>
            <div class="item-row"><span>Income Tax (TDS)</span><span>${formatCurrency(deductions.tds || 4200)}</span></div>
            ${deductions.esi ? `<div class="item-row"><span>ESIC (0.75%)</span><span>${formatCurrency(deductions.esi)}</span></div>` : ""}
            ${deductions.lopDeduction ? `<div class="item-row"><span>Loss of Pay (LOP)</span><span>${formatCurrency(deductions.lopDeduction)}</span></div>` : ""}
            ${deductions.loanAdvance ? `<div class="item-row"><span>Salary Advance / EMI</span><span>${formatCurrency(deductions.loanAdvance)}</span></div>` : ""}
            <div class="item-row total">
              <span style="color: #DE350B;">Total Deductions</span>
              <span style="color: #DE350B;">${formatCurrency(deductions.totalDeductions || 9500)}</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Net Salary Box -->
    <div class="net-box">
      <div>
        <div class="net-label">Net Disbursed Take-Home Pay</div>
        <div class="net-amount">${formatCurrency(p.netPay || 75500)}</div>
      </div>
      <div class="net-words">
        <strong>In Words:</strong> ${netWords}
      </div>
    </div>

    <!-- Footer Authentication -->
    <div class="footer">
      <div>
        <div class="auth-badge">Digitally Authenticated by Staffify Payroll Engine</div>
        <div>This is a computer-generated statutory salary slip and requires no physical signature.</div>
      </div>
      <div class="sign-box">
        <div class="sign-line"></div>
        <div style="font-weight: 700; color: #172B4D;">Authorised Signatory</div>
        <div style="font-size: 9px;">Staffify Enterprise HR & Payroll</div>
      </div>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Downloads the payslip file directly to the user's device Downloads folder.
 */
export const downloadPayslipFile = (payslip) => {
  if (!payslip) {
    toast.error("No payslip data available for download");
    return false;
  }
  const safeEmpId = payslip.employeeId || "EMP";
  const safePeriod = (payslip.periodString || "Salary_Statement").replace(/\s+/g, "_");
  const fileName = `Staffify_Payslip_${safeEmpId}_${safePeriod}.html`;

  try {
    const htmlContent = generatePayslipHtml(payslip);
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast.success(`Payslip file downloaded: ${fileName}`);
    return true;
  } catch (err) {
    console.error("Failed to download mobile payslip file:", err);
    toast.error("Download failed. Opening statement preview.");
    return printPayslip(payslip);
  }
};

/**
 * Opens the payslip in a printable window or triggers print preview
 */
export const printPayslip = (payslip) => {
  if (!payslip) {
    toast.error("No payslip data available for printing");
    return false;
  }
  try {
    const htmlContent = generatePayslipHtml(payslip);
    const printWin = window.open("", "_blank");
    if (printWin) {
      printWin.document.write(htmlContent);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        try {
          printWin.print();
        } catch {
          // Window open succeeded
        }
      }, 300);
      toast.success("Payslip statement opened!");
      return true;
    } else {
      // If popup blocked, fallback to direct download
      return downloadPayslipFile(payslip);
    }
  } catch (err) {
    console.error("Print execution failed:", err);
    return downloadPayslipFile(payslip);
  }
};
