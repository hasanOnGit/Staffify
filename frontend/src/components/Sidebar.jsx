import { NavLink } from "react-router-dom";
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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const baseLinkClasses =
  "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors duration-150";

const getNavLinkClass = ({ isActive }) =>
  `${baseLinkClasses} ${
    isActive
      ? "bg-[#DEEBFF] text-[#0052CC] font-semibold border-l-3 border-[#0052CC]"
      : "text-[#42526E] hover:bg-[#EBECF0] hover:text-[#172B4D]"
  }`;

function Sidebar() {
  const { role, isAdmin, isManager } = useAuth();

  return (
    <aside className="w-56 lg:w-60 bg-white border-r border-[#DFE1E6] hidden md:flex flex-col shrink-0 h-full select-none">
      {/* Navigation Modules */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {/* ESS - Employee Self Service */}
        <div className="space-y-0.5">
          <div className="px-3 pb-1">
            <p className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider">
              Self Service (ESS)
            </p>
          </div>

          <NavLink to="/dashboard" className={getNavLinkClass}>
            <LayoutDashboard size={15} />
            <span>For you (Dashboard)</span>
          </NavLink>

          <NavLink to="/attendance" className={getNavLinkClass}>
            <Clock size={15} />
            <span>Attendance & Swipes</span>
          </NavLink>

          <NavLink to="/leaves" className={getNavLinkClass}>
            <CalendarCheck size={15} />
            <span>Leave & Balances</span>
          </NavLink>

          <NavLink to="/profile" className={getNavLinkClass}>
            <User size={15} />
            <span>My Profile</span>
          </NavLink>

          <NavLink to="/payslips" className={getNavLinkClass}>
            <FileText size={15} />
            <span>Payslips & Salary</span>
          </NavLink>
        </div>

        {/* MSS - Manager Self Service */}
        {isManager && !isAdmin && (
          <div className="space-y-0.5 pt-3 border-t border-[#DFE1E6]">
            <div className="flex items-center justify-between px-3 pb-1">
              <p className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider">
                Manager Services
              </p>
              <span className="text-[9px] font-semibold text-[#0747A6] bg-[#DEEBFF] px-1.5 py-0.2 rounded border border-[#B3D4FF]">
                Manager
              </span>
            </div>

            <NavLink to="/teams" className={getNavLinkClass}>
              <Users2 size={15} />
              <span>Squads & Rosters</span>
            </NavLink>
          </div>
        )}

        {/* HR & System Administration */}
        {isAdmin && (
          <div className="space-y-0.5 pt-3 border-t border-[#DFE1E6]">
            <div className="flex items-center justify-between px-3 pb-1">
              <p className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider">
                HR & Administration
              </p>
              <span className="text-[9px] font-semibold text-[#403294] bg-[#EAE6FF] px-1.5 py-0.2 rounded border border-[#C0B6F2]">
                Admin
              </span>
            </div>

            <NavLink to="/employees" className={getNavLinkClass}>
              <Users size={15} />
              <span>Employee Directory</span>
            </NavLink>

            <NavLink to="/teams" className={getNavLinkClass}>
              <FolderKanban size={15} />
              <span>Teams & Structure</span>
            </NavLink>

            <NavLink to="/payroll" className={getNavLinkClass}>
              <CreditCard size={15} />
              <span>Payroll Processing</span>
            </NavLink>
          </div>
        )}
      </nav>

      {/* Role Indicator Footer */}
      <div className="p-3 border-t border-[#DFE1E6] bg-[#F4F5F7] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-white border border-[#DFE1E6] flex items-center justify-center text-[#42526E]">
            {role === "Admin" ? (
              <ShieldCheck size={13} className="text-[#403294]" />
            ) : role === "Manager" ? (
              <Briefcase size={13} className="text-[#0747A6]" />
            ) : (
              <User size={13} className="text-[#0052CC]" />
            )}
          </div>
          <div>
            <span className="font-semibold text-[#172B4D] capitalize text-[11px] leading-tight block">
              {role === "Admin" ? "Administrator" : role === "Manager" ? "Manager" : "Employee"}
            </span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Circle size={5} className="fill-emerald-500 text-emerald-500" />
          Online
        </span>
      </div>
    </aside>
  );
}

export default Sidebar;
