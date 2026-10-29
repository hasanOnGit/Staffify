import React from "react";
import { useLocation } from "react-router-dom";
import { Menu, Sun, Moon, Sparkles, Building2, Briefcase, FileCheck2, Users, Receipt } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const routeMeta = {
  "/vendors": {
    title: "Vendors & Staffing Agencies",
    subtitle: "Agency compliance, agreements, and credential verification",
    icon: Building2,
  },
  "/clients": {
    title: "Clients & Work Sites",
    subtitle: "Enterprise locations, operational hubs, and delivery centers",
    icon: Briefcase,
  },
  "/commercials": {
    title: "Commercials & Purchase Orders",
    subtitle: "Rate card definitions and real-time PO budget burn-rate tracking",
    icon: FileCheck2,
  },
  "/deployments": {
    title: "Workforce Deployments Matrix",
    subtitle: "Live site roster, billable assignments, and contractor registry",
    icon: Users,
  },
  "/vendor-invoices": {
    title: "Vendor Billing & Invoice Processing",
    subtitle: "Monthly billing runs, GST reconciliations, and PO balance write-downs",
    icon: Receipt,
  },
};

function Navbar({ onToggleMobileMenu = () => {} }) {
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const currentMeta = routeMeta[location.pathname] || {
    title: "StaffifyGo ERP",
    subtitle: "Workforce & Vendor Operations Management",
    icon: Sparkles,
  };
  const Icon = currentMeta.icon;

  return (
    <header className="h-14 bg-white dark:bg-[#0F131C] border-b border-[#DFE1E6] dark:border-[#263042] px-4 md:px-6 flex items-center justify-between shrink-0 select-none transition-colors z-20">
      {/* Left: Mobile Toggle & Page Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-1.5 text-[#6B778C] dark:text-neutral-400 hover:text-[#172B4D] dark:hover:text-white hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] rounded md:hidden cursor-pointer"
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#DEEBFF] dark:bg-[#1C2331] border border-[#B3D4FF] dark:border-[#263042] hidden sm:flex items-center justify-center text-[#0052CC] dark:text-[#579DFF]">
            <Icon size={16} />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-[#172B4D] dark:text-[#F1F5F9] leading-tight flex items-center gap-2">
              <span>{currentMeta.title}</span>
            </h1>
            <p className="text-[11px] text-[#6B778C] dark:text-neutral-400 hidden lg:block leading-tight">
              {currentMeta.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Actions & Sun/Moon Morph Toggle */}
      <div className="flex items-center gap-2 md:gap-3">
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-[#006644] dark:text-emerald-400 bg-[#E3FCEF] dark:bg-emerald-950/40 border border-[#ABF5D1] dark:border-emerald-800 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Mongoose Atlas</span>
        </span>

        {/* 700ms Sun/Moon 360-degree rotation and scale morph */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          className="relative w-8 h-8 rounded-md border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] flex items-center justify-center text-[#42526E] dark:text-neutral-300 transition-colors cursor-pointer overflow-hidden"
          title={isDark ? "Activate Light Mode" : "Activate Dark Mode"}
        >
          {/* Moon Icon */}
          <Moon
            size={16}
            className={`transition-all duration-700 ease-out absolute ${
              isDark
                ? "rotate-90 scale-0 opacity-0"
                : "rotate-0 scale-100 opacity-100 text-[#0052CC]"
            }`}
          />
          {/* Sun Icon */}
          <Sun
            size={16}
            className={`transition-all duration-700 ease-out absolute ${
              isDark
                ? "rotate-0 scale-100 opacity-100 text-amber-400"
                : "-rotate-90 scale-0 opacity-0"
            }`}
          />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
