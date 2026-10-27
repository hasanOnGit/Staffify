import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Users,
  CalendarCheck,
  Clock,
  Users2,
  ShieldCheck,
  Briefcase,
  Circle,
  FolderKanban,
  FileText,
  CreditCard,
  Target,
  Calendar,
  LifeBuoy,
  LogOut,
  Network,
  Receipt,
  BarChart3,
  UserMinus,
  Webhook,
  X,
  Sparkles,
} from "lucide-react";
import StaffifyLogo from "./StaffifyLogo";
import ClockWidget from "./ClockWidget";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const baseLinkClasses =
  "flex items-center gap-2.5 px-3 py-2.5 md:py-2 rounded-md text-xs font-medium transition-all duration-150 hover:translate-x-0.5";

const getNavLinkClass = ({ isActive }) =>
  `${baseLinkClasses} ${
    isActive
      ? "bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF] font-semibold border-l-3 border-[#0052CC] dark:border-[#579DFF]"
      : "text-[#42526E] dark:text-neutral-300 hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] hover:text-[#172B4D] dark:hover:text-white"
  }`;

function Sidebar({ mobileOpen = false, onCloseMobile = () => {} }) {
  const { role, isAdmin, isManager, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    onCloseMobile();
    logout();
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  const renderNavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
      {/* ESS - Employee Self Service */}
      <div className="space-y-0.5">
        <div className="px-3 pb-1">
          <p className="text-[10px] font-bold text-[#6B778C] dark:text-neutral-400 uppercase tracking-wider">
            Self Service (ESS)
          </p>
        </div>

        <NavLink to="/dashboard" className={getNavLinkClass} onClick={onCloseMobile}>
          <LayoutDashboard size={15} />
          <span>For you (Dashboard)</span>
        </NavLink>

        <NavLink to="/copilot" className={getNavLinkClass} onClick={onCloseMobile}>
          <Sparkles size={15} className="text-[#0052CC]" />
          <span className="flex items-center gap-1.5 font-semibold">
            <span>AI Copilot</span>
            <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF]">
              AI
            </span>
          </span>
        </NavLink>

        <NavLink to="/attendance" className={getNavLinkClass} onClick={onCloseMobile}>
          <Clock size={15} />
          <span>Attendance & Swipes</span>
        </NavLink>

        <NavLink to="/leaves" className={getNavLinkClass} onClick={onCloseMobile}>
          <CalendarCheck size={15} />
          <span>Leave & Balances</span>
        </NavLink>

        <NavLink to="/profile" className={getNavLinkClass} onClick={onCloseMobile}>
          <User size={15} />
          <span>My Profile</span>
        </NavLink>

        <NavLink to="/payslips" className={getNavLinkClass} onClick={onCloseMobile}>
          <FileText size={15} />
          <span>Payslips & Salary</span>
        </NavLink>

        <NavLink to="/performance" className={getNavLinkClass} onClick={onCloseMobile}>
          <Target size={15} />
          <span>Performance & OKRs</span>
        </NavLink>

        <NavLink to="/roster" className={getNavLinkClass} onClick={onCloseMobile}>
          <Calendar size={15} />
          <span>Shift Roster Planner</span>
        </NavLink>

        <NavLink to="/helpdesk" className={getNavLinkClass} onClick={onCloseMobile}>
          <LifeBuoy size={15} />
          <span>Helpdesk & Assets</span>
        </NavLink>

        <NavLink to="/org-chart" className={getNavLinkClass} onClick={onCloseMobile}>
          <Network size={15} />
          <span>Organization Tree</span>
        </NavLink>

        <NavLink to="/expenses" className={getNavLinkClass} onClick={onCloseMobile}>
          <Receipt size={15} />
          <span>Expenses & Claims</span>
        </NavLink>

        <NavLink to="/timesheets" className={getNavLinkClass} onClick={onCloseMobile}>
          <Clock size={15} />
          <span>Project Timesheets</span>
        </NavLink>
      </div>

      {/* MSS - Manager Self Service */}
      {isManager && !isAdmin && (
        <div className="space-y-0.5 pt-3 border-t border-[#DFE1E6] dark:border-[#263042]">
          <div className="flex items-center justify-between px-3 pb-1">
            <p className="text-[10px] font-bold text-[#6B778C] dark:text-neutral-400 uppercase tracking-wider">
              Manager Services
            </p>
            <span className="text-[9px] font-semibold text-[#0747A6] dark:text-[#579DFF] bg-[#DEEBFF] dark:bg-[#1C2331] px-1.5 py-0.2 rounded border border-[#B3D4FF] dark:border-[#263042]">
              Manager
            </span>
          </div>

          <NavLink to="/teams" className={getNavLinkClass} onClick={onCloseMobile}>
            <Users2 size={15} />
            <span>Squads & Rosters</span>
          </NavLink>

          <NavLink to="/recruitment" className={getNavLinkClass} onClick={onCloseMobile}>
            <Briefcase size={15} />
            <span>Recruitment & ATS</span>
          </NavLink>

          <NavLink to="/analytics" className={getNavLinkClass} onClick={onCloseMobile}>
            <BarChart3 size={15} />
            <span>Executive Analytics</span>
          </NavLink>

          <NavLink to="/offboarding" className={getNavLinkClass} onClick={onCloseMobile}>
            <UserMinus size={15} />
            <span>Exit Operations</span>
          </NavLink>

          <NavLink to="/webhook-bridge" className={getNavLinkClass} onClick={onCloseMobile}>
            <Webhook size={15} />
            <span>Webhook Bridge</span>
          </NavLink>
        </div>
      )}

      {/* HR & System Administration */}
      {isAdmin && (
        <div className="space-y-0.5 pt-3 border-t border-[#DFE1E6] dark:border-[#263042]">
          <div className="flex items-center justify-between px-3 pb-1">
            <p className="text-[10px] font-bold text-[#6B778C] dark:text-neutral-400 uppercase tracking-wider">
              HR & Administration
            </p>
            <span className="text-[9px] font-semibold text-[#403294] dark:text-purple-300 bg-[#EAE6FF] dark:bg-purple-950/40 px-1.5 py-0.2 rounded border border-[#C0B6F2] dark:border-purple-800">
              Admin
            </span>
          </div>

          <NavLink to="/employees" className={getNavLinkClass} onClick={onCloseMobile}>
            <Users size={15} />
            <span>Employee Directory</span>
          </NavLink>

          <NavLink to="/analytics" className={getNavLinkClass} onClick={onCloseMobile}>
            <BarChart3 size={15} />
            <span>Executive Analytics</span>
          </NavLink>

          <NavLink to="/webhook-bridge" className={getNavLinkClass} onClick={onCloseMobile}>
            <Webhook size={15} />
            <span>Webhook Bridge</span>
          </NavLink>

          <NavLink to="/payroll" className={getNavLinkClass} onClick={onCloseMobile}>
            <CreditCard size={15} />
            <span>Payroll Processing</span>
          </NavLink>

          <NavLink to="/recruitment" className={getNavLinkClass} onClick={onCloseMobile}>
            <Briefcase size={15} />
            <span>Recruitment & ATS</span>
          </NavLink>

          <NavLink to="/teams" className={getNavLinkClass} onClick={onCloseMobile}>
            <FolderKanban size={15} />
            <span>Teams & Structure</span>
          </NavLink>

          <NavLink to="/offboarding" className={getNavLinkClass} onClick={onCloseMobile}>
            <UserMinus size={15} />
            <span>Exit Operations</span>
          </NavLink>

          <NavLink to="/audit-logs" className={getNavLinkClass} onClick={onCloseMobile}>
            <ShieldCheck size={15} />
            <span>Audit & Governance</span>
          </NavLink>
        </div>
      )}
    </nav>
  );

  const renderFooter = () => (
    <div className="p-3 border-t border-[#DFE1E6] dark:border-[#263042] bg-[#F4F5F7] dark:bg-[#090D14] flex items-center justify-between text-xs shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-white dark:bg-[#1C2331] border border-[#DFE1E6] dark:border-[#263042] flex items-center justify-center text-[#42526E] dark:text-neutral-300">
          {role === "Admin" ? (
            <ShieldCheck size={13} className="text-[#403294] dark:text-purple-400" />
          ) : role === "Manager" ? (
            <Briefcase size={13} className="text-[#0747A6] dark:text-[#579DFF]" />
          ) : (
            <User size={13} className="text-[#0052CC] dark:text-[#579DFF]" />
          )}
        </div>
        <div>
          <span className="font-semibold text-[#172B4D] dark:text-neutral-100 capitalize text-[11px] leading-tight block">
            {role === "Admin" ? "Administrator" : role === "Manager" ? "Manager" : "Employee"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <Circle size={5} className="fill-emerald-500 text-emerald-500" />
          Online
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="p-1.5 text-[#6B778C] dark:text-neutral-400 hover:text-[#DE350B] hover:bg-[#FFEBE6] dark:hover:bg-[#DE350B]/10 rounded transition cursor-pointer"
          title="Log Out of Staffify"
        >
          <LogOut size={13} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* =========================================
          1. Desktop Static Left Sidebar (md and up)
         ========================================= */}
      <aside className="w-56 lg:w-60 bg-white dark:bg-[#0F131C] border-r border-[#DFE1E6] dark:border-[#263042] hidden md:flex flex-col shrink-0 h-full select-none transition-colors">
        {renderNavLinks()}
        {renderFooter()}
      </aside>

      {/* =========================================
          2. Mobile Slide-out Drawer (< md screen)
         ========================================= */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs z-50 md:hidden transition-opacity duration-200 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-[#0F131C] z-50 shadow-2xl flex flex-col md:hidden transform transition-transform duration-250 ease-in-out select-none border-r border-transparent dark:border-[#263042] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile Navigation Drawer"
      >
        {/* Drawer Header */}
        <div className="h-12 px-3.5 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#FAFBFC] dark:bg-[#0F131C] shrink-0">
          <StaffifyLogo size="xs" />
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 text-[#6B778C] dark:text-neutral-400 hover:text-[#172B4D] dark:hover:text-white hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] rounded transition cursor-pointer"
            title="Close Menu"
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        </div>

        {/* Mobile Web Clock-In Widget */}
        <div className="p-3 border-b border-[#DFE1E6] dark:border-[#263042] bg-[#F4F5F7]/80 dark:bg-[#151B26]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#6B778C] dark:text-neutral-400 uppercase tracking-wider">
              Shift Clock-In
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Live Swipes
            </span>
          </div>
          <div className="flex justify-center">
            <ClockWidget />
          </div>
        </div>

        {/* Drawer Scrollable Links */}
        {renderNavLinks()}

        {/* Drawer Footer with Logout */}
        {renderFooter()}
      </aside>
    </>
  );
}

export default Sidebar;
