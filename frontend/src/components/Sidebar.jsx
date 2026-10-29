import React from "react";
import { NavLink } from "react-router-dom";
import {
  Building2,
  Briefcase,
  FileCheck2,
  Users,
  Receipt,
  X,
  Database,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import StaffifyLogo from "./StaffifyLogo";
import { seedApi } from "../services/api";
import toast from "react-hot-toast";

const navLinks = [
  {
    path: "/vendors",
    label: "Vendors & Agencies",
    description: "Staffing Partners Master",
    icon: Building2,
  },
  {
    path: "/clients",
    label: "Clients & Work Sites",
    description: "Locations & Billing Hubs",
    icon: Briefcase,
  },
  {
    path: "/commercials",
    label: "Commercials & POs",
    description: "Rate Cards & Budgets",
    icon: FileCheck2,
  },
  {
    path: "/deployments",
    label: "Workforce Deployments",
    description: "Active Site Rosters",
    icon: Users,
  },
  {
    path: "/vendor-invoices",
    label: "Vendor Invoices",
    description: "Billing & PO Deductions",
    icon: Receipt,
  },
];

const getNavLinkClass = ({ isActive }) =>
  `group flex items-start gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-all duration-150 ${
    isActive
      ? "bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF] font-semibold border-l-3 border-[#0052CC] dark:border-[#579DFF]"
      : "text-[#42526E] dark:text-neutral-300 hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] hover:text-[#172B4D] dark:hover:text-white"
  }`;

function Sidebar({ mobileOpen = false, onCloseMobile = () => {} }) {
  const handleSeedDatabase = async () => {
    try {
      toast.loading("Seeding ERP records...", { id: "seed-toast" });
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

  const renderContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] shrink-0">
        <StaffifyLogo size="md" />
        <button
          type="button"
          onClick={onCloseMobile}
          className="p-1 text-[#6B778C] dark:text-neutral-400 hover:text-[#172B4D] dark:hover:text-white rounded md:hidden"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div>
          <div className="px-3 pb-2">
            <span className="text-[10px] font-bold text-[#6B778C] dark:text-neutral-400 uppercase tracking-wider">
              Staffing Operations
            </span>
          </div>

          <nav className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={getNavLinkClass}
                  onClick={onCloseMobile}
                >
                  <Icon size={16} className="mt-0.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="leading-tight">{item.label}</span>
                    <span className="text-[10px] text-[#6B778C] dark:text-neutral-400 font-normal">
                      {item.description}
                    </span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Database & System Actions */}
        <div className="pt-2">
          <div className="px-3 pb-2">
            <span className="text-[10px] font-bold text-[#6B778C] dark:text-neutral-400 uppercase tracking-wider">
              Environment
            </span>
          </div>

          <div className="space-y-1.5 px-1">
            <button
              type="button"
              onClick={handleSeedDatabase}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#0052CC] dark:text-[#579DFF] bg-[#DEEBFF]/60 dark:bg-[#1C2331] hover:bg-[#DEEBFF] dark:hover:bg-[#263042] rounded border border-[#B3D4FF] dark:border-[#263042] transition cursor-pointer"
            >
              <Database size={14} />
              <span>Reset & Seed ERP Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C] text-xs shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#DEEBFF] dark:bg-[#1C2331] border border-[#B3D4FF] dark:border-[#263042] flex items-center justify-center text-[#0052CC] dark:text-[#579DFF]">
            <ShieldCheck size={14} />
          </div>
          <div>
            <p className="font-semibold text-[#172B4D] dark:text-neutral-200 text-[11px] leading-tight">
              Enterprise Suite
            </p>
            <p className="text-[9px] text-[#6B778C] dark:text-neutral-400">
              StaffifyGo v1.0
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#E3FCEF] dark:bg-emerald-950/40 text-[#006644] dark:text-emerald-400 border border-[#ABF5D1] dark:border-emerald-800">
          Connected
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-60 bg-white dark:bg-[#0F131C] border-r border-[#DFE1E6] dark:border-[#263042] hidden md:flex flex-col shrink-0 h-full select-none transition-colors">
        {renderContent()}
      </aside>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs z-50 md:hidden transition-opacity duration-200 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-[#0F131C] z-50 shadow-2xl flex flex-col md:hidden transform transition-transform duration-250 ease-in-out select-none border-r border-[#DFE1E6] dark:border-[#263042] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderContent()}
      </aside>
    </>
  );
}

export default Sidebar;
