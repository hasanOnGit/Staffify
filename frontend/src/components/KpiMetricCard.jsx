import React from "react";

function KpiMetricCard({
  title,
  value,
  badgeText,
  accentColor = "#0052CC",
  icon: Icon,
  iconBg = "bg-[#DEEBFF] dark:bg-[#1C2331]",
  iconColor = "text-[#0052CC] dark:text-[#579DFF]",
  context,
  progressBar,
}) {
  return (
    <div
      className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-4 shadow-xs relative overflow-hidden card-smooth transition-all"
      style={{ borderTop: `3px solid ${accentColor}` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-semibold text-[#6B778C] dark:text-[#94A3B8] uppercase tracking-wider block">
            {title}
          </span>
          <p className="text-2xl font-bold text-[#172B4D] dark:text-[#F1F5F9] mt-1 tracking-tight font-sans">
            {value}
          </p>
        </div>

        {Icon && (
          <div className={`w-9 h-9 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shrink-0 shadow-2xs`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      {progressBar ? (
        <div className="mt-2.5">
          <div className="w-full bg-[#EBECF0] dark:bg-[#1C2331] h-1.5 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, Math.max(0, progressBar.percent || 0))}%` }}
              className={`h-full ${progressBar.color || "bg-[#0052CC]"} rounded-full transition-all duration-500`}
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
            <span>{context}</span>
            <span className="font-semibold text-[#00875A] dark:text-emerald-400">
              {badgeText}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mt-2.5 text-[11px]">
          <span className="text-[#6B778C] dark:text-[#94A3B8] truncate max-w-[180px]">
            {context}
          </span>
          {badgeText && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
              style={{
                backgroundColor: `${accentColor}18`,
                color: accentColor,
              }}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default KpiMetricCard;
