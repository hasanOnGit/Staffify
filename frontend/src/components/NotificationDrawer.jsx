import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  CalendarDays,
  CreditCard,
  Clock,
  Calendar,
  ShieldAlert,
  ArrowRight,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getLeaves } from "../services/leave";

function NotificationDrawer({ isOpen, onClose, onUnreadCountChange }) {
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'unread'
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem("staffify_read_notifs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
  const drawerRef = useRef(null);

  // Sync readIds with localStorage and parent badge count
  const persistReadIds = (newReadIds) => {
    setReadIds(newReadIds);
    try {
      localStorage.setItem("staffify_read_notifs", JSON.stringify(newReadIds));
    } catch {}
  };

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch live pending leaves
  useEffect(() => {
    getLeaves({ status: "Pending" })
      .then((data) => {
        if (Array.isArray(data)) {
          setPendingLeavesCount(data.length);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  // Generate dynamic contextual notifications
  const rawNotifications = useMemo(() => {
    const list = [];

    // 1. Pending Approvals (Admin/Manager)
    if (isAdmin || isManager) {
      if (pendingLeavesCount > 0) {
        list.push({
          id: `leave-pending-${pendingLeavesCount}`,
          title: "Pending Leave Approvals",
          description: `${pendingLeavesCount} employee time-off request${pendingLeavesCount > 1 ? "s" : ""} pending review.`,
          time: "Just now",
          category: "Approvals",
          icon: CalendarDays,
          iconColor: "text-[#FF8B00]",
          iconBg: "bg-[#FFF0B3] dark:bg-amber-950/40",
          path: "/leaves",
          actionText: "Review Leaves",
        });
      }
    }

    // 2. AI Watchdog Alert
    list.push({
      id: "ai-watchdog-alert-today",
      title: "Workforce Watchdog Digest",
      description: "Executive morning digest generated with real-time attendance and payroll health score.",
      time: "25m ago",
      category: "Intelligence",
      icon: Sparkles,
      iconColor: "text-[#0052CC] dark:text-[#579DFF]",
      iconBg: "bg-[#DEEBFF] dark:bg-[#1C2331]",
      path: "/dashboard",
      actionText: "View Insights",
    });

    // 3. Monthly Payroll Disbursement
    list.push({
      id: "payroll-disbursement-oct-2026",
      title: "October Payslip Generated",
      description: "Monthly salary statement is compiled and available for immediate PDF download.",
      time: "2h ago",
      category: "Payroll",
      icon: CreditCard,
      iconColor: "text-[#00875A] dark:text-emerald-400",
      iconBg: "bg-[#E3FCEF] dark:bg-emerald-950/40",
      path: "/payslips",
      actionText: "Download PDF",
    });

    // 4. Punctuality & Clock-In Notice
    list.push({
      id: "attendance-punch-clock-today",
      title: "Web Punch Terminal Active",
      description: "Biometric web clock-in terminal is online for today. Verify daily swipe logs.",
      time: "4h ago",
      category: "Attendance",
      icon: Clock,
      iconColor: "text-[#42526E] dark:text-neutral-300",
      iconBg: "bg-[#EBECF0] dark:bg-[#263042]",
      path: "/attendance",
      actionText: "View Logs",
    });

    // 5. Gazetted Holiday Notice
    list.push({
      id: "holiday-diwali-2026",
      title: "Upcoming Gazetted Holiday",
      description: "Diwali (Deepavali) is scheduled on Sunday, Nov 8, 2026.",
      time: "1d ago",
      category: "Calendar",
      icon: Calendar,
      iconColor: "text-[#6554C0] dark:text-purple-400",
      iconBg: "bg-[#EAE6FF] dark:bg-purple-950/40",
      path: "/dashboard",
      actionText: "View Calendar",
    });

    return list;
  }, [isAdmin, isManager, pendingLeavesCount]);

  // Compute unread list and notify parent
  const unreadCount = useMemo(() => {
    return rawNotifications.filter((n) => !readIds.includes(n.id)).length;
  }, [rawNotifications, readIds]);

  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  const displayedNotifications = useMemo(() => {
    if (activeTab === "unread") {
      return rawNotifications.filter((n) => !readIds.includes(n.id));
    }
    return rawNotifications;
  }, [rawNotifications, activeTab, readIds]);

  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      persistReadIds([...readIds, id]);
    }
  };

  const markAllAsRead = () => {
    const allIds = rawNotifications.map((n) => n.id);
    persistReadIds(allIds);
  };

  const clearAllNotifications = () => {
    const allIds = rawNotifications.map((n) => n.id);
    persistReadIds(allIds);
  };

  const handleNotificationClick = (n) => {
    markAsRead(n.id);
    onClose();
    if (n.path) navigate(n.path);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm sm:max-w-md h-full bg-white dark:bg-[#0F131C] border-l border-[#DFE1E6] dark:border-[#263042] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF] flex items-center justify-center">
              <Bell size={15} />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#172B4D] dark:text-[#F1F5F9]">
                Workforce Notifications
              </h3>
              <p className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}` : "All alerts caught up"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-[#0052CC] dark:text-[#579DFF] hover:bg-[#DEEBFF] dark:hover:bg-[#1C2331] px-2 py-1 rounded transition cursor-pointer flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck size={13} />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-[#6B778C] hover:text-[#172B4D] dark:hover:text-white rounded hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] transition cursor-pointer"
              title="Close drawer (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-[#DFE1E6] dark:border-[#263042] px-4 bg-white dark:bg-[#0F131C] text-xs">
          <button
            onClick={() => setActiveTab("all")}
            className={`py-2.5 px-3 font-semibold border-b-2 transition cursor-pointer ${
              activeTab === "all"
                ? "border-[#0052CC] text-[#0052CC] dark:border-[#579DFF] dark:text-[#579DFF]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D] dark:hover:text-white"
            }`}
          >
            All Alerts ({rawNotifications.length})
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`py-2.5 px-3 font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "unread"
                ? "border-[#0052CC] text-[#0052CC] dark:border-[#579DFF] dark:text-[#579DFF]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D] dark:hover:text-white"
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#FF5630] text-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notification Cards List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#DFE1E6] dark:divide-[#263042] p-2 space-y-1">
          {displayedNotifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#6B778C] dark:text-neutral-400">
              <CheckCircleIcon />
              <p className="font-semibold text-[#172B4D] dark:text-[#F1F5F9] mt-2">
                No notifications to display
              </p>
              <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                {activeTab === "unread" ? "You have read all your alerts." : "No active alerts recorded."}
              </p>
            </div>
          ) : (
            displayedNotifications.map((n) => {
              const isUnread = !readIds.includes(n.id);
              const Icon = n.icon;

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 rounded-lg transition-all duration-150 cursor-pointer group flex items-start gap-3 relative ${
                    isUnread
                      ? "bg-[#FAFBFC] dark:bg-[#151B26] border-l-3 border-[#0052CC] dark:border-[#579DFF]"
                      : "hover:bg-[#F4F5F7] dark:hover:bg-[#151B26]/60 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${n.iconBg} ${n.iconColor} flex items-center justify-center shrink-0`}>
                    <Icon size={16} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-[#6B778C] dark:text-[#94A3B8] tracking-wider">
                          {n.category}
                        </span>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC] dark:bg-[#579DFF] shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-[#6B778C] dark:text-[#94A3B8] shrink-0 font-mono">
                        {n.time}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9] mt-0.5 group-hover:text-[#0052CC] dark:group-hover:text-[#579DFF] transition">
                      {n.title}
                    </h4>

                    <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-0.5 leading-snug">
                      {n.description}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#0052CC] dark:text-[#579DFF] flex items-center gap-1">
                        <span>{n.actionText}</span>
                        <ArrowRight size={11} className="group-hover:translate-x-0.5 transition" />
                      </span>

                      {isUnread ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(n.id);
                          }}
                          className="text-[10px] text-[#6B778C] hover:text-[#172B4D] dark:hover:text-white px-1.5 py-0.5 rounded hover:bg-[#EBECF0] dark:hover:bg-[#263042] transition cursor-pointer"
                          title="Mark as read"
                        >
                          Mark read
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#6B778C] flex items-center gap-0.5">
                          <Check size={11} />
                          <span>Read</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] flex items-center justify-between text-[11px] text-[#6B778C] dark:text-[#94A3B8] shrink-0">
          <span>Synced with live workforce roster</span>
          <button
            onClick={clearAllNotifications}
            className="text-xs font-semibold text-[#6B778C] hover:text-[#DE350B] transition cursor-pointer flex items-center gap-1"
            title="Clear all alerts"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <div className="w-10 h-10 rounded-full bg-[#E3FCEF] dark:bg-emerald-950/40 text-[#00875A] dark:text-emerald-400 flex items-center justify-center mx-auto">
      <Check size={18} />
    </div>
  );
}

export default NotificationDrawer;
