import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getEmployees } from "../services/employee";
import { applyLoan, getLoans, approveLoan } from "../services/loan";
import toast from "react-hot-toast";
import {
  CreditCard,
  DollarSign,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  X,
  Plus,
  AlertCircle,
  FileText,
} from "lucide-react";

function LoanModal({ isOpen, onClose, onSuccess, initialEmployeeId }) {
  const { user, isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("apply"); // "apply" | "active_loans"
  const [existingLoans, setExistingLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: initialEmployeeId || user?.employeeId || user?.userId || "EMP-DEV-03",
    loanType: "Salary Advance",
    principalAmount: "30000",
    tenureMonths: "3",
    repaymentStartMonth: new Date().getMonth() + 1,
    repaymentStartYear: new Date().getFullYear(),
    reason: "Medical emergency hospital expense advance.",
  });

  const formatCurrency = (val = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const calculatedEmi = Math.round(
    (Number(formData.principalAmount) || 0) / (Number(formData.tenureMonths) || 1)
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [empRes, loansRes] = await Promise.all([
        getEmployees().catch(() => []),
        getLoans({ employeeId: isAdmin ? undefined : (user?.employeeId || user?.userId) }),
      ]);
      setEmployees(Array.isArray(empRes) ? empRes : []);
      if (loansRes.success) {
        setExistingLoans(loansRes.data || []);
      }
    } catch (err) {
      console.error("Failed to load loan data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = async (e) => {
    e.preventDefault();
    if (!formData.principalAmount || Number(formData.principalAmount) <= 0) {
      toast.error("Please enter a valid loan amount");
      return;
    }

    try {
      setSubmitting(true);
      const res = await applyLoan({
        ...formData,
        principalAmount: Number(formData.principalAmount),
        tenureMonths: Number(formData.tenureMonths),
      });

      if (res.success) {
        toast.success(`Salary advance request #${res.data.loanId} submitted successfully!`);
        if (onSuccess) onSuccess();
        loadData();
        setActiveTab("active_loans");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit loan request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (loanId) => {
    try {
      const res = await approveLoan(loanId, {
        approvedBy: user?.name || "Admin User",
      });
      if (res.success) {
        toast.success("Loan approved and activated for upcoming payroll deductions!");
        loadData();
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Approval failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-[#DFE1E6] max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DFE1E6] flex items-center justify-between bg-[#FAFBFC]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]">
              <CreditCard size={18} />
            </span>
            <div>
              <h2 className="font-bold text-sm text-[#172B4D]">
                Employee Loans & Salary Advance Management
              </h2>
              <p className="text-xs text-[#6B778C]">
                Zero-interest emergency advance with automated monthly payroll EMI recovery
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6B778C] hover:text-[#172B4D] p-1.5 rounded-md hover:bg-[#EBECF0] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-3 border-b border-[#DFE1E6] flex gap-3 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("apply")}
            className={`pb-2.5 font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "apply"
                ? "border-[#0052CC] text-[#0052CC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <Plus size={13} />
            <span>Apply for Salary Advance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("active_loans")}
            className={`pb-2.5 font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "active_loans"
                ? "border-[#0052CC] text-[#0052CC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <CreditCard size={13} />
            <span>Active Advances & Ledger</span>
            <span className="text-[10px] bg-[#DEEBFF] text-[#0052CC] px-1.5 py-0.2 rounded-full font-mono font-bold">
              {existingLoans.length}
            </span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {activeTab === "apply" ? (
            <form id="loan-form" onSubmit={handleApply} className="space-y-4">
              {isAdmin && (
                <div>
                  <label className="block font-semibold text-[#172B4D] mb-1">
                    Select Employee *
                  </label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] font-medium"
                  >
                    {employees.map((emp) => (
                      <option key={emp.employeeId} value={emp.employeeId}>
                        {emp.name} ({emp.employeeId}) - {emp.department}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172B4D] mb-1">
                    Advance Amount (INR ₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#6B778C]">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="5000"
                      step="1000"
                      required
                      placeholder="e.g. 50000"
                      value={formData.principalAmount}
                      onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 border border-[#DFE1E6] rounded-lg font-bold text-sm text-[#172B4D] bg-[#FAFBFC]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#172B4D] mb-1">
                    Repayment Tenure (Months) *
                  </label>
                  <select
                    value={formData.tenureMonths}
                    onChange={(e) => setFormData({ ...formData, tenureMonths: e.target.value })}
                    className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] font-semibold"
                  >
                    <option value="1">1 Month (Lump sum recovery)</option>
                    <option value="2">2 Months</option>
                    <option value="3">3 Months</option>
                    <option value="4">4 Months</option>
                    <option value="5">5 Months</option>
                    <option value="6">6 Months (Max Standard Advance)</option>
                  </select>
                </div>
              </div>

              {/* Real-time EMI Calculator Card */}
              <div className="bg-[#DEEBFF]/30 border border-[#B3D4FF] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#0747A6] block">
                    Calculated Monthly Payroll EMI Deduction
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl font-bold text-[#0052CC]">
                      {formatCurrency(calculatedEmi)} / mo
                    </span>
                    <span className="text-[11px] text-[#42526E]">
                      for {formData.tenureMonths} monthly payroll cycle(s)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]">
                  0% Interest
                </span>
              </div>

              <div>
                <label className="block font-semibold text-[#172B4D] mb-1">
                  Reason / Purpose of Advance *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Hospital medical treatment, house rental security deposit, higher education fee..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] resize-none"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#F4F5F7] border border-[#DFE1E6] flex items-start gap-2 text-[#42526E]">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-[#0052CC]" />
                <p className="text-[11px] leading-relaxed">
                  Upon approval, the monthly EMI of {formatCurrency(calculatedEmi)} will be auto-debited under "Salary Advance" in your payslip deductions until the balance is fully settled.
                </p>
              </div>
            </form>
          ) : (
            /* Active Advances & Ledger */
            <div className="space-y-4">
              {existingLoans.length > 0 ? (
                existingLoans.map((loan) => (
                  <div
                    key={loan._id || loan.loanId}
                    className="border border-[#DFE1E6] rounded-xl p-4 bg-white shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#172B4D]">{loan.loanId}</span>
                          <span className="font-semibold text-xs text-[#0052CC] bg-[#DEEBFF] px-2 py-0.5 rounded border border-[#B3D4FF]">
                            {loan.employeeName} ({loan.employeeId})
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                              loan.status === "Active"
                                ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                                : loan.status === "Closed"
                                ? "bg-[#F4F5F7] text-[#6B778C] border-[#DFE1E6]"
                                : "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]"
                            }`}
                          >
                            {loan.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B778C] mt-1 italic">"{loan.reason}"</p>
                      </div>

                      {isAdmin && loan.status === "Pending" && (
                        <button
                          type="button"
                          onClick={() => handleApprove(loan._id || loan.loanId)}
                          className="px-3 py-1 bg-[#00875A] hover:bg-[#006644] text-white text-xs font-semibold rounded-lg transition"
                        >
                          Approve & Activate
                        </button>
                      )}
                    </div>

                    {/* Progress Bar & Balances */}
                    <div className="grid grid-cols-3 gap-2 bg-[#FAFBFC] p-3 rounded-lg border border-[#DFE1E6]">
                      <div>
                        <span className="text-[10px] text-[#6B778C] block uppercase font-bold">Principal</span>
                        <span className="font-bold text-[#172B4D]">{formatCurrency(loan.principalAmount)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#6B778C] block uppercase font-bold">Repaid so far</span>
                        <span className="font-bold text-[#006644]">{formatCurrency(loan.totalRepaid)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#6B778C] block uppercase font-bold">Remaining Balance</span>
                        <span className="font-bold text-[#DE350B]">{formatCurrency(loan.remainingBalance)}</span>
                      </div>
                    </div>

                    {/* Monthly EMI Ledger */}
                    {loan.repayments && loan.repayments.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider block mb-1.5">
                          Payroll EMI Recovery Ledger
                        </span>
                        <div className="space-y-1">
                          {loan.repayments.map((rep, idx) => (
                            <div
                              key={rep._id || idx}
                              className="flex items-center justify-between p-2 rounded bg-[#F4F5F7] text-[11px]"
                            >
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 size={12} className="text-[#00875A]" />
                                <span className="font-semibold text-[#172B4D]">
                                  Installment #{rep.emiIndex || idx + 1}
                                </span>
                                <span className="text-[#6B778C]">
                                  ({rep.month}/{rep.year})
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#006644] font-mono">
                                  {formatCurrency(rep.amountPaid)}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white text-[#42526E] border border-[#DFE1E6]">
                                  {rep.mode}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-[#6B778C]">
                  No active loans or salary advances found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F4F5F7] border-t border-[#DFE1E6] flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#DFE1E6] rounded-lg text-xs font-semibold text-[#42526E] hover:bg-[#EBECF0] transition cursor-pointer"
          >
            Close
          </button>

          {activeTab === "apply" && (
            <button
              type="submit"
              form="loan-form"
              disabled={submitting}
              className="px-5 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <CreditCard size={14} />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoanModal;
