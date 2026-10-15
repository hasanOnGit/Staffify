import { useEffect, useMemo, useState, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import AttendanceTable from "../components/AttendanceTable";
import { getAttendanceByDate, requestRegularization } from "../services/attendance";
import { useAuth } from "../context/AuthContext";
import { Calendar, Clock, RefreshCw, PlusCircle, AlertCircle, X } from "lucide-react";
import toast from "react-hot-toast";

function Attendance() {
  const { user, isManager } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [statusFilter, setStatusFilter] = useState("All");

  // Regularization Modal State
  const [showRegModal, setShowRegModal] = useState(false);
  const [regDate, setRegDate] = useState(new Date().toISOString().slice(0, 10));
  const [regReason, setRegReason] = useState("");
  const [regIn, setRegIn] = useState("09:00");
  const [regOut, setRegOut] = useState("18:00");
  const [regSubmitting, setRegSubmitting] = useState(false);

  /* ---------- Fetch Live Records ---------- */
  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAttendanceByDate(selectedDate);
      setAttendance(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch attendance error:", err);
      toast.error("Unable to load attendance records.");
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Re-fetch when topbar punch updates
  useEffect(() => {
    const handlePunchUpdate = () => {
      fetchRecords();
    };
    window.addEventListener("staffify_punch_updated", handlePunchUpdate);
    return () => {
      window.removeEventListener("staffify_punch_updated", handlePunchUpdate);
    };
  }, [fetchRecords]);

  /* ---------- Calculations ---------- */
  const summary = useMemo(() => {
    return {
      Present: attendance.filter((a) => a.status === "Present").length,
      Absent: attendance.filter((a) => a.status === "Absent").length,
      Late: attendance.filter((a) => a.status === "Late").length,
      HalfDay: attendance.filter((a) => a.status === "Half Day").length,
      WFH: attendance.filter((a) => a.status === "WFH").length,
    };
  }, [attendance]);

  const filteredAttendance = useMemo(() => {
    if (statusFilter === "All") return attendance;
    return attendance.filter((a) => a.status === statusFilter);
  }, [attendance, statusFilter]);

  /* ---------- Regularization Submission ---------- */
  const handleRegularizeSubmit = async (e) => {
    e.preventDefault();
    if (!user?.userId) {
      toast.error("Please sign in first.");
      return;
    }
    if (!regReason.trim()) {
      toast.error("Please provide a reason for regularization.");
      return;
    }

    setRegSubmitting(true);
    try {
      await requestRegularization({
        employeeId: user.userId,
        employeeName: user.name || "Employee",
        date: regDate,
        reason: regReason,
        proposedIn: regIn,
        proposedOut: regOut,
      });
      toast.success("Regularization request submitted to manager!");
      setShowRegModal(false);
      setRegReason("");
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit request.");
    } finally {
      setRegSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">Attendance & Swipes</h1>
            <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
              Live Register
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time daily punch logs, swipe history, and regularization requests
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Date Picker */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 bg-white focus:outline-purple-600 shadow-2xs"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchRecords}
            className="p-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg text-gray-600 transition shadow-2xs"
            title="Refresh Records"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          {/* Regularize Button */}
          <button
            onClick={() => setShowRegModal(true)}
            className="flex items-center gap-1.5 bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-semibold px-3 py-2 rounded-lg transition shadow-2xs"
          >
            <PlusCircle size={14} />
            <span>Regularize</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <SummaryCard title="Present" value={summary.Present} color="green" />
        <SummaryCard title="Late Arrivals" value={summary.Late} color="yellow" />
        <SummaryCard title="Half Day" value={summary.HalfDay} color="purple" />
        <SummaryCard title="Absent" value={summary.Absent} color="red" />
        <SummaryCard title="WFH" value={summary.WFH} color="blue" />
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-500" />
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
            Attendance Log ({filteredAttendance.length})
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Filter by Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-700 focus:outline-purple-600 shadow-2xs"
          >
            <option value="All">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Half Day">Half Day</option>
            <option value="Absent">Absent</option>
            <option value="WFH">WFH</option>
          </select>
        </div>
      </div>

      {/* Attendance Table */}
      {loading ? (
        <div className="bg-white border rounded-xl p-12 text-center text-gray-400">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-purple-600" />
          <p className="text-sm font-medium">Loading live attendance records...</p>
        </div>
      ) : (
        <AttendanceTable
          records={filteredAttendance}
          isManager={isManager}
          onRefresh={fetchRecords}
        />
      )}

      {/* Regularization Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} className="text-purple-600" />
                <h3 className="text-base font-semibold text-gray-800">
                  Attendance Regularization
                </h3>
              </div>
              <button
                onClick={() => setShowRegModal(false)}
                className="text-[#6B778C] hover:text-[#172B4D] p-1 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Forgot to swipe or faced device issues? Submit a regularization request to your manager.
            </p>

            <form onSubmit={handleRegularizeSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Date to Regularize
                </label>
                <input
                  type="date"
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Proposed In Time
                  </label>
                  <input
                    type="time"
                    value={regIn}
                    onChange={(e) => setRegIn(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Proposed Out Time
                  </label>
                  <input
                    type="time"
                    value={regOut}
                    onChange={(e) => setRegOut(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for Regularization
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Biometric system offline, On-duty client meeting..."
                  value={regReason}
                  onChange={(e) => setRegReason(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#DFE1E6] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-3.5 py-1.5 border border-[#DFE1E6] rounded text-xs font-medium text-[#172B4D] hover:bg-[#F4F5F7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={regSubmitting}
                  className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-medium disabled:opacity-50 cursor-pointer"
                >
                  {regSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Attendance;

/* ---------- Summary Card ---------- */
function SummaryCard({ title, value, color }) {
  const colorMap = {
    green: "border-l-[#00875A] text-[#00875A]",
    red: "border-l-[#DE350B] text-[#DE350B]",
    yellow: "border-l-[#FF991F] text-[#FF991F]",
    purple: "border-l-[#403294] text-[#403294]",
    blue: "border-l-[#0052CC] text-[#0052CC]",
  };

  return (
    <div className={`bg-white border border-[#DFE1E6] rounded p-3.5 border-l-4 ${colorMap[color] || "border-l-[#DFE1E6]"}`}>
      <p className="text-[11px] font-semibold text-[#6B778C] uppercase tracking-wider">{title}</p>
      <p className="text-xl font-bold text-[#172B4D] mt-0.5">{value}</p>
    </div>
  );
}
