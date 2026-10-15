import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Settings,
  Users,
  CalendarCheck,
  Clock,
  Wallet,
  Briefcase,
  Building2,
  Users2,
} from "lucide-react";

const baseLinkClasses =
  "flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200";

const getNavLinkClass = ({ isActive }) =>
  `${baseLinkClasses} ${
    isActive
      ? "bg-purple-100 text-purple-700 border-l-4 border-purple-600 shadow-sm"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
  }`;

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r hidden md:flex flex-col z-40">
      {/* Brand */}
      <div className="px-6 py-5 text-2xl font-bold text-purple-600 border-b">
        Staffify
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Core */}
        <div className="space-y-1">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase">
            Core
          </p>

          <NavLink to="/dashboard" className={getNavLinkClass}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink to="/employees" className={getNavLinkClass}>
            <Users size={18} />
            Employees
          </NavLink>

          <NavLink to="/teams" className={getNavLinkClass}>
            <Users2 size={18} />
            Teams
          </NavLink>
        </div>

        {/* HR Modules */}
        <div className="space-y-1">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase">
            HR Modules
          </p>

          <NavLink to="/leaves" className={getNavLinkClass}>
            <CalendarCheck size={18} />
            Leaves
          </NavLink>

          <NavLink to="/attendance" className={getNavLinkClass}>
            <Clock size={18} />
            Team Attendance
          </NavLink>

          <NavLink to="/payroll" className={getNavLinkClass}>
            <Wallet size={18} />
            Payroll
          </NavLink>
        </div>

        {/* CRM */}
        <div className="space-y-1">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase">
            CRM
          </p>

          <NavLink to="/projects" className={getNavLinkClass}>
            <Briefcase size={18} />
            Projects
          </NavLink>

          <NavLink to="/clients" className={getNavLinkClass}>
            <Building2 size={18} />
            Clients
          </NavLink>
        </div>

        {/* Account */}
        <div className="space-y-1">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase">
            Account
          </p>

          <NavLink to="/profile" className={getNavLinkClass}>
            <User size={18} />
            Profile
          </NavLink>

          <NavLink to="/dashboard/settings" className={getNavLinkClass}>
            <Settings size={18} />
            Settings
          </NavLink>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 text-xs text-gray-400 border-t">
        © 2026 Staffify
      </div>
    </aside>
  );
}

export default Sidebar;
