const express = require("express");
const apiRoutes = express.Router();
const Employee = require("../models/employees.model");
const SalaryStructure = require("../models/salaryStructure.model");
const Payroll = require("../models/payroll.model");
const Leaves = require("../models/leave.model");
const Attendance = require("../models/attendance.model");
const Loan = require("../models/loan.model");

// Month names helper
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Helper: Convert Number to Indian English Words
function numberToIndianWords(number) {
  const num = Math.round(number);
  if (num === 0) return "Rupees Zero Only";

  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const inWords = (n) => {
    let str = "";
    if (n > 99) {
      str += a[Math.floor(n / 100)] + "Hundred ";
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + " " + a[n % 10];
    } else {
      str += a[n];
    }
    return str;
  };

  let n = ("000000000" + num).substr(-9);
  let crore = parseInt(n.substr(0, 2), 10);
  let lakh = parseInt(n.substr(2, 2), 10);
  let thousand = parseInt(n.substr(4, 2), 10);
  let hundreds = parseInt(n.substr(6, 3), 10);

  let res = "Rupees ";
  if (crore > 0) res += inWords(crore) + "Crore ";
  if (lakh > 0) res += inWords(lakh) + "Lakh ";
  if (thousand > 0) res += inWords(thousand) + "Thousand ";
  if (hundreds > 0) res += inWords(hundreds);

  return res.trim() + " Only";
}

// Helper: Get or create default salary structure
async function getOrCreateSalaryStructure(employeeId, customCtc = 600000) {
  let struct = await SalaryStructure.findOne({ employeeId });
  if (!struct) {
    const monthlyCtc = Math.round(customCtc / 12);
    const basicSalary = Math.round(monthlyCtc * 0.45);
    const hra = Math.round(basicSalary * 0.5);
    const conveyance = 1600;
    const medicalAllowance = 1250;
    const specialAllowance = Math.max(
      0,
      monthlyCtc - (basicSalary + hra + conveyance + medicalAllowance)
    );

    struct = await SalaryStructure.create({
      employeeId,
      annualCtc: customCtc,
      monthlyCtc,
      basicSalary,
      hra,
      conveyance,
      medicalAllowance,
      specialAllowance,
      epfApplicable: true,
      epfCapped: true,
      esiApplicable: monthlyCtc <= 21000,
      ptApplicable: true,
      tdsMonthly: monthlyCtc > 50000 ? Math.round(monthlyCtc * 0.05) : 0,
      taxRegime: "New",
    });
  }
  return struct;
}

module.exports = function (app) {
  /* ==========================================================
     GET ALL SALARY STRUCTURES
     ========================================================== */
  apiRoutes.get("/salary-structures", async (req, res) => {
    try {
      const structures = await SalaryStructure.find().sort({ employeeId: 1 });
      return res.status(200).json({ success: true, count: structures.length, data: structures });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     GET SALARY STRUCTURE FOR EMPLOYEE
     ========================================================== */
  apiRoutes.get("/salary-structure/:employeeId", async (req, res) => {
    try {
      const { employeeId } = req.params;
      const struct = await getOrCreateSalaryStructure(employeeId);
      return res.status(200).json({ success: true, data: struct });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     UPDATE OR CREATE SALARY STRUCTURE
     ========================================================== */
  apiRoutes.post("/salary-structure", async (req, res) => {
    try {
      const {
        employeeId,
        annualCtc,
        basicSalary,
        hra,
        conveyance,
        medicalAllowance,
        specialAllowance,
        epfApplicable,
        epfCapped,
        esiApplicable,
        ptApplicable,
        tdsMonthly,
        taxRegime,
      } = req.body;

      if (!employeeId || !annualCtc) {
        return res
          .status(400)
          .json({ success: false, error: "employeeId and annualCtc are required." });
      }

      const monthlyCtc = Math.round(annualCtc / 12);
      const computedBasic = basicSalary || Math.round(monthlyCtc * 0.45);
      const computedHra = hra || Math.round(computedBasic * 0.5);
      const computedConv = conveyance ?? 1600;
      const computedMed = medicalAllowance ?? 1250;
      const computedSpecial =
        specialAllowance ??
        Math.max(0, monthlyCtc - (computedBasic + computedHra + computedConv + computedMed));

      const updated = await SalaryStructure.findOneAndUpdate(
        { employeeId },
        {
          annualCtc,
          monthlyCtc,
          basicSalary: computedBasic,
          hra: computedHra,
          conveyance: computedConv,
          medicalAllowance: computedMed,
          specialAllowance: computedSpecial,
          epfApplicable: epfApplicable ?? true,
          epfCapped: epfCapped ?? true,
          esiApplicable: esiApplicable ?? monthlyCtc <= 21000,
          ptApplicable: ptApplicable ?? true,
          tdsMonthly: tdsMonthly ?? 0,
          taxRegime: taxRegime || "New",
        },
        { upsert: true, new: true }
      );

      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     RUN MONTHLY PAYROLL BATCH (PROCESS ALL ACTIVE EMPLOYEES)
     ========================================================== */
  apiRoutes.post("/run", async (req, res) => {
    try {
      const { month, year, processedBy } = req.body;
      const m = parseInt(month, 10) || new Date().getMonth() + 1;
      const y = parseInt(year, 10) || new Date().getFullYear();

      // Total days in month
      const totalDaysInMonth = new Date(y, m, 0).getDate();
      const periodString = `${MONTH_NAMES[m - 1]} ${y}`;

      const employees = await Employee.find({ isActive: true });
      if (!employees || employees.length === 0) {
        return res
          .status(400)
          .json({ success: false, error: "No active employees found to process." });
      }

      const results = [];

      for (const emp of employees) {
        // Fetch or create salary structure
        const defaultCtc =
          emp.designation?.includes("Director") || emp.designation?.includes("Admin")
            ? 1200000
            : emp.designation?.includes("Lead") || emp.designation?.includes("Manager")
            ? 840000
            : 600000;

        const struct = await getOrCreateSalaryStructure(emp.employeeId, defaultCtc);

        // Calculate LOP days for this employee in this month
        // 1. Approved LOP leaves
        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0, 23, 59, 59);

        const lopLeaves = await Leaves.find({
          employeeId: emp.employeeId,
          status: "Approved",
          leaveType: "lop",
          fromDate: { $lte: endDate },
          toDate: { $gte: startDate },
        });

        let lopDays = 0;
        lopLeaves.forEach((l) => {
          lopDays += l.daysCount || 1;
        });

        // 2. Paid leaves (casual, sick, earned)
        const paidLeaves = await Leaves.find({
          employeeId: emp.employeeId,
          status: "Approved",
          leaveType: { $ne: "lop" },
          fromDate: { $lte: endDate },
          toDate: { $gte: startDate },
        });

        let paidLeaveDays = 0;
        paidLeaves.forEach((l) => {
          paidLeaveDays += l.daysCount || 1;
        });

        const payableDays = Math.max(0, totalDaysInMonth - lopDays);
        const workedDays = Math.max(0, payableDays - paidLeaveDays);

        // Earnings
        const basic = struct.basicSalary;
        const hra = struct.hra;
        const conveyance = struct.conveyance;
        const medicalAllowance = struct.medicalAllowance;
        const specialAllowance = struct.specialAllowance;
        const grossEarnings = basic + hra + conveyance + medicalAllowance + specialAllowance;

        // Statutory Deductions
        // EPF: 12% of basic, capped at 1800 if epfCapped is true
        let epf = 0;
        if (struct.epfApplicable) {
          const rawEpf = Math.round(basic * 0.12);
          epf = struct.epfCapped ? Math.min(1800, rawEpf) : rawEpf;
        }

        // ESI: 0.75% of gross if gross <= 21000
        let esi = 0;
        if (struct.esiApplicable || grossEarnings <= 21000) {
          esi = Math.round(grossEarnings * 0.0075);
        }

        // Professional Tax: standard Rs 200
        const professionalTax = struct.ptApplicable ? 200 : 0;

        // TDS
        const tds = struct.tdsMonthly || 0;

        // LOP Deduction
        const perDaySalary = grossEarnings / totalDaysInMonth;
        const lopDeduction = Math.round(perDaySalary * lopDays);

        // Active Loan / Salary Advance EMI Auto-Deduction
        const activeLoan = await Loan.findOne({
          employeeId: emp.employeeId,
          status: "Active",
          remainingBalance: { $gt: 0 },
        });

        let loanAdvance = 0;
        if (activeLoan) {
          loanAdvance = Math.min(activeLoan.remainingBalance, activeLoan.monthlyEmi || 0);
          activeLoan.totalRepaid = (activeLoan.totalRepaid || 0) + loanAdvance;
          activeLoan.remainingBalance = Math.max(0, activeLoan.remainingBalance - loanAdvance);
          if (activeLoan.remainingBalance === 0) activeLoan.status = "Fully_Paid";
          activeLoan.repayments.push({
            repaymentId: "REP-" + Date.now(),
            month: m,
            year: y,
            amountPaid: loanAdvance,
            emiIndex: (activeLoan.repayments?.length || 0) + 1,
            payslipId: `PAY-${y}${String(m).padStart(2, "0")}-${emp.employeeId}`,
            deductedAt: new Date(),
            mode: "Payroll Auto-Deduction",
          });
          await activeLoan.save();
        }

        const totalDeductions = epf + esi + professionalTax + tds + lopDeduction + loanAdvance;
        const netPay = Math.max(0, grossEarnings - totalDeductions);
        const netPayInWords = numberToIndianWords(netPay);

        const payslipId = `PAY-${y}${String(m).padStart(2, "0")}-${emp.employeeId}`;

        const payrollRecord = await Payroll.findOneAndUpdate(
          { employeeId: emp.employeeId, month: m, year: y },
          {
            payslipId,
            month: m,
            year: y,
            periodString,
            employeeId: emp.employeeId,
            employeeName: emp.name,
            designation: emp.designation,
            department: emp.department,
            dateOfJoining: emp.dateOfJoining || "2024-01-15",
            bankDetails: {
              bankName: emp.bankDetails?.bankName || "HDFC Bank",
              accountNumber: emp.bankDetails?.accountNumber || "50100234567890",
              ifscCode: emp.bankDetails?.ifscCode || "HDFC0000123",
            },
            statutoryDetails: {
              panNumber: emp.statutoryDetails?.panNumber || "ABCDE1234F",
              uanNumber: emp.statutoryDetails?.uanNumber || "101234567890",
              pfNumber: emp.statutoryDetails?.pfNumber || "MH/BAN/0012345/000/0001",
              esiNumber: emp.statutoryDetails?.esiNumber || "31000123450000001",
            },
            attendanceSummary: {
              totalDays: totalDaysInMonth,
              workedDays,
              paidLeaveDays,
              lopDays,
              payableDays,
            },
            earnings: {
              basic,
              hra,
              conveyance,
              medicalAllowance,
              specialAllowance,
              grossEarnings,
            },
            deductions: {
              epf,
              esi,
              professionalTax,
              tds,
              lopDeduction,
              loanAdvance,
              totalDeductions,
            },
            netPay,
            netPayInWords,
            status: "Processed",
            processedBy: processedBy || "Admin User",
            processedAt: new Date(),
          },
          { upsert: true, new: true }
        );

        results.push(payrollRecord);
      }

      return res.status(200).json({
        success: true,
        message: `Payroll processed successfully for ${periodString}. ${results.length} payslips generated.`,
        data: results,
      });
    } catch (err) {
      console.error("Payroll run error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     GET PAYSLIPS LIST
     ========================================================== */
  apiRoutes.get("/payslips", async (req, res) => {
    try {
      const { employeeId, month, year, status } = req.query;
      const query = {};

      if (employeeId) query.employeeId = employeeId;
      if (month) query.month = parseInt(month, 10);
      if (year) query.year = parseInt(year, 10);
      if (status) query.status = status;

      const payslips = await Payroll.find(query).sort({ year: -1, month: -1, employeeName: 1 });
      return res.status(200).json({ success: true, data: payslips });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     GET INDIVIDUAL PAYSLIP BY ID
     ========================================================== */
  apiRoutes.get("/payslips/:payslipId", async (req, res) => {
    try {
      const { payslipId } = req.params;
      const payslip = await Payroll.findOne({ payslipId });
      if (!payslip) {
        return res.status(404).json({ success: false, error: "Payslip not found." });
      }
      return res.status(200).json({ success: true, data: payslip });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     UPDATE PAYSLIP STATUS (e.g. RELEASE / PAID)
     ========================================================== */
  apiRoutes.patch("/payslips/:payslipId/status", async (req, res) => {
    try {
      const { payslipId } = req.params;
      const { status } = req.body;
      const payslip = await Payroll.findOneAndUpdate(
        { payslipId },
        { status },
        { new: true }
      );
      if (!payslip) {
        return res.status(404).json({ success: false, error: "Payslip not found." });
      }
      return res.status(200).json({ success: true, data: payslip });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     GET PAYROLL SUMMARY METRICS FOR GIVEN MONTH & YEAR
     ========================================================== */
  apiRoutes.get("/summary", async (req, res) => {
    try {
      const m = parseInt(req.query.month, 10) || new Date().getMonth() + 1;
      const y = parseInt(req.query.year, 10) || new Date().getFullYear();

      const payslips = await Payroll.find({ month: m, year: y });

      let totalGross = 0;
      let totalDeductions = 0;
      let totalNet = 0;
      let totalEpf = 0;
      let totalEsi = 0;
      let totalPt = 0;
      let totalTds = 0;

      payslips.forEach((p) => {
        totalGross += p.earnings?.grossEarnings || 0;
        totalDeductions += p.deductions?.totalDeductions || 0;
        totalNet += p.netPay || 0;
        totalEpf += p.deductions?.epf || 0;
        totalEsi += p.deductions?.esi || 0;
        totalPt += p.deductions?.professionalTax || 0;
        totalTds += p.deductions?.tds || 0;
      });

      return res.status(200).json({
        success: true,
        data: {
          periodString: `${MONTH_NAMES[m - 1]} ${y}`,
          month: m,
          year: y,
          totalEmployees: payslips.length,
          totalGross,
          totalDeductions,
          totalNet,
          totalEpf,
          totalEsi,
          totalPt,
          totalTds,
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.use("/api/payroll", apiRoutes);
};
