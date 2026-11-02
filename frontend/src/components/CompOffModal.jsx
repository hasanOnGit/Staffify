import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  Loader2,
  Info,
} from "lucide-react";
import { requestCompOff, getMyCompOffGrants } from "../services/compOff";
import toast from "react-hot-toast";

export default function CompOffModal({ isOpen, onClose, employeeId, onGrantRequested }) {
  const [activeTab, setActiveTab] = useState("apply"); // "apply" or "history"
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myGrants, setMyGrants] = useState([]);

  // Form State
  const [workDate, setWorkDate] = useState(
    new Date(Date.now() - 86400000).toISOString().split("T")[0]
  );
  const [daysGranted, setDaysGranted] = useState(1.0);
  const [reason, setReason] = useState("");
  const [approverRemarks, setApproverRemarks] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadGrants();
    }
  }, [isOpen]);

  const loadGrants = async () => {
    try {
      setLoading(true);
      const res = await getMyCompOffGrants();
      if (res?.success) {
        setMyGrants(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load comp-off grants:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!workDate) {
      toast.error("Please specify the date worked.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please provide a business justification / reason.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await requestCompOff({
        workDate,
        daysGranted,
        reason,
      });

      if (res?.success) {
        toast.success(res.message || "Comp-off grant request submitted successfully");
        setReason("");
        setDaysGranted(1.0);
        await loadGrants();
        setActiveTab("history");
        if (onGrantRequested) onGrantRequested();
      } else {
        toast.error(res?.error || "Failed to submit comp-off request");
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || "Request failed";
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusLozenge = (status) => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]">
            <CheckCircle2 size={12} />
            Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-[#FFEBE6] text-[#BF2600] border border-[#FFBDAD]">
            <AlertCircle size={12} />
            Rejected
          </span>
        );
      case "Lapsed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-[#F4F5F7] text-[#6B778C] border border-[#DFE1E6]">
            <Clock size={12} />
            Lapsed (Expired)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-[#FFF0B3] text-[#172B4D] border border-[#FFE380]">
            <Clock size={12} />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-[#172B4D] dark:text-[#F1F5F9]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#FAFBFC] dark:bg-[#151B26]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#DEEBFF] dark:bg-[#0052CC]/20 text-[#0052CC] dark:text-[#579DFF]">
              <Calendar size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                Compensatory Off (Comp-Off) Engine
              </h2>
              <p className="text-xs text-[#6B778C] dark:text-[#94A3B8]">
                Claim compensatory leave for working on weekends, holidays, or mandated overtime
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

        {/* Tabs */}
        <div className="px-6 pt-3 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center gap-4 bg-white dark:bg-[#0F131C]">
          <button
            onClick={() => setActiveTab("apply")}
            className={`pb-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === "apply"
                ? "border-[#0052CC] text-[#0052CC] dark:text-[#579DFF]"
                : "border-transparent text-[#6B778C] dark:text-[#94A3B8] hover:text-[#172B4D]"
            }`}
          >
            Apply for Comp-Off Grant
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "history"
                ? "border-[#0052CC] text-[#0052CC] dark:text-[#579DFF]"
                : "border-transparent text-[#6B778C] dark:text-[#94A3B8] hover:text-[#172B4D]"
            }`}
          >
            <span>My Comp-Off Requests</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#DEEBFF] dark:bg-[#0052CC]/30 text-[#0052CC] dark:text-[#579DFF] rounded-full font-bold">
              {myGrants.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "apply" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Policy Lozenge Banner */}
              <div className="p-3.5 bg-[#DEEBFF]/40 dark:bg-[#0052CC]/10 border border-[#B3D4FF] dark:border-[#0052CC]/30 rounded-md flex items-start gap-3">
                <Info size={16} className="text-[#0052CC] dark:text-[#579DFF] shrink-0 mt-0.5" />
                <div className="text-xs text-[#0747A6] dark:text-[#579DFF]">
                  <p className="font-semibold">Enterprise Comp-Off Policy Rules</p>
                  <p className="mt-0.5 text-[#172B4D] dark:text-[#94A3B8]">
                    Approved comp-offs remain valid for <strong>90 days</strong> from the date of work. Once credited, you can apply for leave using the regular Leave Application modal selecting <strong>Compensatory Off</strong>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1">
                    Date Worked <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={workDate}
                    onChange={(e) => setWorkDate(e.target.value)}
                    className="w-full border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                    required
                  />
                  <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-1">
                    Must be a scheduled weekend, official holiday, or authorized overtime day.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Grant Allocation</label>
                  <select
                    value={daysGranted}
                    onChange={(e) => setDaysGranted(Number(e.target.value))}
                    className="w-full border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  >
                    <option value={1.0}>Full Day (1.0 Day Credit)</option>
                    <option value={0.5}>Half Day (0.5 Day Credit)</option>
                  </select>
                  <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-1">
                    Full day requires at least 8 hours; half day requires at least 4 hours.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">
                  Reason & Business Deliverables <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Detail the work performed (e.g. Critical production release deployment, client audit support, datacenter migration)..."
                  className="w-full border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  required
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
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Submit Grant Request
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-10 text-xs text-[#6B778C]">
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Loading grant history...
                </div>
              ) : myGrants.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-[#DFE1E6] dark:border-[#263042] rounded-lg">
                  <Calendar size={28} className="mx-auto text-[#6B778C] dark:text-[#94A3B8] mb-2 opacity-60" />
                  <p className="text-xs font-bold">No Comp-Off Requests</p>
                  <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                    You have not submitted any compensatory off requests yet.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#DFE1E6] dark:divide-[#263042] border border-[#DFE1E6] dark:border-[#263042] rounded-lg overflow-hidden">
                  {myGrants.map((grant) => (
                    <div
                      key={grant._id || grant.grantId}
                      className="p-3.5 bg-white dark:bg-[#0F131C] hover:bg-[#FAFBFC] dark:hover:bg-[#151B26] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                            {new Date(grant.workDate).toLocaleDateString("en-IN", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-[#DEEBFF] dark:bg-[#0052CC]/20 text-[#0052CC] dark:text-[#579DFF] rounded font-semibold">
                            {grant.daysGranted} Day{grant.daysGranted > 1 ? "s" : ""}
                          </span>
                          {getStatusLozenge(grant.status)}
                        </div>
                        <p className="text-[#42526E] dark:text-[#94A3B8] text-[11px]">
                          <strong>Reason:</strong> {grant.reason}
                        </p>
                        {grant.status === "Approved" && (
                          <p className="text-[10px] text-[#006644]">
                            Expires on: {new Date(grant.expiresAt).toLocaleDateString("en-IN")} • Credited to Leave Balance
                          </p>
                        )}
                        {grant.status === "Rejected" && grant.rejectionReason && (
                          <p className="text-[10px] text-[#BF2600]">
                            Rejection Note: {grant.rejectionReason}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-[11px] text-[#6B778C] dark:text-[#94A3B8] shrink-0">
                        Requested: {new Date(grant.createdAt || Date.now()).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
