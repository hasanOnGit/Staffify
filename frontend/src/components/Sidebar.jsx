import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Users,
  CalendarCheck,
  Clock,
  Users2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const baseLinkClasses =
  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150";

const getNavLinkClass = ({ isActive }) =>
  `${baseLinkClasses} ${
    isActive
      ? "bg-purple-600 text-white shadow-sm shadow-purple-200"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
  }`;

function Sidebar() {
  const { isManager } = useAuth();

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-gray-200 hidden md:flex flex-col z-40">
      {/* Brand */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-700 to-purple-500 flex items-center justify-center text-white shadow-xs">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent">
              Staffify
            </span>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
              greytHR Edition
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Modules */}
      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        {/* ESS - Employee Self Service */}
        <div className="space-y-1">
          <p className="px-3 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Employee Self Service (ESS)
          </p>

          <NavLink to="/dashboard" className={getNavLinkClass}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/attendance" className={getNavLinkClass}>
            <Clock size={18} />
            <span>Attendance & Swipes</span>
          </NavLink>

          <NavLink to="/leaves" className={getNavLinkClass}>
            <CalendarCheck size={18} />
            <span>Leave & Balances</span>
          </NavLink>

          <NavLink to="/profile" className={getNavLinkClass}>
            <User size={18} />
            <span>My Profile</span>
          </NavLink>
        </div>

        {/* MSS / HR Administration */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 pb-1">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Manager & HR (MSS)
            </p>
            {isManager && (
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                Admin
              </span>
            )}
          </div>

          <NavLink to="/employees" className={getNavLinkClass}>
            <Users size={18} />
            <span>Employee Directory</span>
          </NavLink>

          <NavLink to="/teams" className={getNavLinkClass}>
            <Users2 size={18} />
            <span>Teams & Structure</span>
          </NavLink>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-400">
        <span>v1.2.0 • Active</span>
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
      </div>
    </aside>
  );
}

export default Sidebar;
