import { useAuth } from "../context/AuthContext";
import ClockWidget from "./ClockWidget";
import { Bell, LogOut, ShieldCheck, UserCheck, Briefcase } from "lucide-react";

function Navbar() {
  const { user, logout, role, isAdmin, isManager } = useAuth();

  // Helper for avatar initials
  const getInitials = (name = "") => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getRoleBadge = () => {
    if (isAdmin) {
      return (
        <span className="flex items-center gap-1 bg-rose-50 text-rose-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-rose-200">
          <ShieldCheck size={12} />
          Admin
        </span>
      );
    }
    if (isManager) {
      return (
        <span className="flex items-center gap-1 bg-amber-50 text-amber-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-amber-200">
          <Briefcase size={12} />
          Manager
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 bg-purple-50 text-purple-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-purple-200">
        <UserCheck size={12} />
        Employee
      </span>
    );
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-xs">
      {/* Left: Organization context */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base font-semibold text-gray-800 leading-tight">
            Staffify HRMS
          </h1>
          <p className="text-xs text-gray-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Center/Right: Web Clock-In Widget, Notifications & Profile */}
      <div className="flex items-center gap-4">
        {/* greytHR Signature Clock-In Widget */}
        <ClockWidget />

        <div className="h-6 w-px bg-gray-200" />

        {/* Notifications */}
        <button
          className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          title="Notifications"
          onClick={() => {}}
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-600 rounded-full" />
        </button>

        {/* User Profile Dossier */}
        <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-medium flex items-center justify-center text-xs shadow-xs">
            {getInitials(user?.name)}
          </div>

          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-gray-800 leading-none">
                {user?.name || "User"}
              </p>
              {getRoleBadge()}
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5 leading-none">
              {user?.email}
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition ml-1"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;