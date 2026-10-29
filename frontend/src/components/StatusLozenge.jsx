import React from "react";

function StatusLozenge({ status = "Active", size = "sm", className = "" }) {
  const normalized = String(status || "").toLowerCase();

  let colorClasses =
    "bg-[#EBECF0] text-[#42526E] border border-[#DFE1E6] dark:bg-[#1C2331] dark:text-neutral-300 dark:border-[#263042]";

  if (["active", "approved", "paid", "present", "completed", "settled & paid", "fully repaid"].includes(normalized)) {
    colorClasses =
      "bg-[#E3FCEF] text-[#00875A] border border-[#ABF5D1] dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
  } else if (
    ["pending", "in-review", "submitted", "draft", "warning", "late", "expiring", "deployment", "clearance in progress"].includes(
      normalized
    )
  ) {
    colorClasses =
      "bg-[#FFF0B3] text-[#B9770E] border border-[#FFE380] dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
  } else if (
    ["blacklisted", "terminated", "expired", "exhausted", "danger", "rejected", "cancelled", "high-risk"].includes(
      normalized
    )
  ) {
    colorClasses =
      "bg-[#FFEBE6] text-[#DE350B] border border-[#FFBDAD] dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800";
  } else if (["info", "sourced", "general", "it", "security", "facilities", "ready for payment"].includes(normalized)) {
    colorClasses =
      "bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF] dark:bg-[#1C2331] dark:text-[#579DFF] dark:border-[#263042]";
  }

  const sizeClasses =
    size === "xs"
      ? "text-[9px] px-1.5 py-0.2"
      : size === "md"
      ? "text-xs px-2.5 py-1 font-semibold"
      : "text-[10px] px-2 py-0.5 font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded uppercase tracking-wide font-semibold select-none ${sizeClasses} ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      <span>{status}</span>
    </span>
  );
}

export default StatusLozenge;
