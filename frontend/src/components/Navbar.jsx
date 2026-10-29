import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Sparkles,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Building2,
  Briefcase,
  Users,
  FileCheck2,
  Receipt,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import StaffifyLogo from "./StaffifyLogo";
import { useTheme } from "../context/ThemeContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { vendorsApi } from "../services/api";
import toast from "react-hot-toast";

function Navbar({ onToggleMobileMenu, isMobileMenuOpen, onQuickCreate, onSearchClick }) {
  const { toggleTheme, isDark } = useTheme();
  const { workspace, isPlatformAdmin, activeVendorName, switchToPlatform, switchToAgency } = useWorkspace();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [vendorsList, setVendorsList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(3);

  const fetchVendorsForWorkspace = async () => {
    try {
      const res = await vendorsApi.getAll();
      setVendorsList(res.data.data || []);
    } catch (e) {
      // ignore
    }
  };

  const handleToggleWorkspaceMenu = () => {
    if (!showWorkspaceMenu && vendorsList.length === 0) {
      fetchVendorsForWorkspace();
    }
    setShowWorkspaceMenu(!showWorkspaceMenu);
  };

  const handleNotificationClick = () => {
    setShowNotifMenu(!showNotifMenu);
    setUnreadCount(0);
  };

  return (
    <>
      <header className="h-12 bg-white/95 dark:bg-[#0F131C]/95 backdrop-blur-md border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between px-2.5 sm:px-3.5 sticky top-0 z-50 select-none transition-colors w-full">
        {/* Left Side: Mobile Menu, Staffify Logo & Global Search Omnibar */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 max-w-xl">
          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 text-[#42526E] dark:text-neutral-300 hover:text-[#172B4D] dark:hover:text-white hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] rounded transition cursor-pointer shrink-0"
            title="Toggle Navigation Menu"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Staffify Logo */}
          <div
            onClick={() => navigate("/vendors")}
            className="cursor-pointer shrink-0"
          >
            <StaffifyLogo size="sm" />
          </div>

          {/* Global Search Omnibar Trigger */}
          <div
            onClick={onSearchClick}
            role="button"
            tabIndex={0}
            className="relative ml-1 sm:ml-2 flex-1 max-w-[140px] xs:max-w-xs md:max-w-sm min-w-0 cursor-pointer"
            title="Global Search (Ctrl + K)"
          >
            <div className="flex items-center bg-[#FAFBFC] dark:bg-[#090D14] hover:bg-white dark:hover:bg-[#1C2331] border border-[#DFE1E6] dark:border-[#263042] hover:border-[#0052CC] dark:hover:border-[#579DFF] rounded-md px-2 py-1 text-xs w-full transition-all duration-200 shadow-2xs">
              <Search size={13} className="text-[#6B778C] dark:text-neutral-400 shrink-0 mr-1.5" />
              <span className="w-full text-[#6B778C] dark:text-neutral-400 text-xs min-w-0 truncate select-none">
                <span className="hidden xs:inline">Search vendors, clients, deployments...</span>
                <span className="xs:hidden">Search...</span>
              </span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] bg-[#EBECF0] dark:bg-[#1C2331] px-1.5 py-0.5 rounded text-[#6B778C] dark:text-neutral-400 font-mono border border-[#DFE1E6] dark:border-[#263042] shrink-0">
                Ctrl K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Workspace Switcher (Platform Admin vs Agency Workspace) */}
          <div className="relative">
            <button
              type="button"
              onClick={handleToggleWorkspaceMenu}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-[#172B4D] dark:text-white hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] transition cursor-pointer"
              title="Switch Workspace Scope"
            >
              {isPlatformAdmin ? (
                <span className="flex items-center gap-1 text-[#0052CC] dark:text-[#579DFF]">
                  <ShieldCheck size={14} />
                  <span className="max-w-[120px] truncate hidden sm:inline">Platform Admin</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Building2 size={14} />
                  <span className="max-w-[120px] truncate hidden sm:inline">{activeVendorName}</span>
                </span>
              )}
              <ChevronDown size={12} className="text-[#6B778C]" />
            </button>

            {showWorkspaceMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-lg bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] shadow-xl p-2 z-50 text-xs space-y-1.5 animate-page-enter">
                <div className="px-2 py-1 text-[10px] font-bold text-[#6B778C] dark:text-neutral-400 uppercase tracking-wider">
                  Select Operating Workspace
                </div>

                {/* Platform Admin Option */}
                <button
                  type="button"
                  onClick={() => {
                    switchToPlatform();
                    setShowWorkspaceMenu(false);
                    toast.success("Switched to Enterprise Platform Admin (Global)");
                  }}
                  className={`w-full text-left p-2 rounded flex items-center justify-between transition cursor-pointer ${
                    isPlatformAdmin
                      ? "bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF] font-semibold"
                      : "hover:bg-[#F4F5F7] dark:hover:bg-[#1C2331] text-[#172B4D] dark:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[#0052CC] dark:text-[#579DFF]" />
                    <div>
                      <div className="font-semibold text-xs leading-tight">Enterprise Platform Admin</div>
                      <div className="text-[10px] text-[#6B778C] dark:text-neutral-400">Global oversight & all agencies</div>
                    </div>
                  </div>
                  {isPlatformAdmin && <CheckCircle2 size={14} className="text-[#0052CC] dark:text-[#579DFF]" />}
                </button>

                <div className="pt-1 border-t border-[#DFE1E6] dark:border-[#263042] px-2 text-[10px] font-bold text-[#6B778C] dark:text-neutral-400 uppercase tracking-wider">
                  Private Agency Workspaces
                </div>

                {/* Agency Options */}
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {vendorsList.map((v) => {
                    const isSelected = workspace.vendorId === v.vendorId;
                    return (
                      <button
                        key={v.vendorId}
                        type="button"
                        onClick={() => {
                          switchToAgency(v);
                          setShowWorkspaceMenu(false);
                          toast.success(`Switched to ${v.legalName} private workspace`);
                        }}
                        className={`w-full text-left p-2 rounded flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold"
                            : "hover:bg-[#F4F5F7] dark:hover:bg-[#1C2331] text-[#172B4D] dark:text-white"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-xs truncate leading-tight">{v.legalName}</div>
                          <div className="text-[10px] text-[#6B778C] dark:text-neutral-400">
                            {v.vendorId} &bull; {v.category}
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick "+ Create" Action Button */}
          <button
            type="button"
            onClick={onQuickCreate}
            className="bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white px-2.5 sm:px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 shadow-xs transition cursor-pointer shrink-0"
            title="Quick Action"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Create</span>
          </button>

          {/* Ask AI Copilot Button */}
          <button
            type="button"
            onClick={() => toast.success("StaffifyGo Copilot active on live database.")}
            className="bg-[#DEEBFF] dark:bg-[#1C2536] hover:bg-[#B3D4FF] dark:hover:bg-[#263042] text-[#0052CC] dark:text-[#579DFF] border border-[#B3D4FF] dark:border-[#263042] px-2 sm:px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer shrink-0"
            title="Staffify AI Workforce Copilot"
          >
            <Sparkles size={13} className="text-[#0052CC] dark:text-[#579DFF]" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={handleNotificationClick}
              className="relative p-1.5 text-[#42526E] dark:text-neutral-300 hover:text-[#172B4D] dark:hover:text-white hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] rounded transition cursor-pointer"
              title="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#DE350B] ring-2 ring-white dark:ring-[#0F131C]"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-lg bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] shadow-xl p-3 z-50 text-xs space-y-2 animate-page-enter">
                <div className="flex items-center justify-between pb-2 border-b border-[#DFE1E6] dark:border-[#263042]">
                  <span className="font-bold text-[#172B4D] dark:text-white text-xs">
                    System Alerts
                  </span>
                  <span className="text-[10px] text-[#0052CC] dark:text-[#579DFF] font-semibold">
                    Mark all read
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="p-2 rounded bg-[#FAFBFC] dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042]">
                    <p className="font-semibold text-[#172B4D] dark:text-white">PO-5001 Reached 74% Burn</p>
                    <p className="text-[10px] text-[#6B778C] dark:text-neutral-400 mt-0.5">Titanium Tech H1 engineering budget on track</p>
                  </div>
                  <div className="p-2 rounded bg-[#FAFBFC] dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042]">
                    <p className="font-semibold text-[#172B4D] dark:text-white">Monthly Invoice Approved</p>
                    <p className="text-[10px] text-[#6B778C] dark:text-neutral-400 mt-0.5">Apex Security INV-2026-0002 approved for payout</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle Button (Sun / Moon) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className="relative w-8 h-8 rounded-md border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] flex items-center justify-center text-[#42526E] dark:text-neutral-300 transition-colors cursor-pointer overflow-hidden shrink-0"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <Moon
              size={15}
              className={`transition-all duration-700 ease-out absolute ${
                isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100 text-[#0052CC]"
              }`}
            />
            <Sun
              size={15}
              className={`transition-all duration-700 ease-out absolute ${
                isDark ? "rotate-0 scale-100 opacity-100 text-amber-400" : "-rotate-90 scale-0 opacity-0"
              }`}
            />
          </button>

          {/* User Avatar with Initials */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-7 h-7 rounded-full bg-[#0052CC] text-white font-bold text-xs flex items-center justify-center hover:ring-2 hover:ring-[#4C9AFF] transition cursor-pointer shrink-0"
              title="User Account"
            >
              AD
            </button>

            {/* Profile Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-52 rounded-lg bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] shadow-xl p-2.5 z-50 text-xs animate-page-enter">
                <div className="px-2 py-1.5 border-b border-[#DFE1E6] dark:border-[#263042] mb-1">
                  <p className="font-bold text-[#172B4D] dark:text-white leading-tight">Admin User</p>
                  <p className="text-[10px] text-[#6B778C] dark:text-neutral-400 truncate">admin@staffifygo.com</p>
                  <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#DEEBFF] text-[#0052CC] dark:bg-[#1C2331] dark:text-[#579DFF]">
                    Enterprise Lead
                  </span>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      toast.success("Active session authenticated.");
                    }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#F4F5F7] dark:hover:bg-[#1C2331] text-[#172B4D] dark:text-neutral-200 transition"
                  >
                    Account Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      toast.success("Logged out successfully");
                    }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#FFEBE6] dark:hover:bg-rose-950/30 text-[#DE350B] transition flex items-center justify-between mt-1"
                  >
                    <span>Sign Out</span>
                    <LogOut size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export default Navbar;
