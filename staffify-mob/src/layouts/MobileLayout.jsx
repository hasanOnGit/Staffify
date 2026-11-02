import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  Clock,
  Calendar,
  CreditCard,
  CheckSquare,
  Bell,
  User,
  ShieldCheck,
  Wifi,
  WifiOff,
} from "lucide-react";

export default function MobileLayout() {
  const { user, isManager } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/swipes", label: "Swipes", icon: Clock },
    { to: "/leaves", label: "Leaves", icon: Calendar },
    { to: "/payslips", label: "Payslips", icon: CreditCard },
    {
      to: "/approvals",
      label: isManager ? "Approvals" : "Directory",
      icon: CheckSquare,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F5F7] text-[#172B4D] max-w-md mx-auto shadow-2xl relative border-x border-[#DFE1E6]">
      {/* Top Mobile Header (Sticky) */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#DFE1E6] px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#0052CC] text-white flex items-center justify-center font-black text-sm tracking-tighter shadow-xs">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs text-[#0052CC] tracking-tight">StaffifyMOB</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-[#DEEBFF] text-[#0052CC] font-bold rounded">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-[#6B778C] truncate max-w-[150px]">
              {user?.name || "Employee"} • {user?.role || "Staff"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Online/Offline Status Indicator */}
          <div
            className={`p-1.5 rounded-full ${
              isOnline ? "text-[#00875A] bg-[#E3FCEF]" : "text-[#DE350B] bg-[#FFEBE6]"
            }`}
            title={isOnline ? "Network Connected" : "Offline Cache Active"}
          >
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          </div>

          {/* Profile Button */}
          <button
            onClick={() => navigate("/profile")}
            className="w-8 h-8 rounded-full bg-[#FAFBFC] border border-[#DFE1E6] text-[#0052CC] flex items-center justify-center cursor-pointer active-press"
            title="Profile & Settings"
          >
            <User size={15} />
          </button>
        </div>
      </header>

      {/* Main Screen Body */}
      <main className="flex-1 pb-20 overflow-y-auto px-4 pt-3 space-y-3.5">
        <Outlet />
      </main>

      {/* Bottom Thumb Navigation Bar (Fixed) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#DFE1E6] max-w-md mx-auto shadow-lg pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1 px-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1 px-2 rounded transition cursor-pointer active-press ${
                    isActive
                      ? "text-[#0052CC] font-bold scale-105"
                      : "text-[#6B778C] font-medium hover:text-[#172B4D]"
                  }`
                }
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={2.2} />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
