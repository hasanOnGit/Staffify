import React, { useState, useEffect } from "react";
import {
  X,
  UserCheck,
  ShieldAlert,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Users,
  Send,
  Loader2
} from "lucide-react";
import { getDelegations, createDelegation, revokeDelegation } from "../services/leave";

const SAMPLE_DELEGATES = [
  { employeeId: "EMP-MGR-02", name: "Priya Sundaram", designation: "Engineering Manager", email: "manager@staffify.com" },
  { employeeId: "EMP-014", name: "Priya Sharma", designation: "Frontend Lead", email: "priya.sharma@staffify.com" },
  { employeeId: "EMP-029", name: "Rahul Verma", designation: "Backend Lead", email: "rahul.verma@staffify.com" },
  { employeeId: "EMP-042", name: "Aarav Sharma", designation: "Senior Software Engineer", email: "employee@staffify.com" }
];

export default function ManagerDelegationModal({ isOpen, onClose, currentUser, onDelegationChanged }) {
  const [delegations, setDelegations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDelegateId, setSelectedDelegateId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  );
  const [reason, setReason] = useState("Annual Leave / Out of Office");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadDelegations();
    }
  }, [isOpen]);

  const loadDelegations = async () => {
    setLoading(true);
    try {
      const res = await getDelegations({
        delegatorId: currentUser?.employeeId || currentUser?.userId,
      });
      setDelegations(res?.delegations || []);
    } catch (err) {
      console.warn("Could not load delegations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedDelegateId) {
      setMessage({ type: "error", text: "Please select a colleague to delegate approval rights to." });
      return;
    }

    const delegate = SAMPLE_DELEGATES.find((d) => d.employeeId === selectedDelegateId) || {
      employeeId: selectedDelegateId,
      name: "Proxy Approver",
      email: ""
    };

    setSubmitting(true);
    setMessage(null);

    try {
      await createDelegation({
        delegatorId: currentUser?.employeeId || currentUser?.userId || "EMP-MGR-01",
        delegatorName: currentUser?.name || "Manager",
        delegateId: delegate.employeeId,
        delegateName: delegate.name,
        delegateEmail: delegate.email,
        startDate,
        endDate,
        reason,
      });

      setMessage({ type: "success", text: `Approval rights successfully delegated to ${delegate.name}.` });
      loadDelegations();
      if (onDelegationChanged) onDelegationChanged();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || err.message || "Failed to create delegation" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id) => {
    try {
      await revokeDelegation(id);
      setMessage({ type: "success", text: "Delegation revoked successfully." });
      loadDelegations();
      if (onDelegationChanged) onDelegationChanged();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to revoke delegation." });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0F131C] rounded-2xl border border-[#DFE1E6] dark:border-[#263042] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#FAFBFC] dark:bg-[#151B26]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#DEEBFF] dark:bg-blue-950/60 text-[#0052CC] dark:text-[#579DFF] flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172B4D] dark:text-white">
                Out-of-Office Approval Delegation
              </h2>
              <p className="text-xs text-[#6B778C] dark:text-slate-400">
                Grant temporary proxy rights to a peer manager while on leave
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B778C] hover:text-[#172B4D] dark:hover:text-white hover:bg-[#EBECF0] dark:hover:bg-[#263042] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {message && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-[#E3FCEF] dark:bg-emerald-950/40 border-[#00875A]/30 text-[#00875A] dark:text-emerald-400"
                  : "bg-[#FFEBE6] dark:bg-rose-950/40 border-[#DE350B]/30 text-[#DE350B] dark:text-rose-400"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* New Delegation Form */}
          <form onSubmit={handleCreate} className="bg-[#F4F5F7] dark:bg-[#151B26] p-4 rounded-xl border border-[#DFE1E6] dark:border-[#263042] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] dark:text-white flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-[#0052CC]" /> Appoint Proxy Approver
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-slate-200 mb-1">
                  Delegate To (Colleague)
                </label>
                <select
                  value={selectedDelegateId}
                  onChange={(e) => setSelectedDelegateId(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] text-[#172B4D] dark:text-white focus:outline-none focus:border-[#0052CC]"
                  required
                >
                  <option value="">Select a colleague...</option>
                  {SAMPLE_DELEGATES.filter((d) => d.employeeId !== currentUser?.employeeId).map((d) => (
                    <option key={d.employeeId} value={d.employeeId}>
                      {d.name} ({d.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-slate-200 mb-1">
                  Reason / Handover Note
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Annual Vacation, Conference"
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] text-[#172B4D] dark:text-white focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-slate-200 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] text-[#172B4D] dark:text-white focus:outline-none focus:border-[#0052CC]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-slate-200 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] text-[#172B4D] dark:text-white focus:outline-none focus:border-[#0052CC]"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Activating...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Activate Delegation</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Active Delegations Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-slate-400">
              Active & Scheduled Delegations
            </h3>

            {loading ? (
              <div className="py-8 text-center text-xs text-[#6B778C] dark:text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#0052CC]" />
                <span>Loading delegations...</span>
              </div>
            ) : delegations.length === 0 ? (
              <div className="p-6 text-center rounded-xl border border-dashed border-[#DFE1E6] dark:border-[#263042] text-xs text-[#6B778C] dark:text-slate-400">
                No active delegations found. You currently retain all primary approval responsibilities.
              </div>
            ) : (
              <div className="space-y-2">
                {delegations.map((del) => {
                  const isCurrent = del.isActive && new Date(del.endDate) >= new Date();
                  return (
                    <div
                      key={del._id || del.delegationId}
                      className="p-3.5 rounded-xl border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#172B4D] dark:text-white">
                            {del.delegateName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isCurrent
                                ? "bg-[#E3FCEF] text-[#00875A] border border-[#00875A]/20"
                                : "bg-[#EBECF0] dark:bg-[#263042] text-[#6B778C] dark:text-slate-300"
                            }`}
                          >
                            {isCurrent ? "Active Proxy" : "Inactive / Expired"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B778C] dark:text-slate-400">
                          {del.reason} • {new Date(del.startDate).toLocaleDateString()} to{" "}
                          {new Date(del.endDate).toLocaleDateString()}
                        </p>
                      </div>

                      {del.isActive && (
                        <button
                          onClick={() => handleRevoke(del._id || del.delegationId)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#DE350B]/30 text-[#DE350B] hover:bg-[#FFEBE6] dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#DFE1E6] dark:border-[#263042] text-[#172B4D] dark:text-white hover:bg-[#EBECF0] dark:hover:bg-[#263042] text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
