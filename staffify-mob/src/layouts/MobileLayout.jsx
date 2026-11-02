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
  Sparkles
} from "lucide-react";

export default function MobileLayout() {
  const { user, isManager, isAdmin, isOnline, switchRole, offlineQueue } = useAuth();
  const navigate = useNavigate();
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleSelectRole = async (role) => {
    setRoleModalOpen(false);
    await switchRole(role);
  };

  const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/swipes", label: "Swipes", icon: Clock },
    { to: "/leaves", label: "Leaves", icon: Calendar },
    { to: "/payslips", label: "Payslips", icon: CreditCard },
    {
      to: isManager ? "/approvals" : "/profile",
      label: isManager ? "Approvals" : "Smart ID",
      icon: isManager ? CheckSquare : User,
      badge: isManager ? 3 : null
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F5F7] dark:bg-[#090D14] text-[#172B4D] dark:text-[#F1F5F9] max-w-md mx-auto shadow-2xl relative border-x border-[#DFE1E6]/70 dark:border-[#263042]/70 font-sans">
      {/* Top Mobile Header (Sticky & Frosted Glass) */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0F131C]/90 backdrop-blur-xl border-b border-[#DFE1E6]/80 dark:border-[#263042]/80 px-4 py-2.5 flex items-center justify-between shadow-xs pt-[max(env(safe-area-inset-top),0.65rem)]">
        <div className="flex items-center gap-3">
          {/* Official Staffify Logo */}
          <StaffifyLogo size="sm" subtitle="MOB" onClick={() => navigate("/")} />

          {/* Quick 1-Tap Persona Switcher Badge */}
          <button
            onClick={() => setRoleModalOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#EBECF0]/80 dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] text-[10px] font-bold text-[#172B4D] dark:text-slate-200 active:scale-95 transition-transform"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC]" />
            <span>{user?.role || "Employee"}</span>
            <ChevronDown className="w-2.5 h-2.5 text-[#6B778C]" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Offline Pending Queue Badge */}
          {offlineQueue.length > 0 && (
            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300">
              {offlineQueue.length} queued
            </span>
          )}

          {/* Online/Offline Status Indicator */}
          <div
            className={`p-1.5 rounded-xl border ${
              isOnline
                ? "text-[#00875A] bg-[#E3FCEF]/80 border-[#00875A]/20 dark:bg-emerald-950/40"
                : "text-[#DE350B] bg-[#FFEBE6]/80 border-[#DE350B]/20 dark:bg-rose-950/40"
            }`}
            title={isOnline ? "Network Connected" : "Offline Cache Active"}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          </div>

          {/* Quick Refresh Button */}
          <button
            onClick={handleRefresh}
            className={`p-1.5 rounded-xl border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#6B778C] dark:text-slate-400 active:scale-90 transition-transform ${
              isRefreshing ? "animate-spin text-[#0052CC]" : ""
            }`}
            title="Refresh Data"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Profile Avatar Button */}
          <button
            onClick={() => navigate("/profile")}
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0052CC] to-[#0747A6] text-white flex items-center justify-center font-extrabold text-xs shadow-xs active:scale-95 transition-transform"
            title="Smart ID & Profile"
          >
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "EM"}
          </button>
        </div>
      </header>

      {/* Main Screen Content Body */}
      <main className="flex-1 pb-24 overflow-y-auto px-4 pt-3 space-y-4">
        <Outlet />
      </main>

      {/* Bottom Modern Tab Bar (Fixed & Ergonomic) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0F131C]/95 backdrop-blur-2xl border-t border-[#DFE1E6]/80 dark:border-[#263042]/80 max-w-md mx-auto shadow-xl pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 px-3">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 cursor-pointer relative active:scale-90 ${
                    isActive
                      ? "text-[#0052CC] dark:text-blue-400 font-extrabold"
                      : "text-[#6B778C] dark:text-slate-400 font-medium hover:text-[#172B4D]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`relative p-1.5 rounded-xl transition-all ${
                        isActive
                          ? "bg-[#DEEBFF] dark:bg-blue-950/60 shadow-xs"
                          : ""
                      }`}
                    >
                      <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-[#DE350B] text-white text-[9px] font-black rounded-full shadow-xs">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* 1-Tap Fast Role Switcher Modal */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-3 sm:items-center animate-fade-in">
          <div className="bg-white dark:bg-[#0F131C] w-full max-w-sm rounded-3xl p-5 border border-[#DFE1E6] dark:border-[#263042] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#172B4D] dark:text-white">Active Testing Persona</h3>
                <p className="text-[11px] text-[#6B778C] dark:text-slate-400">Instantly switch between enterprise roles</p>
              </div>
              <button
                onClick={() => setRoleModalOpen(false)}
                className="p-1.5 rounded-xl text-[#6B778C] hover:bg-[#EBECF0] dark:hover:bg-[#151B26]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Admin Option */}
              <button
                onClick={() => handleSelectRole("Admin")}
                className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all active:scale-98 ${
                  user?.role === "Admin"
                    ? "border-[#0052CC] bg-[#DEEBFF]/40 dark:bg-blue-950/40 ring-1 ring-[#0052CC]/30"
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
                className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all active:scale-98 ${
                  user?.role === "Manager"
                    ? "border-[#00875A] bg-[#E3FCEF]/40 dark:bg-emerald-950/40 ring-1 ring-[#00875A]/30"
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
                className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all active:scale-98 ${
                  user?.role === "Employee"
                    ? "border-[#B9770E] bg-[#FFF0B3]/40 dark:bg-amber-950/40 ring-1 ring-[#B9770E]/30"
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
