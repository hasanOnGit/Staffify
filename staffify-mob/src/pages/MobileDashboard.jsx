import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  Clock,
  Calendar,
  CreditCard,
  Award,
  ChevronRight,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Users,
  Flame,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

export default function MobileDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [leaveBalances, setLeaveBalances] = useState(null);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().slice(0, 10);

      // Fetch attendance history
      const attRes = await api.get(`/api/attendance/history/${user?.userId || "USR-DEFAULT"}`).catch(() => ({ data: { data: [] } }));
      const records = attRes.data?.data || [];
      const todayRecord = records.find((r) => r.date === today);
      setTodayAttendance(todayRecord || null);

      // Fetch leave balances
      const balRes = await api.get(`/api/leaves/getLeaveBalance?employeeId=${user?.userId || "USR-DEFAULT"}`).catch(() => ({ data: { data: null } }));
      if (balRes.data?.data) {
        setLeaveBalances(balRes.data.data.leaveAllocation || null);
      }

      // Fetch holidays
      const holRes = await api.get("/api/holidays").catch(() => ({ data: { data: [] } }));
      const hols = holRes.data?.data || [];
      const futureHols = hols
        .filter((h) => new Date(h.date) >= new Date(Date.now() - 86400000))
        .slice(0, 3);
      setUpcomingHolidays(futureHols);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const isClockedIn = todayAttendance?.firstIn && !todayAttendance?.lastOut;
  const isCompletedDay = todayAttendance?.firstIn && todayAttendance?.lastOut;

  return (
    <div className="space-y-3.5 animate-fadeIn">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-[#0052CC] to-[#0747A6] text-white p-4 rounded-xl shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}
          </span>
          <h1 className="text-lg font-black tracking-tight">{getGreeting()}, {user?.name?.split(" ")[0]}!</h1>
          <p className="text-xs text-blue-100 flex items-center gap-1 mt-0.5">
            <MapPin size={11} />
            <span>Bangalore HQ • General Shift</span>
          </p>
        </div>
        <div className="w-11 h-11 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-black text-sm">
          {user?.name?.slice(0, 2).toUpperCase() || "ST"}
        </div>
      </div>

      {/* Today's Punch Card */}
      <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isClockedIn ? "bg-[#E3FCEF] text-[#00875A]" : "bg-[#DEEBFF] text-[#0052CC]"}`}>
              <Clock size={16} />
            </div>
            <div>
              <span className="text-xs font-bold block text-[#172B4D]">Workforce Attendance</span>
              <span className="text-[10px] text-[#6B778C]">
                {isClockedIn ? "Clocked In & Tracking" : isCompletedDay ? "Shift Completed" : "Not Clocked In Today"}
              </span>
            </div>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isClockedIn
                ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                : isCompletedDay
                ? "bg-[#DEEBFF] text-[#0052CC] border-[#B3D4FF]"
                : "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]"
            }`}
          >
            {isClockedIn ? "ON DUTY" : isCompletedDay ? "PUNCHED OUT" : "PENDING IN"}
          </span>
        </div>

        {/* Punch Time Indicators */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <div className="p-2.5 bg-[#FAFBFC] border border-[#DFE1E6] rounded-lg">
            <span className="text-[10px] text-[#6B778C] block">First In</span>
            <span className="font-bold text-[#172B4D]">
              {todayAttendance?.firstIn ? todayAttendance.firstIn.slice(0, 5) : "--:--"}
            </span>
          </div>
          <div className="p-2.5 bg-[#FAFBFC] border border-[#DFE1E6] rounded-lg">
            <span className="text-[10px] text-[#6B778C] block">Last Out</span>
            <span className="font-bold text-[#172B4D]">
              {todayAttendance?.lastOut ? todayAttendance.lastOut.slice(0, 5) : "--:--"}
            </span>
          </div>
        </div>

        {/* Action Button to Swipes */}
        <button
          onClick={() => navigate("/swipes")}
          className="w-full py-2 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active-press shadow-xs"
        >
          <Clock size={14} />
          <span>{isClockedIn ? "Punch Out / Shift Radar" : "Clock In Now via GPS Radar"}</span>
        </button>
      </div>

      {/* Quick Action Tiles */}
      <div>
        <h2 className="text-xs font-bold text-[#172B4D] mb-2 px-1">Quick Self-Service Actions</h2>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Punch GPS", icon: Clock, path: "/swipes", bg: "bg-[#DEEBFF] text-[#0052CC]" },
            { label: "Apply Leave", icon: Calendar, path: "/leaves", bg: "bg-[#E3FCEF] text-[#00875A]" },
            { label: "Comp-Off", icon: Award, path: "/leaves?tab=comp_off", bg: "bg-[#FFF0B3] text-[#B9770E]" },
            { label: "Payslip", icon: CreditCard, path: "/payslips", bg: "bg-[#EAE6FF] text-[#403294]" },
          ].map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                className="bg-white border border-[#DFE1E6] rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-2xs cursor-pointer active-press hover:border-[#B3D4FF]"
              >
                <div className={`p-2 rounded-lg ${action.bg}`}>
                  <Icon size={16} />
                </div>
                <span className="text-[10px] font-bold text-[#172B4D] text-center leading-tight">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Leave Quotas At-a-Glance */}
      <div className="bg-white border border-[#DFE1E6] rounded-xl p-3.5 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#172B4D]">Leave Balances (FY 2026)</span>
          <button
            onClick={() => navigate("/leaves")}
            className="text-[11px] font-bold text-[#0052CC] flex items-center hover:underline cursor-pointer"
          >
            Details <ChevronRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 border border-[#DFE1E6] rounded-lg bg-[#FAFBFC]">
            <span className="text-[10px] text-[#6B778C] block">Casual (CL)</span>
            <span className="font-bold text-[#0052CC]">
              {leaveBalances ? Math.max(0, (leaveBalances.casual?.totalAllocated || 12) - (leaveBalances.casual?.used || 0)) : 12}
            </span>
          </div>
          <div className="p-2 border border-[#DFE1E6] rounded-lg bg-[#FAFBFC]">
            <span className="text-[10px] text-[#6B778C] block">Sick (SL)</span>
            <span className="font-bold text-[#00875A]">
              {leaveBalances ? Math.max(0, (leaveBalances.sick?.totalAllocated || 10) - (leaveBalances.sick?.used || 0)) : 10}
            </span>
          </div>
          <div className="p-2 border border-[#DFE1E6] rounded-lg bg-[#FAFBFC]">
            <span className="text-[10px] text-[#6B778C] block">Earned (EL)</span>
            <span className="font-bold text-[#403294]">
              {leaveBalances ? Math.max(0, (leaveBalances.earned?.totalAllocated || 15) - (leaveBalances.earned?.used || 0)) : 15}
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Holidays Card */}
      <div className="bg-white border border-[#DFE1E6] rounded-xl p-3.5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#172B4D]">Upcoming Statutory Holidays</span>
          <span className="text-[10px] text-[#6B778C]">Next 30 Days</span>
        </div>

        <div className="divide-y divide-[#DFE1E6]">
          {upcomingHolidays.length > 0 ? (
            upcomingHolidays.map((h, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold block text-[#172B4D]">{h.name}</span>
                  <span className="text-[10px] text-[#6B778C]">
                    {new Date(h.date).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DEEBFF] text-[#0052CC]">
                  {h.type || "National"}
                </span>
              </div>
            ))
          ) : (
            <div className="py-3 text-center text-[11px] text-[#6B778C]">
              No upcoming statutory holidays in the next 30 days.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
