import { useState, useMemo } from "react";
import { X, Calendar, Clock, AlertCircle, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

function ApplyLeaveModal({
  isOpen,
  onClose,
  onSubmit,
  employeeName,
  employeeId,
  balances = {},
  loading = false,
}) {
  const [leaveType, setLeaveType] = useState("earned");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState("Session 1 (First Half)");
  const [reason, setReason] = useState("");
  const [contactDetails, setContactDetails] = useState("");

  // Calculate duration in days
  const duration = useMemo(() => {
    if (!fromDate || !toDate) return 0;
    if (isHalfDay) return 0.5;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (from > to) return 0;
    const diffDays = Math.ceil(Math.abs(to - from) / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [fromDate, toDate, isHalfDay]);

  // Calculate sandwich policy deduction details
  const sandwichInfo = useMemo(() => {
    if (!fromDate || !toDate || isHalfDay) return null;
    const start = new Date(fromDate + "T00:00:00");
    const end = new Date(toDate + "T00:00:00");
    if (start > end) return null;
    let weekendDays = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day === 0 || day === 6) {
        weekendDays++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    const workingDays = Math.max(0, duration - weekendDays);
    return {
      weekendDays,
      workingDays,
      totalDays: duration,
      hasSandwich: weekendDays > 0 && duration > 2,
    };
  }, [fromDate, toDate, duration, isHalfDay]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fromDate || !toDate) {
      toast.error("Please select both From and To dates");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast.error("From date cannot be after To date");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please provide a reason for leave");
      return;
    }

    // Check balance
    const quota = balances[leaveType];
    if (leaveType !== "lop" && quota && duration > quota.available) {
      toast.error(
        `Insufficient balance. You have ${quota.available} days available for ${leaveType.toUpperCase()} leave.`
      );
      return;
    }

    onSubmit({
      employeeId,
      employeeName,
      leaveType,
      isHalfDay,
      halfDaySession: isHalfDay ? halfDaySession : "None",
      fromDate,
      toDate,
      reason,
      contactDetailsDuringLeave: contactDetails,
    });
  };

  const getAvailableText = (type) => {
    const b = balances[type];
    if (type === "lop") return "Unpaid / Deducted from pay";
    return b ? `${b.available} days left` : "Available";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#101520] rounded-lg max-w-lg w-full shadow-2xl border border-[#DFE1E6] dark:border-[#263042] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0D121B] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#DEEBFF] dark:bg-[#0747A6]/30 text-[#0052CC] dark:text-[#38BDF8] flex items-center justify-center">
              <Calendar size={15} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                Apply Leave — Staffify ESS
              </h3>
              <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
                Submit statutory time-off or comp-off application
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#6B778C] hover:text-[#172B4D] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] hover:bg-[#EBECF0] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 scroll-smooth">
            {/* Employee Name */}
            <div>
              <label className="block text-xs font-semibold text-[#172B4D] dark:text-[#E2E8F0] mb-1">
                Applicant
              </label>
              <input
                value={`${employeeName} (${employeeId})`}
                disabled
                className="w-full border border-[#DFE1E6] dark:border-[#263042] bg-[#F4F5F7] dark:bg-[#151B26] rounded px-3 py-1.5 text-xs font-medium text-[#172B4D] dark:text-[#F1F5F9]"
              />
            </div>

          {/* Leave Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Leave Type
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full border border-[#DFE1E6] rounded px-3 py-1.5 text-xs bg-white text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
            >
              <option value="earned">Earned Leave (EL) — {getAvailableText("earned")}</option>
              <option value="casual">Casual Leave (CL) — {getAvailableText("casual")}</option>
              <option value="sick">Sick Leave (SL) — {getAvailableText("sick")}</option>
              <option value="paid">General Paid Leave — {getAvailableText("paid")}</option>
              <option value="lop">Loss of Pay (LOP) — {getAvailableText("lop")}</option>
            </select>
          </div>

          {/* Half Day Toggle */}
          <div className="bg-[#DEEBFF]/30 border border-[#B3D4FF] rounded p-2.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#0747A6]">Apply as Half Day</p>
                <p className="text-[11px] text-[#0052CC]">0.5 day deduction for partial shift</p>
              </div>
              <input
                type="checkbox"
                checked={isHalfDay}
                onChange={(e) => setIsHalfDay(e.target.checked)}
                className="w-4 h-4 text-[#0052CC] rounded focus:ring-[#0052CC] cursor-pointer"
              />
            </div>

            {isHalfDay && (
              <div className="mt-2.5 pt-2.5 border-t border-purple-100">
                <label className="block text-xs font-medium text-purple-900 mb-1">
                  Select Session
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 bg-white border border-purple-200 p-2 rounded-md cursor-pointer">
                    <input
                      type="radio"
                      name="session"
                      value="Session 1 (First Half)"
                      checked={halfDaySession === "Session 1 (First Half)"}
                      onChange={(e) => setHalfDaySession(e.target.value)}
                    />
                    <span>Session 1 (1st Half)</span>
                  </label>
                  <label className="flex items-center gap-2 bg-white border border-purple-200 p-2 rounded-md cursor-pointer">
                    <input
                      type="radio"
                      name="session"
                      value="Session 2 (Second Half)"
                      checked={halfDaySession === "Session 2 (Second Half)"}
                      onChange={(e) => setHalfDaySession(e.target.value)}
                    />
                    <span>Session 2 (2nd Half)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  if (isHalfDay) setToDate(e.target.value);
                }}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={isHalfDay ? fromDate : toDate}
                disabled={isHalfDay}
                onChange={(e) => setToDate(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-purple-600 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Duration Banner */}
          {duration > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#F4F5F7] border border-[#DFE1E6] rounded text-xs font-medium">
                <span className="text-[#6B778C]">Calculated Duration:</span>
                <span className="text-[#0052CC] font-bold bg-[#DEEBFF] px-2 py-0.5 rounded border border-[#B3D4FF]">
                  {duration} {duration === 1 ? "Day" : "Days"}
                </span>
              </div>
              {sandwichInfo?.hasSandwich ? (
                <div className="text-[11px] bg-amber-50 border border-amber-200 rounded p-2.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
                    <AlertCircle size={13} className="text-amber-600 shrink-0" />
                    <span>Sandwich Leave Deduction Simulator</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div className="bg-white p-1.5 rounded border border-amber-200">
                      <span className="text-gray-500 block">Working Days</span>
                      <strong className="text-gray-800 font-bold text-xs">{sandwichInfo.workingDays}d</strong>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-amber-200">
                      <span className="text-amber-700 block">+ Weekend Days</span>
                      <strong className="text-amber-700 font-bold text-xs">{sandwichInfo.weekendDays}d</strong>
                    </div>
                    <div className="bg-amber-100 p-1.5 rounded border border-amber-300">
                      <span className="text-amber-900 block">Total Debited</span>
                      <strong className="text-amber-900 font-bold text-xs">{sandwichInfo.totalDays}d</strong>
                    </div>
                  </div>
                  <p className="text-[10px] text-amber-700">
                    Intervening weekend days (Saturday & Sunday) are counted as active leave debits per company statutory sandwich policy.
                  </p>
                </div>
              ) : duration > 2 && !isHalfDay ? (
                <div className="text-[11px] text-[#42526E] bg-[#DEEBFF]/30 border border-[#B3D4FF] p-2 rounded flex items-center gap-1.5">
                  <AlertCircle size={13} className="text-[#0052CC] shrink-0" />
                  <span>
                    No weekend overlap detected. All {duration} days are standard working days.
                  </span>
                </div>
              ) : null}
            </div>
          )}

          {/* Reason */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#172B4D]">
                Reason for Leave *
              </label>
              <button
                type="button"
                onClick={() => {
                  const reasons = [
                    "Personal family commitment requiring planned absence; reachable via phone if urgent.",
                    "Scheduled medical check-up and restorative wellness rest.",
                    "Out-of-town festival and family travel; emergency contacts provided.",
                    "Urgent domestic repair and municipal documentation work.",
                  ];
                  const chosen = reasons[Math.floor(Math.random() * reasons.length)];
                  setReason(chosen);
                  toast.success("AI drafted a professional leave reason!");
                }}
                className="flex items-center gap-1 text-[10px] font-semibold text-[#0052CC] hover:text-[#0747A6] bg-[#DEEBFF] hover:bg-[#B3D4FF] px-2 py-0.5 rounded cursor-pointer transition"
                title="Draft a polite, professional reason with AI"
              >
                <Sparkles size={11} />
                <span>AI Draft Reason</span>
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="e.g. Attending family function, medical appointment..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 100)}
              required
              className="w-full border border-[#DFE1E6] dark:border-[#263042] rounded px-3 py-1.5 text-xs text-[#172B4D] dark:text-[#F1F5F9] bg-white dark:bg-[#151B26] focus:outline-none focus:border-[#0052CC]"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {[
                { label: "Family Event", text: "Attending an important family event and social commitments." },
                { label: "Medical Appointment", text: "Scheduled medical consultation and subsequent rest." },
                { label: "Personal Emergency", text: "Urgent personal matter requiring immediate attention." },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setReason(item.text)}
                  className="text-[9.5px] bg-[#F4F5F7] dark:bg-[#1C2331] hover:bg-[#EBECF0] dark:hover:bg-[#263042] text-[#42526E] dark:text-[#94A3B8] px-2 py-0.5 rounded border border-[#DFE1E6] dark:border-[#263042] cursor-pointer"
                >
                  + {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] dark:text-[#E2E8F0] mb-1">
              Contact Details During Leave (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Phone number or alternate email"
              value={contactDetails}
              onChange={(e) => setContactDetails(e.target.value)}
              onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 100)}
              className="w-full border border-[#DFE1E6] dark:border-[#263042] rounded px-3 py-1.5 text-xs text-[#172B4D] dark:text-[#F1F5F9] bg-white dark:bg-[#151B26] focus:outline-none focus:border-[#0052CC]"
            />
          </div>
        </div>

        {/* Sticky Pinned Footer Actions */}
        <div className="px-5 py-3 border-t border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0D121B] flex items-center justify-between shrink-0 shadow-xs">
          <div>
            {duration > 0 && (
              <span className="text-[11px] font-bold text-[#0052CC] dark:text-[#579DFF] bg-[#DEEBFF] dark:bg-[#1C2331] px-2.5 py-1 rounded border border-[#B3D4FF] dark:border-[#263042]">
                {duration} {duration === 1 ? "Day Total" : "Days Total"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-[#DFE1E6] dark:border-[#263042] rounded text-xs font-medium text-[#172B4D] dark:text-[#CBD5E1] hover:bg-[#F4F5F7] dark:hover:bg-[#1C2331] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white rounded text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </div>
      </form>
      </div>
    </div>
  );
}

export default ApplyLeaveModal;
