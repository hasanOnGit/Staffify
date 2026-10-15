import { useState, useMemo } from "react";
import { X, Calendar, Clock, AlertCircle } from "lucide-react";
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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded max-w-lg w-full p-5 shadow-lg border border-[#DFE1E6] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#DFE1E6]">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#0052CC]" />
            <h3 className="text-sm font-bold text-[#172B4D]">
              Apply Leave — Staffify ESS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#6B778C] hover:text-[#172B4D] p-1 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-3.5 space-y-3.5">
          {/* Employee Name */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Applicant
            </label>
            <input
              value={`${employeeName} (${employeeId})`}
              disabled
              className="w-full border border-[#DFE1E6] bg-[#F4F5F7] rounded px-3 py-1.5 text-xs font-medium text-[#172B4D]"
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
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#F4F5F7] border border-[#DFE1E6] rounded text-xs font-medium">
              <span className="text-[#6B778C]">Calculated Duration:</span>
              <span className="text-[#0052CC] font-bold bg-[#DEEBFF] px-2 py-0.5 rounded border border-[#B3D4FF]">
                {duration} {duration === 1 ? "Day" : "Days"}
              </span>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Reason for Leave *
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Attending family function, medical appointment..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full border border-[#DFE1E6] rounded px-3 py-1.5 text-xs text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Contact Details During Leave (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Phone number or alternate email"
              value={contactDetails}
              onChange={(e) => setContactDetails(e.target.value)}
              className="w-full border border-[#DFE1E6] rounded px-3 py-1.5 text-xs text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#DFE1E6] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-[#DFE1E6] rounded text-xs font-medium text-[#172B4D] hover:bg-[#F4F5F7] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-medium transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApplyLeaveModal;
