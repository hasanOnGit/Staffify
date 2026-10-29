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
} from "lucide-react";
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

export default function AiModuleNavCard({ navCard, moduleDirectory }) {
  const navigate = useNavigate();

  const handleNavigate = (route, title) => {
    if (!route) return;
    toast.success(`Opening ${title}...`, { id: "module-nav" });
    navigate(route);
  };

  // Helper to render dynamic Lucide icon
  const renderIcon = (iconName, size = 16, className = "text-[#0052CC] dark:text-[#579DFF]") => {
    const IconComponent = ICON_MAP[iconName] || Compass;
    return <IconComponent size={size} className={className} />;
  };

  return (
    <div className="space-y-3 my-2">
      {/* 1. SINGLE TARGET MODULE NAVIGATION CARD */}
      {navCard && (
        <div className="border border-[#B3D4FF] dark:border-[#263042] bg-[#F4F5F7] dark:bg-[#090D14] rounded-lg p-3 text-xs shadow-2xs transition-all hover:border-[#0052CC] dark:hover:border-[#579DFF]">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#DFE1E6] dark:border-[#263042]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#DEEBFF] dark:bg-[#1C2331] border border-[#B3D4FF] dark:border-[#263042] flex items-center justify-center shrink-0">
                {renderIcon(navCard.icon, 15)}
              </div>
              <div>
                <h4 className="font-bold text-[#172B4D] dark:text-neutral-100 text-xs leading-snug">
                  {navCard.title}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0747A6] dark:text-[#579DFF] border border-[#B3D4FF] dark:border-[#263042]">
                    {navCard.section || "Self Service"}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                      navCard.isAuthorized
                        ? "bg-[#E3FCEF] dark:bg-emerald-950/40 text-[#00875A] dark:text-emerald-300 border border-[#ABF5D1] dark:border-emerald-800"
                        : "bg-[#FFEBE6] dark:bg-rose-950/40 text-[#DE350B] dark:text-rose-300 border border-[#FFBDAD] dark:border-rose-900"
                    }`}
                  >
                    {navCard.isAuthorized ? "Authorized Access" : "Role Restricted"}
                  </span>
                </div>
              </div>
            </div>

            <span className="text-[10px] font-mono text-[#6B778C] dark:text-neutral-400 shrink-0 bg-white dark:bg-[#151B26] px-1.5 py-0.5 rounded border border-[#DFE1E6] dark:border-[#263042]">
              {navCard.actionRoute || navCard.route}
            </span>
          </div>

          {/* Description */}
          <p className="text-[11px] text-[#42526E] dark:text-neutral-300 my-2 leading-relaxed">
            {navCard.description}
          </p>

          {/* Step-by-Step Guidance */}
          {navCard.steps && navCard.steps.length > 0 && (
            <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-md p-2.5 my-2 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B778C] dark:text-neutral-400 flex items-center gap-1">
                <CheckCircle2 size={11} className="text-[#00875A] dark:text-emerald-400" />
                <span>How to Complete in Staffify:</span>
              </p>
              <ol className="space-y-1 pl-3.5 list-decimal text-[11px] text-[#172B4D] dark:text-neutral-200">
                {navCard.steps.map((step, sIdx) => (
                  <li key={sIdx} className="leading-snug">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 border-t border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between gap-2">
            <span className="text-[10px] text-[#6B778C] dark:text-neutral-400">
              Permitted: {navCard.allowedRoles?.join(", ")}
            </span>

            {navCard.isAuthorized ? (
              <button
                type="button"
                onClick={() => handleNavigate(navCard.actionRoute || navCard.route, navCard.title)}
                className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white rounded font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>{navCard.buttonText || "Open Module"}</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <div className="flex items-center gap-1 text-[11px] font-medium text-[#DE350B] dark:text-rose-400 bg-[#FFEBE6] dark:bg-rose-950/40 px-2 py-1 rounded border border-[#FFBDAD] dark:border-rose-900">
                <Lock size={12} />
                <span>Requires Administrator Access</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. BROAD SYSTEM MODULE DIRECTORY BROWSER */}
      {moduleDirectory && Object.keys(moduleDirectory).length > 0 && (
        <div className="space-y-3 pt-1">
          {Object.entries(moduleDirectory).map(([sectionName, modules]) => {
            if (!modules || modules.length === 0) return null;
            return (
              <div
                key={sectionName}
                className="bg-[#FAFBFC] dark:bg-[#090D14] border border-[#DFE1E6] dark:border-[#263042] rounded-lg p-2.5"
              >
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#EBECF0] dark:border-[#263042]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0052CC] dark:text-[#579DFF]">
                    {sectionName}
                  </span>
                  <span className="text-[9px] font-semibold text-[#6B778C] dark:text-neutral-400">
                    {modules.length} {modules.length === 1 ? "module" : "modules"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {modules.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleNavigate(m.actionRoute || m.route, m.title)}
                      className="group p-2 rounded-md bg-white dark:bg-[#151B26] hover:bg-[#DEEBFF] dark:hover:bg-[#1C2331] border border-[#DFE1E6] dark:border-[#263042] hover:border-[#0052CC] dark:hover:border-[#579DFF] text-left transition-all cursor-pointer shadow-2xs flex items-start gap-2"
                    >
                      <div className="w-5 h-5 rounded bg-[#F4F5F7] dark:bg-[#090D14] group-hover:bg-white dark:group-hover:bg-[#151B26] flex items-center justify-center shrink-0 mt-0.5 border border-[#DFE1E6] dark:border-[#263042]">
                        {renderIcon(m.icon, 12)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-[11px] text-[#172B4D] dark:text-neutral-100 truncate group-hover:text-[#0052CC] dark:group-hover:text-[#579DFF]">
                            {m.title}
                          </p>
                          <ArrowRight
                            size={10}
                            className="text-[#6B778C] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#0052CC] dark:text-[#579DFF]"
                          />
                        </div>
                        <p className="text-[10px] text-[#6B778C] dark:text-neutral-400 line-clamp-1 mt-0.5">
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
