import React from "react";

function StatusLozenge({ status = "Active", size = "sm", className = "" }) {
  const normalized = String(status || "").toLowerCase();

  let colorClasses =
    "bg-[#EBECF0] text-[#42526E] border-[#DFE1E6] dark:bg-[#1C2331] dark:text-neutral-300 dark:border-[#263042]";

  if (["active", "approved", "paid", "present", "success"].includes(normalized)) {
    colorClasses =
      "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1] dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
  } else if (
    ["submitted", "pending", "draft", "warning", "late", "expiring"].includes(normalized)
  ) {
    colorClasses =
      "bg-[#FFF0B3] text-[#B9770E] border-[#FFE380] dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
  } else if (
    ["blacklisted", "terminated", "expired", "exhausted", "danger", "rejected", "cancelled"].includes(
      normalized
    )
  ) {
    colorClasses =
      "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD] dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800";
  } else if (["completed", "inactive", "info"].includes(normalized)) {
    colorClasses =
      "bg-[#DEEBFF] text-[#0052CC] border-[#B3D4FF] dark:bg-[#1C2331] dark:text-[#579DFF] dark:border-[#263042]";
  }

  const sizeClasses =
    size === "xs"
      ? "text-[9px] px-1.5 py-0.2"
      : size === "md"
      ? "text-xs px-2.5 py-1 font-semibold"
      : "text-[11px] px-2 py-0.5 font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded uppercase tracking-wide border font-semibold select-none ${sizeClasses} ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      <span>{status}</span>
    </span>
  );
}

export default StatusLozenge;
