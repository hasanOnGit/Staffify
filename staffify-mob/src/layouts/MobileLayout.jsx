import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StaffifyLogo from "../components/StaffifyLogo";
import {
  Home,
  Clock,
  Calendar,
  CreditCard,
  CheckSquare,
  User,
  Wifi,
  WifiOff,
  RotateCw,
  ChevronDown,
  Building2,
  Users,
  UserCheck,
  X,
  Check,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export default function MobileLayout() {
  const { user, isManager, isAdmin, isOnline, switchRole, offlineQueue } = useAuth();
  const navigate = useNavigate();
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSyncToast, setShowSyncToast] = useState(false);

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setShowSyncToast(false);

    // Haptic vibration feedback
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([25, 45, 25]);
    }

    setTimeout(() => {
      setIsRefreshing(false);
      setShowSyncToast(true);
      setTimeout(() => setShowSyncToast(false), 2400);
    }, 850);
  };

  const handleSelectRole = async (role) => {
    setRoleModalOpen(false);
    await switchRole(role);
  };

  const getNavItems = () => {
    if (isAdmin) {
      return [
        { to: "/", label: "Pulse", icon: Home },
        { to: "/workforce", label: "Workforce", icon: Users },
        { to: "/swipes", label: "Swipes", icon: Clock },
        { to: "/approvals", label: "Approvals", icon: CheckSquare, badge: 4 },
        { to: "/profile", label: "Admin ID", icon: User },
      ];
    }
    if (isManager) {
      return [
        { to: "/", label: "Squad", icon: Home },
        { to: "/swipes", label: "Swipes", icon: Clock },
        { to: "/leaves", label: "Leaves", icon: Calendar },
        { to: "/approvals", label: "Approvals", icon: CheckSquare, badge: 3 },
        { to: "/profile", label: "Smart ID", icon: User },
      ];
    }
    return [
      { to: "/", label: "Home", icon: Home },
      { to: "/swipes", label: "Swipes", icon: Clock },
      { to: "/leaves", label: "Leaves", icon: Calendar },
      { to: "/payslips", label: "Payslips", icon: CreditCard },
      { to: "/profile", label: "Smart ID", icon: User },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F5F7] dark:bg-[#090D14] text-[#172B4D] dark:text-[#F1F5F9] max-w-md mx-auto shadow-2xl relative border-x border-[#DFE1E6]/70 dark:border-[#263042]/70 font-sans select-none">
      {/* Top Mobile Header (Sticky & Frosted Glass) */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0F131C]/90 backdrop-blur-xl border-b border-[#DFE1E6]/80 dark:border-[#263042]/80 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between shadow-xs pt-[max(env(safe-area-inset-top),0.65rem)]">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Official Staffify Logo */}
          <StaffifyLogo size="sm" subtitle="MOB" onClick={() => navigate("/")} />

          {/* Quick 1-Tap Persona Switcher Badge */}
          <button
            onClick={() => setRoleModalOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-[#EBECF0]/80 dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] text-[10px] font-bold text-[#172B4D] dark:text-slate-200 active:scale-90 transition-all hover:border-[#0052CC] shrink-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC] animate-pulse" />
            <span>{user?.role || "Employee"}</span>
            <ChevronDown className="w-2.5 h-2.5 text-[#6B778C]" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Offline Pending Queue Badge */}
          {offlineQueue.length > 0 && (
            <span className="text-[9px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300">
              {offlineQueue.length} queued
            </span>
          )}

          {/* Online/Offline Status Indicator */}
          <div
            className={`p-1.5 sm:p-2 rounded-xl border transition-all ${
              isOnline
                ? "text-[#00875A] bg-[#E3FCEF]/80 border-[#00875A]/25 dark:bg-emerald-950/40"
                : "text-[#DE350B] bg-[#FFEBE6]/80 border-[#DE350B]/25 dark:bg-rose-950/40"
            }`}
            title={isOnline ? "Network Connected" : "Offline Cache Active"}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          </div>

          {/* Ultra-Interactive Refresh Button with 720-deg Spin & Ripple Halo */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-1.5 sm:p-2 rounded-xl border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#6B778C] dark:text-slate-400 cursor-pointer active:scale-80 transition-all shadow-xs relative overflow-hidden group ${
              isRefreshing
                ? "border-[#0052CC] text-[#0052CC] animate-ripple ring-2 ring-[#0052CC]/30"
                : "hover:border-[#0052CC] hover:text-[#0052CC]"
            }`}
            title="Synchronize Data"
          >
            <RotateCw
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                isRefreshing ? "animate-refresh-spin text-[#0052CC]" : "group-hover:rotate-45"
              }`}
            />
          </button>

          {/* Profile Avatar Button */}
          <button
            onClick={() => navigate("/profile")}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#0052CC] to-[#0747A6] text-white flex items-center justify-center font-extrabold text-xs shadow-xs active:scale-85 transition-all ring-1 ring-white/20"
            title="Smart ID & Profile"
          >
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "EM"}
          </button>
        </div>
      </header>

      {/* Floating Micro-Sync Toast */}
      {showSyncToast && (
        <div className="absolute top-14 left-4 right-4 z-50 flex justify-center animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3.5 py-1.5 rounded-full bg-[#172B4D] dark:bg-slate-800 text-white text-[11px] font-semibold flex items-center gap-2 shadow-lg border border-white/10 backdrop-blur-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#36B37E]" />
            <span>Workspace data synchronized</span>
          </div>
        </div>
      )}

      {/* Main Screen Content Body */}
      <main className="flex-1 pb-24 overflow-y-auto px-4 pt-3 space-y-4">
        <Outlet />
      </main>

      {/* Bottom Modern Dock with Peak Icon Detailing */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0F131C]/95 backdrop-blur-2xl border-t border-[#DFE1E6]/80 dark:border-[#263042]/80 max-w-md mx-auto shadow-xl pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 px-1.5 sm:px-3">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1 px-1 sm:px-2.5 rounded-2xl transition-all duration-200 cursor-pointer relative active:scale-85 group flex-1 max-w-[20%] ${
                    isActive
                      ? "text-[#0052CC] dark:text-blue-400 font-extrabold"
                      : "text-[#6B778C] dark:text-slate-400 font-medium hover:text-[#172B4D]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`relative p-2 rounded-2xl transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-tr from-[#DEEBFF] to-blue-50/90 dark:from-blue-950/70 dark:to-blue-900/40 ring-1 ring-[#0052CC]/25 shadow-xs"
                          : "group-hover:bg-[#EBECF0]/60 dark:group-hover:bg-[#151B26]"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 transition-all duration-200 ${
                          isActive
                            ? "stroke-[2.6] drop-shadow-[0_2px_8px_rgba(0,82,204,0.35)] animate-spring-pop text-[#0052CC] dark:text-blue-400"
                            : "stroke-[1.8] group-hover:scale-105"
                        }`}
                      />
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-[#DE350B] text-white text-[9px] font-black rounded-full shadow-xs ring-1 ring-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] mt-0.5 tracking-tight transition-all ${
                        isActive ? "font-bold text-[#0052CC] dark:text-blue-400" : "font-medium"
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Subtle micro active dot indicator */}
                    {isActive && (
                      <span className="w-1 h-1 rounded-full bg-[#0052CC] dark:bg-blue-400 mt-0.5 animate-in fade-in duration-200" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* 1-Tap Fast Role Switcher Modal */}
      {roleModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-3 sm:items-center animate-fade-in"
          onClick={() => setRoleModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#0F131C] w-full max-w-sm rounded-3xl p-5 border border-[#DFE1E6] dark:border-[#263042] shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#172B4D] dark:text-white">Active Testing Persona</h3>
                <p className="text-[11px] text-[#6B778C] dark:text-slate-400">Instantly switch between enterprise roles</p>
              </div>
              <button
                type="button"
                onClick={() => setRoleModalOpen(false)}
                aria-label="Close"
                className="w-7 h-7 rounded-full bg-[#F4F5F7] dark:bg-[#263042] text-[#6B778C] dark:text-slate-300 hover:text-[#DE350B] dark:hover:text-[#DE350B] hover:bg-[#FFEBE6] dark:hover:bg-rose-950/40 flex items-center justify-center transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Admin Option */}
              <button
                onClick={() => handleSelectRole("Admin")}
                className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all active:scale-95 ${
                  user?.role === "Admin"
                    ? "border-[#0052CC] bg-[#DEEBFF]/40 dark:bg-blue-950/40 ring-1 ring-[#0052CC]/30 shadow-xs"
                    : "border-[#DFE1E6] dark:border-[#263042] hover:border-[#0052CC]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0052CC]/10 text-[#0052CC] flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-xs text-[#172B4D] dark:text-white">Admin</p>
                    <p className="text-[10px] text-[#6B778C] dark:text-slate-400">Workforce pulse, broadcasts, operations</p>
                  </div>
                </div>
                {user?.role === "Admin" && <Check className="w-4 h-4 text-[#0052CC]" />}
              </button>

              {/* Manager Option */}
              <button
                onClick={() => handleSelectRole("Manager")}
                className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all active:scale-95 ${
                  user?.role === "Manager"
                    ? "border-[#00875A] bg-[#E3FCEF]/40 dark:bg-emerald-950/40 ring-1 ring-[#00875A]/30 shadow-xs"
                    : "border-[#DFE1E6] dark:border-[#263042] hover:border-[#00875A]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#00875A]/10 text-[#00875A] flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-xs text-[#172B4D] dark:text-white">Manager</p>
                    <p className="text-[10px] text-[#6B778C] dark:text-slate-400">Team attendance roster, 1-tap approvals</p>
                  </div>
                </div>
                {user?.role === "Manager" && <Check className="w-4 h-4 text-[#00875A]" />}
              </button>

              {/* Employee Option */}
              <button
                onClick={() => handleSelectRole("Employee")}
                className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all active:scale-95 ${
                  user?.role === "Employee"
                    ? "border-[#B9770E] bg-[#FFF0B3]/40 dark:bg-amber-950/40 ring-1 ring-[#B9770E]/30 shadow-xs"
                    : "border-[#DFE1E6] dark:border-[#263042] hover:border-[#B9770E]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#B9770E]/10 text-[#B9770E] flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-xs text-[#172B4D] dark:text-white">Employee</p>
                    <p className="text-[10px] text-[#6B778C] dark:text-slate-400">GPS swipes, leave balances, payslips</p>
                  </div>
                </div>
                {user?.role === "Employee" && <Check className="w-4 h-4 text-[#B9770E]" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
