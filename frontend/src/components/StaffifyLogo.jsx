import React from "react";

/**
 * Staffify Enterprise Logo
 *
 * Professional geometric emblem featuring interlocking workforce synergy curves
 * forming the iconic 'S' logomark with modern enterprise-grade typography.
 *
 * @param {string} size - "xs" | "sm" | "md" | "lg" | "xl"
 * @param {boolean} showText - Whether to render "Staffify" text
 * @param {boolean} textLight - Whether text should be white (for dark backgrounds)
 * @param {string} subtitle - Optional small badge / subtitle e.g. "HRMS" or "Enterprise"
 * @param {string} className - Optional container styling
 */
export default function StaffifyLogo({
  size = "md",
  showText = true,
  textLight = false,
  subtitle = "",
  className = "",
  onClick,
}) {
  // Sizing matrix
  const dimensions = {
    xs: { box: 22, mark: 22, text: "text-xs", sub: "text-[8px]" },
    sm: { box: 28, mark: 28, text: "text-sm", sub: "text-[9px]" },
    md: { box: 32, mark: 32, text: "text-base", sub: "text-[10px]" },
    lg: { box: 40, mark: 40, text: "text-xl", sub: "text-xs" },
    xl: { box: 48, mark: 48, text: "text-2xl", sub: "text-xs" },
  };

  const current = dimensions[size] || dimensions.md;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 select-none ${
        onClick ? "cursor-pointer group" : ""
      } ${className}`}
    >
      {/* Logomark Emblem */}
      <div
        className="relative shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
        style={{ width: current.box, height: current.box }}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          <defs>
            <linearGradient id="staffifyBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0052CC" />
              <stop offset="60%" stopColor="#0747A6" />
              <stop offset="100%" stopColor="#00388B" />
            </linearGradient>
            <linearGradient id="staffifyAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00C7E6" />
              <stop offset="100%" stopColor="#4C9AFF" />
            </linearGradient>
          </defs>

          {/* Squircle Background Container */}
          <rect
            width="40"
            height="40"
            rx="11"
            fill="url(#staffifyBgGrad)"
          />
          <rect
            x="0.75"
            y="0.75"
            width="38.5"
            height="38.5"
            rx="10.25"
            stroke="white"
            strokeOpacity="0.18"
            strokeWidth="1.5"
          />

          {/* Upper Synergy Curve (White) */}
          <path
            d="M13 18C13 13.58 16.58 10 21 10H23.5C26.54 10 29 12.46 29 15.5C29 18.54 26.54 21 23.5 21H18"
            stroke="white"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Lower Synergy Curve (Cyan / Blue Accent) */}
          <path
            d="M27 22C27 26.42 23.42 30 19 30H16.5C13.46 30 11 27.54 11 24.5C11 21.46 13.46 19 16.5 19H22"
            stroke="url(#staffifyAccentGrad)"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Workforce Connection Spark (Interlocking Center Dot) */}
          <circle cx="20" cy="20" r="1.6" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-extrabold tracking-tight ${current.text} ${
                textLight
                  ? "text-white"
                  : "text-[#172B4D] group-hover:text-[#0052CC] transition-colors"
              }`}
            >
              Staff<span className={textLight ? "text-[#4C9AFF]" : "text-[#0052CC]"}>ify</span>
            </span>

            {subtitle && (
              <span
                className={`uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                  current.sub
                } ${
                  textLight
                    ? "bg-white/15 text-blue-100 border border-white/20"
                    : "bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF]"
                }`}
              >
                {subtitle}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
