import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Users,
  CalendarCheck,
  Clock,
  Users2,
  Building2,
  ShieldCheck,
  Briefcase,
  Circle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const baseLinkClasses =
  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150";

const getNavLinkClass = ({ isActive }) =>
  `${baseLinkClasses} ${
    isActive
      ? "bg-[#DEEBFF] text-[#0052CC] font-semibold"
      : "text-[#42526E] hover:bg-[#EBECF0] hover:text-[#172B4D]"
  }`;

function Sidebar() {
  const { role, isAdmin, isManager } = useAuth();

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-[#DFE1E6] hidden md:flex flex-col z-40">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-[#DFE1E6] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-[#0052CC] flex items-center justify-center text-white">
            <Building2 size={18} />
          </div>
          <div>
            <span className="text-base font-bold text-[#172B4D] tracking-tight">
              Staffify
            </span>
            <p className="text-[10px] text-[#6B778C] font-semibold tracking-wider uppercase">
              greytHR Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Modules */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {/* ESS - Employee Self Service */}
        <div className="space-y-0.5">
          <div className="px-3 pb-1.5">
            <p className="text-[11px] font-bold text-[#6B778C] uppercase tracking-wider">
              Self Service (ESS)
            </p>
          </div>

          <NavLink to="/dashboard" className={getNavLinkClass}>
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/attendance" className={getNavLinkClass}>
            <Clock size={17} />
            <span>Attendance & Swipes</span>
          </NavLink>

          <NavLink to="/leaves" className={getNavLinkClass}>
            <CalendarCheck size={17} />
            <span>Leave & Balances</span>
          </NavLink>

          <NavLink to="/profile" className={getNavLinkClass}>
            <User size={17} />
            <span>My Profile</span>
          </NavLink>
        </div>

        {/* MSS - Manager Self Service */}
        {isManager && !isAdmin && (
          <div className="space-y-0.5 pt-3 border-t border-[#DFE1E6]">
            <div className="flex items-center justify-between px-3 pb-1.5">
              <p className="text-[11px] font-bold text-[#6B778C] uppercase tracking-wider">
                Manager Services (MSS)
              </p>
              <span className="text-[10px] font-semibold text-[#0747A6] bg-[#DEEBFF] px-1.5 py-0.5 rounded border border-[#B3D4FF]">
                Manager
              </span>
            </div>

            <NavLink to="/teams" className={getNavLinkClass}>
              <Users2 size={17} />
              <span>Squads & Rosters</span>
            </NavLink>
          </div>
        )}

        {/* HR & System Administration */}
        {isAdmin && (
          <div className="space-y-0.5 pt-3 border-t border-[#DFE1E6]">
            <div className="flex items-center justify-between px-3 pb-1.5">
              <p className="text-[11px] font-bold text-[#6B778C] uppercase tracking-wider">
                HR & Administration
              </p>
              <span className="text-[10px] font-semibold text-[#403294] bg-[#EAE6FF] px-1.5 py-0.5 rounded border border-[#C0B6F2]">
                Admin
              </span>
            </div>

            <NavLink to="/employees" className={getNavLinkClass}>
              <Users size={17} />
              <span>Employee Directory</span>
            </NavLink>

            <NavLink to="/teams" className={getNavLinkClass}>
              <ShieldCheck size={17} />
              <span>Teams & Structure</span>
            </NavLink>
          </div>
        )}
      </nav>

      {/* Role Indicator Footer */}
      <div className="p-3.5 border-t border-[#DFE1E6] bg-[#F4F5F7] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-white border border-[#DFE1E6] flex items-center justify-center text-[#42526E]">
            {role === "Admin" ? (
              <ShieldCheck size={14} className="text-[#403294]" />
            ) : role === "Manager" ? (
              <Briefcase size={14} className="text-[#0747A6]" />
            ) : (
              <User size={14} className="text-[#0052CC]" />
            )}
          </div>
          <div>
            <span className="text-[#6B778C] block text-[10px] uppercase font-bold tracking-wider leading-none">
              Active Role
            </span>
            <span className="font-semibold text-[#172B4D] capitalize text-xs leading-tight">
              {role === "Admin" ? "Administrator" : role === "Manager" ? "Manager" : "Employee"}
            </span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Circle size={6} className="fill-emerald-500 text-emerald-500" />
          Online
        </span>
      </div>
    </aside>
  );
}

export default Sidebar;
