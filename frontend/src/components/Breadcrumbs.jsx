import { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home, Sparkles } from "lucide-react";

/**
 * Route to Breadcrumb Section Hierarchy Dictionary
 */
const ROUTE_MAP = {
  "/dashboard": { section: "Overview", title: "Dashboard" },
  "/employees": { section: "Administration", title: "Employee Directory" },
  "/attendance": { section: "Self Service", title: "Attendance & Clock In" },
  "/leaves": { section: "Self Service", title: "Leaves & Time Off" },
  "/payroll": { section: "Administration", title: "Payroll Management" },
  "/payslips": { section: "Self Service", title: "Payslips & Salary" },
  "/teams": { section: "Manager Tools", title: "Team Management" },
  "/roster": { section: "Self Service", title: "Shift Schedule" },
  "/analytics": { section: "Manager Tools", title: "Workforce Analytics" },
  "/performance": { section: "Self Service", title: "Performance & Goals" },
  "/helpdesk": { section: "Self Service", title: "Helpdesk & Support" },
  "/recruitment": { section: "Manager Tools", title: "Recruitment & Hiring" },
  "/expenses": { section: "Self Service", title: "Expenses & Reimbursements" },
  "/timesheets": { section: "Self Service", title: "Project Timesheets" },
  "/org-chart": { section: "Self Service", title: "Organization Chart" },
  "/offboarding": { section: "Manager Tools", title: "Offboarding & Exits" },
  "/webhook-bridge": { section: "Administration", title: "Webhooks & Integrations" },
  "/copilot": { section: "Self Service", title: "AI Copilot" },
  "/ai-copilot": { section: "Self Service", title: "AI Copilot" },
  "/audit-logs": { section: "Administration", title: "Audit Logs" },
  "/profile": { section: "Self Service", title: "My Profile" },
};

export default function Breadcrumbs() {
  const location = useLocation();

  const crumbs = useMemo(() => {
    const pathname = location.pathname;

    // Check exact match
    if (ROUTE_MAP[pathname]) {
      return [
        { label: "Staffify", to: "/dashboard", isHome: true },
        { label: ROUTE_MAP[pathname].section },
        { label: ROUTE_MAP[pathname].title, isCurrent: true },
      ];
    }

    // Dynamic routes e.g. /teams/:teamId
    if (pathname.startsWith("/teams/")) {
      return [
        { label: "Staffify", to: "/dashboard", isHome: true },
        { label: "Squads & Rosters", to: "/teams" },
        { label: "Squad Details", isCurrent: true },
      ];
    }

    // Fallback for custom or nested sub-paths
    const parts = pathname.split("/").filter(Boolean);
    const generated = [{ label: "Staffify", to: "/dashboard", isHome: true }];
    parts.forEach((p, idx) => {
      const isLast = idx === parts.length - 1;
      const formatted = p
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      generated.push({
        label: formatted,
        isCurrent: isLast,
      });
    });
    return generated;
  }, [location.pathname]);

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center justify-between py-1.5 px-0.5 mb-2.5 select-none"
    >
      <ol className="flex items-center space-x-1.5 text-[11px] font-medium text-[#6B778C] dark:text-[#94A3B8]">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <li key={index} className="flex items-center space-x-1.5">
              {index > 0 && (
                <ChevronRight size={12} className="text-[#A5B2C6] dark:text-[#475569] shrink-0" />
              )}

              {crumb.to && !crumb.isCurrent ? (
                <Link
                  to={crumb.to}
                  className="flex items-center gap-1 hover:text-[#0052CC] dark:hover:text-[#579DFF] transition-colors"
                >
                  {crumb.isHome && <Home size={12} className="text-[#0052CC] dark:text-[#579DFF]" />}
                  <span>{crumb.label}</span>
                </Link>
              ) : (
                <span
                  className={
                    crumb.isCurrent
                      ? "text-[#172B4D] dark:text-[#F1F5F9] font-semibold"
                      : "text-[#6B778C] dark:text-[#94A3B8]"
                  }
                  aria-current={crumb.isCurrent ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Keyboard Quick Navigation Hint */}
      <div className="hidden sm:flex items-center gap-2 text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
        <span className="flex items-center gap-1 bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] px-1.5 py-0.5 rounded shadow-2xs font-mono">
          <kbd>Ctrl</kbd>+<kbd>K</kbd>
        </span>
        <span className="hidden md:inline">Omnibar</span>
      </div>
    </nav>
  );
}
