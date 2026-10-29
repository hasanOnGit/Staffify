import React from "react";

function StaffifyLogo({ size = "md", className = "" }) {
  const sizeMap = {
    xs: { icon: 20, text: "text-sm", sub: "text-[9px]" },
    sm: { icon: 24, text: "text-base", sub: "text-[10px]" },
    md: { icon: 28, text: "text-lg", sub: "text-[11px]" },
    lg: { icon: 34, text: "text-xl", sub: "text-xs" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* SVG Monogram Emblem */}
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <rect
          width="32"
          height="32"
          rx="8"
          className="fill-[#0052CC] dark:fill-[#0747A6]"
        />
        <path
          d="M10 21C10 18.5 12.5 16 16 16C19.5 16 22 13.5 22 11"
          stroke="#DEEBFF"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <circle cx="22" cy="11" r="2" fill="#579DFF" />
        <circle cx="10" cy="21" r="2" fill="#FFFFFF" />
      </svg>

      <div className="flex items-center gap-1.5 leading-none">
        <span className="font-bold tracking-tight text-[#172B4D] dark:text-[#F1F5F9] font-sans">
          Staffify
        </span>
        <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-[#DEEBFF] text-[#0052CC] dark:bg-[#1C2331] dark:text-[#579DFF] rounded border border-[#B3D4FF] dark:border-[#263042]">
          Go
        </span>
      </div>
    </div>
  );
}

export default StaffifyLogo;
