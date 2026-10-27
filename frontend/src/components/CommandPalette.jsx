import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutDashboard,
  Clock,
  CalendarDays,
  CreditCard,
  FileText,
  Users,
  Users2,
  Target,
  Calendar,
  LifeBuoy,
  Briefcase,
  Network,
  Receipt,
  BarChart3,
  UserMinus,
  Webhook,
  Sparkles,
  Sun,
  Moon,
  User,
  LogOut,
  CalendarPlus,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useAiAssistant } from "../context/AiAssistantContext";
import { getEmployees } from "../services/employee";
import toast from "react-hot-toast";

function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, logout, isAdmin, isManager } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { toggleAssistant } = useAiAssistant();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [employees, setEmployees] = useState([]);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Fetch employees once on mount or when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      getEmployees()
        .then((data) => {
          if (Array.isArray(data)) setEmployees(data);
        })
        .catch(() => {});
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build command list based on user role and query
  const commands = useMemo(() => {
    const list = [];

    // --- QUICK ACTIONS ---
    list.push({
      id: "action-ai",
      category: "Quick Actions",
      title: "Ask Staffify AI Copilot",
      subtitle: "Instant HR intelligence & data lookups",
      icon: Sparkles,
      iconColor: "text-[#0052CC] dark:text-[#579DFF]",
      iconBg: "bg-[#DEEBFF] dark:bg-[#1C2331]",
      shortcut: "Ctrl J",
      action: () => {
        onClose();
        toggleAssistant();
      },
    });

    list.push({
      id: "action-theme",
      category: "Quick Actions",
      title: isDark ? "Switch to Light Mode" : "Switch to Dark Mode",
      subtitle: "Toggle application appearance",
      icon: isDark ? Sun : Moon,
      iconColor: isDark ? "text-amber-400" : "text-[#42526E]",
      iconBg: "bg-[#F4F5F7] dark:bg-[#1C2331]",
      action: () => {
        toggleTheme();
        onClose();
      },
    });

    list.push({
      id: "action-leave",
      category: "Quick Actions",
      title: "Apply for Time-Off / Leave",
      subtitle: "Submit a new leave request",
      icon: CalendarPlus,
      iconColor: "text-[#00875A] dark:text-emerald-400",
      iconBg: "bg-[#E3FCEF] dark:bg-emerald-950/40",
      action: () => {
        onClose();
        navigate("/leaves");
      },
    });

    list.push({
      id: "action-profile",
      category: "Quick Actions",
      title: "My Profile Dossier",
      subtitle: "View personal credentials and records",
      icon: User,
      iconColor: "text-[#6554C0] dark:text-purple-400",
      iconBg: "bg-[#EAE6FF] dark:bg-purple-950/40",
      action: () => {
        onClose();
        navigate("/profile");
      },
    });

    // --- NAVIGATION ---
    const navItems = [
      { path: "/dashboard", label: "Dashboard", desc: "Executive KPI overview & pulse", icon: LayoutDashboard },
      { path: "/attendance", label: "Attendance & Swipes", desc: "Clock-in records and biometric logs", icon: Clock },
      { path: "/leaves", label: "Leave Management", desc: "Time-off balances and approvals", icon: CalendarDays },
      { path: "/payroll", label: "Payroll & Salary", desc: "Compensation structures and disbursements", icon: CreditCard },
      { path: "/payslips", label: "Payslips & Tax Slips", desc: "Monthly salary statements", icon: FileText },
      { path: "/employees", label: "Employee Directory", desc: "Staff directory and organizational records", icon: Users },
      { path: "/teams", label: "Team Management", desc: "Departments, squads, and reporting lines", icon: Users2 },
      { path: "/performance", label: "Performance & OKRs", desc: "Quarterly reviews, KPIs, and goals", icon: Target },
      { path: "/roster", label: "Shift Roster", desc: "Weekly schedules and shift assignments", icon: Calendar },
      { path: "/helpdesk", label: "IT & HR Helpdesk", desc: "Internal ticketing and support requests", icon: LifeBuoy },
      { path: "/recruitment", label: "Recruitment & ATS", desc: "Job postings and candidate pipeline", icon: Briefcase },
      { path: "/org-chart", label: "Organization Chart", desc: "Interactive company hierarchy", icon: Network },
      { path: "/expenses", label: "Expense Claims", desc: "Reimbursements and financial claims", icon: Receipt },
      { path: "/analytics", label: "HR Analytics", desc: "Turnover, headcount, and trend metrics", icon: BarChart3 },
      { path: "/timesheets", label: "Timesheets", desc: "Project billable hours and logs", icon: Clock },
      { path: "/offboarding", label: "Employee Offboarding", desc: "Resignations, clearances, and exits", icon: UserMinus },
      { path: "/copilot", label: "AI Copilot Console", desc: "Dedicated conversational analytics environment", icon: Sparkles },
    ];

    if (isAdmin) {
      navItems.push({ path: "/webhooks", label: "Webhook Integrations", desc: "Configure REST API webhook triggers", icon: Webhook });
    }

    navItems.forEach((item) => {
      list.push({
        id: `nav-${item.path}`,
        category: "Navigation",
        title: item.label,
        subtitle: item.desc,
        icon: item.icon,
        iconColor: "text-[#42526E] dark:text-neutral-300",
        iconBg: "bg-[#F4F5F7] dark:bg-[#1C2331]",
        action: () => {
          onClose();
          navigate(item.path);
        },
      });
    });

    // --- EMPLOYEES MATCHING QUERY ---
    if (query.trim().length >= 1) {
      const q = query.toLowerCase().trim();
      const matchedEmps = employees
        .filter((emp) => {
          const name = `${emp.firstName || ""} ${emp.lastName || ""}`.toLowerCase();
          const email = (emp.email || "").toLowerCase();
          const dept = (emp.department || "").toLowerCase();
          const role = (emp.role || emp.designation || "").toLowerCase();
          return name.includes(q) || email.includes(q) || dept.includes(q) || role.includes(q);
        })
        .slice(0, 5);

      matchedEmps.forEach((emp) => {
        const fullName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.name || "Employee";
        list.push({
          id: `emp-${emp._id || emp.employeeId || emp.email}`,
          category: "Workforce Directory",
          title: fullName,
          subtitle: `${emp.designation || emp.role || "Staff"} · ${emp.department || "General"}`,
          icon: UserCheck,
          iconColor: "text-[#0052CC] dark:text-[#579DFF]",
          iconBg: "bg-[#DEEBFF] dark:bg-[#1C2331]",
          action: () => {
            onClose();
            navigate(`/employees?search=${encodeURIComponent(fullName)}`);
          },
        });
      });
    }

    // Filter by search query if any
    if (!query.trim()) return list;

    const lowerQuery = query.toLowerCase().trim();
    return list.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(lowerQuery);
      const matchSubtitle = (item.subtitle || "").toLowerCase().includes(lowerQuery);
      const matchCategory = item.category.toLowerCase().includes(lowerQuery);
      return matchTitle || matchSubtitle || matchCategory;
    });
  }, [query, employees, isDark, isAdmin, isManager, user]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // Keyboard navigation within the modal
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, commands.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + commands.length) % Math.max(1, commands.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (commands[selectedIndex]) {
        commands[selectedIndex].action();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-3 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Omnibar Header */}
        <div className="flex items-center px-3.5 py-3 border-b border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26]">
          <Search size={16} className="text-[#6B778C] dark:text-neutral-400 mr-2.5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search modules, or find an employee..."
            className="w-full bg-transparent text-sm text-[#172B4D] dark:text-[#F1F5F9] placeholder-[#6B778C] dark:placeholder-neutral-500 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-[#6B778C] dark:text-neutral-400 hover:text-[#172B4D] dark:hover:text-white px-1.5 py-0.5 rounded cursor-pointer shrink-0 mr-1"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 bg-[#EBECF0] dark:bg-[#1C2331] text-[#6B778C] dark:text-neutral-400 rounded border border-[#DFE1E6] dark:border-[#263042] shrink-0">
            Esc
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto p-2 space-y-1 flex-1">
          {commands.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6B778C] dark:text-neutral-400">
              No matching commands or employees found for "{query}".
            </div>
          ) : (
            commands.map((cmd, index) => {
              const isSelected = index === selectedIndex;
              const Icon = cmd.icon;

              return (
                <div
                  key={cmd.id}
                  data-index={index}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all duration-100 ${
                    isSelected
                      ? "bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF]"
                      : "text-[#172B4D] dark:text-[#F1F5F9] hover:bg-[#F4F5F7] dark:hover:bg-[#151B26]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                        cmd.iconBg || "bg-[#F4F5F7] dark:bg-[#1C2331]"
                      } ${cmd.iconColor || "text-[#42526E] dark:text-neutral-300"}`}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">{cmd.title}</span>
                        <span className="text-[10px] text-[#6B778C] dark:text-neutral-400 px-1 py-0.2 rounded bg-[#EBECF0]/50 dark:bg-[#263042]/50 shrink-0">
                          {cmd.category}
                        </span>
                      </div>
                      {cmd.subtitle && (
                        <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] truncate mt-0.5">
                          {cmd.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {cmd.shortcut && (
                      <kbd className="text-[10px] font-mono px-1 py-0.5 bg-[#EBECF0] dark:bg-[#263042] text-[#6B778C] dark:text-neutral-400 rounded">
                        {cmd.shortcut}
                      </kbd>
                    )}
                    {isSelected && (
                      <span className="text-[10px] font-medium text-[#0052CC] dark:text-[#579DFF] flex items-center gap-0.5">
                        <span>Select</span>
                        <ArrowRight size={10} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint Bar */}
        <div className="flex items-center justify-between px-3.5 py-2 border-t border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-[11px] text-[#6B778C] dark:text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-[#EBECF0] dark:bg-[#1C2331] rounded font-mono text-[9px]">↑↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-[#EBECF0] dark:bg-[#1C2331] rounded font-mono text-[9px]">↵</kbd>
              <span>to select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-[#EBECF0] dark:bg-[#1C2331] rounded font-mono text-[9px]">Esc</kbd>
              <span>to close</span>
            </span>
          </div>
          <span className="font-semibold text-[10px] tracking-wide text-[#0052CC] dark:text-[#579DFF]">
            Staffify Omnibar
          </span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
