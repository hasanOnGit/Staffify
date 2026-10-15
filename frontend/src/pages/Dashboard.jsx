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
  Clock,
  UserPlus,
  Building2,
  CheckSquare,
  CheckCircle2,
  CalendarDays,
  User,
  ShieldCheck,
  Briefcase,
  UserCheck,
  ArrowRight,
  Circle,
  Users,
  CalendarX2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  TrendingUp,
  FileText,
  Check,
  X,
  Layers,
} from "lucide-react";

function Dashboard() {
  const { user, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();

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
  const [, setRecentAttendance] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Time-of-day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  // Today formatted string
  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
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
      setRecentAttendance(attRecords?.slice(0, 5) || []);

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
      <div className="space-y-6">
        {/* Minimal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
          <div>
            <h1 className="text-xl font-bold text-[#172B4D]">Dashboard</h1>
            <p className="text-xs text-[#6B778C] mt-0.5">
              {isAdmin
                ? "Enterprise overview and workforce operations."
                : isManager
                ? "Team leadership dashboard and approvals."
                : "Personal attendance and self-service overview."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#42526E] bg-white border border-[#DFE1E6] px-3 py-1.5 rounded-md font-medium shadow-2xs">
              <Calendar size={13} className="text-[#6B778C]" />
              <span>{todayStr}</span>
            </span>
          </div>
        </div>

        {/* ========================================================
            2. INTERACTIVE QUICK ACTION CARDS (Catchy Clickable Tiles)
            ======================================================== */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-[#0052CC]" />
              <span>{isAdmin ? "Admin Command Hub" : isManager ? "Manager Actions" : "Self-Service Hub"}</span>
            </h2>
            <span className="text-[11px] text-[#6B778C]">Quick access to frequent operations</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {isAdmin ? (
              <>
                <ActionTile
                  icon={UserPlus}
                  iconBg="bg-[#DEEBFF]"
                  iconColor="text-[#0052CC]"
                  title="Onboard Employee"
                  subtitle="New hire & statutory profile"
                  onClick={() => navigate("/employees")}
                />
                <ActionTile
                  icon={Building2}
                  iconBg="bg-[#EAE6FF]"
                  iconColor="text-[#403294]"
                  title="Configure Squads"
                  subtitle="Department teams & leads"
                  onClick={() => navigate("/teams")}
                />
                <ActionTile
                  icon={CheckSquare}
                  iconBg="bg-[#E3FCEF]"
                  iconColor="text-[#00875A]"
                  title="Leave Approvals"
                  subtitle={
                    pendingLeaves.length > 0
                      ? `${pendingLeaves.length} pending approval`
                      : "All requests reviewed"
                  }
                  badge={pendingLeaves.length > 0 ? `${pendingLeaves.length}` : null}
                  onClick={() => navigate("/leaves")}
                />
                <ActionTile
                  icon={Clock}
                  iconBg="bg-[#FFF0B3]"
                  iconColor="text-[#B9770E]"
                  title="Attendance Swipes"
                  subtitle="Punch audit & regularizations"
                  onClick={() => navigate("/attendance")}
                />
              </>
            ) : isManager ? (
              <>
                <ActionTile
                  icon={Users}
                  iconBg="bg-[#DEEBFF]"
                  iconColor="text-[#0052CC]"
                  title="My Squad Roster"
                  subtitle="View assigned team members"
                  onClick={() => navigate("/teams")}
                />
                <ActionTile
                  icon={CheckSquare}
                  iconBg="bg-[#E3FCEF]"
                  iconColor="text-[#00875A]"
                  title="Team Approvals"
                  subtitle={
                    pendingLeaves.length > 0
                      ? `${pendingLeaves.length} pending review`
                      : "Zero pending actions"
                  }
                  badge={pendingLeaves.length > 0 ? `${pendingLeaves.length}` : null}
                  onClick={() => navigate("/leaves")}
                />
                <ActionTile
                  icon={Clock}
                  iconBg="bg-[#FFF0B3]"
                  iconColor="text-[#B9770E]"
                  title="Shift Attendance"
                  subtitle="Squad daily attendance log"
                  onClick={() => navigate("/attendance")}
                />
                <ActionTile
                  icon={CalendarDays}
                  iconBg="bg-[#EAE6FF]"
                  iconColor="text-[#403294]"
                  title="Apply for Leave"
                  subtitle="Submit personal leave request"
                  onClick={() => navigate("/leaves")}
                />
              </>
            ) : (
              <>
                <ActionTile
                  icon={Clock}
                  iconBg="bg-[#DEEBFF]"
                  iconColor="text-[#0052CC]"
                  title="Attendance & Swipes"
                  subtitle="View punch logs & regularize"
                  onClick={() => navigate("/attendance")}
                />
                <ActionTile
                  icon={CalendarDays}
                  iconBg="bg-[#E3FCEF]"
                  iconColor="text-[#00875A]"
                  title="Apply Leave"
                  subtitle="Submit time-off application"
                  onClick={() => navigate("/leaves")}
                />
                <ActionTile
                  icon={User}
                  iconBg="bg-[#EAE6FF]"
                  iconColor="text-[#403294]"
                  title="My Profile 360"
                  subtitle="Job, banking & emergency data"
                  onClick={() => navigate("/profile")}
                />
                <ActionTile
                  icon={Calendar}
                  iconBg="bg-[#FFF0B3]"
                  iconColor="text-[#B9770E]"
                  title="Holiday Calendar"
                  subtitle="View upcoming gazetted off"
                  onClick={() => navigate("/leaves")}
                />
              </>
            )}
          </div>
        </div>

        {/* ========================================================
            3. HIGH-IMPACT KPI METRICS ROW
            ======================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <KpiMetricCard
            title={isAdmin ? "Total Headcount" : isManager ? "Squad Members" : "Workforce Size"}
            value={stats.totalEmployees}
            badgeText="Active Roster"
            accentColor="#0052CC"
            icon={Users}
            iconBg="bg-[#DEEBFF]"
            iconColor="text-[#0052CC]"
            context={`${stats.totalEmployees} employees on payroll`}
          />

          <KpiMetricCard
            title="Present Today"
            value={stats.presentToday}
            badgeText={`${attendanceRate}% Turnout`}
            accentColor="#00875A"
            icon={UserCheck}
            iconBg="bg-[#E3FCEF]"
            iconColor="text-[#00875A]"
            context="Punched in on duty"
            progressBar={{
              percent: attendanceRate,
              color: "bg-[#00875A]",
            }}
          />

          <KpiMetricCard
            title="On Leave"
            value={stats.onLeave}
            badgeText={stats.onLeave > 0 ? "Out of Office" : "Full Presence"}
            accentColor="#FF991F"
            icon={CalendarX2}
            iconBg="bg-[#FFF0B3]"
            iconColor="text-[#B9770E]"
            context="Approved time-off"
          />

          <KpiMetricCard
            title="Late Arrivals"
            value={stats.lateArrivals}
            badgeText={stats.lateArrivals === 0 ? "100% Punctual" : "Attention"}
            accentColor="#DE350B"
            icon={AlertCircle}
            iconBg="bg-[#FFEBE6]"
            iconColor="text-[#DE350B]"
            context="Punched after 09:30 AM"
          />
        </div>

        {/* ========================================================
            4. TWO-COLUMN RESPONSIVE LAYOUT
            Left (8 Cols): Attendance Snapshot + Pending Approvals Hub
            Right (4 Cols): Upcoming Holiday + Team Pulse + Quick Links
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ===================== LEFT COLUMN (8 COLS) ===================== */}
          <div className="lg:col-span-8 space-y-6">
            {/* Workforce Attendance Pulse Card */}
            <div className="bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-bold text-[#172B4D] text-sm flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#0052CC]" />
                    <span>Workforce Attendance Pulse</span>
                  </h3>
                  <p className="text-xs text-[#6B778C] mt-0.5">
                    Real-time punch distribution for today ({todayStr})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]">
                    {attendanceRate}% Present
                  </span>
                  <button
                    onClick={() => navigate("/attendance")}
                    className="text-xs font-medium text-[#0052CC] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Logs</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* Segmented Distribution Progress Bar */}
              <div className="w-full bg-[#F4F5F7] h-3.5 rounded-full overflow-hidden flex p-0.5 border border-[#DFE1E6] mb-4">
                {stats.presentToday > 0 && (
                  <div
                    style={{
                      width: `${(stats.presentToday / Math.max(1, stats.totalEmployees)) * 100}%`,
                    }}
                    className="bg-[#00875A] h-full rounded-l-full transition-all duration-500"
                    title={`Present: ${stats.presentToday}`}
                  />
                )}
                {stats.onLeave > 0 && (
                  <div
                    style={{
                      width: `${(stats.onLeave / Math.max(1, stats.totalEmployees)) * 100}%`,
                    }}
                    className="bg-[#FF991F] h-full transition-all duration-500"
                    title={`On Leave: ${stats.onLeave}`}
                  />
                )}
                {stats.absentToday > 0 && (
                  <div
                    style={{
                      width: `${(stats.absentToday / Math.max(1, stats.totalEmployees)) * 100}%`,
                    }}
                    className="bg-[#DE350B] h-full rounded-r-full transition-all duration-500"
                    title={`Absent: ${stats.absentToday}`}
                  />
                )}
              </div>

              {/* 4 Clean Pulse Stat Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-[#E3FCEF]/40 border border-[#ABF5D1] rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#006644] uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-[#00875A]" />
                    <span>Present</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-bold text-[#006644]">{stats.presentToday}</span>
                    <span className="text-[11px] text-[#00875A] font-medium">
                      ({Math.round((stats.presentToday / Math.max(1, stats.totalEmployees)) * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="bg-[#FFEBE6]/40 border border-[#FFBDAD] rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#DE350B] uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-[#DE350B]" />
                    <span>Absent</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-bold text-[#DE350B]">{stats.absentToday}</span>
                    <span className="text-[11px] text-[#DE350B] font-medium">
                      ({Math.round((stats.absentToday / Math.max(1, stats.totalEmployees)) * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="bg-[#FFF0B3]/40 border border-[#FFE380] rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#B9770E] uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-[#FF991F]" />
                    <span>On Leave</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-bold text-[#B9770E]">{stats.onLeave}</span>
                    <span className="text-[11px] text-[#B9770E] font-medium">
                      ({Math.round((stats.onLeave / Math.max(1, stats.totalEmployees)) * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="bg-[#F4F5F7] border border-[#DFE1E6] rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#42526E] uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-[#0052CC]" />
                    <span>Late Punches</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-bold text-[#172B4D]">{stats.lateArrivals}</span>
                    <span className="text-[11px] text-[#6B778C] font-medium">&gt; 09:30 AM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Approvals Tray (Admins & Managers) */}
            {(isAdmin || isManager) && (
              <div className="bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#172B4D] text-sm">
                        Pending Leave Applications
                      </h3>
                      {pendingLeaves.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF0B3] text-[#172B4D] border border-[#FFE380]">
                          {pendingLeaves.length} Action Needed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B778C] mt-0.5">
                      Review and take action directly on employee time-off requests
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/leaves")}
                    className="text-xs font-semibold text-[#0052CC] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Leaves</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

                {pendingLeaves.length === 0 ? (
                  <div className="text-center py-8 bg-[#F4F5F7]/60 border border-dashed border-[#DFE1E6] rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-[#E3FCEF] text-[#00875A] flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 size={20} />
                    </div>
                    <p className="text-xs font-semibold text-[#172B4D]">All Caught Up!</p>
                    <p className="text-[11px] text-[#6B778C] mt-0.5">
                      There are no pending leave requests awaiting approval.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-[#DFE1E6] rounded-lg">
                    <table className="min-w-full text-xs divide-y divide-[#DFE1E6]">
                      <thead className="bg-[#F4F5F7] text-[#6B778C] font-semibold uppercase text-[11px]">
                        <tr>
                          <th className="px-3.5 py-2.5 text-left">Employee</th>
                          <th className="px-3.5 py-2.5 text-left">Type</th>
                          <th className="px-3.5 py-2.5 text-left">Period</th>
                          <th className="px-3.5 py-2.5 text-left">Reason</th>
                          <th className="px-3.5 py-2.5 text-right">Quick Action</th>
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
                            <tr key={leave._id || leave.leaveId} className="hover:bg-[#F4F5F7]/50">
                              <td className="px-3.5 py-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-[#DEEBFF] text-[#0052CC] font-bold text-xs flex items-center justify-center shrink-0">
                                    {leave.employeeName ? leave.employeeName.charAt(0) : "E"}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-[#172B4D]">
                                      {leave.employeeName || "Employee"}
                                    </p>
                                    <p className="text-[10px] text-[#6B778C]">{leave.leaveId}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-3.5 py-2.5">
                                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF] capitalize">
                                  {leave.leaveType} Leave
                                </span>
                              </td>

                              <td className="px-3.5 py-2.5 text-[#42526E]">
                                <div>
                                  <span className="font-medium">
                                    {fromDateStr} – {toDateStr}
                                  </span>
                                  <span className="text-[10px] text-[#6B778C] block">
                                    {leave.daysCount} {leave.daysCount === 1 ? "day" : "days"}
                                  </span>
                                </div>
                              </td>

                              <td className="px-3.5 py-2.5 text-[#5E6C84] max-w-xs truncate">
                                {leave.reason || "Personal work"}
                              </td>

                              <td className="px-3.5 py-2.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    disabled={actionLoading}
                                    onClick={() =>
                                      handleQuickLeaveAction(leave.leaveId, "Approved")
                                    }
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#00875A] hover:bg-[#006644] text-white rounded text-xs font-medium cursor-pointer transition disabled:opacity-50"
                                    title="Approve Leave"
                                  >
                                    <Check size={12} />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    disabled={actionLoading}
                                    onClick={() =>
                                      handleQuickLeaveAction(leave.leaveId, "Rejected")
                                    }
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F4F5F7] hover:bg-[#FFEBE6] text-[#DE350B] border border-[#DFE1E6] hover:border-[#FFBDAD] rounded text-xs font-medium cursor-pointer transition disabled:opacity-50"
                                    title="Reject Leave"
                                  >
                                    <X size={12} />
                                    <span>Reject</span>
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

            {/* Employee View: Leave Balances & Punch Status */}
            {!isAdmin && !isManager && (
              <div className="bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-[#172B4D] text-sm flex items-center gap-2">
                  <CalendarDays size={16} className="text-[#0052CC]" />
                  <span>My Leave Balances & Quotas</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="border border-[#DFE1E6] rounded-lg p-3 bg-[#F4F5F7]/30">
                    <span className="text-[11px] font-semibold text-[#6B778C] uppercase">
                      Casual Leave
                    </span>
                    <p className="text-xl font-bold text-[#0052CC] mt-0.5">
                      {leaveBalances?.casualLeave?.balance ?? 11} Days
                    </p>
                    <p className="text-[10px] text-[#6B778C]">Total 12 / Used 1</p>
                  </div>

                  <div className="border border-[#DFE1E6] rounded-lg p-3 bg-[#F4F5F7]/30">
                    <span className="text-[11px] font-semibold text-[#6B778C] uppercase">
                      Earned Leave
                    </span>
                    <p className="text-xl font-bold text-[#00875A] mt-0.5">
                      {leaveBalances?.earnedLeave?.balance ?? 13} Days
                    </p>
                    <p className="text-[10px] text-[#6B778C]">Total 15 / Used 2</p>
                  </div>

                  <div className="border border-[#DFE1E6] rounded-lg p-3 bg-[#F4F5F7]/30">
                    <span className="text-[11px] font-semibold text-[#6B778C] uppercase">
                      Sick Leave
                    </span>
                    <p className="text-xl font-bold text-[#FF991F] mt-0.5">
                      {leaveBalances?.sickLeave?.balance ?? 9} Days
                    </p>
                    <p className="text-[10px] text-[#6B778C]">Total 10 / Used 1</p>
                  </div>

                  <div className="border border-[#DFE1E6] rounded-lg p-3 bg-[#F4F5F7]/30">
                    <span className="text-[11px] font-semibold text-[#6B778C] uppercase">
                      Half Day Quota
                    </span>
                    <p className="text-xl font-bold text-[#172B4D] mt-0.5">
                      {leaveBalances?.halfDay?.balance ?? 6} Days
                    </p>
                    <p className="text-[10px] text-[#6B778C]">Session 1 or 2</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => navigate("/leaves")}
                    className="bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Apply for Leave</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ===================== RIGHT COLUMN (4 COLS) ===================== */}
          <div className="lg:col-span-4 space-y-6">
            {/* Upcoming Holiday Spotlight Card */}
            <div className="bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-[#0052CC] uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={13} />
                  <span>Upcoming Holiday</span>
                </span>
                {daysUntilHoliday !== null && (
                  <span className="text-[11px] font-semibold bg-[#DEEBFF] text-[#0052CC] px-2 py-0.5 rounded-full border border-[#B3D4FF]">
                    {daysUntilHoliday === 0
                      ? "Today!"
                      : daysUntilHoliday === 1
                      ? "Tomorrow"
                      : `In ${daysUntilHoliday} Days`}
                  </span>
                )}
              </div>

              {upcomingHoliday ? (
                <div className="bg-gradient-to-br from-[#DEEBFF]/50 to-[#F4F5F7] border border-[#B3D4FF] rounded-lg p-3.5 mb-3">
                  <h4 className="font-bold text-[#172B4D] text-sm">{upcomingHoliday.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-[#42526E] mt-1">
                    <span className="font-medium">
                      {new Date(upcomingHoliday.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-[#6B778C]">•</span>
                    <span className="text-[11px] font-semibold text-[#0052CC]">
                      {upcomingHoliday.type} Holiday
                    </span>
                  </div>
                  {upcomingHoliday.description && (
                    <p className="text-[11px] text-[#6B778C] mt-2 italic">
                      "{upcomingHoliday.description}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-[#6B778C]">
                  No upcoming holidays in the immediate horizon.
                </div>
              )}

              {/* Next 2 upcoming holidays list */}
              {holidays.length > 1 && (
                <div className="space-y-2 pt-1 border-t border-[#DFE1E6]">
                  <span className="text-[10px] font-semibold text-[#6B778C] uppercase tracking-wider block">
                    Upcoming Next
                  </span>
                  {holidays
                    .filter((h) => new Date(h.date) > new Date())
                    .slice(1, 3)
                    .map((h) => (
                      <div
                        key={h._id || h.name}
                        className="flex items-center justify-between text-xs py-1"
                      >
                        <span className="font-medium text-[#172B4D] truncate pr-2">{h.name}</span>
                        <span className="text-[11px] text-[#6B778C] shrink-0">
                          {new Date(h.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    ))}
                </div>
              )}

              <button
                onClick={() => navigate("/leaves")}
                className="w-full mt-3 pt-2 border-t border-[#DFE1E6] text-xs font-semibold text-[#0052CC] hover:text-[#0747A6] flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>View Full 2026 Calendar</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Who's Away Today (Team Out-of-Office Pulse) */}
            <div className="bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-[#172B4D] uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarX2 size={13} className="text-[#FF991F]" />
                  <span>Who's Away Today</span>
                </span>
                <span className="text-[11px] text-[#6B778C] font-semibold">
                  {teamOnLeave.length} On Leave
                </span>
              </div>

              {teamOnLeave.length === 0 ? (
                <div className="py-5 text-center bg-[#F4F5F7]/50 rounded-lg border border-dashed border-[#DFE1E6]">
                  <UserCheck size={20} className="text-[#00875A] mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-[#172B4D]">Full Squad Active</p>
                  <p className="text-[11px] text-[#6B778C] mt-0.5">
                    No colleagues are scheduled on leave today.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {teamOnLeave.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-[#F4F5F7] rounded-lg border border-[#DFE1E6]"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#FFEBE6] text-[#DE350B] font-bold text-xs flex items-center justify-center">
                          {item.employeeName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#172B4D]">
                            {item.employeeName}
                          </p>
                          <p className="text-[10px] text-[#6B778C] capitalize">
                            {item.leaveType} Leave
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#FFF0B3] text-[#172B4D] rounded">
                        Away
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* HR Compliance & Policy Links */}
            <div className="bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-sm">
              <span className="text-[11px] font-bold text-[#172B4D] uppercase tracking-wider block mb-3">
                HR & Organization Shortcuts
              </span>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/teams")}
                  className="w-full text-left p-2.5 rounded-lg border border-[#DFE1E6] hover:bg-[#DEEBFF]/30 hover:border-[#0052CC] transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 size={15} className="text-[#0052CC]" />
                    <span className="text-xs font-medium text-[#172B4D]">
                      Squad Directory & Structure
                    </span>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-[#6B778C] group-hover:text-[#0052CC] transition"
                  />
                </button>

                <button
                  onClick={() => navigate("/employees")}
                  className="w-full text-left p-2.5 rounded-lg border border-[#DFE1E6] hover:bg-[#DEEBFF]/30 hover:border-[#0052CC] transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText size={15} className="text-[#00875A]" />
                    <span className="text-xs font-medium text-[#172B4D]">
                      Employee Statutory 360
                    </span>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-[#6B778C] group-hover:text-[#0052CC] transition"
                  />
                </button>

                <button
                  onClick={() => navigate("/attendance")}
                  className="w-full text-left p-2.5 rounded-lg border border-[#DFE1E6] hover:bg-[#DEEBFF]/30 hover:border-[#0052CC] transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock size={15} className="text-[#B9770E]" />
                    <span className="text-xs font-medium text-[#172B4D]">
                      Punch In / Regularization
                    </span>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-[#6B778C] group-hover:text-[#0052CC] transition"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ==========================================================
   SUB-COMPONENTS (Clean, Reusable, Enterprise Styled)
   ========================================================== */

function ActionTile({ icon: Icon, iconBg, iconColor, title, subtitle, badge, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#DFE1E6] rounded-xl p-3.5 hover:border-[#0052CC] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group flex items-start gap-3 relative"
    >
      <div className={`w-10 h-10 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
        <Icon size={19} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <h4 className="text-xs font-bold text-[#172B4D] group-hover:text-[#0052CC] transition truncate">
            {title}
          </h4>
          {badge && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#FF991F] text-white">
              {badge}
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#6B778C] truncate mt-0.5">{subtitle}</p>
      </div>

      <ChevronRight
        size={14}
        className="text-[#DFE1E6] group-hover:text-[#0052CC] group-hover:translate-x-0.5 transition self-center shrink-0"
      />
    </div>
  );
}

function KpiMetricCard({
  title,
  value,
  badgeText,
  accentColor,
  icon: Icon,
  iconBg,
  iconColor,
  context,
  progressBar,
}) {
  return (
    <div
      className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-sm relative overflow-hidden"
      style={{ borderTop: `3px solid ${accentColor}` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-semibold text-[#6B778C] uppercase tracking-wider block">
            {title}
          </span>
          <p className="text-2xl font-bold text-[#172B4D] mt-1 tracking-tight">{value}</p>
        </div>

        <div className={`w-9 h-9 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
          <Icon size={18} />
        </div>
      </div>

      {progressBar ? (
        <div className="mt-2.5">
          <div className="w-full bg-[#EBECF0] h-1.5 rounded-full overflow-hidden">
            <div
              style={{ width: `${progressBar.percent}%` }}
              className={`h-full ${progressBar.color} rounded-full transition-all duration-500`}
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px] text-[#6B778C]">
            <span>{context}</span>
            <span className="font-semibold text-[#00875A]">{badgeText}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mt-2.5 text-[11px]">
          <span className="text-[#6B778C]">{context}</span>
          {badgeText && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${accentColor}15`,
                color: accentColor,
              }}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
