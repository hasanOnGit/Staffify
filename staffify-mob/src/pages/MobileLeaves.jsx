import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  Calendar,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  X,
  Send,
  Loader2,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

export default function MobileLeaves() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("my_leaves"); // "my_leaves" or "comp_off"
  const [balances, setBalances] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [compOffGrants, setCompOffGrants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Apply Leave Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState("casual");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Claim Comp-Off Modal State
  const [showCompOffModal, setShowCompOffModal] = useState(false);
  const [workDate, setWorkDate] = useState(new Date(Date.now() - 86400000).toISOString().slice(0, 10));
  const [daysGranted, setDaysGranted] = useState(1.0);
  const [compOffReason, setCompOffReason] = useState("");

  useEffect(() => {
    loadLeavesData();
  }, [user]);

  const loadLeavesData = async () => {
    try {
      setLoading(true);
      const empId = user?.userId || "USR-DEFAULT";

      // Balances
      const balRes = await api.get(`/api/leaves/getLeaveBalance?employeeId=${empId}`).catch(() => ({ data: { data: null } }));
      if (balRes.data?.data) {
        setBalances(balRes.data.data.leaveAllocation || null);
      }

      // History
      const leavesRes = await api.get("/api/leaves/getLeaves").catch(() => ({ data: { data: [] } }));
      const myLeaves = (leavesRes.data?.data || []).filter((l) => l.employeeId === empId || !empId);
      setLeaveHistory(myLeaves);

      // Comp-Off Grants
      const grantsRes = await api.get("/api/comp-off/my-grants").catch(() => ({ data: { data: [] } }));
      setCompOffGrants(grantsRes.data?.data || []);
    } catch (e) {
      console.error("Failed to load leaves:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please provide a reason for leave");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/api/leaves/applyLeave", {
        employeeId: user?.userId || "USR-DEFAULT",
        employeeName: user?.name || "Staff Member",
        leaveType,
        startDate,
        endDate,
        reason,
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Leave application submitted!");
        setShowApplyModal(false);
        setReason("");
        await loadLeavesData();
      } else {
        toast.error(res.data?.error || "Failed to submit leave");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Leave submission error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaimCompOff = async (e) => {
    e.preventDefault();
    if (!compOffReason.trim()) {
      toast.error("Please provide work justification");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/api/comp-off/request", {
        workDate,
        daysGranted,
        reason: compOffReason,
      });

      if (res.data?.success) {
        toast.success("Comp-off grant request submitted!");
        setShowCompOffModal(false);
        setCompOffReason("");
        await loadLeavesData();
      } else {
        toast.error(res.data?.error || "Failed to claim comp-off");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Comp-off error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3.5 animate-fadeIn pb-6">
      {/* Header & Apply Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-[#172B4D]">Leaves & Comp-Off Hub</h1>
          <p className="text-[11px] text-[#6B778C]">Annual leave quotas and compensatory time-off</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer active-press"
        >
          <Plus size={13} />
          <span>Apply</span>
        </button>
      </div>

      {/* Quota KPI Cards */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 bg-white border border-[#DFE1E6] rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#6B778C]">
            <span className="text-[10px] uppercase font-bold">Casual Leave</span>
            <span className="w-2 h-2 rounded-full bg-[#0052CC]" />
          </div>
          <span className="text-xl font-black text-[#0052CC] block">
            {balances ? Math.max(0, (balances.casual?.totalAllocated || 12) - (balances.casual?.used || 0)) : 12}
          </span>
          <span className="text-[10px] text-[#6B778C]">of 12 Days remaining</span>
        </div>

        <div className="p-3 bg-white border border-[#DFE1E6] rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#6B778C]">
            <span className="text-[10px] uppercase font-bold">Sick Leave</span>
            <span className="w-2 h-2 rounded-full bg-[#00875A]" />
          </div>
          <span className="text-xl font-black text-[#00875A] block">
            {balances ? Math.max(0, (balances.sick?.totalAllocated || 10) - (balances.sick?.used || 0)) : 10}
          </span>
          <span className="text-[10px] text-[#6B778C]">of 10 Days remaining</span>
        </div>

        <div className="p-3 bg-white border border-[#DFE1E6] rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#6B778C]">
            <span className="text-[10px] uppercase font-bold">Earned Leave</span>
            <span className="w-2 h-2 rounded-full bg-[#403294]" />
          </div>
          <span className="text-xl font-black text-[#403294] block">
            {balances ? Math.max(0, (balances.earned?.totalAllocated || 15) - (balances.earned?.used || 0)) : 15}
          </span>
          <span className="text-[10px] text-[#6B778C]">Accumulated paid quota</span>
        </div>

        <div className="p-3 bg-white border border-[#DFE1E6] rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#6B778C]">
            <span className="text-[10px] uppercase font-bold">Comp-Off Credit</span>
            <span className="w-2 h-2 rounded-full bg-[#FF991F]" />
          </div>
          <span className="text-xl font-black text-[#B9770E] block">
            {balances ? Math.max(0, (balances.compOff?.totalAllocated || 0) - (balances.compOff?.used || 0)) : 0}
          </span>
          <span className="text-[10px] text-[#6B778C]">Valid for 90 days</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="bg-white p-1 rounded-xl border border-[#DFE1E6] flex items-center gap-1 shadow-2xs">
        <button
          onClick={() => setActiveTab("my_leaves")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer text-center ${
            activeTab === "my_leaves"
              ? "bg-[#0052CC] text-white shadow-xs"
              : "text-[#6B778C] hover:text-[#172B4D]"
          }`}
        >
          My Applications
        </button>
        <button
          onClick={() => setActiveTab("comp_off")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer text-center flex items-center justify-center gap-1 ${
            activeTab === "comp_off"
              ? "bg-[#0052CC] text-white shadow-xs"
              : "text-[#6B778C] hover:text-[#172B4D]"
          }`}
        >
          <Award size={13} />
          <span>Comp-Off Tray</span>
        </button>
      </div>

      {/* Tab 1: Leave Applications */}
      {activeTab === "my_leaves" && (
        <div className="space-y-2">
          {leaveHistory.length === 0 ? (
            <div className="text-center py-10 bg-white border border-dashed border-[#DFE1E6] rounded-xl">
              <Calendar size={24} className="text-[#6B778C] mx-auto mb-1.5 opacity-50" />
              <p className="text-xs font-bold">No Leave Requests</p>
              <p className="text-[11px] text-[#6B778C]">Tap Apply to submit time-off</p>
            </div>
          ) : (
            leaveHistory.map((leave) => (
              <div
                key={leave._id || leave.leaveId}
                className="p-3 bg-white border border-[#DFE1E6] rounded-xl shadow-2xs flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#172B4D] capitalize">{leave.leaveType} Leave</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                        leave.status === "Approved"
                          ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                          : leave.status === "Rejected"
                          ? "bg-[#FFEBE6] text-[#BF2600] border-[#FFBDAD]"
                          : "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B778C]">
                    {new Date(leave.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} -{" "}
                    {new Date(leave.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  </p>
                  <p className="text-[10px] text-[#42526E] truncate max-w-[200px]">{leave.reason}</p>
                </div>
                <span className="font-bold text-[#0052CC] text-xs">
                  {leave.daysCount || 1} Day{leave.daysCount > 1 ? "s" : ""}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Comp-Off Grants Tray */}
      {activeTab === "comp_off" && (
        <div className="space-y-2.5">
          <div className="p-3 bg-[#DEEBFF]/50 border border-[#B3D4FF] rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-[#0747A6] block">Claim Comp-Off Grant</span>
              <p className="text-[10px] text-[#42526E]">Earned for working weekend or official holiday</p>
            </div>
            <button
              onClick={() => setShowCompOffModal(true)}
              className="px-2.5 py-1 bg-[#0052CC] text-white rounded text-[11px] font-bold cursor-pointer active-press"
            >
              Claim
            </button>
          </div>

          {compOffGrants.length === 0 ? (
            <div className="text-center py-8 bg-white border border-dashed border-[#DFE1E6] rounded-xl text-xs text-[#6B778C]">
              No comp-off claims submitted yet.
            </div>
          ) : (
            compOffGrants.map((grant) => (
              <div
                key={grant._id || grant.grantId}
                className="p-3 bg-white border border-[#DFE1E6] rounded-xl shadow-2xs flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#172B4D]">
                      {new Date(grant.workDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-[#DEEBFF] text-[#0052CC] rounded font-bold">
                      {grant.daysGranted} Day
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                        grant.status === "Approved"
                          ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                          : grant.status === "Rejected"
                          ? "bg-[#FFEBE6] text-[#BF2600] border-[#FFBDAD]"
                          : "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]"
                      }`}
                    >
                      {grant.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6B778C] truncate max-w-[200px]">{grant.reason}</p>
                  {grant.status === "Approved" && (
                    <p className="text-[9px] text-[#00875A]">
                      Expires: {new Date(grant.expiresAt).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Apply Leave Bottom Sheet Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center">
          <div className="bg-white rounded-t-2xl p-5 w-full max-w-md shadow-2xl border-t border-[#DFE1E6] space-y-4 animate-slideUp">
            <div className="flex items-center justify-between border-b border-[#DFE1E6] pb-2">
              <h3 className="font-bold text-sm text-[#172B4D]">Apply for Leave</h3>
              <button onClick={() => setShowApplyModal(false)} className="p-1 rounded text-[#6B778C]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                >
                  <option value="casual">Casual Leave (CL)</option>
                  <option value="sick">Sick Leave (SL)</option>
                  <option value="earned">Earned Leave (EL)</option>
                  <option value="compOff">Compensatory Off (Comp-Off)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Reason for Absence</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for taking time off..."
                  className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Submit Leave Application</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Claim Comp-Off Bottom Sheet Modal */}
      {showCompOffModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center">
          <div className="bg-white rounded-t-2xl p-5 w-full max-w-md shadow-2xl border-t border-[#DFE1E6] space-y-4 animate-slideUp">
            <div className="flex items-center justify-between border-b border-[#DFE1E6] pb-2">
              <h3 className="font-bold text-sm text-[#172B4D]">Claim Compensatory Off</h3>
              <button onClick={() => setShowCompOffModal(false)} className="p-1 rounded text-[#6B778C]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleClaimCompOff} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Date Worked (Weekend / Holiday)</label>
                <input
                  type="date"
                  value={workDate}
                  onChange={(e) => setWorkDate(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Credit Allocation</label>
                <select
                  value={daysGranted}
                  onChange={(e) => setDaysGranted(Number(e.target.value))}
                  className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none"
                >
                  <option value={1.0}>Full Day (1.0 Credit)</option>
                  <option value={0.5}>Half Day (0.5 Credit)</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Reason / Deliverables</label>
                <textarea
                  rows={2}
                  value={compOffReason}
                  onChange={(e) => setCompOffReason(e.target.value)}
                  placeholder="Detail work performed during weekend or off-schedule day..."
                  className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Award size={14} />}
                <span>Submit Comp-Off Claim</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
