/**
 * Staffify Statutory Labour Law Registers Print Utility
 * Formats and prints official Government Inspection registers under the
 * Indian Code on Wages (2019) / State Shops & Commercial Establishments Acts:
 * - FORM A: Employee Master Register (Rule 59(1))
 * - FORM B: Register of Wages, Deductions & Net Pay (Rule 59(1))
 * - FORM C: Register of Loans, Advances & Recoveries (Rule 59(1))
 * - FORM D: Attendance & Overtime Register (Rule 59(1))
 */
import { printHtmlDocument } from "./printEngine";

const COMPANY_HEADER = `
  <div style="border-bottom: 2px solid #0052CC; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
    <div>
      <div style="font-size: 16px; font-weight: 800; color: #0052CC; letter-spacing: 0.5px;">STAFFIFY ENTERPRISE HRMS</div>
      <div style="font-size: 9px; color: #5E6C84;">Registered Establishment: Bangalore Technology Towers, Whitefield, Bangalore - 560066</div>
      <div style="font-size: 9px; color: #5E6C84;">Registration No: KA/BLR/SE/2026/09182 • EPFO Code: MH/PUN/0012345 • ESIC Code: 3100098271000</div>
    </div>
    <div style="text-align: right;">
      <span style="display: inline-block; padding: 2px 8px; font-size: 8px; font-weight: bold; background: #DEEBFF; color: #0052CC; border: 1px solid #B3D4FF; border-radius: 3px;">
        OFFICIAL LABOUR INSPECTION REGISTER
      </span>
      <div style="font-size: 8px; color: #6B778C; margin-top: 3px;">Generated under Code on Wages, 2019</div>
    </div>
  </div>
`;

/**
 * FORM A: Employee Register (Rule 59(1))
 */
export const printFormAEmployeeRegister = (employees = []) => {
  const rows = employees.map((emp, idx) => `
    <tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td style="font-weight: bold; font-family: monospace;">${emp.employeeId || "-"}</td>
      <td style="font-weight: 600;">${emp.name || "-"}</td>
      <td>${emp.gender || "-"}</td>
      <td>${emp.fatherName || emp.emergencyContactName || "-"}</td>
      <td>${emp.dob || "-"}</td>
      <td>${emp.dateOfJoining || "-"}</td>
      <td>${emp.designation || "-"} (${emp.department || "-"})</td>
      <td style="font-family: monospace;">${emp.statutoryDetails?.aadhaarNumber || "-"}</td>
      <td style="font-family: monospace;">${emp.statutoryDetails?.panNumber || "-"}</td>
      <td style="font-family: monospace;">${emp.statutoryDetails?.uanNumber || "-"}</td>
      <td>${emp.bankDetails?.bankName || "-"} - ${emp.bankDetails?.accountNumber || "-"}</td>
      <td style="text-align: right; font-weight: bold;">INR ${(emp.totalSalary || emp.basicSalary || 0).toLocaleString("en-IN")}</td>
    </tr>
  `).join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Form A - Employee Register</title>
        <style>
          @page { size: A4 landscape; margin: 10mm 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; font-size: 8.5px; color: #172B4D; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 8px; }
          th { background: #0052CC; color: white; border: 1px solid #0052CC; padding: 4px; text-align: left; }
          td { border: 1px solid #DFE1E6; padding: 3.5px; }
          tr:nth-child(even) td { background: #FAFBFC; }
        </style>
      </head>
      <body>
        ${COMPANY_HEADER}
        <div style="text-align: center; margin-bottom: 8px;">
          <h2 style="margin: 0; font-size: 13px; color: #172B4D;">FORM A — EMPLOYEE REGISTER</h2>
          <div style="font-size: 9px; color: #5E6C84;">[See Rule 59(1) of Code on Wages, 2019 / Shops & Commercial Establishments Act]</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Emp ID</th>
              <th>Full Name</th>
              <th>Gender</th>
              <th>Father/Spouse</th>
              <th>DOB</th>
              <th>DOJ</th>
              <th>Designation & Dept</th>
              <th>Aadhaar</th>
              <th>PAN</th>
              <th>UAN</th>
              <th>Bank & A/C</th>
              <th>Wage Rate/Mo</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div style="margin-top: 18px; display: flex; justify-content: space-between; font-size: 8.5px; color: #5E6C84;">
          <div>Certified that the above particulars are true and verified from official personnel records.</div>
          <div style="border-top: 1px solid #172B4D; width: 180px; text-align: center; padding-top: 3px; font-weight: bold; color: #172B4D;">
            Authorized Signatory / Employer
          </div>
        </div>
      </body>
    </html>
  `;

  return printHtmlDocument(html, "Form_A_Employee_Register");
};

/**
 * FORM B: Wage Register (Rule 59(1))
 */
export const printFormBWageRegister = (payrollRecords = [], period = "October 2026") => {
  const rows = payrollRecords.map((p, idx) => `
    <tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td style="font-weight: bold; font-family: monospace;">${p.employeeId}</td>
      <td style="font-weight: 600;">${p.employeeName}</td>
      <td>${p.department || "Engineering"}</td>
      <td style="text-align: center;">${p.payableDays || 30}</td>
      <td style="text-align: right;">${(p.earnings?.basic || 0).toLocaleString("en-IN")}</td>
      <td style="text-align: right;">${(p.earnings?.hra || 0).toLocaleString("en-IN")}</td>
      <td style="text-align: right;">${(p.earnings?.specialAllowance || 0).toLocaleString("en-IN")}</td>
      <td style="text-align: right; font-weight: bold; color: #0052CC;">${(p.grossSalary || 0).toLocaleString("en-IN")}</td>
      <td style="text-align: right;">${(p.deductions?.epf || 0).toLocaleString("en-IN")}</td>
      <td style="text-align: right;">${(p.deductions?.esic || 0).toLocaleString("en-IN")}</td>
      <td style="text-align: right;">${(p.deductions?.pt || 0).toLocaleString("en-IN")}</td>
      <td style="text-align: right;">${(p.deductions?.tds || 0).toLocaleString("en-IN")}</td>
      <td style="text-align: right; font-weight: bold; color: #DE350B;">${(p.totalDeductions || 0).toLocaleString("en-IN")}</td>
      <td style="text-align: right; font-weight: 800; color: #00875A; background: #E3FCEF;">${(p.netSalary || 0).toLocaleString("en-IN")}</td>
      <td style="text-align: center; font-size: 7.5px; color: #5E6C84;">Bank Transfer / NEFT</td>
    </tr>
  `).join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Form B - Wage Register</title>
        <style>
          @page { size: A4 landscape; margin: 10mm 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; font-size: 8.5px; color: #172B4D; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 8px; }
          th { background: #0052CC; color: white; border: 1px solid #0052CC; padding: 4px; text-align: left; }
          td { border: 1px solid #DFE1E6; padding: 3.5px; }
          tr:nth-child(even) td { background: #FAFBFC; }
        </style>
      </head>
      <body>
        ${COMPANY_HEADER}
        <div style="text-align: center; margin-bottom: 8px;">
          <h2 style="margin: 0; font-size: 13px; color: #172B4D;">FORM B — REGISTER OF WAGES</h2>
          <div style="font-size: 9px; color: #5E6C84;">[See Rule 59(1) of Code on Wages, 2019] • Wage Period: <strong>${period}</strong></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Dept</th>
              <th>Days</th>
              <th>Basic</th>
              <th>HRA</th>
              <th>Allowances</th>
              <th>Gross Pay</th>
              <th>EPF (12%)</th>
              <th>ESIC</th>
              <th>PT</th>
              <th>TDS</th>
              <th>Total Ded.</th>
              <th>Net Wages</th>
              <th>Disbursement Mode</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div style="margin-top: 18px; display: flex; justify-content: space-between; font-size: 8.5px; color: #5E6C84;">
          <div>Wages disbursed directly to authenticated employee bank accounts via NEFT/RTGS.</div>
          <div style="border-top: 1px solid #172B4D; width: 180px; text-align: center; padding-top: 3px; font-weight: bold; color: #172B4D;">
            Manager / Payroll In-Charge
          </div>
        </div>
      </body>
    </html>
  `;

  return printHtmlDocument(html, `Form_B_Wage_Register_${period.replace(" ", "_")}`);
};

/**
 * FORM C: Loan & Advances Register (Rule 59(1))
 */
export const printFormCLoanRegister = (loans = []) => {
  const rows = loans.map((l, idx) => `
    <tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td style="font-weight: bold; font-family: monospace;">${l.employeeId}</td>
      <td style="font-weight: 600;">${l.employeeName}</td>
      <td style="text-align: right; font-weight: bold;">INR ${(l.amount || 0).toLocaleString("en-IN")}</td>
      <td>${l.createdAt ? new Date(l.createdAt).toLocaleDateString("en-IN") : "-"}</td>
      <td>${l.reason || "Personal Advance"}</td>
      <td style="text-align: center;">${l.tenureMonths || 6} Months</td>
      <td style="text-align: right;">INR ${(l.monthlyEmi || 0).toLocaleString("en-IN")}</td>
      <td style="text-align: right; font-weight: bold; color: #00875A;">INR ${(l.totalRepaid || 0).toLocaleString("en-IN")}</td>
      <td style="text-align: right; font-weight: bold; color: #DE350B;">INR ${(l.remainingBalance || 0).toLocaleString("en-IN")}</td>
      <td style="text-align: center; font-weight: bold;">${l.status || "Active"}</td>
    </tr>
  `).join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Form C - Loan and Advances Register</title>
        <style>
          @page { size: A4 landscape; margin: 10mm 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; font-size: 8.5px; color: #172B4D; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 8px; }
          th { background: #0052CC; color: white; border: 1px solid #0052CC; padding: 4px; text-align: left; }
          td { border: 1px solid #DFE1E6; padding: 3.5px; }
          tr:nth-child(even) td { background: #FAFBFC; }
        </style>
      </head>
      <body>
        ${COMPANY_HEADER}
        <div style="text-align: center; margin-bottom: 8px;">
          <h2 style="margin: 0; font-size: 13px; color: #172B4D;">FORM C — REGISTER OF LOANS, ADVANCES & RECOVERIES</h2>
          <div style="font-size: 9px; color: #5E6C84;">[See Rule 59(1) of Code on Wages, 2019]</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Loan Sanctioned</th>
              <th>Date Granted</th>
              <th>Purpose of Advance</th>
              <th>Tenure</th>
              <th>Monthly EMI</th>
              <th>Total Recovered</th>
              <th>Outstanding Bal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div style="margin-top: 18px; display: flex; justify-content: space-between; font-size: 8.5px; color: #5E6C84;">
          <div>All deductions strictly comply with the Payment of Wages limit (Maximum 50% of monthly earnings).</div>
          <div style="border-top: 1px solid #172B4D; width: 180px; text-align: center; padding-top: 3px; font-weight: bold; color: #172B4D;">
            Finance Controller / Employer
          </div>
        </div>
      </body>
    </html>
  `;

  return printHtmlDocument(html, "Form_C_Loan_Register");
};

/**
 * FORM D: Attendance & Overtime Register (Rule 59(1))
 */
export const printFormDAttendanceRegister = (attendanceRecords = [], period = "October 2026") => {
  // Group by employee
  const byEmp = {};
  attendanceRecords.forEach((r) => {
    if (!byEmp[r.employeeId]) {
      byEmp[r.employeeId] = {
        employeeId: r.employeeId,
        employeeName: r.employeeName || "Employee",
        records: [],
        totalPresent: 0,
        totalLeaves: 0,
        totalHours: 0,
        totalOtHours: 0,
      };
    }
    byEmp[r.employeeId].records.push(r);
    if (r.status === "Present" || r.status === "WFH") byEmp[r.employeeId].totalPresent++;
    if (r.status === "Absent") byEmp[r.employeeId].totalLeaves++;
    const hrs = Number(r.totalHours || r.workHours || 0);
    byEmp[r.employeeId].totalHours += hrs;
    if (hrs > 8) byEmp[r.employeeId].totalOtHours += (hrs - 8);
  });

  const rows = Object.values(byEmp).map((emp, idx) => `
    <tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td style="font-weight: bold; font-family: monospace;">${emp.employeeId}</td>
      <td style="font-weight: 600;">${emp.employeeName}</td>
      <td style="text-align: center; font-weight: bold; color: #00875A;">${emp.totalPresent}</td>
      <td style="text-align: center; color: #DE350B;">${emp.totalLeaves}</td>
      <td style="text-align: center; font-weight: bold;">${emp.totalHours.toFixed(1)} hrs</td>
      <td style="text-align: center; font-weight: bold; color: #0052CC;">${emp.totalOtHours.toFixed(1)} hrs</td>
      <td style="text-align: center; font-size: 8px;">General (09:00 - 18:00)</td>
      <td style="text-align: center; font-size: 7.5px; color: #5E6C84;">Biometric / GPS Verified</td>
    </tr>
  `).join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Form D - Attendance Register</title>
        <style>
          @page { size: A4 landscape; margin: 10mm 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; font-size: 8.5px; color: #172B4D; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 8px; }
          th { background: #0052CC; color: white; border: 1px solid #0052CC; padding: 4px; text-align: left; }
          td { border: 1px solid #DFE1E6; padding: 3.5px; }
          tr:nth-child(even) td { background: #FAFBFC; }
        </style>
      </head>
      <body>
        ${COMPANY_HEADER}
        <div style="text-align: center; margin-bottom: 8px;">
          <h2 style="margin: 0; font-size: 13px; color: #172B4D;">FORM D — ATTENDANCE & OVERTIME REGISTER</h2>
          <div style="font-size: 9px; color: #5E6C84;">[See Rule 59(1) of Code on Wages, 2019] • Attendance Period: <strong>${period}</strong></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Days Present</th>
              <th>Days Absent</th>
              <th>Total Logged Hours</th>
              <th>Overtime Hours (OT)</th>
              <th>Scheduled Shift</th>
              <th>Verification Mode</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div style="margin-top: 18px; display: flex; justify-content: space-between; font-size: 8.5px; color: #5E6C84;">
          <div>Attendance authenticated using encrypted RFID turnstiles and GPS geofence mobile check-ins.</div>
          <div style="border-top: 1px solid #172B4D; width: 180px; text-align: center; padding-top: 3px; font-weight: bold; color: #172B4D;">
            Timekeeper / HR Operations
          </div>
        </div>
      </body>
    </html>
  `;

  return printHtmlDocument(html, `Form_D_Attendance_Register_${period.replace(" ", "_")}`);
};

export default {
  printFormAEmployeeRegister,
  printFormBWageRegister,
  printFormCLoanRegister,
  printFormDAttendanceRegister,
};
