import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  Clock,
  CalendarCheck,
  User,
  FileText,
  Target,
  Calendar,
  LifeBuoy,
  Network,
  Receipt,
  Users2,
  Briefcase,
  BarChart3,
  UserMinus,
  Webhook,
  Users,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Lock,
  Compass,
  CheckCircle2,
  Search,
  Zap,
  SlidersHorizontal,
  Command,
} from "lucide-react";
import { useAiAssistant } from "../../context/AiAssistantContext";
import toast from "react-hot-toast";

// Map string icon names to Lucide icon components
const ICON_MAP = {
  LayoutDashboard,
  Sparkles,
  Clock,
  CalendarCheck,
  User,
  FileText,
  Target,
  Calendar,
  LifeBuoy,
  Network,
  Receipt,
  Users2,
  Briefcase,
  BarChart3,
  UserMinus,
  Webhook,
  Users,
  CreditCard,
  ShieldCheck,
};

// Registered keyboard shortcuts for power-user hints
const KEYBOARD_SHORTCUTS = {
  attendance: "Alt + P",
  leaves: "Alt + L",
  dashboard: "G then D",
  employees: "G then E",
  payroll: "G then P",
  teams: "G then T",
  helpdesk: "G then H",
  recruitment: "G then R",
  "audit-logs": "G then U",
  "webhook-bridge": "G then W",
  copilot: "Ctrl + J",
};

export default function AiModuleNavCard({ navCard, moduleDirectory }) {
  const navigate = useNavigate();
  const { closeAssistant } = useAiAssistant();

  // Directory filter & search state
  const [dirSearch, setDirSearch] = useState("");
  const [selectedSection, setSelectedSection] = useState("All");

  const handleNavigate = (route, title) => {
    if (!route) return;
    toast.success(`Navigating to ${title}...`, { id: "module-nav" });
    
    // Smoothly close drawer on mobile or compact viewport so target modal is in full view
    if (window.innerWidth < 768) {
      closeAssistant();
    }
    
    navigate(route);
  };

  // Helper to render dynamic Lucide icon
  const renderIcon = (iconName, size = 16, className = "text-[#0052CC] dark:text-[#579DFF]") => {
    const IconComponent = ICON_MAP[iconName] || Compass;
    return <IconComponent size={size} className={className} />;
  };

  // Filtered module directory
  const filteredDirectory = useMemo(() => {
    if (!moduleDirectory) return {};
    const q = dirSearch.toLowerCase().trim();
    const result = {};

    Object.entries(moduleDirectory).forEach(([secName, modules]) => {
      if (selectedSection !== "All" && selectedSection !== secName) return;

      const matchingMods = (modules || []).filter((m) => {
        if (!q) return true;
        const inTitle = m.title.toLowerCase().includes(q);
        const inDesc = (m.description || "").toLowerCase().includes(q);
        const inTasks = (m.keyTasks || []).some((t) => t.toLowerCase().includes(q));
        return inTitle || inDesc || inTasks;
      });

      if (matchingMods.length > 0) {
        result[secName] = matchingMods;
      }
    });

    return result;
  }, [moduleDirectory, dirSearch, selectedSection]);

  const hasDeepLink = navCard?.actionRoute && navCard.actionRoute.includes("?");
  const shortcutHint = navCard ? KEYBOARD_SHORTCUTS[navCard.moduleId] : null;

  return (
    <div className="space-y-3 my-2.5">
      {/* =========================================================
          1. SINGLE TARGET MODULE NAVIGATION CARD
         ========================================================= */}
      {navCard && (
        <div className="border border-[#B3D4FF] dark:border-[#263042] bg-white dark:bg-[#0F131C] rounded-lg p-3.5 text-xs shadow-xs transition-all hover:border-[#0052CC] dark:hover:border-[#579DFF]">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-[#EBECF0] dark:border-[#263042]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#DEEBFF] dark:bg-[#1C2331] border border-[#B3D4FF] dark:border-[#263042] flex items-center justify-center shrink-0 shadow-2xs">
                {renderIcon(navCard.icon, 16)}
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-bold text-[#172B4D] dark:text-neutral-100 text-xs leading-snug">
                    {navCard.title}
                  </h4>
                  {hasDeepLink && (
                    <span className="flex items-center gap-1 text-[9px] font-semibold text-[#0052CC] dark:text-[#579DFF] bg-[#DEEBFF] dark:bg-blue-950/40 px-1.5 py-0.2 rounded border border-[#B3D4FF] dark:border-blue-800">
                      <Zap size={9} />
                      <span>Direct Action</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#F4F5F7] dark:bg-[#151B26] text-[#42526E] dark:text-neutral-300 border border-[#DFE1E6] dark:border-[#263042]">
                    {navCard.section || "Self Service"}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                      navCard.isAuthorized
                        ? "bg-[#E3FCEF] dark:bg-emerald-950/40 text-[#00875A] dark:text-emerald-300 border border-[#ABF5D1] dark:border-emerald-800"
                        : "bg-[#FFEBE6] dark:bg-rose-950/40 text-[#DE350B] dark:text-rose-300 border border-[#FFBDAD] dark:border-rose-900"
                    }`}
                  >
                    {navCard.isAuthorized ? "Access Granted" : (navCard.allowedRoles?.[0] ? `${navCard.allowedRoles[0]} Required` : "Restricted")}
                  </span>
                  {shortcutHint && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FAFBFC] dark:bg-[#151B26] text-[#6B778C] dark:text-neutral-400 border border-[#DFE1E6] dark:border-[#263042] flex items-center gap-1">
                      <Command size={9} />
                      <span>{shortcutHint}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <span className="text-[10px] font-mono font-medium text-[#6B778C] dark:text-neutral-400 shrink-0 bg-[#F4F5F7] dark:bg-[#151B26] px-2 py-0.5 rounded border border-[#DFE1E6] dark:border-[#263042]">
              {navCard.actionRoute || navCard.route}
            </span>
          </div>

          {/* Description */}
          <p className="text-[11px] text-[#42526E] dark:text-neutral-300 my-2.5 leading-relaxed">
            {navCard.description}
          </p>

          {/* Step-by-Step Checklist */}
          {navCard.steps && navCard.steps.length > 0 && (
            <div className="bg-[#FAFBFC] dark:bg-[#090D14] border border-[#DFE1E6] dark:border-[#263042] rounded-md p-3 my-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B778C] dark:text-neutral-400 flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#00875A] dark:text-emerald-400" />
                  <span>How to do this:</span>
                </p>
                <span className="text-[9px] font-semibold text-[#6B778C] dark:text-neutral-500">
                  {navCard.steps.length} {navCard.steps.length === 1 ? "step" : "steps"}
                </span>
              </div>

              <div className="space-y-1.5">
                {navCard.steps.map((step, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex items-start gap-2 p-1.5 rounded-md bg-white dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042] text-[11px] text-[#172B4D] dark:text-neutral-200"
                  >
                    <span className="w-4 h-4 rounded-full bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0747A6] dark:text-[#579DFF] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {sIdx + 1}
                    </span>
                    <span className="leading-snug flex-1">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2.5 border-t border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between gap-2">
            <span className="text-[10px] text-[#6B778C] dark:text-neutral-400">
              Available for: {navCard.allowedRoles?.join(", ")}
            </span>

            {navCard.isAuthorized ? (
              <button
                type="button"
                onClick={() => handleNavigate(navCard.actionRoute || navCard.route, navCard.title)}
                className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white rounded font-semibold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer hover:translate-x-0.5"
              >
                <span>{navCard.buttonText || "Open Module"}</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#DE350B] dark:text-rose-400 bg-[#FFEBE6] dark:bg-rose-950/40 px-2.5 py-1 rounded border border-[#FFBDAD] dark:border-rose-900">
                <Lock size={12} />
                <span>Requires {navCard.allowedRoles?.join(" or ") || "Administrator"} Access</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          2. BROAD SYSTEM MODULE DIRECTORY BROWSER
         ========================================================= */}
      {moduleDirectory && Object.keys(moduleDirectory).length > 0 && (
        <div className="space-y-3 pt-1">
          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg p-2.5 space-y-2">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B778C] dark:text-neutral-400"
              />
              <input
                type="text"
                placeholder="Search features or modules..."
                value={dirSearch}
                onChange={(e) => setDirSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-[#FAFBFC] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] text-[#172B4D] dark:text-neutral-100 placeholder:text-[#6B778C] dark:placeholder:text-neutral-500 focus:outline-none focus:border-[#0052CC] dark:focus:border-[#579DFF]"
              />
            </div>

            {/* Section Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {["All", "Self Service", "Manager Tools", "Administration"].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSelectedSection(sec)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition cursor-pointer shrink-0 ${
                    selectedSection === sec
                      ? "bg-[#0052CC] text-white"
                      : "bg-[#F4F5F7] dark:bg-[#151B26] text-[#42526E] dark:text-neutral-300 hover:bg-[#EBECF0] dark:hover:bg-[#263042]"
                  }`}
                >
                  {sec === "All" ? "All Sections" : sec}
                </button>
              ))}
            </div>
          </div>

          {/* Categorized Sections */}
          {Object.entries(filteredDirectory).map(([sectionName, modules]) => {
            if (!modules || modules.length === 0) return null;
            return (
              <div
                key={sectionName}
                className="bg-[#FAFBFC] dark:bg-[#090D14] border border-[#DFE1E6] dark:border-[#263042] rounded-lg p-3"
              >
                <div className="flex items-center justify-between pb-1.5 mb-2.5 border-b border-[#EBECF0] dark:border-[#263042]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0052CC] dark:text-[#579DFF]">
                    {sectionName}
                  </span>
                  <span className="text-[9px] font-semibold text-[#6B778C] dark:text-neutral-400">
                    {modules.length} {modules.length === 1 ? "module" : "modules"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {modules.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleNavigate(m.actionRoute || m.route, m.title)}
                      className="group p-2.5 rounded-md bg-white dark:bg-[#151B26] hover:bg-[#DEEBFF] dark:hover:bg-[#1C2331] border border-[#DFE1E6] dark:border-[#263042] hover:border-[#0052CC] dark:hover:border-[#579DFF] text-left transition-all cursor-pointer shadow-2xs flex items-start gap-2.5"
                    >
                      <div className="w-6 h-6 rounded-md bg-[#F4F5F7] dark:bg-[#090D14] group-hover:bg-white dark:group-hover:bg-[#151B26] flex items-center justify-center shrink-0 mt-0.5 border border-[#DFE1E6] dark:border-[#263042]">
                        {renderIcon(m.icon, 13)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-semibold text-xs text-[#172B4D] dark:text-neutral-100 truncate group-hover:text-[#0052CC] dark:group-hover:text-[#579DFF]">
                            {m.title}
                          </p>
                          <ArrowRight
                            size={11}
                            className="text-[#6B778C] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#0052CC] dark:text-[#579DFF] shrink-0"
                          />
                        </div>
                        <p className="text-[10px] text-[#6B778C] dark:text-neutral-400 line-clamp-2 mt-0.5 leading-tight">
                          {m.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
