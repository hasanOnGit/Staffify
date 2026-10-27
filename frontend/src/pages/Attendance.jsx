import { useEffect, useMemo, useState, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import AttendanceTable from "../components/AttendanceTable";
import AttendanceHeatmap from "../components/AttendanceHeatmap";
import GeofenceModal from "../components/GeofenceModal";
import BiometricManagerModal from "../components/BiometricManagerModal";
import StaffifyLoader from "../components/StaffifyLoader";
import ClockWidget from "../components/ClockWidget";
import { getAttendanceByDate, getAttendanceHistory, requestRegularization } from "../services/attendance";
import { getGeofenceZones } from "../services/geofence";
import { getEmployees } from "../services/employee";
import { useAuth } from "../context/AuthContext";
import {
  Clock,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  X,
  MapPin,
  SlidersHorizontal,
  Cpu,
  Download,
  Users,
  User,
} from "lucide-react";
import { exportToCsv } from "../utils/csvExporter";
import toast from "react-hot-toast";

function Attendance() {
  const { user, isManager, isAdmin } = useAuth();
  const canManage = isManager || isAdmin;

  // View Mode: Managers can toggle between "team" and "my". Regular employees are locked to "my".
  const [viewMode, setViewMode] = useState(canManage ? "team" : "my");

  // Sync viewMode if role changes
  useEffect(() => {
    if (!canManage && viewMode !== "my") {
      setViewMode("my");
    }
  }, [canManage, viewMode]);

  const [teamAttendance, setTeamAttendance] = useState([]);
  const [myHistory, setMyHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [personalSpan, setPersonalSpan] = useState("month"); // "month" or "date"
  const [statusFilter, setStatusFilter] = useState("All");

  // Geofence Modal & Zones
  const [showGeofenceModal, setShowGeofenceModal] = useState(false);
  const [activeZones, setActiveZones] = useState([]);

  // Biometric Terminal Modal
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [employeesList, setEmployeesList] = useState([]);

  // Regularization Modal State
  const [showRegModal, setShowRegModal] = useState(false);
  const [regDate, setRegDate] = useState(new Date().toISOString().slice(0, 10));
  const [regReason, setRegReason] = useState("");
  const [regIn, setRegIn] = useState("09:00");
  const [regOut, setRegOut] = useState("18:00");
  const [regSubmitting, setRegSubmitting] = useState(false);

  /* ---------- Fetch Live Records with Role-Based Scoping ---------- */
  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const empId = user?.employeeId || user?.userId;

      if (canManage) {
        // Manager can load full workforce register for selected date
        const teamData = await getAttendanceByDate(selectedDate);
        setTeamAttendance(Array.isArray(teamData) ? teamData : []);
      } else {
        // Regular employee never loads company-wide records
        setTeamAttendance([]);
      }

      // Always load personal history for active user
      if (empId) {
        const myData = await getAttendanceHistory(empId);
        setMyHistory(Array.isArray(myData) ? myData : []);
      }
    } catch (err) {
      console.error("Fetch attendance error:", err);
      toast.error("Unable to load attendance records.");
      setTeamAttendance([]);
      setMyHistory([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, canManage, user?.employeeId, user?.userId]);

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
    if (canManage) {
      getEmployees()
        .then((data) => setEmployeesList(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, [fetchRecords, loadActiveZones, canManage]);

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

  /* ---------- Calculations & Scoped Lists ---------- */
  const isPersonal = viewMode === "my";

  // Base list depending on active view mode
  const baseList = useMemo(() => {
    if (!isPersonal) {
      return teamAttendance;
    }
    if (personalSpan === "date") {
      return myHistory.filter((r) => r.date === selectedDate);
    }
    // "month": return full monthly history sorted newest first
    return [...myHistory].sort((a, b) => b.date.localeCompare(a.date));
  }, [isPersonal, teamAttendance, myHistory, personalSpan, selectedDate]);

  const summary = useMemo(() => {
    const list = isPersonal ? myHistory : teamAttendance;
    return {
      Present: list.filter((a) => a.status === "Present").length,
      Late: list.filter((a) => a.status === "Late").length,
      HalfDay: list.filter((a) => a.status === "Half Day").length,
      Absent: list.filter((a) => a.status === "Absent").length,
      WFH: list.filter((a) => a.status === "WFH").length,
      Total: list.length,
    };
  }, [isPersonal, myHistory, teamAttendance]);

  const filteredAttendance = useMemo(() => {
    if (statusFilter === "All") return baseList;
    return baseList.filter((a) => a.status === statusFilter);
  }, [baseList, statusFilter]);

  /* ---------- Regularization Submission ---------- */
  const handleRegularizeSubmit = async (e) => {
    e.preventDefault();
    const empId = user?.employeeId || user?.userId;
    if (!empId) {
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
        employeeId: empId,
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

  /* ---------- Export CSV (Scoped per Role/View) ---------- */
  const handleExportCsv = () => {
    if (isPersonal) {
      exportToCsv({
        filename: `Staffify_My_Attendance_${user?.employeeId || "emp"}_${selectedDate.slice(0, 7)}.csv`,
        headers: [
          { key: "date", label: "Date" },
          { key: "inTime", label: "Punch In", accessor: (item) => item.inTime || item.firstIn || "-" },
          { key: "outTime", label: "Punch Out", accessor: (item) => item.outTime || item.lastOut || "-" },
          {
            key: "workHours",
            label: "Work Hours",
            accessor: (item) => item.workHours || (item.totalHours ? `${item.totalHours} hrs` : "-"),
          },
          { key: "status", label: "Attendance Status" },
          {
            key: "geofenceZone",
            label: "Geofence Zone",
            accessor: (item) =>
              item.geofenceZone ||
              item.punches?.[item.punches.length - 1]?.location?.zoneName ||
              "Authorized Office Campus",
          },
          {
            key: "ipAddress",
            label: "Client Network IP",
            accessor: (item) =>
              item.ipAddress ||
              item.punches?.[item.punches.length - 1]?.ipAddress ||
              "127.0.0.1",
          },
          {
            key: "regularization",
            label: "Regularization Status",
            accessor: (item) => item.regularization?.status || "None",
          },
        ],
        data: filteredAttendance,
      });
    } else {
      exportToCsv({
        filename: `Staffify_Workforce_Attendance_${selectedDate}.csv`,
        headers: [
          { key: "employeeId", label: "Employee ID" },
          { key: "employeeName", label: "Employee Name" },
          { key: "date", label: "Date" },
          { key: "inTime", label: "Punch In" },
          { key: "outTime", label: "Punch Out" },
          { key: "workHours", label: "Work Hours" },
          { key: "status", label: "Attendance Status" },
          {
            key: "geofenceZone",
            label: "Geofence Zone",
            accessor: (item) =>
              item.geofenceZone ||
              item.punches?.[item.punches.length - 1]?.location?.zoneName ||
              "Authorized Office Campus",
          },
          {
            key: "ipAddress",
            label: "Client Network IP",
            accessor: (item) =>
              item.ipAddress ||
              item.punches?.[item.punches.length - 1]?.ipAddress ||
              "127.0.0.1",
          },
          {
            key: "verification",
            label: "Punch Method",
            accessor: (item) => item.punchSource || "Web Clock-In (GPS & IP Verified)",
          },
        ],
        data: filteredAttendance,
      });
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#172B4D]">
              {isPersonal ? "My Attendance & Swipes" : "Workforce Attendance & Swipes"}
            </h1>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isPersonal
                  ? "bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]"
                  : "bg-[#EAE6FF] text-[#403294] border border-[#C0B6F2]"
              }`}
            >
              {isPersonal ? "Personal Register" : "Workforce Live Register"}
            </span>
          </div>
          <p className="text-sm text-[#6B778C] mt-0.5">
            {isPersonal
              ? "Personal punch logs, 30-day streak consistency, office boundary checks, and regularization"
              : "Real-time workforce punch logs, GPS geofencing radius validation, and regularization approvals"}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
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

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            disabled={filteredAttendance.length === 0}
            className="flex items-center gap-1.5 bg-white border border-[#DFE1E6] text-[#172B4D] hover:bg-[#F4F5F7] text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded transition shadow-2xs cursor-pointer disabled:opacity-50"
            title={isPersonal ? "Export my monthly attendance to CSV" : "Export workforce attendance register to CSV"}
          >
            <Download size={14} className="text-[#0052CC]" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>

          {/* Office Geofences Settings / Info */}
          <button
            onClick={() => setShowGeofenceModal(true)}
            className="flex items-center gap-1.5 bg-white border border-[#DFE1E6] text-[#172B4D] hover:bg-[#F4F5F7] text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded transition shadow-2xs cursor-pointer"
            title={canManage ? "View & Configure Authorized Office Geofences" : "View Authorized Office Zones"}
          >
            <MapPin size={14} className="text-[#0052CC]" />
            <span className="hidden sm:inline">{canManage ? "Office Geofences" : "View Office Zones"}</span>
            <span className="sm:hidden">Geofences</span>
          </button>

          {/* Biometric Hardware Terminals Modal - Restricted to Managers/Admins */}
          {canManage && !isPersonal && (
            <button
              onClick={() => setShowBiometricModal(true)}
              className="flex items-center gap-1.5 bg-white border border-[#DFE1E6] text-[#172B4D] hover:bg-[#F4F5F7] text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded transition shadow-2xs cursor-pointer"
              title="Manage eSSL / ZKTeco Biometric Devices and Sync Logs"
            >
              <Cpu size={14} className="text-[#00875A]" />
              <span className="hidden sm:inline">Biometric Hardware</span>
              <span className="sm:hidden">Biometric</span>
            </button>
          )}

          {/* Regularize Button */}
          <button
            onClick={() => setShowRegModal(true)}
            className="flex items-center gap-1.5 bg-[#0052CC] text-white hover:bg-[#0747A6] text-xs font-semibold px-3 py-1.5 sm:py-2 rounded transition shadow-2xs cursor-pointer"
            title="Submit Attendance Regularization Request"
          >
            <PlusCircle size={14} />
            <span>Regularize</span>
          </button>
        </div>
      </div>

      {/* Mobile Web Punch Clock-In Card (Visible on mobile/tablet screens < lg) */}
      <div className="lg:hidden bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-lg p-3 sm:p-4 mb-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF] flex items-center justify-center">
              <Clock size={13} />
            </div>
            <span className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9]">
              Live Shift Clock-In & Location
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            GPS Active
          </span>
        </div>
        <div className="flex justify-center pt-1">
          <ClockWidget />
        </div>
      </div>

      {/* Role Navigation Switcher (Only visible to Managers / Admins) */}
      {canManage && (
        <div className="flex items-center gap-1 p-1 bg-[#EBECF0] rounded-lg mb-5 w-fit">
          <button
            onClick={() => setViewMode("team")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              viewMode === "team"
                ? "bg-white text-[#0052CC] shadow-xs"
                : "text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <Users size={14} />
            <span>Workforce Register</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#DEEBFF] text-[#0052CC] font-bold">
              {teamAttendance.length}
            </span>
          </button>
          <button
            onClick={() => setViewMode("my")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              viewMode === "my"
                ? "bg-white text-[#0052CC] shadow-xs"
                : "text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <User size={14} />
            <span>My Attendance</span>
          </button>
        </div>
      )}

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
              {activeZones.length > 0
                ? `${activeZones.length} Office Zone${activeZones.length > 1 ? "s" : ""} Active`
                : "Bangalore HQ Active"}
            </p>
            <p className="text-[10px] text-[#6B778C]">Standard Radius: 300m</p>
          </div>
          <button
            onClick={() => setShowGeofenceModal(true)}
            className="text-xs font-medium bg-white text-[#0052CC] hover:bg-[#DEEBFF] border border-[#B3D4FF] px-2.5 py-1.5 rounded transition cursor-pointer flex items-center gap-1"
          >
            <SlidersHorizontal size={13} />
            <span>{canManage ? "Configure Radii" : "View Office Zones"}</span>
          </button>
        </div>
      </div>

      {/* 30-Day Attendance Consistency Heatmap (Personalized to current user) */}
      <AttendanceHeatmap
        attendanceRecords={myHistory}
        userName={user?.name || "Employee"}
      />

      {/* Summary KPI Cards (Clickable for 1-Click Filtering) */}
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
          {isPersonal ? "My Monthly Overview" : `Workforce Daily Status (${selectedDate})`}
        </p>
        {isPersonal && (
          <div className="flex items-center gap-1 bg-[#F4F5F7] p-0.5 rounded border border-[#DFE1E6] text-[11px]">
            <button
              onClick={() => setPersonalSpan("month")}
              className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                personalSpan === "month"
                  ? "bg-white text-[#0052CC] shadow-2xs font-bold"
                  : "text-[#6B778C] hover:text-[#172B4D]"
              }`}
            >
              Full Month
            </button>
            <button
              onClick={() => setPersonalSpan("date")}
              className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                personalSpan === "date"
                  ? "bg-white text-[#0052CC] shadow-2xs font-bold"
                  : "text-[#6B778C] hover:text-[#172B4D]"
              }`}
            >
              Selected Date
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        <div onClick={() => setStatusFilter("Present")} className="cursor-pointer transition hover:scale-[1.01]">
          <SummaryCard title={isPersonal ? "Days Present" : "Present Today"} value={summary.Present} color="green" />
        </div>
        <div onClick={() => setStatusFilter("Late")} className="cursor-pointer transition hover:scale-[1.01]">
          <SummaryCard title={isPersonal ? "Late Punches" : "Late Arrivals"} value={summary.Late} color="yellow" />
        </div>
        <div onClick={() => setStatusFilter("Half Day")} className="cursor-pointer transition hover:scale-[1.01]">
          <SummaryCard title="Half Day" value={summary.HalfDay} color="purple" />
        </div>
        <div onClick={() => setStatusFilter("Absent")} className="cursor-pointer transition hover:scale-[1.01]">
          <SummaryCard title="Absent" value={summary.Absent} color="red" />
        </div>
        <div onClick={() => setStatusFilter("WFH")} className="cursor-pointer transition hover:scale-[1.01]">
          <SummaryCard title={isPersonal ? "WFH Days" : "Remote / WFH"} value={summary.WFH} color="blue" />
        </div>
      </div>

      {/* Smart Filter Presets ("1-Click Quick Views") */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-4 text-xs font-medium">
        {[
          { id: "All", label: "All Records", count: summary.Total },
          { id: "Present", label: "Present On-Time", count: summary.Present },
          { id: "Late", label: "Late Arrivals", count: summary.Late },
          { id: "WFH", label: "Remote / WFH", count: summary.WFH },
          { id: "Half Day", label: "Half Day", count: summary.HalfDay },
          { id: "Absent", label: "Absentees", count: summary.Absent },
        ].map((pill) => {
          const isActive = statusFilter === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition cursor-pointer whitespace-nowrap text-xs ${
                isActive
                  ? "bg-[#0052CC] text-white border-[#0052CC] font-semibold shadow-2xs"
                  : "bg-white dark:bg-[#151B26] text-[#6B778C] dark:text-[#94A3B8] border-[#DFE1E6] dark:border-[#263042] hover:bg-[#F4F5F7] dark:hover:bg-[#1E293B]"
              }`}
            >
              <span>{pill.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-[#F4F5F7] dark:bg-[#1E293B] text-[#172B4D] dark:text-[#E2E8F0]"
                }`}
              >
                {pill.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[#6B778C]" />
          <h2 className="text-sm font-bold text-[#172B4D] uppercase tracking-wide">
            {isPersonal
              ? `My Attendance Log (${filteredAttendance.length})`
              : `Workforce Attendance Log (${filteredAttendance.length})`}
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
        <div className="bg-white border border-[#DFE1E6] rounded p-8 text-center shadow-xs">
          <StaffifyLoader mode="card" size="md" text="Loading live attendance & biometric punch records..." />
        </div>
      ) : (
        <AttendanceTable
          records={filteredAttendance}
          isManager={canManage && !isPersonal}
          isPersonalView={isPersonal}
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
        isManager={canManage}
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

      {/* Biometric Hardware Terminals Modal */}
      {showBiometricModal && canManage && (
        <BiometricManagerModal
          isOpen={showBiometricModal}
          onClose={() => setShowBiometricModal(false)}
          employees={employeesList}
          onSynced={fetchRecords}
        />
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
