/**
 * Staffify Enterprise HRMS
 * Official Monthly Attendance Register & Timesheet Summary PDF Engine
 * Zero Unicode emojis, strictly compliant enterprise layout.
 */
import toast from "react-hot-toast";
import { printHtmlDocument } from "./printEngine";

export const generateAttendanceRegisterHtml = ({
  employee = {},
  records = [],
  monthName = "Current Month",
  year = new Date().getFullYear(),
  summary = {},
}) => {
  const e = employee || {};
  const totalDays = records.length;
  const presentDays = summary.present || records.filter((r) => r.status === "Present").length;
  const lateDays = summary.late || records.filter((r) => r.status === "Late").length;
  const halfDays = summary.halfDay || records.filter((r) => r.status === "Half Day").length;
  const absentDays = summary.absent || records.filter((r) => r.status === "Absent").length;
  const totalHours = summary.totalHours || records.reduce((acc, r) => acc + (Number(r.totalHours) || 0), 0);

  const printDateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Staffify Attendance Register - ${e.name || "Employee"} - ${monthName} ${year}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
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
      font-size: 10px;
      line-height: 1.4;
      padding: 10px;
    }
    .register-container {
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
    .company-title {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .company-sub {
      font-size: 9.5px;
      opacity: 0.9;
      margin-top: 2px;
    }
    .register-badge {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.35);
      border-radius: 4px;
      padding: 6px 12px;
      text-align: right;
    }
    .register-badge-title {
      font-size: 11px;
      font-weight: 700;
    }
    .register-badge-sub {
      font-size: 9px;
      opacity: 0.9;
    }
    .content-body {
      padding: 20px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    .field-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px dashed #EBECF0;
      font-size: 10.5px;
    }
    .field-label {
      color: #6B778C;
      font-weight: 600;
    }
    .field-value {
      color: #172B4D;
      font-weight: 600;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-bottom: 18px;
    }
    .summary-card {
      background: #FAFBFC;
      border: 1px solid #DFE1E6;
      border-radius: 4px;
      padding: 8px 10px;
      text-align: center;
    }
    .summary-card-label {
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: #6B778C;
    }
    .summary-card-val {
      font-size: 14px;
      font-weight: 800;
      margin-top: 2px;
      color: #172B4D;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th {
      background: #F4F5F7;
      color: #172B4D;
      font-weight: 700;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #DFE1E6;
      font-size: 9.5px;
    }
    td {
      padding: 5px 8px;
      border: 1px solid #DFE1E6;
      font-size: 9.5px;
    }
    .status-pill {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 10px;
      font-size: 8.5px;
      font-weight: 700;
    }
    .status-Present {
      background: #E3FCEF;
      color: #00875A;
      border: 1px solid #ABF5D1;
    }
    .status-Late {
      background: #FFF0B3;
      color: #B9770E;
      border: 1px solid #FFE380;
    }
    .status-Half-Day {
      background: #EAE6FF;
      color: #403294;
      border: 1px solid #C0B6F2;
    }
    .status-Absent {
      background: #FFEBE6;
      color: #DE350B;
      border: 1px solid #FFBDAD;
    }
    .sign-section {
      margin-top: 28px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      page-break-inside: avoid;
    }
    .sign-box {
      border: 1px dashed #C1C7D0;
      border-radius: 4px;
      padding: 12px;
      text-align: center;
      min-height: 70px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
    .sign-line {
      border-top: 1px solid #172B4D;
      margin-bottom: 4px;
    }
    .sign-title {
      font-size: 9.5px;
      font-weight: 700;
      color: #172B4D;
    }
    .sign-sub {
      font-size: 8px;
      color: #6B778C;
    }
    .footer-note {
      margin-top: 18px;
      font-size: 8px;
      color: #6B778C;
      text-align: center;
      border-top: 1px solid #DFE1E6;
      padding-top: 8px;
    }
  </style>
</head>
<body>
  <div class="register-container">
    <!-- Header -->
    <div class="header-bar">
      <div>
        <div class="company-title">STAFFIFY ENTERPRISE HRMS</div>
        <div class="company-sub">Statutory Attendance & Workforce Turnout Registry</div>
      </div>
      <div class="register-badge">
        <div class="register-badge-title">MONTHLY ATTENDANCE REGISTER</div>
        <div class="register-badge-sub">PERIOD: ${monthName.toUpperCase()} ${year}</div>
      </div>
    </div>

    <div class="content-body">
      <!-- Employee Meta -->
      <div class="grid-2">
        <div>
          <div class="field-row">
            <span class="field-label">Employee Full Name</span>
            <span class="field-value">${e.name || "Staff Member"}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Employee ID</span>
            <span class="field-value">${e.employeeId || "STAFF"}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Department</span>
            <span class="field-value">${e.department || "General"}</span>
          </div>
        </div>

        <div>
          <div class="field-row">
            <span class="field-label">Designation / Role</span>
            <span class="field-value">${e.designation || e.role || "Professional Staff"}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Verification Type</span>
            <span class="field-value">GPS Geofence & Biometric ADMS</span>
          </div>
          <div class="field-row">
            <span class="field-label">Registry Print Date</span>
            <span class="field-value">${printDateStr}</span>
          </div>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-card-label">Present</div>
          <div class="summary-card-val" style="color: #00875A;">${presentDays}</div>
        </div>
        <div class="summary-card">
          <div class="summary-card-label">Late Swipes</div>
          <div class="summary-card-val" style="color: #B9770E;">${lateDays}</div>
        </div>
        <div class="summary-card">
          <div class="summary-card-label">Half Days</div>
          <div class="summary-card-val" style="color: #403294;">${halfDays}</div>
        </div>
        <div class="summary-card">
          <div class="summary-card-label">Absent / LOP</div>
          <div class="summary-card-val" style="color: #DE350B;">${absentDays}</div>
        </div>
        <div class="summary-card">
          <div class="summary-card-label">Work Hours</div>
          <div class="summary-card-val" style="color: #0052CC;">${totalHours.toFixed(1)} hrs</div>
        </div>
      </div>

      <!-- Daily Log Table -->
      <table>
        <thead>
          <tr>
            <th style="width: 15%;">Date</th>
            <th style="width: 15%;">Status</th>
            <th style="width: 18%;">First In</th>
            <th style="width: 18%;">Last Out</th>
            <th style="width: 14%; text-align: right;">Total Hours</th>
            <th style="width: 20%;">Regularization / Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${
            records.length > 0
              ? records
                  .map(
                    (r) => `
            <tr>
              <td style="font-weight: 600;">${r.date || "N/A"}</td>
              <td>
                <span class="status-pill status-${(r.status || "Present").replace(/\s+/g, "-")}">${r.status || "Present"}</span>
              </td>
              <td>${r.firstIn ? new Date(r.firstIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (r.checkIn || "--:--")}</td>
              <td>${r.lastOut ? new Date(r.lastOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (r.checkOut || "--:--")}</td>
              <td style="text-align: right; font-weight: 600;">${r.totalHours ? Number(r.totalHours).toFixed(1) + " h" : (r.workHours || "--")}</td>
              <td style="color: #6B778C; font-size: 8.5px;">${r.regularizationStatus || (r.isRegularized ? "Regularized (Approved)" : "Verified GPS Swipe")}</td>
            </tr>
          `
                  )
                  .join("")
              : `<tr><td colspan="6" style="text-align: center; color: #6B778C; padding: 18px;">No attendance records found for this period.</td></tr>`
          }
        </tbody>
      </table>

      <!-- Signatures -->
      <div class="sign-section">
        <div class="sign-box">
          <div class="sign-line"></div>
          <div class="sign-title">Employee Acknowledgement</div>
          <div class="sign-sub">${e.name || "Employee"}</div>
        </div>

        <div class="sign-box">
          <div class="sign-line"></div>
          <div class="sign-title">Authorized Supervisor / HR Lead</div>
          <div class="sign-sub">Staffify Enterprise Operations</div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer-note">
        This document is an official statutory record compiled under the Model Shops and Establishments Act & Factories Act regulations.
        System-generated by Staffify Enterprise HRMS on ${printDateStr}.
      </div>
    </div>
  </div>
</body>
</html>`;
};

export const printAttendanceRegister = (payload) => {
  const { employee, monthName = "Attendance_Register", year = new Date().getFullYear() } = payload || {};
  const title = `Staffify_Attendance_Register_${employee?.employeeId || "STAFF"}_${monthName}_${year}`;
  const html = generateAttendanceRegisterHtml(payload || {});
  return printHtmlDocument(html, title);
};

export default {
  generateAttendanceRegisterHtml,
  printAttendanceRegister,
};
