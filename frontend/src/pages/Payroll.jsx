import React, { useEffect, useState } from "react";
import {
  Banknote,
  Plus,
  CheckCircle2,
  Lock,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building,
  TrendingDown,
  TrendingUp,
  X,
  FileSpreadsheet,
} from "lucide-react";
import KpiMetricCard from "../components/KpiMetricCard";
import StatusLozenge from "../components/StatusLozenge";
import PayslipModal from "../components/payroll/PayslipModal";
import { payrollApi, musterRollApi } from "../services/api";
import toast from "react-hot-toast";

function Payroll() {
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalGross: 0, totalNet: 0, totalDeductions: 0, totalRuns: 0 });

  // Modals
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Available muster rolls to run payroll against
  const [approvedMusterRolls, setApprovedMusterRolls] = useState([]);
  const [selectedMusterRollId, setSelectedMusterRollId] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const [pRes, mrRes] = await Promise.all([
        payrollApi.getAll(),
        musterRollApi.getAll(),
      ]);
      setPayrollRuns(pRes.data.data || []);
      if (pRes.data.stats) setStats(pRes.data.stats);
      if (pRes.data.data?.length > 0) {
        setSelectedPayroll(pRes.data.data[0]);
      }
      setApprovedMusterRolls(mrRes.data.data || []);
      if (mrRes.data.data?.length > 0) {
        setSelectedMusterRollId(mrRes.data.data[0].musterRollId);
      }
    } catch (err) {
      console.error("Failed to load payroll records:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunPayroll = async (e) => {
    e.preventDefault();
    if (!selectedMusterRollId) {
      toast.error("Please select an approved muster roll.");
      return;
    }

    try {
      setIsRunning(true);
      const res = await payrollApi.runPayroll({ musterRollId: selectedMusterRollId });
      toast.success(res.data.message || "Payroll calculated successfully!");
      setIsRunModalOpen(false);
      fetchPayrollData();
      setSelectedPayroll(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to calculate payroll.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleApprovePayroll = async () => {
    if (!selectedPayroll) return;
    try {
      const res = await payrollApi.approve(selectedPayroll._id);
      toast.success("Payroll approved and locked for disbursement!");
      setSelectedPayroll(res.data.data);
      fetchPayrollData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve payroll.");
    }
  };

  const openPayslip = (record) => {
    setSelectedRecord(record);
    setIsPayslipOpen(true);
  };

  const isApproved = selectedPayroll?.status === "Approved" || selectedPayroll?.status === "Disbursed";

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#172B4D] dark:text-white tracking-tight flex items-center gap-2">
            <Banknote size={20} className="text-[#0052CC] dark:text-[#579DFF]" />
            Payroll & Salary Processing Engine
          </h1>
          <p className="text-xs text-[#6B778C] dark:text-neutral-400 mt-0.5">
            Calculate contractor wages from site muster rolls, compute statutory EPF, ESIC & PT deductions, and generate payslips
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRunModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded bg-[#0052CC] hover:bg-[#0747A6] text-white shadow-xs transition shrink-0 cursor-pointer"
        >
          <Plus size={14} />
          <span>Run Monthly Payroll</span>
        </button>
      </div>

      {/* Top KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <KpiMetricCard
          title="Total Gross Wages"
          value={`Rs ${stats.totalGross.toLocaleString()}`}
          subtitle="Earned basic + overtime base"
          accentColor="#0052CC"
          icon={TrendingUp}
        />
        <KpiMetricCard
          title="Statutory Deductions"
          value={`Rs ${stats.totalDeductions.toLocaleString()}`}
          subtitle="EPF (12%), ESIC (0.75%), PT"
          badgeText="Compliance"
          badgeType="warning"
          accentColor="#B9770E"
          icon={TrendingDown}
        />
        <KpiMetricCard
          title="Net Take-Home Disbursed"
          value={`Rs ${stats.totalNet.toLocaleString()}`}
          subtitle="Bank remittance payout pool"
          badgeText="Verified"
          badgeType="success"
          accentColor="#00875A"
          icon={CheckCircle2}
        />
        <KpiMetricCard
          title="Completed Payroll Runs"
          value={stats.totalRuns}
          subtitle="Monthly approved site cycles"
          badgeText="Runs"
          badgeType="neutral"
          accentColor="#579DFF"
          icon={Banknote}
        />
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Payroll Runs List */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="p-3 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xs flex items-center justify-between">
            <span className="text-xs font-bold text-[#172B4D] dark:text-white uppercase tracking-wider">
              Payroll Run History
            </span>
            <span className="text-[11px] font-mono text-[#6B778C] dark:text-neutral-400">
              {payrollRuns.length} cycles
            </span>
          </div>

          <div className="space-y-2">
            {payrollRuns.length === 0 ? (
              <div className="p-6 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg text-center text-xs text-[#6B778C] dark:text-neutral-400">
                No payroll runs found. Click "+ Run Monthly Payroll" to calculate one from an approved muster roll.
              </div>
            ) : (
              payrollRuns.map((p) => {
                const isSelected = selectedPayroll?._id === p._id;
                return (
                  <div
                    key={p._id}
                    onClick={() => setSelectedPayroll(p)}
                    className={`p-3 rounded-lg border transition cursor-pointer text-xs ${
                      isSelected
                        ? "bg-[#DEEBFF]/50 dark:bg-[#1C2331] border-[#0052CC] dark:border-[#579DFF] shadow-xs"
                        : "bg-white dark:bg-[#0F131C] border-[#DFE1E6] dark:border-[#263042] hover:bg-[#FAFBFC] dark:hover:bg-[#151B26]"
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-[#172B4D] dark:text-white mb-1">
                      <span className="font-mono text-[#0052CC] dark:text-[#579DFF]">{p.payrollId}</span>
                      <StatusLozenge status={p.status} />
                    </div>
                    <div className="font-medium text-[#172B4D] dark:text-neutral-200 truncate">
                      {p.clientName}
                    </div>
                    <div className="text-[11px] text-[#6B778C] dark:text-neutral-400 truncate">
                      {p.siteName} &bull; {p.month} {p.year}
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between text-[11px]">
                      <span className="text-[#6B778C] dark:text-neutral-400">
                        {p.totalHeadcount} workers
                      </span>
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        Net: Rs {p.totalNetPayable?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Payroll Breakdown Table */}
        <div className="lg:col-span-8">
          {selectedPayroll ? (
            <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xs overflow-hidden flex flex-col">
              {/* Card Header */}
              <div className="p-4 border-b border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF]">
                      {selectedPayroll.payrollId}
                    </span>
                    <StatusLozenge status={selectedPayroll.status} />
                    {isApproved && (
                      <span className="text-[10px] font-medium text-[#00875A] flex items-center gap-1">
                        <Lock size={11} /> Approved by {selectedPayroll.approvedBy || "Finance Lead"}
                      </span>
                    )}
                  </div>
                  <h2 className="text-sm font-bold text-[#172B4D] dark:text-white mt-1">
                    {selectedPayroll.clientName} — {selectedPayroll.siteName}
                  </h2>
                  <p className="text-xs text-[#6B778C] dark:text-neutral-400">
                    Cycle: {selectedPayroll.month} {selectedPayroll.year} &bull; {selectedPayroll.records?.length} Contractors &bull; Muster Roll: {selectedPayroll.musterRollId}
                  </p>
                </div>

                {!isApproved && (
                  <button
                    type="button"
                    onClick={handleApprovePayroll}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-[#00875A] hover:bg-[#006644] text-white shadow-xs transition cursor-pointer shrink-0"
                  >
                    <CheckCircle2 size={13} />
                    <span>Approve Payroll</span>
                  </button>
                )}
              </div>

              {/* Records Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAFBFC] dark:bg-[#151B26] border-b border-[#DFE1E6] dark:border-[#263042] text-[#6B778C] dark:text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
                      <th className="px-3.5 py-2.5">Contractor</th>
                      <th className="px-3.5 py-2.5">Role</th>
                      <th className="px-3.5 py-2.5 text-center">Days / OT</th>
                      <th className="px-3.5 py-2.5 text-right">Gross Pay</th>
                      <th className="px-3.5 py-2.5 text-right">EPF (12%)</th>
                      <th className="px-3.5 py-2.5 text-right">ESIC/PT</th>
                      <th className="px-3.5 py-2.5 text-right">Net Take-Home</th>
                      <th className="px-3.5 py-2.5 text-right">Payslip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE1E6] dark:divide-[#263042]">
                    {selectedPayroll.records?.map((r, idx) => (
                      <tr key={idx} className="hover:bg-[#F4F5F7] dark:hover:bg-[#151B26]/60 transition">
                        <td className="px-3.5 py-2.5">
                          <div className="font-semibold text-[#172B4D] dark:text-white">{r.workerName}</div>
                          <div className="text-[10px] font-mono text-[#6B778C] dark:text-neutral-400">{r.workerId}</div>
                        </td>
                        <td className="px-3.5 py-2.5 text-[#42526E] dark:text-neutral-300">{r.designation}</td>
                        <td className="px-3.5 py-2.5 text-center">
                          <span className="font-semibold text-[#172B4D] dark:text-white">{r.payableDays}d</span>
                          {r.overtimeHours > 0 && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-semibold">
                              +{r.overtimeHours}h OT
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-mono text-[#172B4D] dark:text-white">
                          Rs {r.grossSalary?.toLocaleString()}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-mono text-[#DE350B]">
                          -Rs {r.statutoryDeductions?.employeePf?.toLocaleString()}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-mono text-[#DE350B]">
                          -Rs {((r.statutoryDeductions?.esic || 0) + (r.statutoryDeductions?.professionalTax || 0)).toLocaleString()}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          Rs {r.netSalary?.toLocaleString()}
                        </td>
                        <td className="px-3.5 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => openPayslip(r)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0052CC] dark:text-[#579DFF] hover:bg-[#DEEBFF] dark:hover:bg-[#1C2331] rounded transition cursor-pointer"
                          >
                            <Printer size={12} />
                            <span>Slip</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* Totals Footer */}
                  <tfoot>
                    <tr className="bg-[#FAFBFC] dark:bg-[#151B26] font-bold text-[#172B4D] dark:text-white border-t-2 border-[#DFE1E6] dark:border-[#263042]">
                      <td colSpan={3} className="px-3.5 py-3 uppercase tracking-wider text-[11px]">
                        Cycle Totals
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono text-[#172B4D] dark:text-white">
                        Rs {selectedPayroll.totalGrossPay?.toLocaleString()}
                      </td>
                      <td colSpan={2} className="px-3.5 py-3 text-right font-mono text-[#DE350B]">
                        -Rs {selectedPayroll.totalDeductions?.toLocaleString()}
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono text-sm text-emerald-600 dark:text-emerald-400">
                        Rs {selectedPayroll.totalNetPayable?.toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-12 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg text-center text-xs text-[#6B778C] dark:text-neutral-400">
              Select a payroll run from the left panel to inspect wages and statutory breakdown.
            </div>
          )}
        </div>
      </div>

      {/* Run Monthly Payroll Modal */}
      {isRunModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F131C] rounded-lg shadow-2xl border border-[#DFE1E6] dark:border-[#263042] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26]">
              <div className="flex items-center gap-2">
                <Banknote size={16} className="text-[#0052CC] dark:text-[#579DFF]" />
                <h3 className="text-xs font-bold text-[#172B4D] dark:text-white uppercase tracking-wider">
                  Calculate Site Payroll
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRunModalOpen(false)}
                className="p-1 text-[#6B778C] hover:text-[#172B4D] dark:hover:text-white rounded"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleRunPayroll} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                  Source Site Muster Roll <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedMusterRollId}
                  onChange={(e) => setSelectedMusterRollId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  <option value="">Select Muster Roll...</option>
                  {approvedMusterRolls.map((mr) => (
                    <option key={mr.musterRollId} value={mr.musterRollId}>
                      {mr.musterRollId} &bull; {mr.clientName} ({mr.siteName}) &bull; {mr.month} {mr.year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded bg-[#DEEBFF]/50 dark:bg-[#1C2331] border border-[#B3D4FF] dark:border-[#263042] text-[11px] text-[#0747A6] dark:text-[#579DFF] leading-relaxed space-y-1">
                <div className="font-semibold">Automated Statutory Indian Compliance:</div>
                <div>&bull; EPF Employee Deduction: 12% of basic wages</div>
                <div>&bull; ESIC Employee Deduction: 0.75% of gross (if &le; ₹21,000)</div>
                <div>&bull; Professional Tax: ₹200 standard monthly slab</div>
                <div>&bull; Overtime Calculation: 1.5x statutory multiplier</div>
              </div>

              <div className="pt-3 border-t border-[#DFE1E6] dark:border-[#263042] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRunModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded border border-[#DFE1E6] dark:border-[#263042] text-[#42526E] dark:text-neutral-300 hover:bg-[#EBECF0] dark:hover:bg-[#1C2331]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRunning}
                  className="px-4 py-1.5 text-xs font-semibold rounded bg-[#0052CC] hover:bg-[#0747A6] text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isRunning ? (
                    <span>Calculating Wages...</span>
                  ) : (
                    <>
                      <Banknote size={14} />
                      <span>Execute Payroll Run</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Individual Payslip Modal */}
      <PayslipModal
        isOpen={isPayslipOpen}
        onClose={() => setIsPayslipOpen(false)}
        payroll={selectedPayroll}
        record={selectedRecord}
      />
    </div>
  );
}

export default Payroll;
