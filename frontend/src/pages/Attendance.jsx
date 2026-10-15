import { useEffect, useMemo, useState, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import AttendanceTable from "../components/AttendanceTable";
import GeofenceModal from "../components/GeofenceModal";
import { getAttendanceByDate, requestRegularization } from "../services/attendance";
import { getGeofenceZones } from "../services/geofence";
import { useAuth } from "../context/AuthContext";
import { Clock, RefreshCw, PlusCircle, AlertCircle, X, MapPin, SlidersHorizontal } from "lucide-react";
import toast from "react-hot-toast";

function Attendance() {
  const { user, isManager } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [statusFilter, setStatusFilter] = useState("All");

  // Geofence Modal & Zones
  const [showGeofenceModal, setShowGeofenceModal] = useState(false);
  const [activeZones, setActiveZones] = useState([]);

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

  const loadActiveZones = useCallback(async () => {
    try {
      const res = await getGeofenceZones();
      if (res?.success && Array.isArray(res.data)) {
        setActiveZones(res.data);
      }
    } catch {
      // Non-critical background fetch
    }
  }, []);

  useEffect(() => {
    fetchRecords();
    loadActiveZones();
  }, [fetchRecords, loadActiveZones]);

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
      Late: attendance.filter((a) => a.status === "Late").length,
      HalfDay: attendance.filter((a) => a.status === "Half Day").length,
      Absent: attendance.filter((a) => a.status === "Absent").length,
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
            <h1 className="text-2xl font-bold text-[#172B4D]">Attendance & Swipes</h1>
            <span className="text-xs bg-[#EAE6FF] text-[#403294] font-semibold px-2 py-0.5 rounded-full">
              Live Register
            </span>
          </div>
          <p className="text-sm text-[#6B778C] mt-0.5">
            Real-time daily punch logs, GPS geofencing radius validation, and regularization
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Date Picker */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-[#DFE1E6] rounded px-3 py-1.5 text-xs font-medium text-[#172B4D] bg-white focus:outline-[#0052CC] shadow-2xs"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchRecords}
            className="p-2 border border-[#DFE1E6] bg-white hover:bg-[#F4F5F7] rounded text-[#6B778C] transition shadow-2xs cursor-pointer"
            title="Refresh Records"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          {/* Office Geofences Settings / Info */}
          <button
            onClick={() => setShowGeofenceModal(true)}
            className="flex items-center gap-1.5 bg-white border border-[#DFE1E6] text-[#172B4D] hover:bg-[#F4F5F7] text-xs font-semibold px-3 py-2 rounded transition shadow-2xs cursor-pointer"
            title="View & Configure Authorized Office Geofences"
          >
            <MapPin size={14} className="text-[#0052CC]" />
            <span>{isManager ? "Office Geofences" : "View Office Zones"}</span>
          </button>

          {/* Regularize Button */}
          <button
            onClick={() => setShowRegModal(true)}
            className="flex items-center gap-1.5 bg-[#0052CC] text-white hover:bg-[#0747A6] text-xs font-semibold px-3 py-2 rounded transition shadow-2xs cursor-pointer"
          >
            <PlusCircle size={14} />
            <span>Regularize</span>
          </button>
        </div>
      </div>

      {/* Geofence Perimeter Status Card */}
      <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded p-3 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#DEEBFF] text-[#0052CC] rounded border border-[#B3D4FF] shrink-0">
            <MapPin size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wide">
                GPS Geofence Perimeter Protection
              </h3>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]">
                Active Enforcement
              </span>
            </div>
            <p className="text-xs text-[#6B778C] mt-0.5">
              Clock-In and Clock-Out swipe buttons are automatically verified against assigned office boundaries. Punches outside authorized perimeter are locked.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-semibold text-[#172B4D]">
              {activeZones.length > 0 ? `${activeZones.length} Office Zone${activeZones.length > 1 ? "s" : ""} Active` : "Bangalore HQ Active"}
            </p>
            <p className="text-[10px] text-[#6B778C]">Standard Radius: 300m</p>
          </div>
          <button
            onClick={() => setShowGeofenceModal(true)}
            className="text-xs font-medium bg-white text-[#0052CC] hover:bg-[#DEEBFF] border border-[#B3D4FF] px-2.5 py-1.5 rounded transition cursor-pointer flex items-center gap-1"
          >
            <SlidersHorizontal size={13} />
            <span>{isManager ? "Configure Radii" : "View Office Zones"}</span>
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
          <Clock size={16} className="text-[#6B778C]" />
          <h2 className="text-sm font-bold text-[#172B4D] uppercase tracking-wide">
            Attendance Log ({filteredAttendance.length})
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6B778C] font-medium">Filter by Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[#DFE1E6] rounded px-3 py-1.5 text-xs bg-white text-[#172B4D] focus:outline-[#0052CC] shadow-2xs"
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
        <div className="bg-white border border-[#DFE1E6] rounded p-12 text-center text-[#6B778C]">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#0052CC]" />
          <p className="text-sm font-medium">Loading live attendance records...</p>
        </div>
      ) : (
        <AttendanceTable
          records={filteredAttendance}
          isManager={isManager}
          onRefresh={fetchRecords}
        />
      )}

      {/* Geofence Management Modal */}
      <GeofenceModal
        isOpen={showGeofenceModal}
        onClose={() => {
          setShowGeofenceModal(false);
          loadActiveZones();
        }}
      />

      {/* Regularization Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded max-w-md w-full p-6 shadow-xl border border-[#DFE1E6] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFE1E6]">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} className="text-[#0052CC]" />
                <h3 className="text-base font-semibold text-[#172B4D]">
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

            <p className="text-xs text-[#6B778C] mt-2">
              Forgot to swipe or faced device GPS issues? Submit a regularization request to your manager.
            </p>

            <form onSubmit={handleRegularizeSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                  Date to Regularize
                </label>
                <input
                  type="date"
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  required
                  className="w-full border border-[#DFE1E6] rounded px-3 py-2 text-xs text-[#172B4D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                    Proposed In Time
                  </label>
                  <input
                    type="time"
                    value={regIn}
                    onChange={(e) => setRegIn(e.target.value)}
                    required
                    className="w-full border border-[#DFE1E6] rounded px-3 py-2 text-xs text-[#172B4D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                    Proposed Out Time
                  </label>
                  <input
                    type="time"
                    value={regOut}
                    onChange={(e) => setRegOut(e.target.value)}
                    required
                    className="w-full border border-[#DFE1E6] rounded px-3 py-2 text-xs text-[#172B4D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                  Reason for Regularization
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., GPS signal delay, On-duty client meeting, Biometric sync issue..."
                  value={regReason}
                  onChange={(e) => setRegReason(e.target.value)}
                  required
                  className="w-full border border-[#DFE1E6] rounded px-3 py-2 text-xs text-[#172B4D]"
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
