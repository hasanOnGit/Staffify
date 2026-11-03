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
  TrendingUp,
  Activity,
  ShieldCheck,
  Zap,
  ArrowRight,
  Server,
  Layers
} from "lucide-react";
import PullToRefresh from "../components/PullToRefresh";

export default function MobileDashboard() {
  const { user, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();

  // State
  const [workHoursTicking, setWorkHoursTicking] = useState("05h 24m 18s");
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
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
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

  const squadAttendance = [
    { name: "Priya Sharma", role: "Frontend Dev", status: "Present", inTime: "09:14 AM" },
    { name: "Rahul Verma", role: "Backend Dev", status: "Late", inTime: "10:22 AM" },
    { name: "Neha Deshmukh", role: "QA Engineer", status: "On Leave", inTime: "Casual Leave" },
    { name: "Aman Patel", role: "DevOps", status: "Present", inTime: "08:58 AM" }
  ];

  const handleRefresh = async () => {
    // Refresh dashboard state
    await new Promise((r) => setTimeout(r, 650));
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="pb-8 space-y-4 animate-in fade-in duration-300">
        {/* Toast */}
      {broadcastSuccess && (
        <div className="p-3.5 rounded-2xl bg-[#E3FCEF] dark:bg-emerald-950/40 border border-[#00875A]/30 text-[#00875A] dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{broadcastSuccess}</span>
        </div>
      )}

      {/* Hero Executive Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0052CC] via-[#0747A6] to-[#00388B] text-white p-5 shadow-lg border border-white/15">
        {/* Decorative Geometric Overlay */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Sparkles className="w-44 h-44" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase border border-white/20">
              <Zap className="w-3 h-3 text-cyan-300" />
              <span>{user?.role || "Employee"} Workspace</span>
            </div>
            <span className="text-[11px] text-blue-200 font-medium">
              {new Date().toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}
            </span>
          </div>

          <div className="flex items-center gap-3.5 pt-1">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-black text-lg shadow-inner">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "EM"}
            </div>
            <div>
              <p className="text-xs text-blue-200 font-medium">{getGreeting()},</p>
              <h1 className="text-xl font-extrabold tracking-tight leading-tight">
                {user?.name || "Team Member"}
              </h1>
              <p className="text-[11px] text-blue-100/90 font-medium mt-0.5">
                {user?.designation || "Enterprise Staff"} • {user?.department || "General"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ADMIN ROLE VIEW                                                */}
      {/* ============================================================== */}
      {isAdmin && (
        <div className="space-y-4">
          {/* Executive Pulse KPI Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-[#0F131C] p-4 rounded-2xl border border-[#DFE1E6]/80 dark:border-[#263042] space-y-1.5 shadow-xs hover:border-[#0052CC] transition-colors">
              <div className="flex items-center justify-between text-[#6B778C] dark:text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Headcount</span>
                <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0052CC]">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-[#172B4D] dark:text-white tabular-nums">42</p>
              <p className="text-[10px] text-[#00875A] font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> 100% Active Workforce
              </p>
            </div>

            <div
              onClick={() => navigate("/swipes?tab=org")}
              className="bg-white dark:bg-[#0F131C] p-4 rounded-2xl border border-[#DFE1E6]/80 dark:border-[#263042] space-y-1.5 shadow-xs hover:border-[#00875A] transition-colors cursor-pointer active:scale-95 group"
            >
              <div className="flex items-center justify-between text-[#6B778C] dark:text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Attendance %</span>
                <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#00875A]">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-[#00875A] tabular-nums">92.8%</p>
              <div className="flex items-center justify-between gap-1">
                <p className="text-[10px] text-[#6B778C] dark:text-slate-400 truncate">38 Present • 3 Leave</p>
                <span className="text-[10px] text-[#0052CC] font-bold flex items-center gap-0.5 group-hover:underline shrink-0">
                  <span>Teams</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0F131C] p-4 rounded-2xl border border-[#DFE1E6]/80 dark:border-[#263042] space-y-1.5 shadow-xs hover:border-[#B9770E] transition-colors">
              <div className="flex items-center justify-between text-[#6B778C] dark:text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Pending Deck</span>
                <div className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-[#B9770E]">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-[#B9770E] tabular-nums">4</p>
              <button
                onClick={() => navigate("/approvals")}
                className="text-[10px] text-[#0052CC] font-bold hover:underline flex items-center gap-0.5"
              >
                <span>Review Requests</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-white dark:bg-[#0F131C] p-4 rounded-2xl border border-[#DFE1E6]/80 dark:border-[#263042] space-y-1.5 shadow-xs hover:border-[#0052CC] transition-colors">
              <div className="flex items-center justify-between text-[#6B778C] dark:text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Payroll Cycle</span>
                <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0052CC]">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-[#172B4D] dark:text-white">Ready</p>
              <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#E3FCEF] text-[#00875A]">
                Disbursement Open
              </span>
            </div>
          </div>

          {/* Quick Admin Actions */}
          <div className="bg-white dark:bg-[#0F131C] p-4 rounded-3xl border border-[#DFE1E6]/80 dark:border-[#263042] space-y-3 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-slate-400">
              Executive Controls
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setBroadcastModalOpen(true)}
                className="p-3.5 rounded-2xl border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-left hover:border-[#0052CC] active:scale-95 transition-all flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-[#0052CC]/10 text-[#0052CC] shrink-0">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-[#172B4D] dark:text-white">Broadcast</p>
                  <p className="text-[10px] text-[#6B778C] dark:text-slate-400 mt-0.5">Push notice to all</p>
                </div>
              </button>

              <button
                onClick={() => navigate("/approvals")}
                className="p-3.5 rounded-2xl border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-left hover:border-[#0052CC] active:scale-95 transition-all flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-[#00875A]/10 text-[#00875A] shrink-0">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-[#172B4D] dark:text-white">Approvals</p>
                  <p className="text-[10px] text-[#6B778C] dark:text-slate-400 mt-0.5">Review 4 queues</p>
                </div>
              </button>
            </div>
          </div>

          {/* Master Workforce Directory Snapshot */}
          <div className="bg-white dark:bg-[#0F131C] p-4 rounded-3xl border border-[#DFE1E6]/80 dark:border-[#263042] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#0052CC]" />
                Workforce Distribution
              </h3>
              <button
                onClick={() => navigate("/workforce")}
                className="text-xs text-[#0052CC] dark:text-blue-400 font-bold flex items-center gap-0.5 hover:underline"
              >
                <span>Directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-2xl bg-[#FAFBFC] dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042]">
                <p className="text-base font-black text-[#172B4D] dark:text-white">22</p>
                <p className="text-[9px] text-[#6B778C] dark:text-slate-400 font-bold uppercase mt-0.5">Engg</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#FAFBFC] dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042]">
                <p className="text-base font-black text-[#172B4D] dark:text-white">6</p>
                <p className="text-[9px] text-[#6B778C] dark:text-slate-400 font-bold uppercase mt-0.5">Product</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#FAFBFC] dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042]">
                <p className="text-base font-black text-[#172B4D] dark:text-white">14</p>
                <p className="text-[9px] text-[#6B778C] dark:text-slate-400 font-bold uppercase mt-0.5">Ops / Sales</p>
              </div>
            </div>

            <button
              onClick={() => navigate("/workforce")}
              className="w-full py-2.5 rounded-2xl bg-[#0052CC] text-white text-xs font-bold shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Explore All 42 Employees</span>
            </button>
          </div>

          {/* Biometric Gateways & Terminals Monitor */}
          <div className="bg-white dark:bg-[#0F131C] p-4 rounded-3xl border border-[#DFE1E6]/80 dark:border-[#263042] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-slate-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#0052CC]" />
                Biometric Gateway Health
              </h3>
              <button
                onClick={() => navigate("/swipes?tab=gateways")}
                className="text-xs text-[#0052CC] dark:text-blue-400 font-bold flex items-center gap-0.5 hover:underline"
              >
                <span>3 Online</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-[#FAFBFC] dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00875A] animate-pulse" />
                  <div>
                    <p className="font-bold text-[#172B4D] dark:text-white">Main Lobby FaceID</p>
                    <p className="text-[9px] text-[#6B778C] dark:text-slate-400 font-mono">192.168.1.101 • eSSL Terminal</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-[#E3FCEF] text-[#00875A] font-bold text-[9px]">99.8%</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#FAFBFC] dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00875A]" />
                  <div>
                    <p className="font-bold text-[#172B4D] dark:text-white">Wing-B Turnstile</p>
                    <p className="text-[9px] text-[#6B778C] dark:text-slate-400 font-mono">192.168.1.102 • ZKTeco Finger</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-[#E3FCEF] text-[#00875A] font-bold text-[9px]">100%</span>
              </div>
            </div>
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
            className="p-4 rounded-3xl bg-gradient-to-r from-[#DEEBFF]/80 to-blue-50/90 dark:from-blue-950/50 dark:to-blue-900/40 border border-[#0052CC]/30 flex items-center justify-between cursor-pointer active:scale-98 transition-all shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#0052CC] text-white flex items-center justify-center font-bold shadow-xs">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-[#172B4D] dark:text-white">Pending Team Approvals</h3>
                <p className="text-[11px] text-[#0052CC] dark:text-blue-300 font-semibold mt-0.5">
                  3 Requests awaiting your review
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white dark:bg-[#0F131C] flex items-center justify-center text-[#0052CC] shadow-xs">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Squad Attendance Today */}
          <div className="bg-white dark:bg-[#0F131C] p-4 rounded-3xl border border-[#DFE1E6]/80 dark:border-[#263042] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#0052CC]" />
                My Squad Today (4 Members)
              </h3>
              <button
                onClick={() => navigate("/swipes?tab=team")}
                className="text-xs text-[#0052CC] dark:text-blue-400 font-bold flex items-center gap-0.5 hover:underline"
              >
                <span>75% Present</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {squadAttendance.map((emp, i) => (
                <div
                  key={i}
                  onClick={() => navigate("/swipes?tab=team")}
                  className="p-3 rounded-2xl border border-[#EBECF0] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] flex items-center justify-between text-xs cursor-pointer hover:border-[#0052CC] active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#EBECF0] dark:bg-[#263042] flex items-center justify-center font-bold text-[11px] text-[#172B4D] dark:text-white">
                      {emp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-[#172B4D] dark:text-white">{emp.name}</p>
                      <p className="text-[10px] text-[#6B778C] dark:text-slate-400">{emp.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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

            <button
              onClick={() => navigate("/swipes?tab=team")}
              className="w-full py-2.5 rounded-2xl bg-[#0052CC] text-white text-xs font-bold shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Open Squad Attendance Hub</span>
            </button>
          </div>

          {/* Manager Personal Shift Clock */}
          <div className="bg-white dark:bg-[#0F131C] rounded-3xl p-5 border border-[#DFE1E6]/80 dark:border-[#263042] shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00875A]"></span>
                </span>
                <span className="font-bold text-xs uppercase tracking-wider text-[#00875A]">
                  Manager On Duty
                </span>
              </div>
              <span className="text-[11px] font-mono font-medium text-[#6B778C] dark:text-slate-400">First In: 09:00 AM</span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#6B778C] dark:text-slate-400 tracking-wider">
                  Active Shift Time
                </p>
                <p className="text-3xl font-black tracking-tight text-[#172B4D] dark:text-white font-mono mt-0.5">
                  {workHoursTicking}
                </p>
              </div>
              <button
                onClick={() => navigate("/swipes")}
                className="px-4 py-2.5 rounded-2xl bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-bold active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Punch Swipe</span>
              </button>
            </div>
          </div>

          {/* Manager 4 Quick Action Tiles */}
          <div className="grid grid-cols-4 gap-2.5">
            <button
              onClick={() => navigate("/swipes")}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-[#0F131C] border border-[#DFE1E6]/80 dark:border-[#263042] active:scale-90 transition-all shadow-xs hover:border-[#0052CC] group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center mb-1.5 shadow-xs transition-transform duration-200 group-hover:scale-110 group-active:scale-125 group-active:-rotate-6 ring-1 ring-[#0052CC]/15">
                <Clock className="w-5 h-5 transition-transform duration-200 group-active:stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-[#172B4D] dark:text-white group-hover:text-[#0052CC] transition-colors">Swipes</span>
            </button>

            <button
              onClick={() => navigate("/approvals")}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-[#0F131C] border border-[#DFE1E6]/80 dark:border-[#263042] active:scale-90 transition-all shadow-xs hover:border-[#0052CC] group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#E3FCEF] text-[#00875A] flex items-center justify-center mb-1.5 shadow-xs transition-transform duration-200 group-hover:scale-110 group-active:scale-125 group-active:rotate-6 ring-1 ring-[#00875A]/15 relative">
                <FileCheck2 className="w-5 h-5 transition-transform duration-200 group-active:stroke-[2.5]" />
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-[#DE350B] text-white text-[9px] font-black rounded-full shadow-xs">3</span>
              </div>
              <span className="text-[11px] font-bold text-[#172B4D] dark:text-white group-hover:text-[#00875A] transition-colors">Approvals</span>
            </button>

            <button
              onClick={() => navigate("/leaves")}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-[#0F131C] border border-[#DFE1E6]/80 dark:border-[#263042] active:scale-90 transition-all shadow-xs hover:border-[#B9770E] group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0B3] text-[#B9770E] flex items-center justify-center mb-1.5 shadow-xs transition-transform duration-200 group-hover:scale-110 group-active:scale-125 group-active:-rotate-6 ring-1 ring-[#B9770E]/15">
                <Calendar className="w-5 h-5 transition-transform duration-200 group-active:stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-[#172B4D] dark:text-white group-hover:text-[#B9770E] transition-colors">Leaves</span>
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-[#0F131C] border border-[#DFE1E6]/80 dark:border-[#263042] active:scale-90 transition-all shadow-xs hover:border-[#0052CC] group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FAFBFC] text-[#0052CC] border border-[#DFE1E6] flex items-center justify-center mb-1.5 shadow-xs transition-transform duration-200 group-hover:scale-110 group-active:scale-125 group-active:rotate-6 ring-1 ring-[#0052CC]/15">
                <Award className="w-5 h-5 transition-transform duration-200 group-active:stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-[#172B4D] dark:text-white group-hover:text-[#0052CC] transition-colors">Smart ID</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EMPLOYEE WORKFORCE VIEW                                        */}
      {/* ============================================================== */}
      {!isAdmin && !isManager && (
        <div className="space-y-4">
          {/* Live Attendance Clock Widget */}
          <div className="bg-white dark:bg-[#0F131C] rounded-3xl p-5 border border-[#DFE1E6]/80 dark:border-[#263042] shadow-sm space-y-3.5">
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
              <span className="text-[11px] font-mono font-medium text-[#6B778C] dark:text-slate-400">First In: 09:12 AM</span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#6B778C] dark:text-slate-400 tracking-wider">
                  Active Shift Time
                </p>
                <p className="text-3xl font-black tracking-tight text-[#172B4D] dark:text-white font-mono mt-0.5">
                  {workHoursTicking}
                </p>
              </div>
              <button
                onClick={() => navigate("/swipes")}
                className="px-4 py-2.5 rounded-2xl bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-bold active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Punch Swipe</span>
              </button>
            </div>

            {/* GPS Perimeter Radar Pill */}
            <div className="p-3 rounded-2xl bg-[#FAFBFC] dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#6B778C] dark:text-slate-400 truncate">
                <MapPin className="w-4 h-4 text-[#0052CC] shrink-0" />
                <span className="truncate">Tech Park Campus (Authorized Radius: 500m)</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E3FCEF] text-[#00875A] font-bold text-[10px] shrink-0">
                Verified
              </span>
            </div>
          </div>

          {/* 4 Premium Quick Action Tiles with Peak Detailing */}
          <div className="grid grid-cols-4 gap-2.5">
            <button
              onClick={() => navigate("/swipes")}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-[#0F131C] border border-[#DFE1E6]/80 dark:border-[#263042] active:scale-90 transition-all shadow-xs hover:border-[#0052CC] group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center mb-1.5 shadow-xs transition-transform duration-200 group-hover:scale-110 group-active:scale-125 group-active:-rotate-6 ring-1 ring-[#0052CC]/15">
                <Clock className="w-5 h-5 transition-transform duration-200 group-active:stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-[#172B4D] dark:text-white group-hover:text-[#0052CC] transition-colors">Swipes</span>
            </button>

            <button
              onClick={() => navigate("/leaves")}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-[#0F131C] border border-[#DFE1E6]/80 dark:border-[#263042] active:scale-90 transition-all shadow-xs hover:border-[#00875A] group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#E3FCEF] text-[#00875A] flex items-center justify-center mb-1.5 shadow-xs transition-transform duration-200 group-hover:scale-110 group-active:scale-125 group-active:rotate-6 ring-1 ring-[#00875A]/15">
                <Calendar className="w-5 h-5 transition-transform duration-200 group-active:stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-[#172B4D] dark:text-white group-hover:text-[#00875A] transition-colors">Leaves</span>
            </button>

            <button
              onClick={() => navigate("/payslips")}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-[#0F131C] border border-[#DFE1E6]/80 dark:border-[#263042] active:scale-90 transition-all shadow-xs hover:border-[#B9770E] group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0B3] text-[#B9770E] flex items-center justify-center mb-1.5 shadow-xs transition-transform duration-200 group-hover:scale-110 group-active:scale-125 group-active:-rotate-6 ring-1 ring-[#B9770E]/15">
                <CreditCard className="w-5 h-5 transition-transform duration-200 group-active:stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-[#172B4D] dark:text-white group-hover:text-[#B9770E] transition-colors">Payslips</span>
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-[#0F131C] border border-[#DFE1E6]/80 dark:border-[#263042] active:scale-90 transition-all shadow-xs hover:border-[#0052CC] group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FAFBFC] text-[#0052CC] border border-[#DFE1E6] flex items-center justify-center mb-1.5 shadow-xs transition-transform duration-200 group-hover:scale-110 group-active:scale-125 group-active:rotate-6 ring-1 ring-[#0052CC]/15">
                <Award className="w-5 h-5 transition-transform duration-200 group-active:stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-[#172B4D] dark:text-white group-hover:text-[#0052CC] transition-colors">Smart ID</span>
            </button>
          </div>
        </div>
      )}

      {/* Common Leave Quotas (For Manager and Employee) */}
      {!isAdmin && (
        <div className="bg-white dark:bg-[#0F131C] rounded-3xl p-4 border border-[#DFE1E6]/80 dark:border-[#263042] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-slate-400">
              Leave Quotas
            </h3>
            <button
              onClick={() => navigate("/leaves")}
              className="text-xs text-[#0052CC] dark:text-blue-400 font-bold flex items-center gap-0.5 hover:underline"
            >
              <span>Apply Leave</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="p-3 rounded-2xl bg-[#FAFBFC] dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042] text-center">
              <p className="text-[10px] text-[#6B778C] dark:text-slate-400 font-bold uppercase">CL</p>
              <p className="text-lg font-black text-[#0052CC] mt-0.5 tabular-nums">4.5</p>
              <p className="text-[9px] text-[#8993A4]">Casual</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAFBFC] dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042] text-center">
              <p className="text-[10px] text-[#6B778C] dark:text-slate-400 font-bold uppercase">SL</p>
              <p className="text-lg font-black text-[#00875A] mt-0.5 tabular-nums">6.0</p>
              <p className="text-[9px] text-[#8993A4]">Sick</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAFBFC] dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042] text-center">
              <p className="text-[10px] text-[#6B778C] dark:text-slate-400 font-bold uppercase">EL</p>
              <p className="text-lg font-black text-[#B9770E] mt-0.5 tabular-nums">14.0</p>
              <p className="text-[9px] text-[#8993A4]">Earned</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAFBFC] dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042] text-center">
              <p className="text-[10px] text-[#6B778C] dark:text-slate-400 font-bold uppercase">CO</p>
              <p className="text-lg font-black text-[#42526E] mt-0.5 tabular-nums">2.0</p>
              <p className="text-[9px] text-[#8993A4]">Comp-Off</p>
            </div>
          </div>
        </div>
      )}

      {/* Corporate Holidays (Universal to all roles) */}
      <div className="bg-white dark:bg-[#0F131C] rounded-3xl p-4 border border-[#DFE1E6]/80 dark:border-[#263042] shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#0052CC]" />
            Corporate Holidays (Q4 2026)
          </h3>
          <span className="text-[10px] text-[#00875A] font-bold">2 Remaining</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-2xl bg-[#FAFBFC] dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042] flex items-center justify-between">
            <div>
              <p className="font-bold text-[#172B4D] dark:text-white">Diwali (Deepavali)</p>
              <p className="text-[10px] text-[#6B778C] dark:text-slate-400">Statutory Public Holiday</p>
            </div>
            <span className="font-mono text-[11px] font-bold text-[#0052CC] bg-[#DEEBFF] dark:bg-blue-950/60 px-2 py-0.5 rounded-lg">
              08 Nov 2026
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#FAFBFC] dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042] flex items-center justify-between">
            <div>
              <p className="font-bold text-[#172B4D] dark:text-white">Christmas Day</p>
              <p className="text-[10px] text-[#6B778C] dark:text-slate-400">National Holiday</p>
            </div>
            <span className="font-mono text-[11px] font-bold text-[#0052CC] bg-[#DEEBFF] dark:bg-blue-950/60 px-2 py-0.5 rounded-lg">
              25 Dec 2026
            </span>
          </div>
        </div>
      </div>

      {/* Admin Broadcast Modal */}
      {broadcastModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-fade-in"
          onClick={() => setBroadcastModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#0F131C] w-full max-w-sm rounded-3xl p-5 border border-[#DFE1E6] dark:border-[#263042] shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#0052CC]" />
                <h3 className="font-bold text-sm text-[#172B4D] dark:text-white">Company Broadcast</h3>
              </div>
              <button
                type="button"
                onClick={() => setBroadcastModalOpen(false)}
                aria-label="Close"
                className="w-7 h-7 rounded-full bg-[#F4F5F7] dark:bg-[#263042] text-[#6B778C] dark:text-slate-300 hover:text-[#DE350B] dark:hover:text-[#DE350B] hover:bg-[#FFEBE6] dark:hover:bg-rose-950/40 flex items-center justify-center transition-all active:scale-90"
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
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-xs text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
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
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-xs text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBroadcastModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-[#DFE1E6] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0052CC] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 active:scale-95 transition-transform"
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
    </PullToRefresh>
  );
}
