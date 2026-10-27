/**
 * Staffify Enterprise Payslip Generator & PDF Printer
 * Renders high-fidelity, printable, and downloadable salary statements.
 */
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
    if (n < 100000) return inWords(Math.floor(n / 1000)) + "Thousand " + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + "Lakh " + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + "Crore " + inWords(n % 10000000);
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
  <title>Staffify Payslip - ${p.employeeName || "Employee"} - ${p.periodString || "Salary Slip"}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm;
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
      background: #FFFFFF;
      padding: 16px;
    }
    .payslip-container {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #DFE1E6;
      border-radius: 6px;
      padding: 24px;
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
    .logo-badge {
      width: 32px;
      height: 32px;
      background: #0052CC;
      color: #FFFFFF;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 800;
    }
    .company-name {
      font-size: 15px;
      font-weight: 800;
      color: #172B4D;
      letter-spacing: -0.2px;
    }
    .company-address {
      font-size: 10px;
      color: #6B778C;
      margin-top: 2px;
    }
    .title-block {
      text-align: right;
    }
    .title-pill {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0052CC;
    }
    .period-title {
      font-size: 14px;
      font-weight: 800;
      color: #172B4D;
      margin-top: 2px;
    }
    .ref-code {
      font-size: 9.5px;
      font-family: monospace;
      color: #6B778C;
      margin-top: 1px;
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
      border-radius: 4px;
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
    .two-col-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #DFE1E6;
      border-radius: 4px;
      margin-bottom: 14px;
    }
    .two-col-table th {
      background: #F4F5F7;
      border: 1px solid #DFE1E6;
      padding: 6px 10px;
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
      color: #172B4D;
    }
    .two-col-table td {
      border: 1px solid #DFE1E6;
      padding: 5px 10px;
      vertical-align: top;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
    }
    .item-row.total {
      font-weight: 800;
      border-top: 1.5px solid #DFE1E6;
      margin-top: 4px;
      padding-top: 6px;
    }
    .net-box {
      background: #E3FCEF;
      border: 1px solid #ABF5D1;
      border-radius: 4px;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .net-label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      color: #006644;
    }
    .net-words {
      font-size: 10.5px;
      font-style: italic;
      color: #006644;
      font-weight: 600;
      margin-top: 2px;
    }
    .net-amount {
      font-size: 20px;
      font-weight: 900;
      color: #006644;
      letter-spacing: -0.5px;
    }
    .footer {
      border-top: 1px solid #DFE1E6;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 9.5px;
      color: #6B778C;
    }
    .auth-badge {
      color: #00875A;
      font-weight: 700;
      margin-bottom: 3px;
    }
    .sign-box {
      text-align: right;
    }
    .sign-line {
      width: 140px;
      border-bottom: 1px solid #172B4D;
      margin-bottom: 4px;
      margin-left: auto;
    }
    @media print {
      body {
        padding: 0;
      }
      .payslip-container {
        border: none;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="payslip-container">
    <!-- Header -->
    <div class="header">
      <div class="brand">
        <div class="logo-badge">S</div>
        <div>
          <div class="company-name">STAFFIFY ENTERPRISE TECHNOLOGIES PVT. LTD.</div>
          <div class="company-address">DLF Cyber City, Tower B, Level 8, Gurugram, Haryana - 122002, India</div>
          <div class="company-address">CIN: U72200HR2024PTC098765 · Email: payroll@staffify.com</div>
        </div>
      </div>
      <div class="title-block">
        <div class="title-pill">Monthly Salary Statement</div>
        <div class="period-title">${p.periodString || "Salary Slip"}</div>
        <div class="ref-code">Ref: ${p.payslipId || "GEN-REF"}</div>
      </div>
    </div>

    <!-- Metadata Grid -->
    <table class="grid-table">
      <tr class="bg-alt">
        <td style="width: 25%;"><span class="label">Employee ID</span><span class="val mono">${p.employeeId || "—"}</span></td>
        <td style="width: 25%;"><span class="label">Employee Name</span><span class="val">${p.employeeName || "—"}</span></td>
        <td style="width: 25%;"><span class="label">Designation</span><span class="val">${p.designation || "—"}</span></td>
        <td style="width: 25%;"><span class="label">Department</span><span class="val">${p.department || "—"}</span></td>
      </tr>
      <tr>
        <td><span class="label">Bank Name</span><span class="val">${bank.bankName || "HDFC Bank"}</span></td>
        <td><span class="label">Bank Account No.</span><span class="val mono">${bank.accountNumber ? "••••" + String(bank.accountNumber).slice(-4) : "••••7890"}</span></td>
        <td><span class="label">IFSC Code</span><span class="val mono">${bank.ifscCode || "HDFC0000123"}</span></td>
        <td><span class="label">Date of Joining</span><span class="val">${p.dateOfJoining || "15-Jan-2024"}</span></td>
      </tr>
      <tr class="bg-alt">
        <td><span class="label">PAN Number</span><span class="val mono">${statutory.panNumber || "ABCDE1234F"}</span></td>
        <td><span class="label">UAN Number</span><span class="val mono">${statutory.uanNumber || "101234567890"}</span></td>
        <td><span class="label">PF Number</span><span class="val mono">${statutory.pfNumber || "MH/BAN/0012345/000/0001"}</span></td>
        <td><span class="label">ESI Number</span><span class="val mono">${statutory.esiNumber || "31000123450000001"}</span></td>
      </tr>
    </table>

    <!-- Attendance Strip -->
    <div class="strip">
      <div class="strip-item"><span class="label">Total Days</span><span class="val">${attendance.totalDays || 31}</span></div>
      <div class="strip-item"><span class="label">Worked Days</span><span class="val">${attendance.workedDays || 31}</span></div>
      <div class="strip-item"><span class="label">Paid Leave</span><span class="val">${attendance.paidLeaveDays || 0}</span></div>
      <div class="strip-item"><span class="label">Loss of Pay</span><span class="val" style="color: #DE350B;">${attendance.lopDays || 0}</span></div>
      <div class="strip-item"><span class="label">Payable Days</span><span class="val" style="color: #00875A;">${attendance.payableDays || 31}</span></div>
    </div>

    <!-- Earnings & Deductions -->
    <table class="two-col-table">
      <thead>
        <tr>
          <th style="width: 50%;">Earnings (INR)</th>
          <th style="width: 50%;">Deductions (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="item-row"><span>Basic Salary</span><span>${formatCurrency(earnings.basic)}</span></div>
            <div class="item-row"><span>House Rent Allowance (HRA)</span><span>${formatCurrency(earnings.hra)}</span></div>
            <div class="item-row"><span>Conveyance Allowance</span><span>${formatCurrency(earnings.conveyance)}</span></div>
            <div class="item-row"><span>Medical Allowance</span><span>${formatCurrency(earnings.medicalAllowance)}</span></div>
            <div class="item-row"><span>Special Allowance</span><span>${formatCurrency(earnings.specialAllowance)}</span></div>
            <div class="item-row total"><span>Total Gross Earnings</span><span style="color: #00875A;">${formatCurrency(earnings.grossEarnings)}</span></div>
          </td>
          <td>
            <div class="item-row"><span>Provident Fund (EPF)</span><span>${formatCurrency(deductions.epf)}</span></div>
            <div class="item-row"><span>Employee State Insurance (ESI)</span><span>${formatCurrency(deductions.esi)}</span></div>
            <div class="item-row"><span>Professional Tax (PT)</span><span>${formatCurrency(deductions.professionalTax)}</span></div>
            <div class="item-row"><span>Tax Deducted at Source (TDS)</span><span>${formatCurrency(deductions.tds)}</span></div>
            <div class="item-row"><span>Loss of Pay (LOP) Deduction</span><span>${formatCurrency(deductions.lopDeduction)}</span></div>
            <div class="item-row total"><span>Total Deductions</span><span style="color: #DE350B;">${formatCurrency(deductions.totalDeductions)}</span></div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Net Pay -->
    <div class="net-box">
      <div>
        <div class="net-label">Net Salary Payable</div>
        <div class="net-words">${netWords}</div>
      </div>
      <div style="text-align: right;">
        <div class="net-amount">${formatCurrency(p.netPay)}</div>
        <div style="font-size: 9.5px; color: #006644; font-weight: 600;">Disbursed to Bank Account</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div>
        <div class="auth-badge">Digitally Authenticated by Staffify Payroll Engine</div>
        <div>This is a computer-generated statutory salary slip and requires no physical signature.</div>
      </div>
      <div class="sign-box">
        <div class="sign-line"></div>
        <div style="font-weight: 700; color: #172B4D;">Authorised Signatory</div>
        <div style="font-size: 9px;">Staffify Enterprise HR</div>
      </div>
    </div>
  </div>
</body>
</html>`;
};

export const printPayslip = (payslip) => {
  const html = generatePayslipHtml(payslip);
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Please allow popups in your browser to print/download payslips.");
    return;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
};

export const downloadPayslipFile = (payslip) => {
  const html = generatePayslipHtml(payslip);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const fileName = `Staffify_Payslip_${payslip.employeeId || "EMP"}_${(payslip.periodString || "Month").replace(/\s+/g, "_")}.html`;
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
