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
  const [activeTab, setActiveTab] = useState("payslips"); // "payslips" or "salary_structures"

  const [payslips, setPayslips] = useState([]);
  const [summary, setSummary] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState(null);

  // Modal states
  const [activePayslip, setActivePayslip] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
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
      const [payslipsRes, summaryRes, empsRes] = await Promise.all([
        getPayslips({ month: selectedMonth, year: selectedYear }).catch(() => ({ data: [] })),
        getPayrollSummary(selectedMonth, selectedYear).catch(() => ({ data: null })),
        getEmployees().catch(() => []),
      ]);

      setPayslips(payslipsRes.data || []);
      setSummary(summaryRes.data || null);
      setEmployees(empsRes || []);
    } catch (err) {
      console.error("Error loading payroll:", err);
    } finally {
      setLoading(false);
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

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Jira Header with Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#DFE1E6]">
          <div>
            <h1 className="text-xl font-bold text-[#172B4D] flex items-center gap-2">
              <Building2 size={20} className="text-[#0052CC]" />
              <span>Payroll & Statutory Processing</span>
            </h1>
            <p className="text-xs text-[#6B778C] mt-0.5">
              greytHR Compliant Salary Engine • EPF, ESIC, Professional Tax, and Payslip Generation
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
            2. JIRA TABS BAR
            ======================================================== */}
        <div className="flex items-center gap-2 border-b border-[#DFE1E6] pb-2">
          <button
            onClick={() => setActiveTab("payslips")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "payslips"
                ? "bg-[#EBECF0] text-[#172B4D] font-bold"
                : "text-[#42526E] hover:bg-[#EBECF0]"
            }`}
          >
            <FileText size={14} />
            <span>Monthly Payslips Roster ({payslips.length})</span>
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
            <span>Salary Structures & CTC Directory</span>
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

              {/* Search Bar */}
              <div className="relative">
                <Search size={14} className="text-[#6B778C] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter employee or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[#FAFBFC] border border-[#DFE1E6] rounded text-xs outline-none focus:border-[#0052CC] w-64 text-[#172B4D]"
                />
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
                            >
                              <FileText size={12} />
                              <span>View Payslip</span>
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

        {/* Modal: View greytHR Printable Payslip */}
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
      </div>
    </DashboardLayout>
  );
}

export default Payroll;
