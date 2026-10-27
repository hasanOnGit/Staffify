/**
 * Staffify Enterprise HRMS
 * Executive Personnel Dossier PDF & Print Engine
 * Zero Unicode emojis, strictly compliant enterprise layout.
 */
import toast from "react-hot-toast";

const maskString = (str = "", visibleCount = 4) => {
  if (!str) return "Not Provided";
  const s = String(str);
  if (s.length <= visibleCount) return s;
  return "*".repeat(s.length - visibleCount) + s.slice(-visibleCount);
};

export const generateDossierHtml = (employee) => {
  const e = employee || {};
  const statutory = e.statutoryDetails || {};
  const bank = e.bankDetails || {};
  const emergency = e.emergencyContact || {};
  const initials = e.name ? e.name.slice(0, 2).toUpperCase() : "EM";

  const joinDateStr = e.dateOfJoining
    ? new Date(e.dateOfJoining).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not Recorded";

  const printDateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Personnel Dossier - ${e.name || "Employee"} (${e.employeeId || "STAFF"})</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 12mm 14mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      background: #FFFFFF;
      color: #172B4D;
      font-size: 11px;
      line-height: 1.45;
    }
    .dossier-card {
      border: 1px solid #DFE1E6;
      border-radius: 6px;
      overflow: hidden;
    }
    .header-bar {
      background: #0052CC;
      color: #FFFFFF;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .avatar-circle {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #0747A6;
      border: 2px solid #FFFFFF;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 1px;
    }
    .emp-title h1 {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.2px;
      margin-bottom: 2px;
    }
    .emp-subtitle {
      font-size: 11px;
      color: #DEEBFF;
      font-weight: 500;
    }
    .header-right {
      text-align: right;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      font-size: 10px;
      font-weight: 700;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-active {
      background: #E3FCEF;
      color: #006644;
      border: 1px solid #ABF5D1;
    }
    .badge-inactive {
      background: #FFEBE6;
      color: #DE350B;
      border: 1px solid #FFBDAD;
    }
    .org-tag {
      font-size: 10px;
      color: #DEEBFF;
      margin-top: 4px;
      font-weight: 600;
    }

    .content-body {
      padding: 16px 20px;
    }
    .section-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 800;
      color: #0052CC;
      border-bottom: 1.5px solid #0052CC;
      padding-bottom: 3px;
      margin-top: 14px;
      margin-bottom: 8px;
    }
    .section-title:first-child {
      margin-top: 0;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 6px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 6px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 6px;
    }
    .field-box {
      background: #FAFBFC;
      border: 1px solid #EBECF0;
      border-radius: 4px;
      padding: 7px 9px;
    }
    .field-label {
      font-size: 9px;
      color: #6B778C;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 2px;
    }
    .field-value {
      font-size: 11px;
      color: #172B4D;
      font-weight: 600;
      word-break: break-word;
    }
    .field-mono {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      letter-spacing: 0.3px;
    }

    .footer-seal {
      margin-top: 18px;
      padding-top: 12px;
      border-top: 1px dashed #DFE1E6;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 9px;
      color: #6B778C;
    }
    .seal-box {
      border: 1px solid #DFE1E6;
      border-radius: 4px;
      padding: 6px 12px;
      text-align: center;
      background: #FAFBFC;
    }
    .seal-title {
      font-weight: 700;
      color: #0052CC;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 9px;
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="dossier-card">
    <!-- Header -->
    <div class="header-bar">
      <div class="header-left">
        <div class="avatar-circle">${initials}</div>
        <div class="emp-title">
          <h1>${e.name || "Personnel Profile"}</h1>
          <div class="emp-subtitle">
            ${e.designation || "Designation Not Assigned"} • ${e.department || "Operations"}
          </div>
        </div>
      </div>
      <div class="header-right">
        <div>
          <span class="badge ${e.isActive ? "badge-active" : "badge-inactive"}">
            ${e.isActive ? "Active Employee" : "Inactive / Resigned"}
          </span>
        </div>
        <div class="org-tag">STAFFIFY ENTERPRISE HRMS</div>
      </div>
    </div>

    <!-- Content -->
    <div class="content-body">
      <!-- 1. Primary Identification -->
      <div class="section-title">1. Primary Identification & Employment</div>
      <div class="grid-4">
        <div class="field-box">
          <div class="field-label">Employee ID</div>
          <div class="field-value field-mono">${e.employeeId || "N/A"}</div>
        </div>
        <div class="field-box">
          <div class="field-label">Department</div>
          <div class="field-value">${e.department || "General"}</div>
        </div>
        <div class="field-box">
          <div class="field-label">Designation</div>
          <div class="field-value">${e.designation || "Executive"}</div>
        </div>
        <div class="field-box">
          <div class="field-label">Date of Joining</div>
          <div class="field-value">${joinDateStr}</div>
        </div>
      </div>

      <div class="grid-4">
        <div class="field-box">
          <div class="field-label">Work Location</div>
          <div class="field-value">${e.workLocation || "HQ Office"}</div>
        </div>
        <div class="field-box">
          <div class="field-label">Employment Type</div>
          <div class="field-value">${e.employmentType || "Full-Time Permanent"}</div>
        </div>
        <div class="field-box">
          <div class="field-label">Reporting Manager</div>
          <div class="field-value">${e.reportingManager || "Department Head"}</div>
        </div>
        <div class="field-box">
          <div class="field-label">Work Shift</div>
          <div class="field-value">${e.shift || "General Day Shift (9 AM - 6 PM)"}</div>
        </div>
      </div>

      <!-- 2. Contact & Personal Profile -->
      <div class="section-title">2. Contact & Personal Profile</div>
      <div class="grid-3">
        <div class="field-box">
          <div class="field-label">Work Email</div>
          <div class="field-value">${e.email || "N/A"}</div>
        </div>
        <div class="field-box">
          <div class="field-label">Contact Phone</div>
          <div class="field-value">${e.phoneNo || "N/A"}</div>
        </div>
        <div class="field-box">
          <div class="field-label">Date of Birth</div>
          <div class="field-value">${e.dob ? new Date(e.dob).toLocaleDateString() : "Not Disclosed"}</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="field-box">
          <div class="field-label">Residential Address</div>
          <div class="field-value">${e.address || "Standard residential premises on file"}</div>
        </div>
        <div class="field-box">
          <div class="field-label">Emergency Contact</div>
          <div class="field-value">
            ${emergency.name ? `${emergency.name} (${emergency.relationship || "Relative"}) - ${emergency.phone || ""}` : "Verified Next of Kin on HR Record"}
          </div>
        </div>
      </div>

      <!-- 3. Statutory & Identity Credentials -->
      <div class="section-title">3. Statutory & Identity Credentials (Redacted for Security)</div>
      <div class="grid-4">
        <div class="field-box">
          <div class="field-label">PAN Number</div>
          <div class="field-value field-mono">${maskString(statutory.panNumber, 4)}</div>
        </div>
        <div class="field-box">
          <div class="field-label">Aadhaar UID</div>
          <div class="field-value field-mono">${maskString(statutory.aadhaarNumber, 4)}</div>
        </div>
        <div class="field-box">
          <div class="field-label">Universal Account Number (UAN)</div>
          <div class="field-value field-mono">${maskString(statutory.uan, 4)}</div>
        </div>
        <div class="field-box">
          <div class="field-label">ESIC Number</div>
          <div class="field-value field-mono">${statutory.esiNumber ? maskString(statutory.esiNumber, 4) : "Not Enrolled (CTC &gt; 21k)"}</div>
        </div>
      </div>

      <!-- 4. Compensation & Bank Disbursement Details -->
      <div class="section-title">4. Compensation & Disbursement Account</div>
      <div class="grid-3">
        <div class="field-box">
          <div class="field-label">Bank Name</div>
          <div class="field-value">${bank.bankName || "Authorized Banking Partner"}</div>
        </div>
        <div class="field-box">
          <div class="field-label">Account Number</div>
          <div class="field-value field-mono">${maskString(bank.accountNumber, 4)}</div>
        </div>
        <div class="field-box">
          <div class="field-label">Bank IFSC Code</div>
          <div class="field-value field-mono">${bank.ifscCode || "IFSC Verified"}</div>
        </div>
      </div>

      <!-- Footer Sign-off & Seal -->
      <div class="footer-seal">
        <div>
          <div>Document ID: <strong>DOS-${e.employeeId || "STAFF"}-${Date.now().toString().slice(-6)}</strong></div>
          <div>Printed Date: ${printDateStr} • Staffify Enterprise HR Audit Trail Verified</div>
          <div style="color: #DE350B; font-weight: 600; margin-top: 2px;">
            CONFIDENTIAL • FOR AUTHORIZED PERSONNEL MANAGEMENT ONLY
          </div>
        </div>
        <div class="seal-box">
          <div class="seal-title">STAFFIFY HR VERIFIED</div>
          <div style="font-size: 8px; color: #6B778C; margin-top: 2px;">DIGITALLY VALIDATED RECORD</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
};

export const printEmployeeDossier = (employee) => {
  if (!employee) {
    toast.error("No employee record selected for printing");
    return;
  }

  const html = generateDossierHtml(employee);
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Please allow popups to print the Executive Dossier");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 400);

  toast.success("Executive Dossier prepared for printing!");
};
