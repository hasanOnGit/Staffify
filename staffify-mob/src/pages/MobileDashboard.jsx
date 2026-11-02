import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
  Building2,
  Send,
  Radio,
  FileCheck2,
  Sparkles,
  ArrowUpRight,
  X,
  Check,
  TrendingUp,
  UserCheck,
  Activity
} from "lucide-react";
import api from "../services/api";

export default function MobileDashboard() {
  const { user, isAdmin, isManager, isEmployee } = useAuth();
  const navigate = useNavigate();

  // State
  const [workHoursTicking, setWorkHoursTicking] = useState("05h 24m");
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastSuccess, setBroadcastSuccess] = useState(null);

  // Live timer simulation for employee clock-in
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const mins = String(now.getMinutes()).padStart(2, "0");
      const secs = String(now.getSeconds()).padStart(2, "0");
      setWorkHoursTicking(`05h ${mins}m ${secs}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    setBroadcastSuccess("Announcement broadcasted to all employees successfully");
    setBroadcastModalOpen(false);
    setBroadcastTitle("");
    setBroadcastMessage("");
    setTimeout(() => setBroadcastSuccess(null), 3500);
  };

  // Mock Squad Data for Managers
  const squadAttendance = [
    { name: "Priya Sharma", role: "Frontend Dev", status: "Present", inTime: "09:14 AM" },
    { name: "Rahul Verma", role: "Backend Dev", status: "Late", inTime: "10:22 AM" },
    { name: "Neha Deshmukh", role: "QA Engineer", status: "On Leave", inTime: "Casual Leave" },
    { name: "Aman Patel", role: "DevOps", status: "Present", inTime: "08:58 AM" }
  ];

  return (
    <div className="pb-8 space-y-4">
      {/* Toast */}
      {broadcastSuccess && (
        <div className="p-3.5 rounded-xl bg-[#E3FCEF] dark:bg-emerald-950/40 border border-[#00875A]/30 text-[#00875A] dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{broadcastSuccess}</span>
        </div>
      )}

      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-[#0052CC] to-[#0747A6] rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>StaffifyMOB • {user?.role || "Employee"} Portal</span>
          </div>
          <h1 className="text-xl font-bold leading-tight">
            {getGreeting()}, {user?.name?.split(" ")[0] || "Team Member"}!
          </h1>
          <p className="text-xs text-blue-100">
            {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ADMIN ROLE VIEW                                                */}
      {/* ============================================================== */}
      {isAdmin && (
        <div className="space-y-4">
          {/* Executive Pulse KPI Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white dark:bg-[#0F131C] p-3.5 rounded-xl border border-[#DFE1E6] dark:border-[#263042] space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-[#6B778C] dark:text-slate-400">
                <span className="text-[11px] font-bold uppercase">Total Workforce</span>
                <Users className="w-4 h-4 text-[#0052CC]" />
              </div>
              <p className="text-2xl font-black text-[#172B4D] dark:text-white">42</p>
              <p className="text-[10px] text-[#00875A] font-semibold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> 100% Active Directory
              </p>
            </div>

            <div className="bg-white dark:bg-[#0F131C] p-3.5 rounded-xl border border-[#DFE1E6] dark:border-[#263042] space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-[#6B778C] dark:text-slate-400">
                <span className="text-[11px] font-bold uppercase">Attendance Today</span>
                <Activity className="w-4 h-4 text-[#00875A]" />
              </div>
              <p className="text-2xl font-black text-[#00875A]">92.8%</p>
              <p className="text-[10px] text-[#6B778C] dark:text-slate-400">38 Present • 3 Leaves • 1 Late</p>
            </div>

            <div className="bg-white dark:bg-[#0F131C] p-3.5 rounded-xl border border-[#DFE1E6] dark:border-[#263042] space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-[#6B778C] dark:text-slate-400">
                <span className="text-[11px] font-bold uppercase">Pending Actions</span>
                <AlertCircle className="w-4 h-4 text-[#B9770E]" />
              </div>
              <p className="text-2xl font-black text-[#B9770E]">4</p>
              <button
                onClick={() => navigate("/approvals")}
                className="text-[10px] text-[#0052CC] font-bold hover:underline"
              >
                Review Approval Deck →
              </button>
            </div>

            <div className="bg-white dark:bg-[#0F131C] p-3.5 rounded-xl border border-[#DFE1E6] dark:border-[#263042] space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-[#6B778C] dark:text-slate-400">
                <span className="text-[11px] font-bold uppercase">Payroll Status</span>
                <CreditCard className="w-4 h-4 text-[#0052CC]" />
              </div>
              <p className="text-2xl font-black text-[#172B4D] dark:text-white">Ready</p>
              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#E3FCEF] text-[#00875A]">
                Disbursement Open
              </span>
            </div>
          </div>

          {/* Quick Admin Actions */}
          <div className="bg-white dark:bg-[#0F131C] p-4 rounded-xl border border-[#DFE1E6] dark:border-[#263042] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-slate-400">
              Admin Operations
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setBroadcastModalOpen(true)}
                className="p-3 rounded-xl border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-left hover:border-[#0052CC] active:scale-98 transition-all flex items-start gap-2.5"
              >
                <div className="p-2 rounded-lg bg-[#0052CC]/10 text-[#0052CC] shrink-0">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-[#172B4D] dark:text-white">Broadcast</p>
                  <p className="text-[10px] text-[#6B778C] dark:text-slate-400">Push notice to all</p>
                </div>
              </button>

              <button
                onClick={() => navigate("/approvals")}
                className="p-3 rounded-xl border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-left hover:border-[#0052CC] active:scale-98 transition-all flex items-start gap-2.5"
              >
                <div className="p-2 rounded-lg bg-[#00875A]/10 text-[#00875A] shrink-0">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-[#172B4D] dark:text-white">Approvals</p>
                  <p className="text-[10px] text-[#6B778C] dark:text-slate-400">Review 4 items</p>
                </div>
              </button>
            </div>
          </div>

          {/* Live Biometric & Geofence Gateway Health */}
          <div className="p-3.5 rounded-xl border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="font-bold text-[#172B4D] dark:text-white">Bangalore HQ Gateways</p>
                <p className="text-[10px] text-[#6B778C] dark:text-slate-400">2 Biometric ADMS Online • 1 Geofence Active</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#E3FCEF] text-[#00875A] font-bold text-[10px]">
              Healthy
            </span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MANAGER ROLE VIEW                                              */}
      {/* ============================================================== */}
      {isManager && !isAdmin && (
        <div className="space-y-4">
          {/* Approvals Action Banner */}
          <div
            onClick={() => navigate("/approvals")}
            className="p-4 rounded-xl bg-[#DEEBFF] dark:bg-blue-950/40 border border-[#0052CC]/30 flex items-center justify-between cursor-pointer active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0052CC] text-white flex items-center justify-center font-bold">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-[#172B4D] dark:text-white">Pending Team Approvals</h3>
                <p className="text-[10px] text-[#0052CC] dark:text-blue-300 font-semibold">
                  3 Requests awaiting your decision
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#0052CC]" />
          </div>

          {/* Squad Attendance Today */}
          <div className="bg-white dark:bg-[#0F131C] p-4 rounded-xl border border-[#DFE1E6] dark:border-[#263042] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#0052CC]" />
                My Squad Today (4 Members)
              </h3>
              <span className="text-[10px] text-[#00875A] font-bold">75% Present</span>
            </div>

            <div className="space-y-2">
              {squadAttendance.map((emp, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg border border-[#EBECF0] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-[#172B4D] dark:text-white">{emp.name}</p>
                    <p className="text-[10px] text-[#6B778C] dark:text-slate-400">{emp.role}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.status === "Present"
                          ? "bg-[#E3FCEF] text-[#00875A]"
                          : emp.status === "Late"
                          ? "bg-[#FFF0B3] text-[#B9770E]"
                          : "bg-[#FFEBE6] text-[#DE350B]"
                      }`}
                    >
                      {emp.status}
                    </span>
                    <p className="text-[9px] text-[#6B778C] dark:text-slate-400 mt-0.5 font-mono">{emp.inTime}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EMPLOYEE WORKFORCE VIEW                                        */}
      {/* ============================================================== */}
      <div className="space-y-4">
        {/* Live Attendance Card */}
        <div className="bg-white dark:bg-[#0F131C] rounded-2xl p-4 border border-[#DFE1E6] dark:border-[#263042] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00875A]"></span>
              </span>
              <span className="font-bold text-xs uppercase tracking-wider text-[#00875A]">
                Currently Clocked In
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#6B778C] dark:text-slate-400">In: 09:12 AM</span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#6B778C] dark:text-slate-400">Work Hours Logged</p>
              <p className="text-3xl font-black tracking-tight text-[#172B4D] dark:text-white font-mono mt-0.5">
                {workHoursTicking}
              </p>
            </div>
            <button
              onClick={() => navigate("/swipes")}
              className="px-3.5 py-2 rounded-xl bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold active:scale-95 transition-transform flex items-center gap-1.5 shadow-sm"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Punch Swipe</span>
            </button>
          </div>

          {/* GPS Perimeter Pill */}
          <div className="p-2.5 rounded-xl bg-[#FAFBFC] dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#6B778C] dark:text-slate-400">
              <MapPin className="w-4 h-4 text-[#0052CC] shrink-0" />
              <span className="truncate">Bangalore HQ Perimeter (200m zone)</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#E3FCEF] text-[#00875A] font-bold text-[10px] shrink-0">
              Inside
            </span>
          </div>
        </div>

        {/* 4 Quick Actions Grid */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => navigate("/swipes")}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] active:scale-95 transition-transform shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center mb-1.5">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#172B4D] dark:text-white">Swipes</span>
          </button>

          <button
            onClick={() => navigate("/leaves")}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] active:scale-95 transition-transform shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E3FCEF] text-[#00875A] flex items-center justify-center mb-1.5">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#172B4D] dark:text-white">Leaves</span>
          </button>

          <button
            onClick={() => navigate("/payslips")}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] active:scale-95 transition-transform shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FFF0B3] text-[#B9770E] flex items-center justify-center mb-1.5">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#172B4D] dark:text-white">Payslips</span>
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] active:scale-95 transition-transform shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F4F5F7] text-[#42526E] flex items-center justify-center mb-1.5">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#172B4D] dark:text-white">Smart ID</span>
          </button>
        </div>

        {/* Leave Quota Balance Summary */}
        <div className="bg-white dark:bg-[#0F131C] rounded-2xl p-4 border border-[#DFE1E6] dark:border-[#263042] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-slate-400">
              Leave Balances
            </h3>
            <button
              onClick={() => navigate("/leaves")}
              className="text-xs text-[#0052CC] dark:text-blue-400 font-bold flex items-center gap-1 hover:underline"
            >
              <span>Manage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="p-2.5 rounded-xl bg-[#FAFBFC] dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042] text-center">
              <p className="text-[10px] text-[#6B778C] dark:text-slate-400 font-bold">CL</p>
              <p className="text-base font-black text-[#0052CC] mt-0.5">4.5</p>
              <p className="text-[8px] text-[#8993A4]">Casual</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAFBFC] dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042] text-center">
              <p className="text-[10px] text-[#6B778C] dark:text-slate-400 font-bold">SL</p>
              <p className="text-base font-black text-[#00875A] mt-0.5">6.0</p>
              <p className="text-[8px] text-[#8993A4]">Sick</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAFBFC] dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042] text-center">
              <p className="text-[10px] text-[#6B778C] dark:text-slate-400 font-bold">EL</p>
              <p className="text-base font-black text-[#B9770E] mt-0.5">14.0</p>
              <p className="text-[8px] text-[#8993A4]">Earned</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAFBFC] dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042] text-center">
              <p className="text-[10px] text-[#6B778C] dark:text-slate-400 font-bold">CO</p>
              <p className="text-base font-black text-[#42526E] mt-0.5">2.0</p>
              <p className="text-[8px] text-[#8993A4]">Comp-Off</p>
            </div>
          </div>
        </div>

        {/* Upcoming Statutory Holidays */}
        <div className="bg-white dark:bg-[#0F131C] rounded-2xl p-4 border border-[#DFE1E6] dark:border-[#263042] shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0052CC]" />
              Upcoming Corporate Holidays
            </h3>
            <span className="text-[10px] text-[#6B778C] font-semibold">Q4 2026</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="p-2.5 rounded-lg bg-[#FAFBFC] dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042] flex items-center justify-between">
              <div>
                <p className="font-bold text-[#172B4D] dark:text-white">Diwali (Deepavali)</p>
                <p className="text-[10px] text-[#6B778C] dark:text-slate-400">Mandatory Public Holiday</p>
              </div>
              <span className="font-mono text-[11px] font-bold text-[#0052CC]">08 Nov 2026</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#FAFBFC] dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042] flex items-center justify-between">
              <div>
                <p className="font-bold text-[#172B4D] dark:text-white">Christmas Day</p>
                <p className="text-[10px] text-[#6B778C] dark:text-slate-400">National Holiday</p>
              </div>
              <span className="font-mono text-[11px] font-bold text-[#0052CC]">25 Dec 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Broadcast Modal */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-fade-in">
          <div className="bg-white dark:bg-[#0F131C] w-full max-w-sm rounded-2xl p-5 border border-[#DFE1E6] dark:border-[#263042] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#0052CC]" />
                <h3 className="font-bold text-sm text-[#172B4D] dark:text-white">Company Broadcast</h3>
              </div>
              <button
                onClick={() => setBroadcastModalOpen(false)}
                className="p-1 rounded-lg text-[#6B778C] hover:bg-[#EBECF0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#172B4D] dark:text-slate-300">Subject</label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Townhall Announcement"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-xs text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#172B4D] dark:text-slate-300">Message</label>
                <textarea
                  required
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Draft priority notice for all mobile users..."
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-xs text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBroadcastModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-[#DFE1E6] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0052CC] text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
