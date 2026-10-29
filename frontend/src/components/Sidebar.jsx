import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  FileCheck2,
  Users,
  Receipt,
  X,
  Database,
  ShieldCheck,
  LogOut,
  ChevronRight,
  CalendarCheck,
  UserCheck,
  Banknote,
} from "lucide-react";
import { seedApi } from "../services/api";
import toast from "react-hot-toast";

const navSections = [
  {
    title: "Overview",
    links: [
      {
        path: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "People & Work",
    links: [
      {
        path: "/workers",
        label: "Workers",
        icon: UserCheck,
      },
      {
        path: "/deployments",
        label: "Work Assignments",
        icon: Users,
      },
      {
        path: "/muster-roll",
        label: "Attendance & Overtime",
        icon: CalendarCheck,
      },
    ],
  },
  {
    title: "Clients & Partners",
    links: [
      {
        path: "/clients",
        label: "Clients & Sites",
        icon: Briefcase,
      },
      {
        path: "/vendors",
        label: "Staffing Agencies",
        icon: Building2,
      },
    ],
  },
  {
    title: "Money & Billing",
    links: [
      {
        path: "/payroll",
        label: "Salaries & Payroll",
        icon: Banknote,
      },
      {
        path: "/vendor-invoices",
        label: "Invoices & Payments",
        icon: Receipt,
      },
      {
        path: "/commercials",
        label: "Contracts & Budgets (POs)",
        icon: FileCheck2,
      },
    ],
  },
];

const getNavLinkClass = ({ isActive }) =>
  `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-all duration-150 ${
    isActive
      ? "bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF] font-semibold border-l-3 border-[#0052CC] dark:border-[#579DFF]"
      : "text-[#42526E] dark:text-neutral-300 hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] hover:text-[#172B4D] dark:hover:text-white font-medium"
  }`;

function Sidebar({ mobileOpen = false, onCloseMobile = () => {} }) {
  const handleSeedDatabase = async () => {
    try {
      toast.loading("Resetting & seeding ERP database...", { id: "seed-toast" });
      const res = await seedApi.seedDatabase();
      toast.success(
        `Seeded ${res.data.seededCounts.vendors} Vendors, ${res.data.seededCounts.clients} Clients, ${res.data.seededCounts.deployments} Deployments!`,
        { id: "seed-toast" }
      );
      window.location.reload();
    } catch (err) {
      toast.error("Failed to seed database: " + err.message, { id: "seed-toast" });
    }
  };

  const renderNavLinks = () => (
    <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
      {navSections.map((section, idx) => (
        <div key={idx} className="space-y-1">
          <div className="px-3 pb-1 pt-1">
            <span className="text-[10px] font-bold text-[#6B778C] dark:text-neutral-400 uppercase tracking-wider block">
              {section.title}
            </span>
          </div>

          <div className="space-y-0.5">
            {section.links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={getNavLinkClass}
                  onClick={onCloseMobile}
                >
                  <Icon size={15} className="shrink-0" />
                  <span className="truncate">{link.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}

      {/* Database Quick Seeder Button */}
      <div className="pt-2 border-t border-[#DFE1E6] dark:border-[#263042] px-1">
        <button
          type="button"
          onClick={handleSeedDatabase}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-semibold text-[#0052CC] dark:text-[#579DFF] bg-[#DEEBFF]/60 dark:bg-[#1C2331] hover:bg-[#DEEBFF] dark:hover:bg-[#263042] rounded border border-[#B3D4FF] dark:border-[#263042] transition cursor-pointer"
        >
          <Database size={13} />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </nav>
  );

  const renderFooterUserCard = () => (
    <div className="p-3 border-t border-[#DFE1E6] dark:border-[#263042] bg-[#F4F5F7] dark:bg-[#090D14] flex items-center justify-between text-xs shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-[#DEEBFF] dark:bg-[#1C2331] border border-[#B3D4FF] dark:border-[#263042] flex items-center justify-center font-bold text-xs text-[#0052CC] dark:text-[#579DFF]">
          AD
        </div>
        <div>
          <span className="font-semibold text-[#172B4D] dark:text-neutral-100 text-[11px] leading-tight block">
            Enterprise Admin
          </span>
          <span className="text-[9px] font-medium text-[#6B778C] dark:text-neutral-400">
            StaffifyGo ERP
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Online
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Static Left Sidebar (underneath the 100% full-width Navbar) */}
      <aside className="w-60 bg-white dark:bg-[#0F131C] border-r border-[#DFE1E6] dark:border-[#263042] hidden md:flex flex-col shrink-0 h-full select-none transition-colors">
        {renderNavLinks()}
        {renderFooterUserCard()}
      </aside>

      {/* Mobile Slide-out Drawer */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs z-50 md:hidden transition-opacity duration-200 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-[#0F131C] z-50 shadow-2xl flex flex-col md:hidden transform transition-transform duration-250 ease-in-out select-none border-r border-[#DFE1E6] dark:border-[#263042] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile Navigation Drawer"
      >
        <div className="h-12 px-3.5 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#FAFBFC] dark:bg-[#0F131C] shrink-0">
          <span className="text-xs font-bold text-[#172B4D] dark:text-white uppercase tracking-wider">
            Navigation Menu
          </span>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 text-[#6B778C] hover:text-[#172B4D] dark:hover:text-white rounded"
          >
            <X size={16} />
          </button>
        </div>
        {renderNavLinks()}
        {renderFooterUserCard()}
      </aside>
    </>
  );
}

export default Sidebar;
