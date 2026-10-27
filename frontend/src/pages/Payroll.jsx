import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  getPayslips,
  runMonthlyPayroll,
  getPayrollSummary,
  updatePayslipStatus,
  saveSalaryStructure,
} from "../services/payroll";
import { getEmployees } from "../services/employee";
import PayslipModal from "../components/PayslipModal";
import SettlementModal from "../components/SettlementModal";
import TaxDeclarationModal from "../components/TaxDeclarationModal";
import LoanModal from "../components/LoanModal";
import CtcCalculatorModal from "../components/CtcCalculatorModal";
import { getLoans } from "../services/loan";
import {
  getComplianceSummary,
  downloadEpfoEcr,
  downloadEsicReturn,
  downloadBankDisbursement,
} from "../services/compliance";
import { getSettlements, initiateSettlement } from "../services/settlement";
import { getAllTaxDeclarations, verifyTaxDeclaration } from "../services/tax";
import { printPayslip } from "../utils/payslipPrinter";
import { exportToCsv } from "../utils/csvExporter";
import toast from "react-hot-toast";
import {
  DollarSign,
  Play,
  FileText,
  Building2,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Percent,
  TrendingUp,
  X,
  Edit2,
  Search,
  Download,
  FileSpreadsheet,
  UserMinus,
  FileCheck,
  ExternalLink,
  Plus,
  CreditCard,
  Calculator,
} from "lucide-react";

const MONTHS = [
  { val: 1, name: "January" },
  { val: 2, name: "February" },
  { val: 3, name: "March" },
  { val: 4, name: "April" },
  { val: 5, name: "May" },
  { val: 6, name: "June" },
  { val: 7, name: "July" },
  { val: 8, name: "August" },
  { val: 9, name: "September" },
  { val: 10, name: "October" },
  { val: 11, name: "November" },
  { val: 12, name: "December" },
];

function Payroll() {
  const { user } = useAuth();

  const [selectedMonth, setSelectedMonth] = useState(10); // Default October
  const [selectedYear, setSelectedYear] = useState(2026);
  const [activeTab, setActiveTab] = useState("payslips"); // "payslips", "salary_structures", "compliance", "settlements", "tax_declarations"

  const [payslips, setPayslips] = useState([]);
  const [summary, setSummary] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [complianceSummary, setComplianceSummary] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [taxDeclarations, setTaxDeclarations] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState(null);

  // Modal states
  const [activePayslip, setActivePayslip] = useState(null);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showCtcCalculator, setShowCtcCalculator] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [activeSettlement, setActiveSettlement] = useState(null);
  const [activeTaxEmp, setActiveTaxEmp] = useState(null);
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [initEmpId, setInitEmpId] = useState("");
  const [initResignDate, setInitResignDate] = useState(new Date().toISOString().split("T")[0]);
  const [initLwdDate, setInitLwdDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [initNoticeDays, setInitNoticeDays] = useState(30);

  const [editCtc, setEditCtc] = useState(600000);
  const [editRegime, setEditRegime] = useState("New");

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  const formatCurrency = (val = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const loadPayrollData = async () => {
    try {
      setLoading(true);
      const [payslipsRes, summaryRes, empsRes, compRes, settleRes, taxRes, loansRes] = await Promise.all([
        getPayslips({ month: selectedMonth, year: selectedYear }).catch(() => ({ data: [] })),
        getPayrollSummary(selectedMonth, selectedYear).catch(() => ({ data: null })),
        getEmployees().catch(() => []),
        getComplianceSummary(selectedMonth, selectedYear).catch(() => ({ data: null })),
        getSettlements().catch(() => ({ data: [] })),
        getAllTaxDeclarations("2024-2025").catch(() => ({ data: [] })),
        getLoans().catch(() => ({ data: [] })),
      ]);

      setPayslips(payslipsRes.data || []);
      setSummary(summaryRes.data || null);
      setEmployees(empsRes || []);
      setComplianceSummary(compRes?.data || null);
      setSettlements(settleRes?.data || []);
      setTaxDeclarations(taxRes?.data || []);
      setLoans(loansRes?.data || []);
    } catch (err) {
      console.error("Error loading payroll:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateSettlement = async (e) => {
    e.preventDefault();
    if (!initEmpId) {
      toast.error("Please select an employee");
      return;
    }
    try {
      await initiateSettlement({
        employeeId: initEmpId,
        resignationDate: initResignDate,
        lastWorkingDate: initLwdDate,
        noticePeriodDays: Number(initNoticeDays),
        servedNoticeDays: Number(initNoticeDays),
        initiatedBy: user?.name || "HR Admin",
      });
      toast.success("Full & Final separation settlement initiated successfully");
      setShowInitiateModal(false);
      await loadPayrollData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to initiate settlement");
    }
  };

  const handleVerifyDeclaration = async (decId, nextStatus) => {
    try {
      await verifyTaxDeclaration({
        declarationId: decId,
        status: nextStatus,
        verifiedBy: user?.name || "HR Admin",
        adminRemarks: `Approved by HR Admin on ${new Date().toLocaleDateString("en-IN")}`,
      });
      toast.success(`Form 12BB tax declaration marked as ${nextStatus}`);
      await loadPayrollData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Verification failed");
    }
  };

  useEffect(() => {
    loadPayrollData();
  }, [selectedMonth, selectedYear]);

  // Run Batch Payroll
  const handleRunPayroll = async () => {
    try {
      setRunning(true);
      setMessage(null);
      const res = await runMonthlyPayroll(selectedMonth, selectedYear, user?.name || "Admin User");
      setMessage({ type: "success", text: res.message || "Payroll processed successfully." });
      await loadPayrollData();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || err.message });
    } finally {
      setRunning(false);
    }
  };

  // Mark as Paid
  const handleMarkPaid = async (payslipId) => {
    try {
      await updatePayslipStatus(payslipId, "Paid");
      await loadPayrollData();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Open Edit CTC Modal
  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setEditCtc(
      emp.designation?.includes("Director") || emp.designation?.includes("Admin")
        ? 1200000
        : emp.designation?.includes("Lead") || emp.designation?.includes("Manager")
        ? 840000
        : 600000
    );
    setEditRegime("New");
  };

  // Save Salary Structure
  const handleSaveStructure = async () => {
    if (!editingEmployee) return;
    try {
      await saveSalaryStructure({
        employeeId: editingEmployee.employeeId,
        annualCtc: editCtc,
        taxRegime: editRegime,
      });
      setEditingEmployee(null);
      await loadPayrollData();
    } catch (err) {
      console.error("Failed to save salary structure:", err);
    }
  };

  // Filtered payslips
  const filteredPayslips = payslips.filter(
    (p) =>
      p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportPayrollCsv = () => {
    const monthName = MONTHS.find((m) => m.val === selectedMonth)?.name || "Month";
    exportToCsv({
      filename: `Staffify_Payroll_Register_${monthName}_${selectedYear}.csv`,
      headers: [
        { key: "payslipId", label: "Payslip ID" },
        { key: "employeeId", label: "Employee ID" },
        { key: "employeeName", label: "Employee Name" },
        { key: "designation", label: "Designation" },
        { key: "department", label: "Department" },
        {
          key: "payableDays",
          label: "Payable Days",
          accessor: (item) => item.attendanceSummary?.payableDays || 0,
        },
        {
          key: "grossEarnings",
          label: "Gross Earnings (INR)",
          accessor: (item) => item.earnings?.grossEarnings || 0,
        },
        {
          key: "totalDeductions",
          label: "Total Deductions (INR)",
          accessor: (item) => item.deductions?.totalDeductions || 0,
        },
        { key: "netPay", label: "Net Take-Home (INR)" },
        { key: "status", label: "Disbursement Status" },
      ],
      data: filteredPayslips,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header with Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#DFE1E6]">
          <div>
            <h1 className="text-xl font-bold text-[#172B4D] flex items-center gap-2">
              <Building2 size={20} className="text-[#0052CC]" />
              <span>Payroll & Statutory Processing</span>
            </h1>
            <p className="text-xs text-[#6B778C] mt-0.5">
              Staffify Compliant Salary Engine • EPF, ESIC, Professional Tax, and Payslip Generation
            </p>
          </div>

          {/* Month, Year & Action Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-white border border-[#DFE1E6] rounded px-3 py-1.5 text-xs font-semibold text-[#172B4D] outline-none cursor-pointer hover:border-[#0052CC]"
            >
              {MONTHS.map((m) => (
                <option key={m.val} value={m.val}>
                  {m.name}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white border border-[#DFE1E6] rounded px-3 py-1.5 text-xs font-semibold text-[#172B4D] outline-none cursor-pointer hover:border-[#0052CC]"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>

            <button
              type="button"
              onClick={() => setShowCtcCalculator(true)}
              className="bg-white hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6] px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Calculator size={13} className="text-[#0052CC]" />
              <span>CTC & In-Hand Calculator</span>
            </button>

            <button
              disabled={running}
              onClick={handleRunPayroll}
              className="bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <Play size={13} className="fill-white" />
              <span>{running ? "Processing..." : "Run Monthly Payroll"}</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {message && (
          <div
            className={`p-3 rounded border text-xs font-medium flex items-center justify-between ${
              message.type === "success"
                ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                : "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]"
            }`}
          >
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="text-[#6B778C] hover:text-[#172B4D] p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ========================================================
            1. HIGH-IMPACT PAYROLL SUMMARY KPI CARDS
            ======================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white border border-[#DFE1E6] rounded-md p-4 border-t-3 border-t-[#0052CC] shadow-2xs">
            <span className="text-[11px] font-semibold text-[#6B778C] uppercase tracking-wider block">
              Processed Headcount
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-[#172B4D]">
                {summary?.totalEmployees || payslips.length}
              </span>
              <span className="text-[11px] text-[#0052CC] font-semibold">Active Staff</span>
            </div>
            <p className="text-[11px] text-[#6B778C] mt-2">
              For {MONTHS.find((m) => m.val === selectedMonth)?.name} {selectedYear}
            </p>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-md p-4 border-t-3 border-t-[#00875A] shadow-2xs">
            <span className="text-[11px] font-semibold text-[#6B778C] uppercase tracking-wider block">
              Gross Payroll Payout
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-[#00875A]">
                {formatCurrency(summary?.totalGross || 0)}
              </span>
            </div>
            <p className="text-[11px] text-[#6B778C] mt-2">Pre-deduction earnings total</p>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-md p-4 border-t-3 border-t-[#FF991F] shadow-2xs">
            <span className="text-[11px] font-semibold text-[#6B778C] uppercase tracking-wider block">
              Statutory Deductions
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-[#B9770E]">
                {formatCurrency(summary?.totalDeductions || 0)}
              </span>
            </div>
            <p className="text-[11px] text-[#6B778C] mt-2">
              PF: {formatCurrency(summary?.totalEpf || 0)} • PT:{" "}
              {formatCurrency(summary?.totalPt || 0)}
            </p>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-md p-4 border-t-3 border-t-[#403294] shadow-2xs">
            <span className="text-[11px] font-semibold text-[#6B778C] uppercase tracking-wider block">
              Net Bank Disbursement
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-[#403294]">
                {formatCurrency(summary?.totalNet || 0)}
              </span>
            </div>
            <p className="text-[11px] text-[#00875A] font-semibold mt-2">Direct Bank Transfer</p>
          </div>
        </div>

        {/* ========================================================
            2. PAYROLL TABS BAR
            ======================================================== */}
        <div className="flex items-center gap-2 border-b border-[#DFE1E6] pb-2 flex-wrap">
          <button
            onClick={() => setActiveTab("payslips")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "payslips"
                ? "bg-[#EBECF0] text-[#172B4D] font-bold"
                : "text-[#42526E] hover:bg-[#EBECF0]"
            }`}
          >
            <FileText size={14} />
            <span>Monthly Payslips ({payslips.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("salary_structures")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "salary_structures"
                ? "bg-[#EBECF0] text-[#172B4D] font-bold"
                : "text-[#42526E] hover:bg-[#EBECF0]"
            }`}
          >
            <Percent size={14} />
            <span>Salary Structures & CTC</span>
          </button>

          <button
            onClick={() => setActiveTab("compliance")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "compliance"
                ? "bg-[#EBECF0] text-[#172B4D] font-bold"
                : "text-[#42526E] hover:bg-[#EBECF0]"
            }`}
          >
            <FileSpreadsheet size={14} />
            <span>Statutory Exports (EPFO ECR / ESIC / Bank)</span>
          </button>

          <button
            onClick={() => setActiveTab("settlements")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "settlements"
                ? "bg-[#EBECF0] text-[#172B4D] font-bold"
                : "text-[#42526E] hover:bg-[#EBECF0]"
            }`}
          >
            <UserMinus size={14} />
            <span>Exit & F&F Settlements ({settlements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("tax_declarations")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "tax_declarations"
                ? "bg-[#EBECF0] text-[#172B4D] font-bold"
                : "text-[#42526E] hover:bg-[#EBECF0]"
            }`}
          >
            <FileCheck size={14} />
            <span>IT Declarations Form 12BB ({taxDeclarations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("loans")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "loans"
                ? "bg-[#EBECF0] text-[#172B4D] font-bold"
                : "text-[#42526E] hover:bg-[#EBECF0]"
            }`}
          >
            <CreditCard size={14} />
            <span>Loans & Advances ({loans.length})</span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: MONTHLY PAYSLIPS ROSTER
            ======================================================== */}
        {activeTab === "payslips" && (
          <div className="bg-white border border-[#DFE1E6] rounded-md p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-[#172B4D] text-xs uppercase tracking-wider">
                  Payslip Generation Registry
                </h3>
                <p className="text-[11px] text-[#6B778C]">
                  View, print, and download generated payslips for{" "}
                  {MONTHS.find((m) => m.val === selectedMonth)?.name} {selectedYear}
                </p>
              </div>

              {/* Search Bar & Export CSV */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="text-[#6B778C] absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filter employee or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-[#FAFBFC] border border-[#DFE1E6] rounded text-xs outline-none focus:border-[#0052CC] w-56 text-[#172B4D]"
                  />
                </div>

                <button
                  onClick={handleExportPayrollCsv}
                  disabled={filteredPayslips.length === 0}
                  className="flex items-center gap-1.5 bg-white hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6] rounded px-3 py-1.5 text-xs font-semibold cursor-pointer transition shadow-xs disabled:opacity-50"
                  title="Export monthly payroll register to CSV"
                >
                  <Download size={13} className="text-[#0052CC]" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {filteredPayslips.length === 0 ? (
              <div className="text-center py-10 bg-[#FAFBFC] rounded border border-dashed border-[#DFE1E6]">
                <FileText size={24} className="text-[#6B778C] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#172B4D]">
                  No Payslips Generated For This Month
                </p>
                <p className="text-[11px] text-[#6B778C] mt-1 max-w-sm mx-auto">
                  Click the "Run Monthly Payroll" button at the top right to calculate earnings and
                  generate payslips.
                </p>
                <button
                  onClick={handleRunPayroll}
                  disabled={running}
                  className="mt-3 px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Play size={12} className="fill-white" />
                  <span>Generate Now</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#DFE1E6] rounded">
                <table className="min-w-full text-xs divide-y divide-[#DFE1E6]">
                  <thead className="bg-[#F4F5F7] text-[#6B778C] font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2 text-left">Employee</th>
                      <th className="px-3 py-2 text-left">Payable Days</th>
                      <th className="px-3 py-2 text-right">Gross Earnings</th>
                      <th className="px-3 py-2 text-right">Deductions</th>
                      <th className="px-3 py-2 text-right">Net Take-Home</th>
                      <th className="px-3 py-2 text-center">Status</th>
                      <th className="px-3 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE1E6] bg-white">
                    {filteredPayslips.map((p) => (
                      <tr key={p._id || p.payslipId} className="hover:bg-[#FAFBFC]">
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#DEEBFF] text-[#0052CC] font-bold text-xs flex items-center justify-center shrink-0">
                              {p.employeeName?.charAt(0) || "E"}
                            </div>
                            <div>
                              <p className="font-semibold text-[#172B4D]">{p.employeeName}</p>
                              <p className="text-[10px] text-[#6B778C]">
                                {p.employeeId} • {p.designation}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-2.5 text-[#42526E]">
                          <span className="font-semibold">{p.attendanceSummary?.payableDays}</span>{" "}
                          / {p.attendanceSummary?.totalDays} d
                          {p.attendanceSummary?.lopDays > 0 && (
                            <span className="text-[10px] text-[#DE350B] block">
                              ({p.attendanceSummary.lopDays}d LOP)
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-2.5 text-right font-medium text-[#172B4D]">
                          {formatCurrency(p.earnings?.grossEarnings)}
                        </td>

                        <td className="px-3 py-2.5 text-right font-medium text-[#DE350B]">
                          {formatCurrency(p.deductions?.totalDeductions)}
                        </td>

                        <td className="px-3 py-2.5 text-right font-bold text-[#00875A] text-sm">
                          {formatCurrency(p.netPay)}
                        </td>

                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              p.status === "Paid"
                                ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                                : "bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>

                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setActivePayslip(p)}
                              className="px-2.5 py-1 bg-[#F4F5F7] hover:bg-[#DEEBFF] text-[#0052CC] border border-[#DFE1E6] hover:border-[#B3D4FF] rounded text-xs font-semibold cursor-pointer transition flex items-center gap-1"
                              title="View payslip statement"
                            >
                              <FileText size={12} />
                              <span>View</span>
                            </button>

                            <button
                              onClick={() => printPayslip(p)}
                              className="px-2 py-1 bg-[#F4F5F7] hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6] rounded text-xs font-semibold cursor-pointer transition flex items-center gap-1"
                              title="Print or Save as PDF"
                            >
                              <Download size={12} className="text-[#0052CC]" />
                              <span>PDF</span>
                            </button>

                            {p.status !== "Paid" && (
                              <button
                                onClick={() => handleMarkPaid(p.payslipId)}
                                className="px-2 py-1 bg-[#00875A] hover:bg-[#006644] text-white rounded text-xs font-semibold cursor-pointer transition flex items-center gap-1"
                              >
                                <CheckCircle2 size={12} />
                                <span>Mark Paid</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: SALARY STRUCTURES & CTC DIRECTORY
            ======================================================== */}
        {activeTab === "salary_structures" && (
          <div className="bg-white border border-[#DFE1E6] rounded-md p-4 space-y-4">
            <div>
              <h3 className="font-bold text-[#172B4D] text-xs uppercase tracking-wider">
                Employee Salary Structure Directory
              </h3>
              <p className="text-[11px] text-[#6B778C]">
                Manage CTC packages, statutory configurations, and tax regimes
              </p>
            </div>

            <div className="overflow-x-auto border border-[#DFE1E6] rounded">
              <table className="min-w-full text-xs divide-y divide-[#DFE1E6]">
                <thead className="bg-[#F4F5F7] text-[#6B778C] font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2 text-left">Employee</th>
                    <th className="px-3 py-2 text-left">Designation</th>
                    <th className="px-3 py-2 text-right">Annual CTC</th>
                    <th className="px-3 py-2 text-right">Monthly Gross</th>
                    <th className="px-3 py-2 text-center">Tax Regime</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1E6] bg-white">
                  {employees.map((emp) => {
                    const estCtc =
                      emp.designation?.includes("Director") || emp.designation?.includes("Admin")
                        ? 1200000
                        : emp.designation?.includes("Lead") || emp.designation?.includes("Manager")
                        ? 840000
                        : 600000;

                    return (
                      <tr key={emp._id || emp.employeeId} className="hover:bg-[#FAFBFC]">
                        <td className="px-3 py-2.5 font-semibold text-[#172B4D]">
                          {emp.name}
                          <span className="text-[10px] text-[#6B778C] block font-normal">
                            {emp.employeeId}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-[#42526E]">{emp.designation}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-[#0052CC]">
                          {formatCurrency(estCtc)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold text-[#172B4D]">
                          {formatCurrency(Math.round(estCtc / 12))}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F4F5F7] text-[#172B4D] border border-[#DFE1E6]">
                            New Regime (Default)
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="px-2.5 py-1 bg-[#F4F5F7] hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6] rounded text-xs font-semibold cursor-pointer transition inline-flex items-center gap-1"
                          >
                            <Edit2 size={12} />
                            <span>Edit CTC</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: STATUTORY COMPLIANCE EXPORTS (EPFO ECR, ESIC, BANK)
            ======================================================== */}
        {activeTab === "compliance" && (
          <div className="bg-white border border-[#DFE1E6] rounded-md p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-[#172B4D] text-xs uppercase tracking-wider">
                  Government Statutory Portal Exports
                </h3>
                <p className="text-[11px] text-[#6B778C]">
                  Official EPFO Unified Portal ECR (.txt), ESIC Monthly Return (.csv), and Corporate Bank NEFT Disbursement (.csv) files for {MONTHS.find((m) => m.val === selectedMonth)?.name} {selectedYear}
                </p>
              </div>

              {/* 1-Click Export Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => downloadEpfoEcr(selectedMonth, selectedYear)}
                  className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Download size={13} />
                  <span>EPFO ECR (.txt)</span>
                </button>

                <button
                  onClick={() => downloadEsicReturn(selectedMonth, selectedYear)}
                  className="px-3 py-1.5 bg-[#00875A] hover:bg-[#006644] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Download size={13} />
                  <span>ESIC Return (.csv)</span>
                </button>

                <button
                  onClick={() => downloadBankDisbursement(selectedMonth, selectedYear)}
                  className="px-3 py-1.5 bg-[#403294] hover:bg-[#35297A] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <FileSpreadsheet size={13} />
                  <span>Bank NEFT Batch (.csv)</span>
                </button>
              </div>
            </div>

            {/* Statutory Numbers Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-[#FAFBFC] border border-[#DFE1E6] rounded">
                <span className="text-[10px] uppercase font-bold text-[#6B778C] block">EPF Employee Share (12%)</span>
                <span className="text-base font-bold text-[#0052CC]">
                  {formatCurrency(complianceSummary?.totalEpfEE || 0)}
                </span>
                <p className="text-[10px] text-[#6B778C] mt-0.5">Deducted from staff wages</p>
              </div>

              <div className="p-3 bg-[#FAFBFC] border border-[#DFE1E6] rounded">
                <span className="text-[10px] uppercase font-bold text-[#6B778C] block">Employer EPS Share (8.33%)</span>
                <span className="text-base font-bold text-[#00875A]">
                  {formatCurrency(complianceSummary?.totalEps || 0)}
                </span>
                <p className="text-[10px] text-[#6B778C] mt-0.5">Capped at ₹1,250 / emp</p>
              </div>

              <div className="p-3 bg-[#FAFBFC] border border-[#DFE1E6] rounded">
                <span className="text-[10px] uppercase font-bold text-[#6B778C] block">Employer EPF Share (3.67%)</span>
                <span className="text-base font-bold text-[#FF991F]">
                  {formatCurrency(complianceSummary?.totalEpfER || 0)}
                </span>
                <p className="text-[10px] text-[#6B778C] mt-0.5">Direct company contribution</p>
              </div>

              <div className="p-3 bg-[#FAFBFC] border border-[#DFE1E6] rounded">
                <span className="text-[10px] uppercase font-bold text-[#6B778C] block">Total EPFO Remittance</span>
                <span className="text-base font-bold text-[#403294]">
                  {formatCurrency(complianceSummary?.totalEpfOverall || 0)}
                </span>
                <p className="text-[10px] text-[#6B778C] mt-0.5">Account 1, 2, 10 & 21 Total</p>
              </div>
            </div>

            {/* Preview Table */}
            <div className="overflow-x-auto border border-[#DFE1E6] rounded">
              <table className="min-w-full text-xs divide-y divide-[#DFE1E6]">
                <thead className="bg-[#F4F5F7] text-[#6B778C] font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2 text-left">Employee Name</th>
                    <th className="px-3 py-2 text-left">Employee ID</th>
                    <th className="px-3 py-2 text-right">Gross Wages</th>
                    <th className="px-3 py-2 text-right">EPF Wages</th>
                    <th className="px-3 py-2 text-right">EE Share (12%)</th>
                    <th className="px-3 py-2 text-right">EPS Share (8.33%)</th>
                    <th className="px-3 py-2 text-right">ER Share (3.67%)</th>
                    <th className="px-3 py-2 text-center">NCP / LOP Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1E6] bg-white">
                  {payslips.map((p) => {
                    const gross = p.earnings?.grossEarnings || 0;
                    const basic = p.earnings?.basic || Math.round(gross * 0.45);
                    const epfWage = Math.min(15000, basic);
                    const eeShare = p.deductions?.epf || Math.round(epfWage * 0.12);
                    const epsShare = Math.min(1250, Math.round(epfWage * 0.0833));
                    const erShare = Math.max(0, eeShare - epsShare);

                    return (
                      <tr key={p._id || p.payslipId} className="hover:bg-[#FAFBFC]">
                        <td className="px-3 py-2.5 font-semibold text-[#172B4D]">{p.employeeName}</td>
                        <td className="px-3 py-2.5 text-[#6B778C] font-mono">{p.employeeId}</td>
                        <td className="px-3 py-2.5 text-right font-medium">{formatCurrency(gross)}</td>
                        <td className="px-3 py-2.5 text-right font-medium text-[#0052CC]">{formatCurrency(epfWage)}</td>
                        <td className="px-3 py-2.5 text-right font-medium text-[#172B4D]">{formatCurrency(eeShare)}</td>
                        <td className="px-3 py-2.5 text-right font-medium text-[#00875A]">{formatCurrency(epsShare)}</td>
                        <td className="px-3 py-2.5 text-right font-medium text-[#FF991F]">{formatCurrency(erShare)}</td>
                        <td className="px-3 py-2.5 text-center text-[#6B778C]">
                          {p.attendanceSummary?.lopDays || 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: EXIT & FULL AND FINAL (F&F) SETTLEMENTS
            ======================================================== */}
        {activeTab === "settlements" && (
          <div className="bg-white border border-[#DFE1E6] rounded-md p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-[#172B4D] text-xs uppercase tracking-wider">
                  Full & Final (F&F) Separation Settlements
                </h3>
                <p className="text-[11px] text-[#6B778C]">
                  Automated gratuity, leave encashment, notice period recovery, and departmental NOC clearance
                </p>
              </div>

              <button
                onClick={() => setShowInitiateModal(true)}
                className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus size={13} />
                <span>Initiate Separation</span>
              </button>
            </div>

            {settlements.length === 0 ? (
              <div className="text-center py-10 bg-[#FAFBFC] rounded border border-dashed border-[#DFE1E6]">
                <UserMinus size={24} className="text-[#6B778C] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#172B4D]">No Active Separation Settlements</p>
                <p className="text-[11px] text-[#6B778C] mt-1 max-w-sm mx-auto">
                  When an employee resigns, click "Initiate Separation" to compute leave encashment and start NOC clearance.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#DFE1E6] rounded">
                <table className="min-w-full text-xs divide-y divide-[#DFE1E6]">
                  <thead className="bg-[#F4F5F7] text-[#6B778C] font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2 text-left">Employee</th>
                      <th className="px-3 py-2 text-left">Resignation Date</th>
                      <th className="px-3 py-2 text-left">Last Working Day</th>
                      <th className="px-3 py-2 text-right">Leave Encashment</th>
                      <th className="px-3 py-2 text-right">Gratuity</th>
                      <th className="px-3 py-2 text-right">Net Payable</th>
                      <th className="px-3 py-2 text-center">Status</th>
                      <th className="px-3 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE1E6] bg-white">
                    {settlements.map((s) => (
                      <tr key={s._id || s.settlementId} className="hover:bg-[#FAFBFC]">
                        <td className="px-3 py-2.5">
                          <p className="font-semibold text-[#172B4D]">{s.employeeName}</p>
                          <p className="text-[10px] text-[#6B778C]">
                            {s.employeeId} • {s.designation}
                          </p>
                        </td>
                        <td className="px-3 py-2.5 text-[#42526E]">
                          {new Date(s.resignationDate).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-3 py-2.5 text-[#42526E]">
                          {new Date(s.lastWorkingDate).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-[#00875A]">
                          {formatCurrency(s.earnings?.leaveEncashmentAmount)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-[#172B4D]">
                          {formatCurrency(s.earnings?.gratuityAmount)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold text-[#006644] text-sm">
                          {formatCurrency(s.netPayable)}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              s.settlementStatus === "Paid"
                                ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                                : s.settlementStatus === "Settled"
                                ? "bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]"
                                : "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]"
                            }`}
                          >
                            {s.settlementStatus.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            onClick={() => setActiveSettlement(s)}
                            className="px-2.5 py-1 bg-[#F4F5F7] hover:bg-[#DEEBFF] text-[#0052CC] border border-[#DFE1E6] rounded text-xs font-semibold cursor-pointer transition flex items-center gap-1 inline-flex"
                          >
                            <ExternalLink size={12} />
                            <span>View Dossier</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 5: IT DECLARATIONS (FORM 12BB) REVIEW
            ======================================================== */}
        {activeTab === "tax_declarations" && (
          <div className="bg-white border border-[#DFE1E6] rounded-md p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-[#172B4D] text-xs uppercase tracking-wider">
                  Employee Form 12BB IT Declarations (FY 2024-2025)
                </h3>
                <p className="text-[11px] text-[#6B778C]">
                  Audit investment proofs, Section 80C, 80D, HRA claims, and verify employee tax regimes
                </p>
              </div>
            </div>

            {taxDeclarations.length === 0 ? (
              <div className="text-center py-10 bg-[#FAFBFC] rounded border border-dashed border-[#DFE1E6]">
                <FileCheck size={24} className="text-[#6B778C] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#172B4D]">No Declarations Submitted Yet</p>
                <p className="text-[11px] text-[#6B778C] mt-1 max-w-sm mx-auto">
                  Employees can submit Form 12BB declarations directly from their Payslips & Salary self-service portal.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#DFE1E6] rounded">
                <table className="min-w-full text-xs divide-y divide-[#DFE1E6]">
                  <thead className="bg-[#F4F5F7] text-[#6B778C] font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2 text-left">Employee</th>
                      <th className="px-3 py-2 text-center">Tax Regime</th>
                      <th className="px-3 py-2 text-right">Declared 80C</th>
                      <th className="px-3 py-2 text-right">Declared 80D</th>
                      <th className="px-3 py-2 text-right">Annual Rent</th>
                      <th className="px-3 py-2 text-right">Est. Tax Savings</th>
                      <th className="px-3 py-2 text-center">Verification</th>
                      <th className="px-3 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE1E6] bg-white">
                    {taxDeclarations.map((d) => (
                      <tr key={d._id || d.declarationId} className="hover:bg-[#FAFBFC]">
                        <td className="px-3 py-2.5 font-semibold text-[#172B4D]">
                          {d.employeeName}
                          <span className="text-[10px] text-[#6B778C] block font-normal">{d.employeeId}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAE6FF] text-[#403294] border border-[#C0B6F2]">
                            {d.regime} Regime
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-[#0052CC]">
                          {formatCurrency(d.section80C?.total80C || 0)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-[#00875A]">
                          {formatCurrency(d.section80D?.total80D || 0)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-[#172B4D]">
                          {formatCurrency(d.hraDetails?.annualRent || 0)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold text-[#006644]">
                          {formatCurrency(d.taxEstimate?.taxSavings || 0)}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              d.status === "Verified"
                                ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                                : d.status === "Submitted"
                                ? "bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]"
                                : "bg-[#F4F5F7] text-[#172B4D] border-[#DFE1E6]"
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setActiveTaxEmp(d)}
                              className="px-2 py-1 bg-white hover:bg-[#EBECF0] border border-[#DFE1E6] rounded text-xs font-semibold cursor-pointer"
                            >
                              Inspect
                            </button>
                            {d.status !== "Verified" && (
                              <button
                                onClick={() => handleVerifyDeclaration(d.declarationId, "Verified")}
                                className="px-2 py-1 bg-[#00875A] hover:bg-[#006644] text-white rounded text-xs font-semibold cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 6: EMPLOYEE LOANS & SALARY ADVANCES
            ======================================================== */}
        {activeTab === "loans" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-[#DFE1E6]">
              <div>
                <h3 className="font-bold text-sm text-[#172B4D]">
                  Employee Loans & Salary Advance Ledger
                </h3>
                <p className="text-xs text-[#6B778C]">
                  Zero-interest salary advances recovered automatically via monthly payroll EMI deductions
                </p>
              </div>

              <button
                onClick={() => setShowLoanModal(true)}
                className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                <span>Issue Salary Advance</span>
              </button>
            </div>

            <div className="bg-white border border-[#DFE1E6] rounded-lg overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F5F7] text-[#42526E] font-bold uppercase text-[10px] border-b border-[#DFE1E6]">
                  <tr>
                    <th className="px-3 py-2.5">Loan ID</th>
                    <th className="px-3 py-2.5">Employee</th>
                    <th className="px-3 py-2.5">Loan Type</th>
                    <th className="px-3 py-2.5 text-right">Principal</th>
                    <th className="px-3 py-2.5 text-right">Monthly EMI</th>
                    <th className="px-3 py-2.5 text-right">Repaid</th>
                    <th className="px-3 py-2.5 text-right">Remaining Balance</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1E6]">
                  {loans.length > 0 ? (
                    loans.map((loan) => (
                      <tr key={loan._id || loan.loanId} className="hover:bg-[#FAFBFC] transition">
                        <td className="px-3 py-2.5 font-mono font-bold text-[#172B4D]">{loan.loanId}</td>
                        <td className="px-3 py-2.5">
                          <p className="font-semibold text-[#172B4D]">{loan.employeeName}</p>
                          <p className="text-[10px] text-[#6B778C]">{loan.department} • {loan.employeeId}</p>
                        </td>
                        <td className="px-3 py-2.5">{loan.loanType}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-[#172B4D]">{formatCurrency(loan.principalAmount)}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-[#0052CC]">{formatCurrency(loan.monthlyEmi)}/mo</td>
                        <td className="px-3 py-2.5 text-right font-bold text-[#00875A]">{formatCurrency(loan.totalRepaid)}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-[#DE350B]">{formatCurrency(loan.remainingBalance)}</td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            loan.status === "Active" ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]" : "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]"
                          }`}>
                            {loan.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            onClick={() => setShowLoanModal(true)}
                            className="px-2 py-1 bg-white hover:bg-[#EBECF0] border border-[#DFE1E6] rounded text-xs font-semibold cursor-pointer"
                          >
                            Inspect Ledger
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-xs text-[#6B778C]">
                        No loans or salary advances currently registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Salary Advance Management */}
        {showLoanModal && (
          <LoanModal
            isOpen={showLoanModal}
            onClose={() => setShowLoanModal(false)}
            onSuccess={loadPayrollData}
          />
        )}

        {/* Modal: View Staffify Printable Payslip */}
        {activePayslip && (
          <PayslipModal payslip={activePayslip} onClose={() => setActivePayslip(null)} />
        )}

        {/* Modal: Edit CTC Configuration */}
        {editingEmployee && (
          <div className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl border border-[#DFE1E6] w-full max-w-md overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#DFE1E6] flex items-center justify-between">
                <h3 className="font-bold text-[#172B4D] text-sm">
                  Configure CTC: {editingEmployee.name}
                </h3>
                <button
                  onClick={() => setEditingEmployee(null)}
                  className="p-1 rounded text-[#6B778C] hover:bg-[#EBECF0]"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">
                    Annual CTC Amount (INR ₹)
                  </label>
                  <input
                    type="number"
                    value={editCtc}
                    onChange={(e) => setEditCtc(Number(e.target.value))}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                  <p className="text-[11px] text-[#6B778C] mt-1">
                    Monthly Gross: {formatCurrency(Math.round(editCtc / 12))}
                  </p>
                </div>

                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">Tax Regime</label>
                  <select
                    value={editRegime}
                    onChange={(e) => setEditRegime(e.target.value)}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  >
                    <option value="New">New Tax Regime (Section 115BAC)</option>
                    <option value="Old">Old Tax Regime (With Deductions)</option>
                  </select>
                </div>

                <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded p-2.5 space-y-1 text-[11px]">
                  <p className="font-semibold text-[#172B4D]">Auto-Computed Monthly Breakdown:</p>
                  <div className="flex justify-between">
                    <span>Basic (45%):</span>
                    <span className="font-semibold">
                      {formatCurrency(Math.round((editCtc / 12) * 0.45))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>HRA (50% of Basic):</span>
                    <span className="font-semibold">
                      {formatCurrency(Math.round((editCtc / 12) * 0.45 * 0.5))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>EPF (12% capped):</span>
                    <span className="font-semibold">
                      {formatCurrency(Math.min(1800, Math.round((editCtc / 12) * 0.45 * 0.12)))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Professional Tax:</span>
                    <span className="font-semibold">₹200</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingEmployee(null)}
                    className="px-3 py-1.5 border border-[#DFE1E6] rounded text-xs text-[#172B4D] hover:bg-[#EBECF0]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveStructure}
                    className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold"
                  >
                    Save & Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Settlement Dossier */}
        {activeSettlement && (
          <SettlementModal
            isOpen={!!activeSettlement}
            onClose={() => setActiveSettlement(null)}
            settlement={activeSettlement}
            onUpdated={loadPayrollData}
          />
        )}

        {/* Modal: Tax Declaration Modal */}
        {activeTaxEmp && (
          <TaxDeclarationModal
            isOpen={!!activeTaxEmp}
            onClose={() => setActiveTaxEmp(null)}
            employeeId={activeTaxEmp.employeeId}
            employeeName={activeTaxEmp.employeeName}
            annualCtc={activeTaxEmp.taxEstimate?.grossAnnualIncome || 600000}
          />
        )}

        {/* Modal: Initiate Separation Dialog */}
        {showInitiateModal && (
          <div className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl border border-[#DFE1E6] w-full max-w-md overflow-hidden animate-in fade-in duration-150">
              <div className="px-5 py-3.5 border-b border-[#DFE1E6] flex items-center justify-between bg-[#FAFBFC]">
                <h3 className="font-bold text-[#172B4D] text-sm">Initiate Employee Separation</h3>
                <button
                  onClick={() => setShowInitiateModal(false)}
                  className="p-1 rounded text-[#6B778C] hover:bg-[#EBECF0]"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleInitiateSettlement} className="p-4 space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">Select Resigning Employee</label>
                  <select
                    value={initEmpId}
                    onChange={(e) => setInitEmpId(e.target.value)}
                    required
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp.employeeId} value={emp.employeeId}>
                        {emp.name} ({emp.employeeId}) • {emp.designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-semibold text-[#172B4D] block mb-1">Resignation Date</label>
                    <input
                      type="date"
                      required
                      value={initResignDate}
                      onChange={(e) => setInitResignDate(e.target.value)}
                      className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#172B4D] block mb-1">Last Working Day</label>
                    <input
                      type="date"
                      required
                      value={initLwdDate}
                      onChange={(e) => setInitLwdDate(e.target.value)}
                      className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">Notice Period (Days)</label>
                  <input
                    type="number"
                    value={initNoticeDays}
                    onChange={(e) => setInitNoticeDays(Number(e.target.value))}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                  <p className="text-[10px] text-[#6B778C] mt-1">
                    System will auto-calculate Gratuity, Leave Encashment, and any Notice Shortfall deduction.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#DFE1E6]">
                  <button
                    type="button"
                    onClick={() => setShowInitiateModal(false)}
                    className="px-3 py-1.5 border border-[#DFE1E6] rounded text-xs text-[#172B4D] hover:bg-[#EBECF0]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    Initiate F&F
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Interactive CTC & Take-Home Calculator Modal */}
        <CtcCalculatorModal
          isOpen={showCtcCalculator}
          onClose={() => setShowCtcCalculator(false)}
        />
      </div>
    </DashboardLayout>
  );
}

export default Payroll;
