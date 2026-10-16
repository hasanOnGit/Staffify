import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import ClockWidget from "./ClockWidget";
import {
  Grid,
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
  Layers,
  CalendarDays,
  UserPlus,
  Clock,
  X,
  FileText,
  CreditCard,
  Target,
  ArrowLeftRight,
  LifeBuoy,
} from "lucide-react";

function Navbar() {
  const { user, logout, isAdmin, isManager } = useAuth();
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
      <header className="h-12 bg-white border-b border-[#DFE1E6] flex items-center justify-between px-3.5 sticky top-0 z-50 select-none">
        {/* Left: Jira App Switcher, Staffify Brand & Search */}
        <div className="flex items-center gap-3">
          {/* 9-Dots Jira App Switcher */}
          <button
            className="p-1.5 text-[#42526E] hover:text-[#172B4D] hover:bg-[#EBECF0] rounded transition cursor-pointer"
            title="Atlassian App Switcher"
            onClick={() => {}}
          >
            <Grid size={18} />
          </button>

          {/* Staffify Logo / Mark */}
          <div
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded bg-[#0052CC] flex items-center justify-center text-white shadow-xs">
              <Building2 size={15} />
            </div>
            <span className="text-sm font-bold text-[#172B4D] tracking-tight group-hover:text-[#0052CC] transition hidden sm:inline">
              Staffify
            </span>
          </div>

          {/* Jira Global Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative ml-2">
            <div className="flex items-center bg-[#FAFBFC] hover:bg-white focus-within:bg-white border border-[#DFE1E6] focus-within:border-[#0052CC] rounded-md px-2.5 py-1 text-xs w-44 sm:w-64 md:w-80 transition shadow-2xs">
              <Search size={14} className="text-[#6B778C] shrink-0 mr-2" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-[#172B4D] placeholder-[#6B778C] text-xs"
              />
              <kbd className="hidden md:inline-block text-[10px] bg-[#EBECF0] px-1.5 py-0.5 rounded text-[#6B778C] font-mono border border-[#DFE1E6] shrink-0">
                /
              </kbd>
            </div>
          </form>
        </div>

        {/* Right: + Create, Web Clock-In, Apps, Notifications, Help, Settings & Avatar */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Signature Jira "+ Create" Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white px-2.5 sm:px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 shadow-xs transition cursor-pointer shrink-0"
          >
            <Plus size={14} />
            <span>Create</span>
          </button>

          {/* Web Clock Widget */}
          <div className="hidden lg:block">
            <ClockWidget />
          </div>

          <div className="h-4 w-px bg-[#DFE1E6] hidden sm:block" />

          {/* 4-Squares Jira Apps Icon */}
          <button
            className="p-1.5 text-[#42526E] hover:text-[#172B4D] hover:bg-[#EBECF0] rounded transition cursor-pointer hidden md:block"
            title="Jira Apps & Spaces"
          >
            <Layers size={16} />
          </button>

          {/* Notifications Bell with Jira-style Badge */}
          <button
            className="relative p-1.5 text-[#42526E] hover:text-[#172B4D] hover:bg-[#EBECF0] rounded transition cursor-pointer"
            title="Notifications"
            onClick={() => navigate("/leaves")}
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF5630] rounded-full border border-white" />
          </button>

          {/* Help / Support Icon */}
          <button
            className="p-1.5 text-[#42526E] hover:text-[#172B4D] hover:bg-[#EBECF0] rounded transition cursor-pointer hidden sm:block"
            title="Help & Documentation"
          >
            <HelpCircle size={16} />
          </button>

          {/* Settings Gear */}
          <button
            onClick={() => navigate("/profile")}
            className="p-1.5 text-[#42526E] hover:text-[#172B4D] hover:bg-[#EBECF0] rounded transition cursor-pointer hidden sm:block"
            title="Settings"
          >
            <Settings size={16} />
          </button>

          {/* User Profile Avatar (Jira Style Amber/Blue Pill) */}
          <div className="relative">
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
                className="absolute right-0 mt-2 w-56 bg-white border border-[#DFE1E6] rounded-md shadow-lg py-2 z-50 text-xs text-[#172B4D]"
              >
                <div className="px-3.5 py-2 border-b border-[#DFE1E6]">
                  <p className="font-bold text-[#172B4D] truncate">{user?.name || "Admin User"}</p>
                  <p className="text-[11px] text-[#6B778C] truncate mt-0.5">{user?.email}</p>
                  <div className="mt-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF]">
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
                    className="w-full text-left px-3.5 py-2 hover:bg-[#F4F5F7] transition cursor-pointer"
                  >
                    Profile & Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/attendance");
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#F4F5F7] transition cursor-pointer"
                  >
                    Attendance & Swipes
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/leaves");
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#F4F5F7] transition cursor-pointer"
                  >
                    Leave Approvals
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/payslips");
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#F4F5F7] transition cursor-pointer"
                  >
                    My Payslips & Salary
                  </button>
                </div>

                <div className="border-t border-[#DFE1E6] pt-1 mt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3.5 py-2 text-[#DE350B] hover:bg-[#FFEBE6] transition flex items-center gap-1.5 cursor-pointer font-medium"
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

      {/* Jira "+ Create" Quick Action Modal */}
      {showCreateModal && (
        <div
          onClick={() => setShowCreateModal(false)}
          className="fixed inset-0 bg-[#091E42]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-xl border border-[#DFE1E6] w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden my-auto"
          >
            <div className="px-5 py-3.5 border-b border-[#DFE1E6] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#0052CC] text-white flex items-center justify-center">
                  <Plus size={14} />
                </div>
                <h3 className="font-bold text-[#172B4D] text-sm">Quick Create</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#6B778C] hover:text-[#172B4D] p-1 rounded hover:bg-[#EBECF0] transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-2 overflow-y-auto">
              <p className="text-xs text-[#6B778C] mb-3">
                Select an item to quickly create or request in Staffify:
              </p>

              <button
                onClick={() => {
                  setShowCreateModal(false);
                  navigate("/leaves");
                }}
                className="w-full text-left p-3 rounded-lg border border-[#DFE1E6] hover:border-[#0052CC] hover:bg-[#DEEBFF]/20 transition flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-md bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center shrink-0">
                  <CalendarDays size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#172B4D] group-hover:text-[#0052CC]">
                    Apply for Leave
                  </h4>
                  <p className="text-[11px] text-[#6B778C]">
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
                  className="w-full text-left p-3 rounded-lg border border-[#DFE1E6] hover:border-[#0052CC] hover:bg-[#DEEBFF]/20 transition flex items-center gap-3 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-md bg-[#E3FCEF] text-[#00875A] flex items-center justify-center shrink-0">
                    <UserPlus size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#172B4D] group-hover:text-[#0052CC]">
                      Onboard New Employee
                    </h4>
                    <p className="text-[11px] text-[#6B778C]">
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
                  className="w-full text-left p-3 rounded-lg border border-[#DFE1E6] hover:border-[#0052CC] hover:bg-[#DEEBFF]/20 transition flex items-center gap-3 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-md bg-[#E3FCEF] text-[#00875A] flex items-center justify-center shrink-0">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#172B4D] group-hover:text-[#0052CC]">
                      Run Monthly Payroll
                    </h4>
                    <p className="text-[11px] text-[#6B778C]">
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
                  className="w-full text-left p-3 rounded-lg border border-[#DFE1E6] hover:border-[#0052CC] hover:bg-[#DEEBFF]/20 transition flex items-center gap-3 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-md bg-[#EAE6FF] text-[#403294] flex items-center justify-center shrink-0">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#172B4D] group-hover:text-[#0052CC]">
                      Configure Squad or Team
                    </h4>
                    <p className="text-[11px] text-[#6B778C]">
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
                  className="w-full text-left p-3 rounded-lg border border-[#DFE1E6] hover:border-[#0052CC] hover:bg-[#DEEBFF]/20 transition flex items-center gap-3 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-md bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center shrink-0">
                    <Briefcase size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#172B4D] group-hover:text-[#0052CC]">
                      Publish Job Opening
                    </h4>
                    <p className="text-[11px] text-[#6B778C]">
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
                className="w-full text-left p-3 rounded-lg border border-[#DFE1E6] hover:border-[#0052CC] hover:bg-[#DEEBFF]/20 transition flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-md bg-[#FFF0B3] text-[#B9770E] flex items-center justify-center shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#172B4D] group-hover:text-[#0052CC]">
                    Attendance Regularization
                  </h4>
                  <p className="text-[11px] text-[#6B778C]">
                    Submit punch correction request for missed swipes
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowCreateModal(false);
                  navigate("/performance");
                }}
                className="w-full text-left p-3 rounded-lg border border-[#DFE1E6] hover:border-[#0052CC] hover:bg-[#DEEBFF]/20 transition flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-md bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center shrink-0">
                  <Target size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#172B4D] group-hover:text-[#0052CC]">
                    New Goal & OKR
                  </h4>
                  <p className="text-[11px] text-[#6B778C]">
                    Define measurable key results and performance targets
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowCreateModal(false);
                  navigate("/roster");
                }}
                className="w-full text-left p-3 rounded-lg border border-[#DFE1E6] hover:border-[#0052CC] hover:bg-[#DEEBFF]/20 transition flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-md bg-[#EAE6FF] text-[#6554C0] flex items-center justify-center shrink-0">
                  <ArrowLeftRight size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#172B4D] group-hover:text-[#0052CC]">
                    Request Shift Swap
                  </h4>
                  <p className="text-[11px] text-[#6B778C]">
                    Exchange scheduled shift date with an eligible squad peer
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowCreateModal(false);
                  navigate("/helpdesk");
                }}
                className="w-full text-left p-3 rounded-lg border border-[#DFE1E6] hover:border-[#0052CC] hover:bg-[#DEEBFF]/20 transition flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-md bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center shrink-0">
                  <LifeBuoy size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#172B4D] group-hover:text-[#0052CC]">
                    Raise Support Ticket
                  </h4>
                  <p className="text-[11px] text-[#6B778C]">
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
