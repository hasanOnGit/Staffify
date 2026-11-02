import React, { useState } from "react";
import {
  X,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  ArrowRight,
  ExternalLink,
  DollarSign,
  Users,
} from "lucide-react";
import { disburseDirectBank } from "../services/compliance";
import toast from "react-hot-toast";

const GATEWAYS = [
  {
    id: "icici_cib",
    name: "ICICI Bank CIB 2.0",
    subtitle: "Direct Corporate Internet Banking Host-to-Host API",
    badge: "Instant 24x7 IMPS/NEFT",
    color: "#0052CC",
  },
  {
    id: "hdfc_enet",
    name: "HDFC Corporate Enet",
    subtitle: "Bulk Corporate Disbursement Gateway (H2H Encrypted)",
    badge: "Direct Clearing House",
    color: "#00875A",
  },
  {
    id: "razorpayx",
    name: "RazorpayX Enterprise Payouts",
    subtitle: "Composite Banking API Suite with Smart Routing",
    badge: "Automated Failure Fallback",
    color: "#403294",
  },
];

export default function DirectBankPayoutModal({
  isOpen,
  onClose,
  currentMonth = new Date().getMonth() + 1,
  currentYear = new Date().getFullYear(),
  onDisbursementComplete,
}) {
  const [gateway, setGateway] = useState("icici_cib");
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [remarks, setRemarks] = useState(`Payroll Disbursement ${currentMonth}/${currentYear}`);
  const [filterDepartment, setFilterDepartment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [payoutResult, setPayoutResult] = useState(null);

  if (!isOpen) return null;

  const handleDisbursement = async () => {
    try {
      setSubmitting(true);
      const res = await disburseDirectBank({
        month: Number(month),
        year: Number(year),
        gateway,
        remarks,
        filterDepartment: filterDepartment || undefined,
      });

      if (res?.success) {
        setPayoutResult(res);
        toast.success(res.message || "Direct bank disbursement executed successfully!");
        if (onDisbursementComplete) onDisbursementComplete();
      } else {
        toast.error(res?.error || "Disbursement failed to execute");
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || "Direct disbursement error";
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!payoutResult) return;
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payoutResult, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `Bank_Disbursement_Receipt_${payoutResult.batchId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-[#172B4D] dark:text-[#F1F5F9]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#FAFBFC] dark:bg-[#151B26]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#DEEBFF] dark:bg-[#0052CC]/20 text-[#0052CC] dark:text-[#579DFF]">
              <Building2 size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                Direct Bank API Salary Disbursement
              </h2>
              <p className="text-xs text-[#6B778C] dark:text-[#94A3B8]">
                Disburse salaries directly to employee bank accounts via integrated corporate banking APIs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#6B778C] hover:text-[#172B4D] dark:hover:text-white p-1.5 rounded transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!payoutResult ? (
            <>
              {/* Security Banner */}
              <div className="p-3 bg-[#E3FCEF] dark:bg-[#00875A]/10 border border-[#ABF5D1] dark:border-[#00875A]/30 rounded flex items-center gap-3">
                <ShieldCheck size={18} className="text-[#00875A] shrink-0" />
                <p className="text-xs text-[#006644] dark:text-[#ABF5D1]">
                  <strong>NPCI & RBI 256-bit Encrypted Tunnel:</strong> Payout batches generate official Indian UTRs immediately upon API handshake. Payslips will be automatically marked as <strong>Paid</strong> with audit timestamps.
                </p>
              </div>

              {/* Gateway Selector Cards */}
              <div>
                <label className="text-xs font-bold block mb-2">Select Corporate Disbursement Gateway</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {GATEWAYS.map((g) => {
                    const isSelected = gateway === g.id;
                    return (
                      <div
                        key={g.id}
                        onClick={() => setGateway(g.id)}
                        className={`p-3.5 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-[#0052CC] bg-[#DEEBFF]/30 dark:bg-[#0052CC]/15"
                            : "border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] hover:border-[#B3D4FF]"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs">{g.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-[#E3FCEF] text-[#006644] rounded font-semibold border border-[#ABF5D1]">
                              {g.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8]">{g.subtitle}</p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-[#0052CC] bg-[#0052CC]" : "border-[#DFE1E6]"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Period and Department Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Month</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>
                        {new Date(2000, m - 1, 1).toLocaleString("en-US", { month: "long" })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  >
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Department</label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-full border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  >
                    <option value="">All Departments (Entire Company)</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Disbursement Memo / Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Monthly Salary Batch for October 2026"
                  className="w-full border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-[#DFE1E6] dark:border-[#263042] rounded text-xs font-semibold hover:bg-[#F4F5F7] dark:hover:bg-[#151B26] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDisbursement}
                  disabled={submitting}
                  className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Disbursing via Bank Gateway...
                    </>
                  ) : (
                    <>
                      <Building2 size={14} />
                      Authorize & Initiate Direct Disbursement
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Disbursement Success Receipt Screen */
            <div className="space-y-4">
              <div className="p-4 bg-[#E3FCEF] dark:bg-[#00875A]/20 border border-[#ABF5D1] dark:border-[#00875A]/40 rounded-lg text-center space-y-1">
                <CheckCircle2 size={32} className="mx-auto text-[#00875A]" />
                <h3 className="text-sm font-bold text-[#006644] dark:text-[#ABF5D1]">
                  Disbursement Batch Successfully Executed
                </h3>
                <p className="text-xs text-[#172B4D] dark:text-[#F1F5F9]">
                  {payoutResult.message}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 border border-[#DFE1E6] dark:border-[#263042] rounded bg-[#FAFBFC] dark:bg-[#151B26]">
                  <span className="text-[11px] text-[#6B778C] block">Batch ID</span>
                  <span className="font-mono font-bold text-xs text-[#0052CC] dark:text-[#579DFF]">
                    {payoutResult.batchId}
                  </span>
                </div>
                <div className="p-3 border border-[#DFE1E6] dark:border-[#263042] rounded bg-[#FAFBFC] dark:bg-[#151B26]">
                  <span className="text-[11px] text-[#6B778C] block">Disbursed Count</span>
                  <span className="font-bold text-xs">{payoutResult.disbursedCount} Employees</span>
                </div>
                <div className="p-3 border border-[#DFE1E6] dark:border-[#263042] rounded bg-[#FAFBFC] dark:bg-[#151B26]">
                  <span className="text-[11px] text-[#6B778C] block">Total Amount Disbursed</span>
                  <span className="font-bold text-xs text-[#00875A]">
                    ₹{(payoutResult.totalDisbursed || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Sample UTR Details */}
              <div>
                <h4 className="text-xs font-bold mb-2">Disbursement Bank Transactions (Sample)</h4>
                <div className="border border-[#DFE1E6] dark:border-[#263042] rounded overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAFBFC] dark:bg-[#151B26] border-b border-[#DFE1E6] dark:border-[#263042] text-[#6B778C]">
                      <tr>
                        <th className="p-2">Employee ID</th>
                        <th className="p-2">UTR Number</th>
                        <th className="p-2">Amount</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DFE1E6] dark:divide-[#263042]">
                      {(payoutResult.transactions || []).map((tx, idx) => (
                        <tr key={idx} className="hover:bg-[#FAFBFC] dark:hover:bg-[#151B26]">
                          <td className="p-2 font-semibold">{tx.employeeId}</td>
                          <td className="p-2 font-mono text-[11px] text-[#0052CC] dark:text-[#579DFF]">
                            {tx.utr}
                          </td>
                          <td className="p-2 font-semibold">₹{(tx.amount || 0).toLocaleString("en-IN")}</td>
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]">
                              PROCESSED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="px-3.5 py-2 border border-[#DFE1E6] dark:border-[#263042] rounded text-xs font-semibold hover:bg-[#F4F5F7] dark:hover:bg-[#151B26] flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} />
                  Download Bank Audit JSON
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-bold transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
