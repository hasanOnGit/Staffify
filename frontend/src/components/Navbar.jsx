import { useAuth } from "../context/AuthContext";
import ClockWidget from "./ClockWidget";
import { Bell, LogOut, ShieldCheck, UserCheck, Briefcase } from "lucide-react";

function Navbar() {
  const { user, logout, isAdmin, isManager } = useAuth();

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
        <span className="flex items-center gap-1 bg-[#EAE6FF] text-[#403294] text-[11px] font-semibold px-2 py-0.5 rounded border border-[#C0B6F2]">
          <ShieldCheck size={12} />
          Admin
        </span>
      );
    }
    if (isManager) {
      return (
        <span className="flex items-center gap-1 bg-[#DEEBFF] text-[#0747A6] text-[11px] font-semibold px-2 py-0.5 rounded border border-[#B3D4FF]">
          <Briefcase size={12} />
          Manager
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 bg-[#E3FCEF] text-[#006644] text-[11px] font-semibold px-2 py-0.5 rounded border border-[#ABF5D1]">
        <UserCheck size={12} />
        Employee
      </span>
    );
  };

  return (
    <header className="h-14 bg-white border-b border-[#DFE1E6] flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left: Organization & Date */}
      <div className="flex items-center gap-3">
        <div>
          <span className="text-xs font-semibold text-[#172B4D] tracking-tight">
            Staffify Enterprise
          </span>
          <span className="text-xs text-[#6B778C] ml-2">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Right: Clock Widget, Notifications & Profile */}
      <div className="flex items-center gap-3">
        <ClockWidget />

        <div className="h-5 w-px bg-[#DFE1E6]" />

        {/* Notifications */}
        <button
          className="relative p-2 text-[#5E6C84] hover:text-[#172B4D] hover:bg-[#EBECF0] rounded transition"
          title="Notifications"
          onClick={() => {}}
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#DE350B] rounded-full" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#DFE1E6]">
          <div className="w-8 h-8 rounded-full bg-[#0052CC] text-white font-medium flex items-center justify-center text-xs">
            {getInitials(user?.name)}
          </div>

          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-[#172B4D] leading-none">
                {user?.name || "User"}
              </p>
              {getRoleBadge()}
            </div>
            <p className="text-[11px] text-[#6B778C] mt-0.5 leading-none">
              {user?.email}
            </p>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-[#6B778C] hover:text-[#DE350B] hover:bg-[#FFEBE6] rounded transition ml-1"
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;