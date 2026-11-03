import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  X,
  CheckCheck,
  CalendarCheck,
  CheckSquare,
  CreditCard,
  Radio,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Trash2,
  Inbox
} from "lucide-react";
import { hapticLight, hapticSuccess } from "../utils/haptics";

const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Leave Request Approved",
    description: "Your Casual Leave for Nov 05 - Nov 06 has been approved by Priya Sundaram.",
    category: "Leaves",
    time: "10m ago",
    read: false,
    icon: CalendarCheck,
    color: "emerald",
    link: "/leaves",
  },
  {
    id: "notif-2",
    title: "Manager Approval Delegation",
    description: "You have been appointed as proxy approver for Squad Engineering until Nov 12.",
    category: "Approvals",
    time: "1h ago",
    read: false,
    icon: CheckSquare,
    color: "blue",
    link: "/approvals",
  },
  {
    id: "notif-3",
    title: "Offline Attendance Synced",
    description: "Your 2 queued offline swipe records were successfully synchronized with the HQ attendance ledger.",
    category: "System",
    time: "3h ago",
    read: false,
    icon: Clock,
    color: "purple",
    link: "/swipes",
  },
  {
    id: "notif-4",
    title: "Payslip Generated",
    description: "Salary slip for October 2026 is ready for download in your employee documents vault.",
    category: "Finance",
    time: "1d ago",
    read: true,
    icon: CreditCard,
    color: "blue",
    link: "/payslips",
  },
  {
    id: "notif-5",
    title: "Geofence Perimeter Verified",
    description: "HQ Bangalore Campus GPS coordinates calibrated with high-accuracy satellite precision.",
    category: "System",
    time: "2d ago",
    read: true,
    icon: ShieldCheck,
    color: "amber",
    link: "/swipes",
  },
];

export default function NotificationCenterModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState("All");

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllAsRead = () => {
    hapticSuccess();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (item) => {
    hapticLight();
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    onClose();
    if (item.link) {
      navigate(item.link);
    }
  };

  const handleDismiss = (e, id) => {
    e.stopPropagation();
    hapticLight();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    hapticLight();
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "Unread") return !n.read;
    if (activeFilter === "Leaves") return n.category === "Leaves";
    if (activeFilter === "Approvals") return n.category === "Approvals";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Tap Backdrop to Dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-Up Bottom Sheet Modal Container */}
      <div className="relative z-10 w-full max-w-md mx-auto bg-white dark:bg-[#0F131C] rounded-t-3xl sm:rounded-3xl border-t sm:border border-[#DFE1E6] dark:border-[#263042] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-6 duration-250">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between shrink-0 bg-white/80 dark:bg-[#0F131C]/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#DEEBFF] dark:bg-blue-950/60 text-[#0052CC] dark:text-[#579DFF] flex items-center justify-center border border-[#0052CC]/20 shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#172B4D] dark:text-white">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#0052CC] text-white text-[10px] font-extrabold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#6B778C] dark:text-slate-400">
                Staffify Workforce Intelligence Alerts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                title="Mark all as read"
                className="px-2 py-1 text-[11px] font-semibold text-[#0052CC] dark:text-[#579DFF] hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark read</span>
              </button>
            )}
            {/* Prominent Cross Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#EBECF0] dark:bg-[#151B26] hover:bg-[#DFE1E6] dark:hover:bg-[#263042] text-[#6B778C] dark:text-slate-300 active:scale-90 transition-all border border-[#DFE1E6] dark:border-[#263042]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-2 border-b border-[#DFE1E6]/70 dark:border-[#263042]/70 flex items-center gap-1.5 overflow-x-auto shrink-0 bg-[#F4F5F7]/50 dark:bg-[#090D14]/50">
          {["All", "Unread", "Leaves", "Approvals"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                hapticLight();
                setActiveFilter(tab);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === tab
                  ? "bg-[#0052CC] text-white shadow-xs"
                  : "bg-white dark:bg-[#151B26] text-[#6B778C] dark:text-slate-400 hover:text-[#172B4D] dark:hover:text-white border border-[#DFE1E6] dark:border-[#263042]"
              }`}
            >
              {tab}
              {tab === "Unread" && unreadCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[9px] rounded-full bg-rose-500 text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1 divide-y divide-[#DFE1E6]/60 dark:divide-[#263042]/60 p-2 sm:p-3 space-y-1">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EBECF0] dark:bg-[#151B26] text-[#6B778C] flex items-center justify-center mx-auto">
                <Inbox className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#172B4D] dark:text-white">
                  No notifications to display
                </p>
                <p className="text-[11px] text-[#6B778C] dark:text-slate-400 max-w-xs mx-auto">
                  You are all caught up! System broadcasts and workflow updates will appear here.
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const IconComponent = n.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 relative group active:scale-[0.99] ${
                    !n.read
                      ? "bg-[#DEEBFF]/40 dark:bg-blue-950/25 border border-[#B3D4FF]/50 dark:border-blue-900/40"
                      : "bg-white dark:bg-[#0F131C] hover:bg-[#F4F5F7] dark:hover:bg-[#151B26]"
                  }`}
                >
                  {/* Category Icon */}
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] text-[#0052CC] dark:text-[#579DFF] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <IconComponent className="w-4 h-4" />
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-[#172B4D] dark:text-white">
                        {n.title}
                      </span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-[#0052CC] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#6B778C] dark:text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                      {n.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#6B778C] dark:text-slate-400">
                      <span className="font-medium">{n.time}</span>
                      <span>•</span>
                      <span className="px-1.5 py-0.2 rounded bg-[#EBECF0] dark:bg-[#151B26] font-semibold">
                        {n.category}
                      </span>
                    </div>
                  </div>

                  {/* Dismiss Single Item Button */}
                  <button
                    type="button"
                    onClick={(e) => handleDismiss(e, n.id)}
                    title="Dismiss"
                    className="absolute right-2.5 top-2.5 p-1 rounded-lg text-[#6B778C] hover:text-[#DE350B] dark:text-slate-400 hover:bg-[#FFEBE6] dark:hover:bg-rose-950/40 opacity-70 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-[#DFE1E6] dark:border-[#263042] bg-[#F4F5F7] dark:bg-[#090D14] flex items-center justify-between shrink-0 text-xs">
            <span className="text-[11px] text-[#6B778C] dark:text-slate-400">
              {notifications.length} total alert(s)
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] font-semibold text-[#DE350B] hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
