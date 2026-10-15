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
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-purple-600" />
            <h3 className="text-base font-bold text-gray-800">
              Apply Leave — greytHR ESS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Employee Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Applicant
            </label>
            <input
              value={`${employeeName} (${employeeId})`}
              disabled
              className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-xs font-medium text-gray-600"
            />
          </div>

          {/* Leave Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Leave Type
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white text-gray-800 focus:outline-purple-600"
            >
              <option value="earned">Earned Leave (EL) — {getAvailableText("earned")}</option>
              <option value="casual">Casual Leave (CL) — {getAvailableText("casual")}</option>
              <option value="sick">Sick Leave (SL) — {getAvailableText("sick")}</option>
              <option value="paid">General Paid Leave — {getAvailableText("paid")}</option>
              <option value="lop">Loss of Pay (LOP) — {getAvailableText("lop")}</option>
            </select>
          </div>

          {/* Half Day Toggle */}
          <div className="bg-purple-50/60 border border-purple-100 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-purple-900">Apply as Half Day</p>
                <p className="text-[11px] text-purple-700">0.5 day deduction for partial shift</p>
              </div>
              <input
                type="checkbox"
                checked={isHalfDay}
                onChange={(e) => setIsHalfDay(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
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
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium">
              <span className="text-gray-600">Calculated Duration:</span>
              <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                {duration} {duration === 1 ? "Day" : "Days"}
              </span>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Reason for Leave *
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Attending family function, medical appointment..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-purple-600"
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Contact Details During Leave (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Phone number or alternate email"
              value={contactDetails}
              onChange={(e) => setContactDetails(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-purple-600"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
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
