import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getEmployees } from "../services/employee";
import { getLeaves, updateLeave, getLeaveBalance, getTeamOnLeave } from "../services/leave";
import { getHolidays } from "../services/holiday";
import { getAttendanceByDate } from "../services/attendance";
import PulseFeed from "../components/PulseFeed";
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
  ShieldAlert,
} from "lucide-react";
import aiService from "../services/ai.service";

function Dashboard() {
  const { user, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    lateArrivals: 0,
    absentToday: 0,
  });

  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [teamOnLeave, setTeamOnLeave] = useState([]);
  const [, setRecentAttendance] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [watchdogDigest, setWatchdogDigest] = useState(null);

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
      const empCount = Array.isArray(emps) ? emps.length : 0;

      // 2. Fetch Attendance for Today
      const attRecords = await getAttendanceByDate(todayISO).catch(() => []);
      const recordsList = Array.isArray(attRecords) ? attRecords : [];
      const presentRecords = recordsList.filter((r) => r.status === "Present" || r.status === "Late");
      const presentCount = presentRecords.length;
      const lateCount = recordsList.filter((r) => r.status === "Late").length;
      setRecentAttendance(recordsList.slice(0, 5));

      // 3. Fetch Leaves
      const allLeaves = await getLeaves().catch(() => []);
      const leavesList = Array.isArray(allLeaves) ? allLeaves : [];
      const pending = leavesList.filter((l) => l.status === "Pending");
      setPendingLeaves(pending);

      // 4. Fetch Team on Leave
      const onLeave = await getTeamOnLeave().catch(() => []);
      const onLeaveList = Array.isArray(onLeave) ? onLeave : [];
      setTeamOnLeave(onLeaveList);

      // 5. Compute Stats
      const onLeaveCount = onLeaveList.length;
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
      setHolidays(Array.isArray(holidayData) ? holidayData : []);

      // 7. If employee, fetch personal balance
      if (!isAdmin && !isManager) {
        const empId = user?.employeeId || user?.userId;
        if (empId) {
          const bal = await getLeaveBalance(empId).catch(() => null);
          if (bal?.data) setLeaveBalances(bal.data);
        }
      }

      // 8. Fetch Executive Morning Digest
      aiService.getWatchdogDigest().then((d) => setWatchdogDigest(d)).catch(() => {});
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
            <h1 className="text-xl font-bold text-[#172B4D] dark:text-[#F1F5F9]">Dashboard</h1>
            <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
              {isAdmin
                ? "Enterprise overview and workforce operations."
                : isManager
                ? "Team leadership dashboard and approvals."
                : "Personal attendance and self-service overview."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#42526E] dark:text-[#CBD5E1] bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] px-3 py-1.5 rounded-md font-medium shadow-2xs">
              <Calendar size={13} className="text-[#6B778C] dark:text-[#94A3B8]" />
              <span>{todayStr}</span>
            </span>
          </div>
        </div>

        {/* ========================================================
            EXECUTIVE MORNING DIGEST & WATCHDOG BANNER
            ======================================================== */}
        {(isAdmin || isManager) && watchdogDigest && (
          <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white dark:from-dark-surface dark:to-dark-bg border border-blue-200 dark:border-dark-border rounded-xl p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs shrink-0 mt-0.5">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                      Workforce Watchdog: Executive Morning Digest
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                        watchdogDigest.healthScore >= 90
                          ? "bg-emerald-100 text-emerald-800"
                          : watchdogDigest.healthScore >= 75
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      Score: {watchdogDigest.healthScore}/100 {watchdogDigest.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-snug">
                    {watchdogDigest.criticalCount > 0
                      ? `${watchdogDigest.criticalCount} critical operational anomalies detected across attendance, leaves, or payroll requiring review.`
                      : "All operational pillars nominal. Zero critical SLA or statutory variance breaches detected today."}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate("/copilot")}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open Watchdog Insights</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            2. INTERACTIVE QUICK ACTION CARDS (Catchy Clickable Tiles)
            ======================================================== */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9] uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-[#0052CC] dark:text-[#579DFF]" />
              <span>{isAdmin ? "Admin Command Hub" : isManager ? "Manager Actions" : "Self-Service Hub"}</span>
            </h2>
            <span className="text-[11px] text-[#6B778C] dark:text-[#94A3B8]">Quick access to frequent operations</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {isAdmin ? (
              <>
                <ActionTile
                  icon={UserPlus}
                  iconBg="bg-[#DEEBFF] dark:bg-[#1C2536]"
                  iconColor="text-[#0052CC] dark:text-[#579DFF]"
                  title="Onboard Employee"
                  subtitle="New hire & statutory profile"
                  onClick={() => navigate("/employees")}
                />
                <ActionTile
                  icon={Building2}
                  iconBg="bg-[#EAE6FF] dark:bg-purple-950/40"
                  iconColor="text-[#403294] dark:text-purple-300"
                  title="Configure Squads"
                  subtitle="Department teams & leads"
                  onClick={() => navigate("/teams")}
                />
                <ActionTile
                  icon={CheckSquare}
                  iconBg="bg-[#E3FCEF] dark:bg-emerald-950/40"
                  iconColor="text-[#00875A] dark:text-emerald-400"
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
                  iconBg="bg-[#FFF0B3] dark:bg-amber-950/40"
                  iconColor="text-[#B9770E] dark:text-amber-300"
                  title="Attendance Swipes"
                  subtitle="Punch audit & regularizations"
                  onClick={() => navigate("/attendance")}
                />
              </>
            ) : isManager ? (
              <>
                <ActionTile
                  icon={Users}
                  iconBg="bg-[#DEEBFF] dark:bg-[#1C2536]"
                  iconColor="text-[#0052CC] dark:text-[#579DFF]"
                  title="My Squad Roster"
                  subtitle="View assigned team members"
                  onClick={() => navigate("/teams")}
                />
                <ActionTile
                  icon={CheckSquare}
                  iconBg="bg-[#E3FCEF] dark:bg-emerald-950/40"
                  iconColor="text-[#00875A] dark:text-emerald-400"
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
                  iconBg="bg-[#FFF0B3] dark:bg-amber-950/40"
                  iconColor="text-[#B9770E] dark:text-amber-300"
                  title="Shift Attendance"
                  subtitle="Squad daily attendance log"
                  onClick={() => navigate("/attendance")}
                />
                <ActionTile
                  icon={CalendarDays}
                  iconBg="bg-[#EAE6FF] dark:bg-purple-950/40"
                  iconColor="text-[#403294] dark:text-purple-300"
                  title="Apply for Leave"
                  subtitle="Submit personal leave request"
                  onClick={() => navigate("/leaves")}
                />
              </>
            ) : (
              <>
                <ActionTile
                  icon={Clock}
                  iconBg="bg-[#DEEBFF] dark:bg-[#1C2536]"
                  iconColor="text-[#0052CC] dark:text-[#579DFF]"
                  title="Attendance & Swipes"
                  subtitle="View punch logs & regularize"
                  onClick={() => navigate("/attendance")}
                />
                <ActionTile
                  icon={CalendarDays}
                  iconBg="bg-[#E3FCEF] dark:bg-emerald-950/40"
                  iconColor="text-[#00875A] dark:text-emerald-400"
                  title="Apply Leave"
                  subtitle="Submit time-off application"
                  onClick={() => navigate("/leaves")}
                />
                <ActionTile
                  icon={User}
                  iconBg="bg-[#EAE6FF] dark:bg-purple-950/40"
                  iconColor="text-[#403294] dark:text-purple-300"
                  title="My Profile 360"
                  subtitle="Job, banking & emergency data"
                  onClick={() => navigate("/profile")}
                />
                <ActionTile
                  icon={Calendar}
                  iconBg="bg-[#FFF0B3] dark:bg-amber-950/40"
                  iconColor="text-[#B9770E] dark:text-amber-300"
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
            <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-5 shadow-sm transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-bold text-[#172B4D] dark:text-[#F1F5F9] text-sm flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#0052CC] dark:text-[#579DFF]" />
                    <span>Workforce Attendance Pulse</span>
                  </h3>
                  <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                    Real-time punch distribution for today ({todayStr})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E3FCEF] dark:bg-emerald-950/40 text-[#006644] dark:text-emerald-400 border border-[#ABF5D1] dark:border-emerald-800">
                    {attendanceRate}% Present
                  </span>
                  <button
                    onClick={() => navigate("/attendance")}
                    className="text-xs font-medium text-[#0052CC] dark:text-[#579DFF] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Logs</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* Segmented Distribution Progress Bar */}
              <div className="w-full bg-[#F4F5F7] dark:bg-[#1C2331] h-3.5 rounded-full overflow-hidden flex p-0.5 border border-[#DFE1E6] dark:border-[#263042] mb-4">
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
                <div className="bg-[#E3FCEF]/40 dark:bg-emerald-950/30 border border-[#ABF5D1] dark:border-emerald-800/60 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#006644] dark:text-emerald-400 uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-[#00875A] dark:bg-emerald-400" />
                    <span>Present</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-bold text-[#006644] dark:text-emerald-300">{stats.presentToday}</span>
                    <span className="text-[11px] text-[#00875A] dark:text-emerald-400 font-medium">
                      ({Math.round((stats.presentToday / Math.max(1, stats.totalEmployees)) * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="bg-[#FFEBE6]/40 dark:bg-rose-950/30 border border-[#FFBDAD] dark:border-rose-800/60 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#DE350B] dark:text-rose-400 uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-[#DE350B] dark:bg-rose-400" />
                    <span>Absent</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-bold text-[#DE350B] dark:text-rose-300">{stats.absentToday}</span>
                    <span className="text-[11px] text-[#DE350B] dark:text-rose-400 font-medium">
                      ({Math.round((stats.absentToday / Math.max(1, stats.totalEmployees)) * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="bg-[#FFF0B3]/40 dark:bg-amber-950/30 border border-[#FFE380] dark:border-amber-800/60 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#B9770E] dark:text-amber-400 uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-[#FF991F] dark:bg-amber-400" />
                    <span>On Leave</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-bold text-[#B9770E] dark:text-amber-300">{stats.onLeave}</span>
                    <span className="text-[11px] text-[#B9770E] dark:text-amber-400 font-medium">
                      ({Math.round((stats.onLeave / Math.max(1, stats.totalEmployees)) * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="bg-[#F4F5F7] dark:bg-[#1C2331] border border-[#DFE1E6] dark:border-[#263042] rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#42526E] dark:text-neutral-300 uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-[#0052CC] dark:bg-[#579DFF]" />
                    <span>Late Punches</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-bold text-[#172B4D] dark:text-[#F1F5F9]">{stats.lateArrivals}</span>
                    <span className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] font-medium">&gt; 09:30 AM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Approvals Tray (Admins & Managers) */}
            {(isAdmin || isManager) && (
              <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-5 shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#172B4D] dark:text-[#F1F5F9] text-sm">
                        Pending Leave Applications
                      </h3>
                      {pendingLeaves.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF0B3] dark:bg-amber-950/40 text-[#172B4D] dark:text-amber-300 border border-[#FFE380] dark:border-amber-800">
                          {pendingLeaves.length} Action Needed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                      Review and take action directly on employee time-off requests
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/leaves")}
                    className="text-xs font-semibold text-[#0052CC] dark:text-[#579DFF] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Leaves</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

                {pendingLeaves.length === 0 ? (
                  <div className="text-center py-8 bg-[#F4F5F7]/60 dark:bg-[#090D14]/50 border border-dashed border-[#DFE1E6] dark:border-[#263042] rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-[#E3FCEF] dark:bg-emerald-950/40 text-[#00875A] dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 size={20} />
                    </div>
                    <p className="text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9]">All Caught Up!</p>
                    <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                      There are no pending leave requests awaiting approval.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-[#DFE1E6] dark:border-[#263042] rounded-lg">
                    <table className="min-w-full text-xs divide-y divide-[#DFE1E6] dark:divide-[#263042]">
                      <thead className="bg-[#F4F5F7] dark:bg-[#090D14] text-[#6B778C] dark:text-[#94A3B8] font-semibold uppercase text-[11px]">
                        <tr>
                          <th className="px-3.5 py-2.5 text-left">Employee</th>
                          <th className="px-3.5 py-2.5 text-left">Type</th>
                          <th className="px-3.5 py-2.5 text-left">Period</th>
                          <th className="px-3.5 py-2.5 text-left">Reason</th>
                          <th className="px-3.5 py-2.5 text-right">Quick Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DFE1E6] dark:divide-[#263042] bg-white dark:bg-[#151B26]">
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
                            <tr key={leave._id || leave.leaveId} className="hover:bg-[#F4F5F7]/50 dark:hover:bg-[#1C2331]/50 transition-colors">
                              <td className="px-3.5 py-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF] font-bold text-xs flex items-center justify-center shrink-0">
                                    {leave.employeeName ? leave.employeeName.charAt(0) : "E"}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                                      {leave.employeeName || "Employee"}
                                    </p>
                                    <p className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">{leave.leaveId}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-3.5 py-2.5">
                                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0747A6] dark:text-[#579DFF] border border-[#B3D4FF] dark:border-[#263042] capitalize">
                                  {leave.leaveType} Leave
                                </span>
                              </td>

                              <td className="px-3.5 py-2.5 text-[#42526E] dark:text-neutral-300">
                                <div>
                                  <span className="font-medium">
                                    {fromDateStr} – {toDateStr}
                                  </span>
                                  <span className="text-[10px] text-[#6B778C] dark:text-[#94A3B8] block">
                                    {leave.daysCount} {leave.daysCount === 1 ? "day" : "days"}
                                  </span>
                                </div>
                              </td>

                              <td className="px-3.5 py-2.5 text-[#5E6C84] dark:text-neutral-400 max-w-xs truncate">
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
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F4F5F7] dark:bg-[#1C2331] hover:bg-[#FFEBE6] dark:hover:bg-[#DE350B]/10 text-[#DE350B] border border-[#DFE1E6] dark:border-[#263042] hover:border-[#FFBDAD] rounded text-xs font-medium cursor-pointer transition disabled:opacity-50"
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
              <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-[#172B4D] dark:text-[#F1F5F9] text-sm flex items-center gap-2">
                  <CalendarDays size={16} className="text-[#0052CC]" />
                  <span>My Leave Balances & Quotas</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="border border-[#DFE1E6] rounded-lg p-3 bg-[#F4F5F7]/30">
                    <span className="text-[11px] font-semibold text-[#6B778C] uppercase">
                      Casual Leave
                    </span>
                    <p className="text-xl font-bold text-[#0052CC] mt-0.5">
                      {leaveBalances?.casual?.available ?? 12} Days
                    </p>
                    <p className="text-[10px] text-[#6B778C]">
                      Total {leaveBalances?.casual?.total ?? 12} / Used {leaveBalances?.casual?.used ?? 0}
                    </p>
                  </div>

                  <div className="border border-[#DFE1E6] rounded-lg p-3 bg-[#F4F5F7]/30">
                    <span className="text-[11px] font-semibold text-[#6B778C] uppercase">
                      Earned Leave
                    </span>
                    <p className="text-xl font-bold text-[#00875A] mt-0.5">
                      {leaveBalances?.earned?.available ?? 15} Days
                    </p>
                    <p className="text-[10px] text-[#6B778C]">
                      Total {leaveBalances?.earned?.total ?? 15} / Used {leaveBalances?.earned?.used ?? 0}
                    </p>
                  </div>

                  <div className="border border-[#DFE1E6] rounded-lg p-3 bg-[#F4F5F7]/30">
                    <span className="text-[11px] font-semibold text-[#6B778C] uppercase">
                      Sick Leave
                    </span>
                    <p className="text-xl font-bold text-[#FF991F] mt-0.5">
                      {leaveBalances?.sick?.available ?? 10} Days
                    </p>
                    <p className="text-[10px] text-[#6B778C]">
                      Total {leaveBalances?.sick?.total ?? 10} / Used {leaveBalances?.sick?.used ?? 0}
                    </p>
                  </div>

                  <div className="border border-[#DFE1E6] rounded-lg p-3 bg-[#F4F5F7]/30">
                    <span className="text-[11px] font-semibold text-[#6B778C] uppercase">
                      Half Day Quota
                    </span>
                    <p className="text-xl font-bold text-[#172B4D] mt-0.5">
                      {leaveBalances?.halfDay?.available ?? 6} Days
                    </p>
                    <p className="text-[10px] text-[#6B778C]">
                      Total {leaveBalances?.halfDay?.total ?? 6} / Used {leaveBalances?.halfDay?.used ?? 0}
                    </p>
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
            <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-5 shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-[#0052CC] dark:text-[#579DFF] uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={13} />
                  <span>Upcoming Holiday</span>
                </span>
                {daysUntilHoliday !== null && (
                  <span className="text-[11px] font-semibold bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF] px-2 py-0.5 rounded-full border border-[#B3D4FF] dark:border-[#263042]">
                    {daysUntilHoliday === 0
                      ? "Today!"
                      : daysUntilHoliday === 1
                      ? "Tomorrow"
                      : `In ${daysUntilHoliday} Days`}
                  </span>
                )}
              </div>

              {upcomingHoliday ? (
                <div className="bg-gradient-to-br from-[#DEEBFF]/50 to-[#F4F5F7] dark:from-[#1C2331] dark:to-[#090D14] border border-[#B3D4FF] dark:border-[#263042] rounded-lg p-3.5 mb-3">
                  <h4 className="font-bold text-[#172B4D] dark:text-[#F1F5F9] text-sm">{upcomingHoliday.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-[#42526E] dark:text-neutral-300 mt-1">
                    <span className="font-medium">
                      {new Date(upcomingHoliday.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-[#6B778C] dark:text-neutral-500">•</span>
                    <span className="text-[11px] font-semibold text-[#0052CC] dark:text-[#579DFF]">
                      {upcomingHoliday.type} Holiday
                    </span>
                  </div>
                  {upcomingHoliday.description && (
                    <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-2 italic">
                      "{upcomingHoliday.description}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-[#6B778C] dark:text-[#94A3B8]">
                  No upcoming holidays in the immediate horizon.
                </div>
              )}

              {/* Next 2 upcoming holidays list */}
              {holidays.length > 1 && (
                <div className="space-y-2 pt-1 border-t border-[#DFE1E6] dark:border-[#263042]">
                  <span className="text-[10px] font-semibold text-[#6B778C] dark:text-[#94A3B8] uppercase tracking-wider block">
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
                        <span className="font-medium text-[#172B4D] dark:text-neutral-200 truncate pr-2">{h.name}</span>
                        <span className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] shrink-0">
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
                className="w-full mt-3 pt-2 border-t border-[#DFE1E6] dark:border-[#263042] text-xs font-semibold text-[#0052CC] dark:text-[#579DFF] hover:text-[#0747A6] flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>View Full 2026 Calendar</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Who's Away Today (Team Out-of-Office Pulse) */}
            <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-5 shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-[#172B4D] dark:text-[#F1F5F9] uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarX2 size={13} className="text-[#FF991F]" />
                  <span>Who's Away Today</span>
                </span>
                <span className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] font-semibold">
                  {teamOnLeave.length} On Leave
                </span>
              </div>

              {teamOnLeave.length === 0 ? (
                <div className="py-5 text-center bg-[#F4F5F7]/50 dark:bg-[#090D14]/50 rounded-lg border border-dashed border-[#DFE1E6] dark:border-[#263042]">
                  <UserCheck size={20} className="text-[#00875A] dark:text-emerald-400 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9]">Full Squad Active</p>
                  <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                    No colleagues are scheduled on leave today.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {teamOnLeave.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-[#F4F5F7] dark:bg-[#090D14] rounded-lg border border-[#DFE1E6] dark:border-[#263042]"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#FFEBE6] dark:bg-rose-950/40 text-[#DE350B] dark:text-rose-300 font-bold text-xs flex items-center justify-center">
                          {item.employeeName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                            {item.employeeName}
                          </p>
                          <p className="text-[10px] text-[#6B778C] dark:text-[#94A3B8] capitalize">
                            {item.leaveType} Leave
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#FFF0B3] dark:bg-amber-950/40 text-[#172B4D] dark:text-amber-300 rounded">
                        Away
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* HR Compliance & Policy Links */}
            <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-5 shadow-sm transition-colors">
              <span className="text-[11px] font-bold text-[#172B4D] dark:text-[#F1F5F9] uppercase tracking-wider block mb-3">
                HR & Organization Shortcuts
              </span>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/teams")}
                  className="w-full text-left p-2.5 rounded-lg border border-[#DFE1E6] dark:border-[#263042] hover:bg-[#DEEBFF]/30 dark:hover:bg-[#1C2331] hover:border-[#0052CC] transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 size={15} className="text-[#0052CC] dark:text-[#579DFF]" />
                    <span className="text-xs font-medium text-[#172B4D] dark:text-neutral-200">
                      Squad Directory & Structure
                    </span>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-[#6B778C] dark:text-[#94A3B8] group-hover:text-[#0052CC] dark:group-hover:text-[#579DFF] transition"
                  />
                </button>

                <button
                  onClick={() => navigate("/employees")}
                  className="w-full text-left p-2.5 rounded-lg border border-[#DFE1E6] dark:border-[#263042] hover:bg-[#DEEBFF]/30 dark:hover:bg-[#1C2331] hover:border-[#0052CC] transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText size={15} className="text-[#00875A] dark:text-emerald-400" />
                    <span className="text-xs font-medium text-[#172B4D] dark:text-neutral-200">
                      Employee Statutory 360
                    </span>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-[#6B778C] dark:text-[#94A3B8] group-hover:text-[#0052CC] dark:group-hover:text-[#579DFF] transition"
                  />
                </button>

                <button
                  onClick={() => navigate("/attendance")}
                  className="w-full text-left p-2.5 rounded-lg border border-[#DFE1E6] dark:border-[#263042] hover:bg-[#DEEBFF]/30 dark:hover:bg-[#1C2331] hover:border-[#0052CC] transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock size={15} className="text-[#B9770E] dark:text-amber-400" />
                    <span className="text-xs font-medium text-[#172B4D] dark:text-neutral-200">
                      Punch In / Regularization
                    </span>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-[#6B778C] dark:text-[#94A3B8] group-hover:text-[#0052CC] dark:group-hover:text-[#579DFF] transition"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Company Pulse, Broadcasts & Community Kudos */}
        <PulseFeed />
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
      className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-3.5 hover:border-[#0052CC] dark:hover:border-[#579DFF] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group flex items-start gap-3 relative"
    >
      <div className={`w-10 h-10 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
        <Icon size={19} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <h4 className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9] group-hover:text-[#0052CC] dark:group-hover:text-[#579DFF] transition truncate">
            {title}
          </h4>
          {badge && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#FF991F] text-white">
              {badge}
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] truncate mt-0.5">{subtitle}</p>
      </div>

      <ChevronRight
        size={14}
        className="text-[#DFE1E6] dark:text-[#263042] group-hover:text-[#0052CC] dark:group-hover:text-[#579DFF] group-hover:translate-x-0.5 transition self-center shrink-0"
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
      className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-4 shadow-sm relative overflow-hidden transition-colors"
      style={{ borderTop: `3px solid ${accentColor}` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-semibold text-[#6B778C] dark:text-[#94A3B8] uppercase tracking-wider block">
            {title}
          </span>
          <p className="text-2xl font-bold text-[#172B4D] dark:text-[#F1F5F9] mt-1 tracking-tight">{value}</p>
        </div>

        <div className={`w-9 h-9 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
          <Icon size={18} />
        </div>
      </div>

      {progressBar ? (
        <div className="mt-2.5">
          <div className="w-full bg-[#EBECF0] dark:bg-[#1C2331] h-1.5 rounded-full overflow-hidden">
            <div
              style={{ width: `${progressBar.percent}%` }}
              className={`h-full ${progressBar.color} rounded-full transition-all duration-500`}
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
            <span>{context}</span>
            <span className="font-semibold text-[#00875A] dark:text-emerald-400">{badgeText}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mt-2.5 text-[11px]">
          <span className="text-[#6B778C] dark:text-[#94A3B8]">{context}</span>
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
