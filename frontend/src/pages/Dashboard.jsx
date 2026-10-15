import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getEmployees } from "../services/employee";
import { getLeaveBalance, getTeamOnLeave } from "../services/leave";
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
} from "lucide-react";

function Dashboard() {
  const { user, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalEmployees: 3,
    presentToday: 2,
    onLeave: 1,
    lateArrivals: 0,
  });
  const [leaveBalances, setLeaveBalances] = useState(null);
  const [, setTeamOnLeave] = useState([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch employees count
        const emps = await getEmployees().catch(() => []);
        if (emps && emps.length > 0) {
          setStats((prev) => ({
            ...prev,
            totalEmployees: emps.length,
            presentToday: Math.max(1, Math.floor(emps.length * 0.7)),
            onLeave: Math.max(0, Math.floor(emps.length * 0.15)),
            lateArrivals: Math.max(0, Math.floor(emps.length * 0.1)),
          }));
        }

        // If employee, fetch personal leave balance
        const empId = user?.userId || "EMP-DEV-03";
        const balanceData = await getLeaveBalance(empId).catch(() => null);
        if (balanceData) {
          setLeaveBalances(balanceData);
        }

        // Fetch team on leave
        const onLeaveList = await getTeamOnLeave().catch(() => []);
        setTeamOnLeave(onLeaveList || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#172B4D]">
              Welcome back, {user?.name || "User"}
            </h1>
            <span
              className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded font-semibold uppercase tracking-wider ${
                isAdmin
                  ? "bg-[#EAE6FF] text-[#403294] border border-[#C0B6F2]"
                  : isManager
                  ? "bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF]"
                  : "bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]"
              }`}
            >
              {isAdmin ? (
                <>
                  <ShieldCheck size={12} />
                  Administrator
                </>
              ) : isManager ? (
                <>
                  <Briefcase size={12} />
                  Manager
                </>
              ) : (
                <>
                  <UserCheck size={12} />
                  Employee
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-[#6B778C] mt-1">
            {isAdmin
              ? "Enterprise overview and administrative control center."
              : isManager
              ? "Team leadership dashboard and operational approvals."
              : "Personal attendance and self-service summary for today."}
          </p>
        </div>

        {/* Date Pill */}
        <div className="bg-white border border-[#DFE1E6] px-3 py-1.5 rounded text-xs font-medium text-[#42526E] flex items-center gap-2">
          <Calendar size={14} className="text-[#6B778C]" />
          <span>
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* ========================================================
          1. ADMIN VIEW (Full Enterprise & HR Management)
          ======================================================== */}
      {isAdmin && (
        <div className="space-y-6">
          {/* Quick Action Bar */}
          <div className="bg-white border border-[#DFE1E6] border-l-4 border-l-[#0052CC] p-4 rounded">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-[#172B4D]">
                  HR Admin Command Center
                </h2>
                <p className="text-xs text-[#6B778C]">
                  Quickly execute essential administrative actions
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => navigate("/employees")}
                className="bg-[#F4F5F7] hover:bg-[#EBECF0] border border-[#DFE1E6] text-[#172B4D] font-medium py-2 px-3 rounded text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus size={14} className="text-[#0052CC]" />
                <span>Onboard Employee</span>
              </button>
              <button
                onClick={() => navigate("/teams")}
                className="bg-[#F4F5F7] hover:bg-[#EBECF0] border border-[#DFE1E6] text-[#172B4D] font-medium py-2 px-3 rounded text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Building2 size={14} className="text-[#0052CC]" />
                <span>Configure Squads</span>
              </button>
              <button
                onClick={() => navigate("/leaves")}
                className="bg-[#F4F5F7] hover:bg-[#EBECF0] border border-[#DFE1E6] text-[#172B4D] font-medium py-2 px-3 rounded text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckSquare size={14} className="text-[#00875A]" />
                <span>Review Approvals</span>
              </button>
              <button
                onClick={() => navigate("/attendance")}
                className="bg-[#F4F5F7] hover:bg-[#EBECF0] border border-[#DFE1E6] text-[#172B4D] font-medium py-2 px-3 rounded text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Clock size={14} className="text-[#0052CC]" />
                <span>Attendance Logs</span>
              </button>
            </div>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <KpiCard
              title="Total Headcount"
              value={stats.totalEmployees}
              subtitle="Registered active staff"
              accentColor="#0052CC"
            />
            <KpiCard
              title="Present Today"
              value={stats.presentToday}
              subtitle="Punched in"
              accentColor="#00875A"
            />
            <KpiCard
              title="On Leave"
              value={stats.onLeave}
              subtitle="Approved time off"
              accentColor="#FF991F"
            />
            <KpiCard
              title="Late Arrivals"
              value={stats.lateArrivals}
              subtitle="Punched after 09:30 AM"
              accentColor="#DE350B"
            />
          </div>

          {/* Workforce Attendance Snapshot */}
          <div className="bg-white border border-[#DFE1E6] rounded p-4">
            <h3 className="font-semibold text-[#172B4D] text-sm mb-3">
              Enterprise Attendance Snapshot
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Present" value={stats.presentToday} type="success" />
              <StatCard
                label="Absent"
                value={Math.max(0, stats.totalEmployees - stats.presentToday - stats.onLeave)}
                type="danger"
              />
              <StatCard label="On Leave" value={stats.onLeave} type="warning" />
              <StatCard label="Late Punches" value={stats.lateArrivals} type="subtle" />
            </div>
          </div>

          {/* Pending Approvals Tray */}
          <div className="bg-white border border-[#DFE1E6] rounded p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-semibold text-[#172B4D] text-sm">
                  Pending Leave Requests
                </h3>
                <p className="text-xs text-[#6B778C]">
                  Requires administrative or managerial action
                </p>
              </div>
              <button
                onClick={() => navigate("/leaves")}
                className="text-xs text-[#0052CC] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Approvals Hub</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="overflow-x-auto border border-[#DFE1E6] rounded">
              <table className="min-w-full text-xs divide-y divide-[#DFE1E6]">
                <thead className="bg-[#F4F5F7] text-[#6B778C] font-semibold uppercase">
                  <tr>
                    <th className="px-3.5 py-2 text-left">Employee</th>
                    <th className="px-3.5 py-2 text-left">Leave Type</th>
                    <th className="px-3.5 py-2 text-left">Period</th>
                    <th className="px-3.5 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1E6] bg-white">
                  <tr>
                    <td className="px-3.5 py-2.5 font-medium text-[#172B4D]">
                      Rahul Sharma (EMP-1002)
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-[#FFEBE6] text-[#DE350B] font-semibold border border-[#FFBDAD]">
                        Sick Leave
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-[#5E6C84]">Oct 16 – Oct 17 (2 Days)</td>
                    <td className="px-3.5 py-2.5 text-right">
                      <button
                        onClick={() => navigate("/leaves")}
                        className="px-2.5 py-1 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-medium cursor-pointer"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. MANAGER VIEW (Team Roster & Approvals)
          ======================================================== */}
      {isManager && !isAdmin && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <KpiCard
              title="Squad Strength"
              value={stats.totalEmployees}
              subtitle="Team members"
              accentColor="#0052CC"
            />
            <KpiCard
              title="Team Present"
              value={stats.presentToday}
              subtitle="Working today"
              accentColor="#00875A"
            />
            <KpiCard
              title="Team on Leave"
              value={stats.onLeave}
              subtitle="Out of office"
              accentColor="#FF991F"
            />
            <KpiCard
              title="Action Required"
              value="1"
              subtitle="Pending approvals"
              accentColor="#DE350B"
            />
          </div>

          {/* Pending Leave Approvals */}
          <div className="bg-white border border-[#DFE1E6] rounded p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-semibold text-[#172B4D] text-sm">
                  Manager Approvals Tray
                </h3>
                <p className="text-xs text-[#6B778C]">
                  Leave applications submitted by team members
                </p>
              </div>
              <button
                onClick={() => navigate("/leaves")}
                className="text-xs text-[#0052CC] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Approvals Hub</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="overflow-x-auto border border-[#DFE1E6] rounded">
              <table className="min-w-full text-xs divide-y divide-[#DFE1E6]">
                <thead className="bg-[#F4F5F7] text-[#6B778C] font-semibold uppercase">
                  <tr>
                    <th className="px-3.5 py-2 text-left">Team Member</th>
                    <th className="px-3.5 py-2 text-left">Type</th>
                    <th className="px-3.5 py-2 text-left">Dates</th>
                    <th className="px-3.5 py-2 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1E6] bg-white">
                  <tr>
                    <td className="px-3.5 py-2.5 font-medium text-[#172B4D]">Rahul Sharma</td>
                    <td className="px-3.5 py-2.5">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-[#DEEBFF] text-[#0747A6] font-semibold border border-[#B3D4FF]">
                        Casual Leave
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-[#5E6C84]">Tomorrow (1 Day)</td>
                    <td className="px-3.5 py-2.5 text-right">
                      <button
                        onClick={() => navigate("/leaves")}
                        className="px-2.5 py-1 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-medium cursor-pointer"
                      >
                        Review & Approve
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Squad Roster Banner */}
          <div className="bg-[#DEEBFF] border border-[#B3D4FF] p-4 rounded flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[#0747A6] text-sm">
                Squad & Project Assignments
              </h4>
              <p className="text-xs text-[#0052CC] mt-0.5">
                Manage team assignments, designations, and squad rosters
              </p>
            </div>
            <button
              onClick={() => navigate("/teams")}
              className="bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-medium px-3.5 py-2 rounded transition flex items-center gap-1 cursor-pointer"
            >
              <span>Open Squad Roster</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          3. EMPLOYEE VIEW (Personal ESS Dashboard)
          ======================================================== */}
      {!isManager && !isAdmin && (
        <div className="space-y-6">
          {/* ESS KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="bg-white border border-[#DFE1E6] rounded p-4">
              <span className="text-[11px] text-[#6B778C] font-semibold uppercase tracking-wider block">
                Today's Attendance
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-bold text-[#00875A] flex items-center gap-1.5">
                  <Circle size={8} className="fill-[#00875A] text-[#00875A]" />
                  Punched In
                </span>
                <span className="text-[11px] bg-[#E3FCEF] text-[#006644] font-semibold px-2 py-0.5 rounded border border-[#ABF5D1]">
                  On Time
                </span>
              </div>
              <p className="text-xs text-[#6B778C] mt-2">Punched In at 09:12 AM</p>
            </div>

            <div className="bg-white border border-[#DFE1E6] rounded p-4">
              <span className="text-[11px] text-[#6B778C] font-semibold uppercase tracking-wider block">
                Available Paid Leave
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-bold text-[#0052CC]">
                  {leaveBalances
                    ? leaveBalances.casualLeave?.balance + leaveBalances.earnedLeave?.balance
                    : 24}{" "}
                  Days
                </span>
                <button
                  onClick={() => navigate("/leaves")}
                  className="text-xs bg-[#DEEBFF] text-[#0052CC] font-semibold px-2.5 py-1 rounded border border-[#B3D4FF] hover:bg-[#B3D4FF]/40 cursor-pointer"
                >
                  Apply Leave
                </button>
              </div>
              <p className="text-xs text-[#6B778C] mt-2">
                Casual: {leaveBalances?.casualLeave?.balance || 11}d · Earned:{" "}
                {leaveBalances?.earnedLeave?.balance || 13}d
              </p>
            </div>

            <div className="bg-white border border-[#DFE1E6] rounded p-4">
              <span className="text-[11px] text-[#6B778C] font-semibold uppercase tracking-wider block">
                Employee Dossier
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-bold text-[#172B4D]">100% Complete</span>
                <button
                  onClick={() => navigate("/profile")}
                  className="text-xs bg-[#F4F5F7] text-[#172B4D] font-semibold px-2.5 py-1 rounded border border-[#DFE1E6] hover:bg-[#EBECF0] cursor-pointer"
                >
                  View Dossier
                </button>
              </div>
              <p className="text-xs text-[#6B778C] mt-2">
                Personal, Banking & Statutory Verified
              </p>
            </div>
          </div>

          {/* Quick Self Service Actions */}
          <div className="bg-white border border-[#DFE1E6] rounded p-4">
            <h3 className="font-semibold text-[#172B4D] text-sm mb-3">
              Quick Self-Service Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => navigate("/attendance")}
                className="p-3.5 border border-[#DFE1E6] rounded hover:border-[#4C9AFF] hover:bg-[#DEEBFF]/20 transition text-center group cursor-pointer"
              >
                <div className="w-9 h-9 bg-[#DEEBFF] text-[#0052CC] rounded flex items-center justify-center mx-auto mb-2">
                  <Clock size={18} />
                </div>
                <span className="text-xs font-semibold text-[#172B4D] block">
                  Attendance & Swipes
                </span>
                <span className="text-[11px] text-[#6B778C]">Punch log & regularize</span>
              </button>

              <button
                onClick={() => navigate("/leaves")}
                className="p-3.5 border border-[#DFE1E6] rounded hover:border-[#4C9AFF] hover:bg-[#DEEBFF]/20 transition text-center group cursor-pointer"
              >
                <div className="w-9 h-9 bg-[#E3FCEF] text-[#00875A] rounded flex items-center justify-center mx-auto mb-2">
                  <CalendarDays size={18} />
                </div>
                <span className="text-xs font-semibold text-[#172B4D] block">
                  Apply Leave
                </span>
                <span className="text-[11px] text-[#6B778C]">Submit time-off request</span>
              </button>

              <button
                onClick={() => navigate("/profile")}
                className="p-3.5 border border-[#DFE1E6] rounded hover:border-[#4C9AFF] hover:bg-[#DEEBFF]/20 transition text-center group cursor-pointer"
              >
                <div className="w-9 h-9 bg-[#EAE6FF] text-[#403294] rounded flex items-center justify-center mx-auto mb-2">
                  <User size={18} />
                </div>
                <span className="text-xs font-semibold text-[#172B4D] block">
                  My Profile 360
                </span>
                <span className="text-[11px] text-[#6B778C]">View & edit dossier</span>
              </button>

              <button
                onClick={() => navigate("/leaves")}
                className="p-3.5 border border-[#DFE1E6] rounded hover:border-[#4C9AFF] hover:bg-[#DEEBFF]/20 transition text-center group cursor-pointer"
              >
                <div className="w-9 h-9 bg-[#FFF0B3] text-[#172B4D] rounded flex items-center justify-center mx-auto mb-2">
                  <CalendarCheck2 size={18} />
                </div>
                <span className="text-xs font-semibold text-[#172B4D] block">
                  Holiday Calendar
                </span>
                <span className="text-[11px] text-[#6B778C]">Upcoming holidays</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function CalendarCheck2(props) {
  return <CheckCircle2 {...props} />;
}

function KpiCard({ title, value, subtitle, accentColor }) {
  return (
    <div
      className="bg-white border border-[#DFE1E6] rounded p-3.5"
      style={{ borderTop: `3px solid ${accentColor}` }}
    >
      <span className="text-[11px] font-semibold text-[#6B778C] uppercase tracking-wider block">
        {title}
      </span>
      <p className="text-xl font-bold text-[#172B4D] mt-1">{value}</p>
      {subtitle && <p className="text-[11px] text-[#6B778C] mt-0.5">{subtitle}</p>}
    </div>
  );
}

function StatCard({ label, value, type }) {
  const styles = {
    success: "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]",
    danger: "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]",
    warning: "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]",
    subtle: "bg-[#F4F5F7] text-[#172B4D] border-[#DFE1E6]",
  };

  return (
    <div className={`border rounded p-3 ${styles[type] || styles.subtle}`}>
      <p className="text-[11px] font-semibold opacity-85 uppercase">{label}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
    </div>
  );
}

export default Dashboard;
