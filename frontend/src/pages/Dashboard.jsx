import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getEmployees } from "../services/employee";
import { getLeaves, updateLeave, getLeaveBalance, getTeamOnLeave } from "../services/leave";
import { getHolidays } from "../services/holiday";
import { getAttendanceByDate } from "../services/attendance";
import {
  Calendar,
  Building2,
  CheckCircle2,
  UserCheck,
  ArrowRight,
  Users,
  CalendarX2,
  AlertCircle,
  ChevronRight,
  FileText,
  Check,
  X,
  Clock,
  Layers,
  FolderGit2,
  Boxes,
} from "lucide-react";

function Dashboard() {
  const { user, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("recommended");
  const [stats, setStats] = useState({
    totalEmployees: 4,
    presentToday: 2,
    onLeave: 0,
    lateArrivals: 0,
    absentToday: 2,
  });

  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [teamOnLeave, setTeamOnLeave] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Today formatted string
  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const loadData = async () => {
    try {
      const todayISO = new Date().toISOString().split("T")[0];

      // 1. Fetch Employees
      const emps = await getEmployees().catch(() => []);
      const empCount = emps?.length || 4;

      // 2. Fetch Attendance for Today
      const attRecords = await getAttendanceByDate(todayISO).catch(() => []);
      const presentCount = attRecords?.length || Math.max(1, Math.floor(empCount * 0.5));
      const lateCount = attRecords?.filter((r) => r.status === "Late")?.length || 0;

      // 3. Fetch Leaves
      const allLeaves = await getLeaves().catch(() => []);
      const pending = allLeaves?.filter((l) => l.status === "Pending") || [];
      setPendingLeaves(pending);

      // 4. Fetch Team on Leave
      const onLeave = await getTeamOnLeave().catch(() => []);
      setTeamOnLeave(onLeave || []);

      // 5. Compute Stats
      const onLeaveCount = onLeave?.length || 0;
      const absentCount = Math.max(0, empCount - presentCount - onLeaveCount);

      setStats({
        totalEmployees: empCount,
        presentToday: presentCount,
        onLeave: onLeaveCount,
        lateArrivals: lateCount,
        absentToday: absentCount,
      });

      // 6. Fetch Holidays
      const holidayData = await getHolidays().catch(() => []);
      setHolidays(holidayData || []);

      // 7. If employee, fetch personal balance
      if (!isAdmin && !isManager) {
        const empId = user?.userId || "EMP-DEV-03";
        const bal = await getLeaveBalance(empId).catch(() => null);
        if (bal) setLeaveBalances(bal);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Handle Quick Approve / Reject for Pending Leaves
  const handleQuickLeaveAction = async (leaveId, status) => {
    try {
      setActionLoading(true);
      await updateLeave(leaveId, status, user?.name || "HR Admin");
      await loadData();
    } catch (err) {
      console.error(`Failed to ${status} leave:`, err);
    } finally {
      setActionLoading(false);
    }
  };

  // Next Upcoming Holiday
  const upcomingHoliday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sorted = holidays
      .filter((h) => new Date(h.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return sorted[0] || null;
  }, [holidays]);

  // Days until next holiday
  const daysUntilHoliday = useMemo(() => {
    if (!upcomingHoliday) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const holDate = new Date(upcomingHoliday.date);
    const diff = Math.ceil((holDate - today) / (1000 * 60 * 60 * 24));
    return diff;
  }, [upcomingHoliday]);

  // Attendance rate calculation
  const attendanceRate = useMemo(() => {
    if (!stats.totalEmployees) return 0;
    return Math.round((stats.presentToday / stats.totalEmployees) * 100);
  }, [stats]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* ========================================================
            1. MINIMAL JIRA-STYLE SECTION: RECOMMENDED SPACES (SQUADS)
            ======================================================== */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#172B4D]">Recommended spaces</h2>
            <button
              onClick={() => navigate("/teams")}
              className="text-xs text-[#0052CC] hover:underline font-medium cursor-pointer"
            >
              View all spaces
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div
              onClick={() => navigate("/teams")}
              className="bg-white border border-[#DFE1E6] rounded-md p-3.5 hover:border-[#0052CC] hover:shadow-2xs transition cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded bg-[#FF5630]/10 text-[#DE350B] flex items-center justify-center shrink-0 border border-[#FFBDAD]/40">
                <FolderGit2 size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-bold text-[#172B4D] group-hover:text-[#0052CC] transition truncate">
                  Engineering Core Squad
                </h3>
                <p className="text-[11px] text-[#6B778C] truncate mt-0.5">
                  Tech & Platforms • 4 members
                </p>
              </div>
            </div>

            <div
              onClick={() => navigate("/teams")}
              className="bg-white border border-[#DFE1E6] rounded-md p-3.5 hover:border-[#0052CC] hover:shadow-2xs transition cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded bg-[#0052CC]/10 text-[#0052CC] flex items-center justify-center shrink-0 border border-[#B3D4FF]/40">
                <Boxes size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-bold text-[#172B4D] group-hover:text-[#0052CC] transition truncate">
                  Product & Operations
                </h3>
                <p className="text-[11px] text-[#6B778C] truncate mt-0.5">
                  Business & Delivery • 2 members
                </p>
              </div>
            </div>

            <div
              onClick={() => navigate("/teams")}
              className="bg-white border border-[#DFE1E6] rounded-md p-3.5 hover:border-[#0052CC] hover:shadow-2xs transition cursor-pointer flex items-center gap-3 group sm:col-span-2 lg:col-span-1"
            >
              <div className="w-10 h-10 rounded bg-[#5243AA]/10 text-[#5243AA] flex items-center justify-center shrink-0 border border-[#C0B6F2]/40">
                <Building2 size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-bold text-[#172B4D] group-hover:text-[#0052CC] transition truncate">
                  HR & People Operations
                </h3>
                <p className="text-[11px] text-[#6B778C] truncate mt-0.5">
                  Statutory & Compliance • 3 members
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. JIRA-STYLE FILTER TABS ROW
            ======================================================== */}
        <div className="flex items-center gap-2 border-b border-[#DFE1E6] pb-2 overflow-x-auto select-none">
          <button
            onClick={() => setActiveTab("recommended")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
              activeTab === "recommended"
                ? "bg-[#EBECF0] text-[#172B4D] font-bold"
                : "text-[#42526E] hover:bg-[#EBECF0] hover:text-[#172B4D]"
            }`}
          >
            Recommended
          </button>

          <button
            onClick={() => setActiveTab("approvals")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "approvals"
                ? "bg-[#EBECF0] text-[#172B4D] font-bold"
                : "text-[#42526E] hover:bg-[#EBECF0] hover:text-[#172B4D]"
            }`}
          >
            <span>Assigned to me</span>
            {pendingLeaves.length > 0 && (
              <span className="px-1.5 py-0.2 bg-[#0052CC] text-white text-[10px] font-bold rounded-full">
                {pendingLeaves.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
              activeTab === "attendance"
                ? "bg-[#EBECF0] text-[#172B4D] font-bold"
                : "text-[#42526E] hover:bg-[#EBECF0] hover:text-[#172B4D]"
            }`}
          >
            Attendance Pulse
          </button>

          <button
            onClick={() => setActiveTab("holidays")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
              activeTab === "holidays"
                ? "bg-[#EBECF0] text-[#172B4D] font-bold"
                : "text-[#42526E] hover:bg-[#EBECF0] hover:text-[#172B4D]"
            }`}
          >
            Holiday Schedule
          </button>
        </div>

        {/* ========================================================
            3. CLEAN KPI METRICS ROW (Minimal Atlassian Style)
            ======================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white border border-[#DFE1E6] rounded-md p-3.5 border-t-3 border-t-[#0052CC]">
            <span className="text-[11px] font-semibold text-[#6B778C] uppercase tracking-wider block">
              Total Headcount
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-[#172B4D]">{stats.totalEmployees}</span>
              <span className="text-[11px] text-[#6B778C]">Active Staff</span>
            </div>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-md p-3.5 border-t-3 border-t-[#00875A]">
            <span className="text-[11px] font-semibold text-[#6B778C] uppercase tracking-wider block">
              Present Today
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-[#00875A]">{stats.presentToday}</span>
              <span className="text-[11px] font-semibold text-[#00875A]">
                {attendanceRate}% Turnout
              </span>
            </div>
            <div className="w-full bg-[#EBECF0] h-1.5 rounded-full overflow-hidden mt-2">
              <div
                style={{ width: `${attendanceRate}%` }}
                className="bg-[#00875A] h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-md p-3.5 border-t-3 border-t-[#FF991F]">
            <span className="text-[11px] font-semibold text-[#6B778C] uppercase tracking-wider block">
              On Leave
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-[#172B4D]">{stats.onLeave}</span>
              <span className="text-[11px] text-[#6B778C]">Approved Out</span>
            </div>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-md p-3.5 border-t-3 border-t-[#DE350B]">
            <span className="text-[11px] font-semibold text-[#6B778C] uppercase tracking-wider block">
              Late Arrivals
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-[#DE350B]">{stats.lateArrivals}</span>
              <span className="text-[11px] text-[#6B778C]">&gt; 09:30 AM</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            4. TWO-COLUMN OPERATIONAL WORK AREA
            Left (8 Cols): Workforce Attendance + Pending Approvals
            Right (4 Cols): Upcoming Holiday + Team Away + Shortcuts
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ===================== LEFT COLUMN (8 COLS) ===================== */}
          <div className="lg:col-span-8 space-y-6">
            {/* Workforce Attendance Snapshot */}
            <div className="bg-white border border-[#DFE1E6] rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-[#172B4D] text-xs uppercase tracking-wider">
                    Workforce Attendance Snapshot
                  </h3>
                  <p className="text-[11px] text-[#6B778C] mt-0.5">{todayStr}</p>
                </div>
                <button
                  onClick={() => navigate("/attendance")}
                  className="text-xs text-[#0052CC] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Attendance Logs</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              {/* Segmented Distribution Bar */}
              <div className="w-full bg-[#EBECF0] h-2.5 rounded-full overflow-hidden flex mb-3">
                {stats.presentToday > 0 && (
                  <div
                    style={{
                      width: `${(stats.presentToday / Math.max(1, stats.totalEmployees)) * 100}%`,
                    }}
                    className="bg-[#00875A] h-full"
                    title={`Present: ${stats.presentToday}`}
                  />
                )}
                {stats.onLeave > 0 && (
                  <div
                    style={{
                      width: `${(stats.onLeave / Math.max(1, stats.totalEmployees)) * 100}%`,
                    }}
                    className="bg-[#FF991F] h-full"
                    title={`On Leave: ${stats.onLeave}`}
                  />
                )}
                {stats.absentToday > 0 && (
                  <div
                    style={{
                      width: `${(stats.absentToday / Math.max(1, stats.totalEmployees)) * 100}%`,
                    }}
                    className="bg-[#DE350B] h-full"
                    title={`Absent: ${stats.absentToday}`}
                  />
                )}
              </div>

              {/* 4 Clean Stat Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-[#E3FCEF]/50 border border-[#ABF5D1] rounded p-2 text-center">
                  <span className="text-[10px] font-bold text-[#006644] uppercase block">
                    Present
                  </span>
                  <span className="text-lg font-bold text-[#006644] mt-0.5 block">
                    {stats.presentToday}
                  </span>
                </div>

                <div className="bg-[#FFEBE6]/50 border border-[#FFBDAD] rounded p-2 text-center">
                  <span className="text-[10px] font-bold text-[#DE350B] uppercase block">
                    Absent
                  </span>
                  <span className="text-lg font-bold text-[#DE350B] mt-0.5 block">
                    {stats.absentToday}
                  </span>
                </div>

                <div className="bg-[#FFF0B3]/50 border border-[#FFE380] rounded p-2 text-center">
                  <span className="text-[10px] font-bold text-[#B9770E] uppercase block">
                    On Leave
                  </span>
                  <span className="text-lg font-bold text-[#B9770E] mt-0.5 block">
                    {stats.onLeave}
                  </span>
                </div>

                <div className="bg-[#F4F5F7] border border-[#DFE1E6] rounded p-2 text-center">
                  <span className="text-[10px] font-bold text-[#42526E] uppercase block">
                    Late Punches
                  </span>
                  <span className="text-lg font-bold text-[#172B4D] mt-0.5 block">
                    {stats.lateArrivals}
                  </span>
                </div>
              </div>
            </div>

            {/* Pending Approvals Tray (Admins & Managers) */}
            {(isAdmin || isManager) && (
              <div className="bg-white border border-[#DFE1E6] rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-[#172B4D] text-xs uppercase tracking-wider">
                      Pending Approvals
                    </h3>
                    <p className="text-[11px] text-[#6B778C] mt-0.5">
                      Leave applications awaiting review
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/leaves")}
                    className="text-xs text-[#0052CC] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

                {pendingLeaves.length === 0 ? (
                  <div className="text-center py-6 bg-[#FAFBFC] border border-dashed border-[#DFE1E6] rounded">
                    <CheckCircle2 size={18} className="text-[#00875A] mx-auto mb-1" />
                    <p className="text-xs font-semibold text-[#172B4D]">No pending leave requests</p>
                    <p className="text-[11px] text-[#6B778C]">All team requests are processed.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-[#DFE1E6] rounded">
                    <table className="min-w-full text-xs divide-y divide-[#DFE1E6]">
                      <thead className="bg-[#F4F5F7] text-[#6B778C] font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="px-3 py-2 text-left">Employee</th>
                          <th className="px-3 py-2 text-left">Type</th>
                          <th className="px-3 py-2 text-left">Dates</th>
                          <th className="px-3 py-2 text-left">Reason</th>
                          <th className="px-3 py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DFE1E6] bg-white">
                        {pendingLeaves.slice(0, 4).map((leave) => {
                          const fromDateStr = new Date(leave.fromDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          });
                          const toDateStr = new Date(leave.toDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          });

                          return (
                            <tr key={leave._id || leave.leaveId} className="hover:bg-[#F4F5F7]">
                              <td className="px-3 py-2 font-medium text-[#172B4D]">
                                {leave.employeeName || "Employee"}
                              </td>
                              <td className="px-3 py-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF] capitalize">
                                  {leave.leaveType}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-[#42526E]">
                                {fromDateStr} – {toDateStr} ({leave.daysCount}d)
                              </td>
                              <td className="px-3 py-2 text-[#6B778C] max-w-xs truncate">
                                {leave.reason || "Personal"}
                              </td>
                              <td className="px-3 py-2 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    disabled={actionLoading}
                                    onClick={() =>
                                      handleQuickLeaveAction(leave.leaveId, "Approved")
                                    }
                                    className="px-2 py-1 bg-[#00875A] hover:bg-[#006644] text-white rounded text-xs font-medium cursor-pointer transition disabled:opacity-50"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    disabled={actionLoading}
                                    onClick={() =>
                                      handleQuickLeaveAction(leave.leaveId, "Rejected")
                                    }
                                    className="px-2 py-1 bg-[#F4F5F7] hover:bg-[#FFEBE6] text-[#DE350B] border border-[#DFE1E6] rounded text-xs font-medium cursor-pointer transition disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Employee View: Leave Balances */}
            {!isAdmin && !isManager && (
              <div className="bg-white border border-[#DFE1E6] rounded-md p-4 space-y-3">
                <h3 className="font-bold text-[#172B4D] text-xs uppercase tracking-wider">
                  My Leave Balances
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="border border-[#DFE1E6] rounded p-2.5 bg-[#F4F5F7]/40">
                    <span className="text-[10px] font-semibold text-[#6B778C] uppercase">Casual</span>
                    <p className="text-lg font-bold text-[#0052CC] mt-0.5">
                      {leaveBalances?.casualLeave?.balance ?? 11} Days
                    </p>
                  </div>
                  <div className="border border-[#DFE1E6] rounded p-2.5 bg-[#F4F5F7]/40">
                    <span className="text-[10px] font-semibold text-[#6B778C] uppercase">Earned</span>
                    <p className="text-lg font-bold text-[#00875A] mt-0.5">
                      {leaveBalances?.earnedLeave?.balance ?? 13} Days
                    </p>
                  </div>
                  <div className="border border-[#DFE1E6] rounded p-2.5 bg-[#F4F5F7]/40">
                    <span className="text-[10px] font-semibold text-[#6B778C] uppercase">Sick</span>
                    <p className="text-lg font-bold text-[#FF991F] mt-0.5">
                      {leaveBalances?.sickLeave?.balance ?? 9} Days
                    </p>
                  </div>
                  <div className="border border-[#DFE1E6] rounded p-2.5 bg-[#F4F5F7]/40">
                    <span className="text-[10px] font-semibold text-[#6B778C] uppercase">Half Day</span>
                    <p className="text-lg font-bold text-[#172B4D] mt-0.5">
                      {leaveBalances?.halfDay?.balance ?? 6} Days
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ===================== RIGHT COLUMN (4 COLS) ===================== */}
          <div className="lg:col-span-4 space-y-6">
            {/* Upcoming Holiday Card */}
            <div className="bg-white border border-[#DFE1E6] rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#172B4D] uppercase tracking-wider">
                  Upcoming Holiday
                </span>
                {daysUntilHoliday !== null && (
                  <span className="text-[10px] font-semibold bg-[#DEEBFF] text-[#0052CC] px-2 py-0.5 rounded border border-[#B3D4FF]">
                    {daysUntilHoliday === 0 ? "Today" : `In ${daysUntilHoliday} Days`}
                  </span>
                )}
              </div>

              {upcomingHoliday ? (
                <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded p-3 mb-2">
                  <h4 className="font-bold text-[#172B4D] text-xs">{upcomingHoliday.name}</h4>
                  <p className="text-[11px] text-[#6B778C] mt-0.5">
                    {new Date(upcomingHoliday.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    • {upcomingHoliday.type}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#6B778C] py-2">No upcoming holidays scheduled.</p>
              )}

              <button
                onClick={() => navigate("/leaves")}
                className="w-full text-center text-xs font-semibold text-[#0052CC] hover:underline pt-2 block cursor-pointer"
              >
                View Holiday Calendar
              </button>
            </div>

            {/* Who's Away Today */}
            <div className="bg-white border border-[#DFE1E6] rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#172B4D] uppercase tracking-wider">
                  Who's Away Today
                </span>
                <span className="text-[11px] text-[#6B778C]">{teamOnLeave.length} On Leave</span>
              </div>

              {teamOnLeave.length === 0 ? (
                <div className="py-4 text-center bg-[#FAFBFC] rounded border border-dashed border-[#DFE1E6]">
                  <p className="text-xs font-medium text-[#172B4D]">Full Squad Active</p>
                  <p className="text-[10px] text-[#6B778C]">No team members on leave today.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {teamOnLeave.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-[#F4F5F7] rounded text-xs"
                    >
                      <span className="font-medium text-[#172B4D]">{item.employeeName}</span>
                      <span className="text-[10px] text-[#6B778C] capitalize">
                        {item.leaveType}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white border border-[#DFE1E6] rounded-md p-4">
              <span className="text-[11px] font-bold text-[#172B4D] uppercase tracking-wider block mb-2">
                Quick Shortcuts
              </span>
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => navigate("/teams")}
                  className="w-full text-left p-2 rounded border border-[#DFE1E6] hover:bg-[#DEEBFF]/30 hover:border-[#0052CC] transition flex items-center justify-between cursor-pointer"
                >
                  <span className="text-[#172B4D]">Squad Directory</span>
                  <ChevronRight size={13} className="text-[#6B778C]" />
                </button>
                <button
                  onClick={() => navigate("/employees")}
                  className="w-full text-left p-2 rounded border border-[#DFE1E6] hover:bg-[#DEEBFF]/30 hover:border-[#0052CC] transition flex items-center justify-between cursor-pointer"
                >
                  <span className="text-[#172B4D]">Employee Directory</span>
                  <ChevronRight size={13} className="text-[#6B778C]" />
                </button>
                <button
                  onClick={() => navigate("/attendance")}
                  className="w-full text-left p-2 rounded border border-[#DFE1E6] hover:bg-[#DEEBFF]/30 hover:border-[#0052CC] transition flex items-center justify-between cursor-pointer"
                >
                  <span className="text-[#172B4D]">Attendance & Swipes</span>
                  <ChevronRight size={13} className="text-[#6B778C]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
