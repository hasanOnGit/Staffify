import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAiAssistant } from "../context/AiAssistantContext";
import toast from "react-hot-toast";
import ClockWidget from "./ClockWidget";
import StaffifyLogo from "./StaffifyLogo";
import {
  Search,
  Plus,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  Building2,
  ShieldCheck,
  UserCheck,
  Briefcase,
  CalendarDays,
  UserPlus,
  Clock,
  X,
  FileText,
  CreditCard,
  Target,
  ArrowLeftRight,
  LifeBuoy,
  Menu,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function Navbar({ onToggleMobileMenu, isMobileMenuOpen }) {
  const { user, logout, isAdmin, isManager } = useAuth();
  const { toggleAssistant } = useAiAssistant();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getInitials = (name = "") => {
    if (!name) return "AU";
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/employees?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  return (
    <>
      <header className="h-12 bg-white dark:bg-[#111C3D] border-b border-[#DFE1E6] dark:border-[#202E5C] flex items-center justify-between px-2.5 sm:px-3.5 sticky top-0 z-50 select-none transition-colors">
        {/* Left: Mobile Menu, Staffify Brand & Search */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 max-w-xl">
          {/* Mobile Hamburger Drawer Toggle */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 text-[#42526E] dark:text-neutral-300 hover:text-[#172B4D] dark:hover:text-white hover:bg-[#EBECF0] dark:hover:bg-[#16224A] rounded transition cursor-pointer shrink-0"
            title="Toggle Navigation Menu"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Proper Staffify Logo */}
          <StaffifyLogo
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="shrink-0"
          />

          {/* Staffify Global Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative ml-1 sm:ml-2 flex-1 max-w-xs md:max-w-sm min-w-0">
            <div className="flex items-center bg-[#FAFBFC] dark:bg-[#0B132B] hover:bg-white dark:hover:bg-[#16224A] focus-within:bg-white dark:focus-within:bg-[#16224A] border border-[#DFE1E6] dark:border-[#202E5C] focus-within:border-[#0052CC] rounded-md px-2 py-1 text-xs w-full transition shadow-2xs">
              <Search size={13} className="text-[#6B778C] dark:text-neutral-400 shrink-0 mr-1.5" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-[#172B4D] dark:text-white placeholder-[#6B778C] dark:placeholder-neutral-400 text-xs min-w-0"
              />
              <kbd className="hidden md:inline-block text-[10px] bg-[#EBECF0] dark:bg-[#16224A] px-1.5 py-0.5 rounded text-[#6B778C] dark:text-neutral-400 font-mono border border-[#DFE1E6] dark:border-[#202E5C] shrink-0">
                /
              </kbd>
            </div>
          </form>
        </div>

        {/* Right: + Create, Web Clock-In, Sun/Moon, Notifications, Help, Settings & Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Global Quick "+ Create" Action Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white px-2.5 sm:px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 shadow-xs transition cursor-pointer shrink-0"
          >
            <Plus size={14} />
            <span>Create</span>
          </button>

          {/* Ask AI Copilot Button */}
          <button
            type="button"
            onClick={toggleAssistant}
            className="bg-[#DEEBFF] dark:bg-[#16224A] hover:bg-[#B3D4FF] dark:hover:bg-[#202E5C] text-[#0052CC] dark:text-[#4C9AFF] border border-[#B3D4FF] dark:border-[#202E5C] px-2.5 sm:px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer shrink-0"
            title="Ask Staffify AI Copilot (Ctrl + J)"
          >
            <Sparkles size={13} className="text-[#0052CC] dark:text-[#4C9AFF]" />
            <span className="hidden xs:inline">Ask AI</span>
          </button>

          {/* Web Clock Widget */}
          <div className="hidden lg:block shrink-0">
            <ClockWidget />
          </div>

          <div className="h-4 w-px bg-[#DFE1E6] dark:bg-[#202E5C] hidden sm:block shrink-0" />

          {/* Theme Switcher (Dark / Light Mode Sun / Moon Button) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 text-[#42526E] dark:text-amber-400 hover:text-[#172B4D] dark:hover:text-amber-300 hover:bg-[#EBECF0] dark:hover:bg-[#16224A] rounded transition cursor-pointer shrink-0"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun size={16} className="text-amber-400" />
            ) : (
              <Moon size={16} className="text-[#42526E]" />
            )}
          </button>

          {/* Notifications Bell */}
          <button
            className="relative p-1.5 text-[#42526E] dark:text-neutral-300 hover:text-[#172B4D] dark:hover:text-white hover:bg-[#EBECF0] dark:hover:bg-[#16224A] rounded transition cursor-pointer shrink-0"
            title="Notifications"
            onClick={() => navigate("/leaves")}
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF5630] rounded-full border border-white dark:border-[#111C3D]" />
          </button>

          {/* Helpdesk & Support */}
          <button
            onClick={() => navigate("/helpdesk")}
            className="p-1.5 text-[#42526E] dark:text-neutral-300 hover:text-[#172B4D] dark:hover:text-white hover:bg-[#EBECF0] dark:hover:bg-[#16224A] rounded transition cursor-pointer hidden sm:block shrink-0"
            title="Helpdesk & Support"
          >
            <HelpCircle size={16} />
          </button>

          {/* Settings Gear */}
          <button
            onClick={() => navigate("/profile")}
            className="p-1.5 text-[#42526E] dark:text-neutral-300 hover:text-[#172B4D] dark:hover:text-white hover:bg-[#EBECF0] dark:hover:bg-[#16224A] rounded transition cursor-pointer hidden sm:block shrink-0"
            title="Settings"
          >
            <Settings size={16} />
          </button>

          {/* User Profile Avatar */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-7 h-7 rounded-full bg-[#FF8B00] text-white font-bold flex items-center justify-center text-[11px] cursor-pointer hover:ring-2 hover:ring-[#0052CC]/40 transition shrink-0"
              title={user?.name || "User Account"}
            >
              {getInitials(user?.name)}
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111C3D] border border-[#DFE1E6] dark:border-[#202E5C] rounded-md shadow-lg py-2 z-50 text-xs text-[#172B4D] dark:text-neutral-100"
              >
                <div className="px-3.5 py-2 border-b border-[#DFE1E6] dark:border-[#202E5C]">
                  <p className="font-bold text-[#172B4D] dark:text-neutral-100 truncate">{user?.name || "Admin User"}</p>
                  <p className="text-[11px] text-[#6B778C] dark:text-neutral-400 truncate mt-0.5">{user?.email}</p>
                  <div className="mt-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-[#DEEBFF] dark:bg-[#16224A] text-[#0747A6] dark:text-[#4C9AFF] border border-[#B3D4FF] dark:border-[#202E5C]">
                      {isAdmin ? (
                        <>
                          <ShieldCheck size={11} />
                          Administrator
                        </>
                      ) : isManager ? (
                        <>
                          <Briefcase size={11} />
                          Manager
                        </>
                      ) : (
                        <>
                          <UserCheck size={11} />
                          Employee
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/profile");
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#F4F5F7] dark:hover:bg-[#16224A] dark:text-neutral-200 transition cursor-pointer"
                  >
                    Profile & Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/attendance");
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#F4F5F7] dark:hover:bg-[#16224A] dark:text-neutral-200 transition cursor-pointer"
                  >
                    Attendance & Swipes
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/leaves");
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#F4F5F7] dark:hover:bg-[#16224A] dark:text-neutral-200 transition cursor-pointer"
                  >
                    Leave Approvals
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/payslips");
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#F4F5F7] dark:hover:bg-[#16224A] dark:text-neutral-200 transition cursor-pointer"
                  >
                    My Payslips & Salary
                  </button>
                </div>

                <div className="border-t border-[#DFE1E6] dark:border-[#202E5C] pt-1 mt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3.5 py-2 text-[#DE350B] hover:bg-[#FFEBE6] dark:hover:bg-[#DE350B]/10 transition flex items-center gap-1.5 cursor-pointer font-medium"
                  >
                    <LogOut size={13} />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Staffify "+ Create" Quick Action Modal */}
      {showCreateModal && (
        <div
          onClick={() => setShowCreateModal(false)}
          className="fixed inset-0 bg-[#091E42]/50 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#111C3D] rounded-lg shadow-xl border border-[#DFE1E6] dark:border-[#202E5C] w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden my-auto"
          >
            <div className="px-5 py-3.5 border-b border-[#DFE1E6] dark:border-[#202E5C] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#0052CC] text-white flex items-center justify-center">
                  <Plus size={14} />
                </div>
                <h3 className="font-bold text-[#172B4D] dark:text-neutral-100 text-sm">Quick Create</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#6B778C] dark:text-neutral-400 hover:text-[#172B4D] dark:hover:text-white p-1 rounded hover:bg-[#EBECF0] dark:hover:bg-[#16224A] transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-2 overflow-y-auto">
              <p className="text-xs text-[#6B778C] dark:text-neutral-400 mb-3">
                Select an item to quickly create or request in Staffify:
              </p>

              <button
                onClick={() => {
                  setShowCreateModal(false);
                  navigate("/leaves");
                }}
                className="w-full text-left p-3 rounded-lg border border-[#DFE1E6] dark:border-[#202E5C] hover:border-[#0052CC] hover:bg-[#DEEBFF]/20 dark:hover:bg-[#16224A] transition flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-md bg-[#DEEBFF] dark:bg-[#16224A] text-[#0052CC] dark:text-[#4C9AFF] flex items-center justify-center shrink-0">
                  <CalendarDays size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#172B4D] dark:text-neutral-100 group-hover:text-[#0052CC] dark:group-hover:text-[#4C9AFF]">
                    Apply for Leave
                  </h4>
                  <p className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                    Submit time-off, casual, sick, or half-day request
                  </p>
                </div>
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    navigate("/employees");
                  }}
                  className="w-full text-left p-3 rounded-lg border border-[#DFE1E6] dark:border-[#202E5C] hover:border-[#0052CC] hover:bg-[#DEEBFF]/20 dark:hover:bg-[#16224A] transition flex items-center gap-3 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-md bg-[#E3FCEF] dark:bg-emerald-950/40 text-[#00875A] dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <UserPlus size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#172B4D] dark:text-neutral-100 group-hover:text-[#0052CC] dark:group-hover:text-[#4C9AFF]">
                      Onboard New Employee
                    </h4>
                    <p className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                      Add new staff member, job profile, and statutory details
                    </p>
                  </div>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    navigate("/payroll");
                  }}
                  className="w-full text-left p-3 rounded-lg border border-[#DFE1E6] dark:border-[#202E5C] hover:border-[#0052CC] hover:bg-[#DEEBFF]/20 dark:hover:bg-[#16224A] transition flex items-center gap-3 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-md bg-[#E3FCEF] dark:bg-emerald-950/40 text-[#00875A] dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#172B4D] dark:text-neutral-100 group-hover:text-[#0052CC] dark:group-hover:text-[#4C9AFF]">
                      Run Monthly Payroll
                    </h4>
                    <p className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                      Process employee salaries, statutory deductions & payslips
                    </p>
                  </div>
                </button>
              )}

              {(isAdmin || isManager) && (
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    navigate("/teams");
                  }}
                  className="w-full text-left p-3 rounded-lg border border-[#DFE1E6] dark:border-[#202E5C] hover:border-[#0052CC] hover:bg-[#DEEBFF]/20 dark:hover:bg-[#16224A] transition flex items-center gap-3 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-md bg-[#EAE6FF] dark:bg-purple-950/40 text-[#403294] dark:text-purple-300 flex items-center justify-center shrink-0">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#172B4D] dark:text-neutral-100 group-hover:text-[#0052CC] dark:group-hover:text-[#4C9AFF]">
                      Configure Squad or Team
                    </h4>
                    <p className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                      Create new department squad and assign leadership
                    </p>
                  </div>
                </button>
              )}

              {(isAdmin || isManager) && (
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    navigate("/recruitment");
                  }}
                  className="w-full text-left p-3 rounded-lg border border-[#DFE1E6] dark:border-[#202E5C] hover:border-[#0052CC] hover:bg-[#DEEBFF]/20 dark:hover:bg-[#16224A] transition flex items-center gap-3 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-md bg-[#DEEBFF] dark:bg-[#16224A] text-[#0052CC] dark:text-[#4C9AFF] flex items-center justify-center shrink-0">
                    <Briefcase size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#172B4D] dark:text-neutral-100 group-hover:text-[#0052CC] dark:group-hover:text-[#4C9AFF]">
                      Publish Job Opening
                    </h4>
                    <p className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                      Create new job requisition and recruit squad talent
                    </p>
                  </div>
                </button>
              )}

              <button
                onClick={() => {
                  setShowCreateModal(false);
                  navigate("/attendance");
                }}
                className="w-full text-left p-3 rounded-lg border border-[#DFE1E6] dark:border-[#202E5C] hover:border-[#0052CC] hover:bg-[#DEEBFF]/20 dark:hover:bg-[#16224A] transition flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-md bg-[#FFF0B3] dark:bg-amber-950/40 text-[#B9770E] dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#172B4D] dark:text-neutral-100 group-hover:text-[#0052CC] dark:group-hover:text-[#4C9AFF]">
                    Attendance Regularization
                  </h4>
                  <p className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                    Submit punch correction request for missed swipes
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowCreateModal(false);
                  navigate("/performance");
                }}
                className="w-full text-left p-3 rounded-lg border border-[#DFE1E6] dark:border-[#202E5C] hover:border-[#0052CC] hover:bg-[#DEEBFF]/20 dark:hover:bg-[#16224A] transition flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-md bg-[#DEEBFF] dark:bg-[#16224A] text-[#0052CC] dark:text-[#4C9AFF] flex items-center justify-center shrink-0">
                  <Target size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#172B4D] dark:text-neutral-100 group-hover:text-[#0052CC] dark:group-hover:text-[#4C9AFF]">
                    New Goal & OKR
                  </h4>
                  <p className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                    Define measurable key results and performance targets
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowCreateModal(false);
                  navigate("/roster");
                }}
                className="w-full text-left p-3 rounded-lg border border-[#DFE1E6] dark:border-[#202E5C] hover:border-[#0052CC] hover:bg-[#DEEBFF]/20 dark:hover:bg-[#16224A] transition flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-md bg-[#EAE6FF] dark:bg-purple-950/40 text-[#6554C0] dark:text-purple-300 flex items-center justify-center shrink-0">
                  <ArrowLeftRight size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#172B4D] dark:text-neutral-100 group-hover:text-[#0052CC] dark:group-hover:text-[#4C9AFF]">
                    Request Shift Swap
                  </h4>
                  <p className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                    Exchange scheduled shift date with an eligible squad peer
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowCreateModal(false);
                  navigate("/helpdesk");
                }}
                className="w-full text-left p-3 rounded-lg border border-[#DFE1E6] dark:border-[#202E5C] hover:border-[#0052CC] hover:bg-[#DEEBFF]/20 dark:hover:bg-[#16224A] transition flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-md bg-[#DEEBFF] dark:bg-[#16224A] text-[#0052CC] dark:text-[#4C9AFF] flex items-center justify-center shrink-0">
                  <LifeBuoy size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#172B4D] dark:text-neutral-100 group-hover:text-[#0052CC] dark:group-hover:text-[#4C9AFF]">
                    Raise Support Ticket
                  </h4>
                  <p className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                    Submit IT hardware, HR query, or payroll assistance request
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
