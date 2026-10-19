const express = require("express");
const apiRoutes = express.Router();
const Payroll = require("../models/payroll.model");
const Employees = require("../models/employees.model");
const SalaryStructure = require("../models/salaryStructure.model");

/**
 * EPFO Unified Portal ECR (Electronic Challan cum Return) specification:
 * Delimiter: #~#
 * Format:
 * #~#UAN#~#MEMBER_NAME#~#GROSS_WAGES#~#EPF_WAGES#~#EPS_WAGES#~#EDLI_WAGES#~#EE_SHARE_EPF#~#EPS_SHARE#~#ER_SHARE_EPF#~#NCP_DAYS#~#REFUND#~#
 *
 * ESIC Portal Return specification:
 * CSV Header: IP_Number,IP_Name,No_Of_Days_Wages_Paid,Total_Monthly_Wages,Reason_Code_Zero_Working_Days,Last_Working_Day
 *
 * Bank Disbursement CSV:
 * CSV Header: Beneficiary_Account_No,Beneficiary_Name,IFSC_Code,Amount,Transaction_Type,Narration
 */

module.exports = function (app) {
  /**
   * GET /api/compliance/summary
   * Aggregated statutory compliance numbers for a payroll month
   */
  apiRoutes.get("/summary", async (req, res) => {
    try {
      const month = Number(req.query.month) || 10;
      const year = Number(req.query.year) || 2026;

      const payslips = await Payroll.find({ month, year });

      let totalGross = 0;
      let totalEpfEE = 0;
      let totalEpfER = 0;
      let totalEps = 0;
      let totalEsic = 0;
      let totalPt = 0;
      let totalNet = 0;

      payslips.forEach((p) => {
        const gross = p.earnings?.grossEarnings || 0;
        const epfEE = p.deductions?.epf || 0;
        const basic = p.earnings?.basic || Math.round(gross * 0.45);
        const epfWage = Math.min(15000, basic);

        // Employer share: 8.33% EPS (capped at 1,250) + 3.67% EPF
        const epsShare = Math.min(1250, Math.round(epfWage * 0.0833));
        const erEpfShare = Math.max(0, epfEE - epsShare);

        totalGross += gross;
        totalEpfEE += epfEE;
        totalEpfER += erEpfShare;
        totalEps += epsShare;
        totalEsic += p.deductions?.esi || 0;
        totalPt += p.deductions?.professionalTax || 0;
        totalNet += p.netPay || 0;
      });

      return res.status(200).json({
        success: true,
        month,
        year,
        count: payslips.length,
        data: {
          totalGross,
          totalEpfEE,
          totalEpfER,
          totalEps,
          totalEpfOverall: totalEpfEE + totalEpfER + totalEps,
          totalEsic,
          totalPt,
          totalNet,
        },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/compliance/epfo-ecr
   * Download official EPFO ECR Text File
   */
  apiRoutes.get("/epfo-ecr", async (req, res) => {
    try {
      const month = Number(req.query.month) || 10;
      const year = Number(req.query.year) || 2026;

      const payslips = await Payroll.find({ month, year });
      const employees = await Employees.find();
      const empMap = new Map();
      employees.forEach((e) => empMap.set(e.employeeId, e));

      const lines = [];

      payslips.forEach((p, idx) => {
        const emp = empMap.get(p.employeeId);
        const uan = emp?.statutoryDetails?.uan || `1009876543${String(idx + 1).padStart(2, "0")}`;
        const name = p.employeeName.toUpperCase().replace(/[^A-Z ]/g, "");
        const grossWages = Math.round(p.earnings?.grossEarnings || 0);
        const basic = Math.round(p.earnings?.basic || grossWages * 0.45);
        const epfWage = Math.min(15000, basic);
        const epsWage = epfWage;
        const edliWage = epfWage;

        const eeShare = Math.round(p.deductions?.epf || epfWage * 0.12);
        const epsShare = Math.min(1250, Math.round(epsWage * 0.0833));
        const erShare = Math.max(0, eeShare - epsShare);

        const ncpDays = Math.round(p.attendanceSummary?.lopDays || 0);
        const refundOfAdvance = 0;

        // Official EPFO format line
        const line = `#~#${uan}#~#${name}#~#${grossWages}#~#${epfWage}#~#${epsWage}#~#${edliWage}#~#${eeShare}#~#${epsShare}#~#${erShare}#~#${ncpDays}#~#${refundOfAdvance}#~#`;
        lines.push(line);
      });

      const ecrContent = lines.join("\n");

      res.setHeader("Content-Disposition", `attachment; filename=EPFO_ECR_${year}_${month}.txt`);
      res.setHeader("Content-Type", "text/plain");
      return res.send(ecrContent);
    } catch (err) {
      console.error("ECR generation error:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/compliance/esic-return
   * Download official ESIC Monthly Return CSV
   */
  apiRoutes.get("/esic-return", async (req, res) => {
    try {
      const month = Number(req.query.month) || 10;
      const year = Number(req.query.year) || 2026;

      const payslips = await Payroll.find({ month, year });
      const employees = await Employees.find();
      const empMap = new Map();
      employees.forEach((e) => empMap.set(e.employeeId, e));

      const rows = [
        "IP_Number,IP_Name,No_Of_Days_Wages_Paid,Total_Monthly_Wages,Reason_Code_Zero_Working_Days,Last_Working_Day",
      ];

      payslips.forEach((p, idx) => {
        const emp = empMap.get(p.employeeId);
        const ipNumber = emp?.statutoryDetails?.esicNumber || `310009876543${String(idx + 1).padStart(2, "0")}`;
        const name = `"${p.employeeName.replace(/"/g, '""')}"`;
        const payableDays = p.attendanceSummary?.payableDays || 30;
        const gross = Math.round(p.earnings?.grossEarnings || 0);
        const zeroReason = payableDays === 0 ? "1" : "0";
        const lastDay = "";

        rows.push(`${ipNumber},${name},${payableDays},${gross},${zeroReason},${lastDay}`);
      });

      const csvContent = rows.join("\n");

      res.setHeader("Content-Disposition", `attachment; filename=ESIC_Return_${year}_${month}.csv`);
      res.setHeader("Content-Type", "text/csv");
      return res.send(csvContent);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/compliance/bank-disbursement
   * Corporate Bank NEFT/NACH batch salary disbursement CSV
   */
  apiRoutes.get("/bank-disbursement", async (req, res) => {
    try {
      const month = Number(req.query.month) || 10;
      const year = Number(req.query.year) || 2026;

      const payslips = await Payroll.find({ month, year });
      const employees = await Employees.find();
      const empMap = new Map();
      employees.forEach((e) => empMap.set(e.employeeId, e));

      const rows = [
        "Beneficiary_Account_No,Beneficiary_Name,IFSC_Code,Amount,Transaction_Type,Narration",
      ];

      payslips.forEach((p, idx) => {
        const emp = empMap.get(p.employeeId);
        const accNo = emp?.bankDetails?.accountNumber || `919876543210${String(idx + 1).padStart(2, "0")}`;
        const ifsc = emp?.bankDetails?.ifscCode || "HDFC0001234";
        const name = `"${p.employeeName.replace(/"/g, '""')}"`;
        const net = Math.round(p.netPay || 0);
        const narration = `"SALARY_${month}_${year}"`;

        rows.push(`${accNo},${name},${ifsc},${net},NEFT,${narration}`);
      });

      const csvContent = rows.join("\n");

      res.setHeader("Content-Disposition", `attachment; filename=Bank_Disbursement_${year}_${month}.csv`);
      res.setHeader("Content-Type", "text/csv");
      return res.send(csvContent);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.use("/api/compliance", apiRoutes);
};
