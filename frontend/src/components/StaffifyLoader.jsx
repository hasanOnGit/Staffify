import { useState, useEffect, useRef } from "react";
import { Zap } from "lucide-react";

/**
 * StaffifyLoader
 *
 * Premium interactive logo-based loader featuring:
 * 1. Animated Staffify S-Curve emblem with glowing path stroke animations.
 * 2. Dual celestial orbital rings with particle accent nodes.
 * 3. Central workforce synergy spark with radial wave pings.
 * 4. Interactive 3D hover tilt & click energy boost ripples.
 * 5. Dynamic enterprise status cycler and shimmer progress track.
 *
 * @param {"sm" | "md" | "lg" | "xl"} size - Sizing tier
 * @param {"fullscreen" | "page" | "card" | "inline"} mode - Display container variant
 * @param {string} text - Custom loading text (or auto-cycling enterprise copy)
 * @param {string} subtitle - Optional secondary note
 * @param {boolean} showText - Whether to render "Staffify" typography
 * @param {boolean} interactive - Enable hover tilt and click ripples
 */
export default function StaffifyLoader({
  size = "md",
  mode = "card",
  text = "",
  subtitle = "",
  showText = true,
  interactive = true,
  className = "",
}) {
  const [clickRipples, setClickRipples] = useState([]);
  const [boostCount, setBoostCount] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const containerRef = useRef(null);

  // Enterprise status cycle tips (shown if custom text is not provided or in fullscreen)
  const defaultTips = [
    "Connecting to Staffify database...",
    "Verifying role-based permissions...",
    "Synchronizing workforce records...",
    "Computing deterministic metrics...",
    "Rendering executive workspace...",
  ];

  useEffect(() => {
    if (text) return; // custom text takes priority
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % defaultTips.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [text, defaultTips.length]);

  // Dimension scaling matrix
  const dimensions = {
    sm: { box: 36, mark: 36, text: "text-sm", ring: 52, sub: "text-[9px]" },
    md: { box: 52, mark: 52, text: "text-base", ring: 72, sub: "text-[10px]" },
    lg: { box: 72, mark: 72, text: "text-xl", ring: 98, sub: "text-xs" },
    xl: { box: 96, mark: 96, text: "text-2xl", ring: 130, sub: "text-xs" },
  };

  const dim = dimensions[size] || dimensions.md;

  // Interactive mouse move for 3D tilt
  const handleMouseMove = (e) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);
    setTilt({
      x: Math.max(-12, Math.min(12, -deltaY * 12)),
      y: Math.max(-12, Math.min(12, deltaX * 12)),
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  // Interactive click energy boost
  const handleClick = (e) => {
    if (!interactive) return;
    setBoostCount((prev) => prev + 1);
    const newRipple = {
      id: Date.now() + Math.random(),
      x: e.nativeEvent.offsetX || dim.box / 2,
      y: e.nativeEvent.offsetY || dim.box / 2,
    };
    setClickRipples((prev) => [...prev.slice(-4), newRipple]);
    setTimeout(() => {
      setClickRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 800);
  };

  const displayedText = text || defaultTips[tipIndex];

  // Base logo visual
  const logoContent = (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${
          isHovered ? 1.04 : 1
        })`,
        transition: isHovered ? "transform 0.08s ease-out" : "transform 0.4s ease-out",
      }}
      className={`relative flex items-center justify-center select-none ${
        interactive ? "cursor-pointer group" : ""
      }`}
    >
      {/* Dynamic Keyframes Styling */}
      <style>{`
        @keyframes staffifyOrbitSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes staffifyOrbitReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes staffifyPulseGlow {
          0%, 100% {
            filter: drop-shadow(0 4px 10px rgba(0, 82, 204, 0.4));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 6px 20px rgba(0, 199, 230, 0.7));
            transform: scale(1.03);
          }
        }
        @keyframes staffifyStrokeDash1 {
          0% { stroke-dashoffset: 80; opacity: 0.6; }
          50% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: -80; opacity: 0.6; }
        }
        @keyframes staffifyStrokeDash2 {
          0% { stroke-dashoffset: -80; opacity: 0.6; }
          50% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: 80; opacity: 0.6; }
        }
        @keyframes staffifySparkPing {
          0% { transform: scale(0.8); opacity: 0.9; }
          50% { transform: scale(1.6); opacity: 0.3; }
          100% { transform: scale(0.8); opacity: 0.9; }
        }
        @keyframes staffifyShimmerSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        @keyframes staffifyRippleExpand {
          0% { transform: scale(0.4); opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>

      {/* Outer Orbital Ring (Counter-Clockwise) */}
      <div
        className="absolute rounded-full border border-dashed border-[#4C9AFF]/30 pointer-events-none"
        style={{
          width: dim.ring,
          height: dim.ring,
          animation: "staffifyOrbitReverse 14s linear infinite",
        }}
      >
        {/* Orbital particle accent */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#00C7E6] shadow-[0_0_8px_#00C7E6]" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0052CC] shadow-[0_0_6px_#0052CC]" />
      </div>

      {/* Inner Fast Orbital Ring (Clockwise) */}
      <div
        className="absolute rounded-full border border-[#0052CC]/25 pointer-events-none"
        style={{
          width: dim.ring - 12,
          height: dim.ring - 12,
          animation: "staffifyOrbitSpin 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        }}
      >
        <div className="absolute top-0 right-1 w-2 h-2 rounded-full bg-[#4C9AFF] shadow-[0_0_6px_#4C9AFF]" />
      </div>

      {/* Click Interactive Expanding Ripples */}
      {clickRipples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none border-2 border-[#00C7E6]"
          style={{
            width: dim.box * 1.5,
            height: dim.box * 1.5,
            animation: "staffifyRippleExpand 0.75s ease-out forwards",
          }}
        />
      ))}

      {/* Main Staffify Emblem with SVG Path Tracing */}
      <div
        className="relative shrink-0 flex items-center justify-center"
        style={{
          width: dim.box,
          height: dim.box,
          animation: "staffifyPulseGlow 2.8s ease-in-out infinite",
        }}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="staffifyLoaderBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0052CC" />
              <stop offset="60%" stopColor="#0747A6" />
              <stop offset="100%" stopColor="#00388B" />
            </linearGradient>
            <linearGradient id="staffifyLoaderAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00C7E6" />
              <stop offset="100%" stopColor="#4C9AFF" />
            </linearGradient>
            <filter id="staffifyLoaderGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Squircle Background Base */}
          <rect width="40" height="40" rx="11" fill="url(#staffifyLoaderBg)" />
          <rect
            x="0.75"
            y="0.75"
            width="38.5"
            height="38.5"
            rx="10.25"
            stroke="white"
            strokeOpacity="0.22"
            strokeWidth="1.5"
          />

          {/* Background Ambient Upper Glow */}
          <path
            d="M13 18C13 13.58 16.58 10 21 10H23.5C26.54 10 29 12.46 29 15.5C29 18.54 26.54 21 23.5 21H18"
            stroke="#4C9AFF"
            strokeOpacity="0.3"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Upper Synergy Curve (White with animated dash flow) */}
          <path
            d="M13 18C13 13.58 16.58 10 21 10H23.5C26.54 10 29 12.46 29 15.5C29 18.54 26.54 21 23.5 21H18"
            stroke="white"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="22 14"
            style={{ animation: "staffifyStrokeDash1 2.2s linear infinite" }}
          />

          {/* Background Ambient Lower Glow */}
          <path
            d="M27 22C27 26.42 23.42 30 19 30H16.5C13.46 30 11 27.54 11 24.5C11 21.46 13.46 19 16.5 19H22"
            stroke="#00C7E6"
            strokeOpacity="0.35"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Lower Synergy Curve (Cyan / Blue Accent with animated dash flow) */}
          <path
            d="M27 22C27 26.42 23.42 30 19 30H16.5C13.46 30 11 27.54 11 24.5C11 21.46 13.46 19 16.5 19H22"
            stroke="url(#staffifyLoaderAccent)"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="22 14"
            style={{ animation: "staffifyStrokeDash2 2.2s linear infinite" }}
          />

          {/* Expanding Central Synergy Ripple Ring */}
          <circle
            cx="20"
            cy="20"
            r="3.5"
            fill="none"
            stroke="#00C7E6"
            strokeWidth="1"
            style={{
              transformOrigin: "center",
              animation: "staffifySparkPing 1.8s ease-in-out infinite",
            }}
          />

          {/* Center Connection Spark */}
          <circle cx="20" cy="20" r="1.8" fill="#FFFFFF" filter="url(#staffifyLoaderGlow)" />
        </svg>
      </div>

      {/* Boost Badge (if user tapped) */}
      {boostCount > 0 && (
        <span
          className="absolute -top-3 -right-3 px-1.5 py-0.5 rounded-full bg-[#0052CC] text-white text-[9px] font-bold shadow-xs flex items-center gap-0.5 animate-bounce"
          title="Interactive boost tap count"
        >
          <Zap size={9} className="text-[#FFAB00]" />
          +{boostCount}
        </span>
      )}
    </div>
  );

  // Render content according to mode
  if (mode === "fullscreen") {
    return (
      <div className={`fixed inset-0 z-50 bg-[#F4F5F7]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 ${className}`}>
        <div className="flex flex-col items-center max-w-sm text-center space-y-4">
          {logoContent}

          {/* Typography */}
          {showText && (
            <div className="flex flex-col items-center">
              <span className={`font-extrabold tracking-tight text-[#172B4D] ${dim.text}`}>
                Staff<span className="text-[#0052CC]">ify</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-[#6B778C] tracking-wider mt-0.5">
                Enterprise Cloud HRMS
              </span>
            </div>
          )}

          {/* Shimmer Progress Track */}
          <div className="w-48 h-1 bg-[#DFE1E6] rounded-full overflow-hidden relative">
            <div
              className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#0052CC] to-transparent rounded-full"
              style={{ animation: "staffifyShimmerSlide 1.6s ease-in-out infinite" }}
            />
          </div>

          {/* Status Message */}
          <div className="flex flex-col items-center space-y-1">
            <p className="text-xs font-medium text-[#42526E] transition-opacity duration-300">
              {displayedText}
            </p>
            {subtitle ? (
              <p className="text-[10px] text-[#6B778C]">{subtitle}</p>
            ) : (
              <p className="text-[10px] text-[#A5ADBA]">
                {interactive ? "Tip: Hover or tap logo to interact" : "Please hold on..."}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (mode === "page") {
    return (
      <div className={`py-12 px-4 flex flex-col items-center justify-center space-y-3.5 ${className}`}>
        {logoContent}

        {showText && (
          <span className={`font-extrabold tracking-tight text-[#172B4D] ${dim.text}`}>
            Staff<span className="text-[#0052CC]">ify</span>
          </span>
        )}

        <div className="w-36 h-1 bg-[#DFE1E6] rounded-full overflow-hidden relative">
          <div
            className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-[#0052CC] to-transparent rounded-full"
            style={{ animation: "staffifyShimmerSlide 1.5s ease-in-out infinite" }}
          />
        </div>

        <p className="text-xs font-medium text-[#42526E] text-center max-w-xs">{displayedText}</p>
        {subtitle && <p className="text-[10px] text-[#6B778C]">{subtitle}</p>}
      </div>
    );
  }

  // mode === "card" (Default in containers/tables)
  return (
    <div className={`py-8 px-4 flex flex-col items-center justify-center space-y-3 ${className}`}>
      {logoContent}

      {showText && (
        <span className={`font-extrabold tracking-tight text-[#172B4D] ${dim.text}`}>
          Staff<span className="text-[#0052CC]">ify</span>
        </span>
      )}

      {displayedText && (
        <p className="text-xs font-medium text-[#42526E] text-center max-w-xs">{displayedText}</p>
      )}

      {subtitle && <p className="text-[10px] text-[#6B778C] text-center">{subtitle}</p>}
    </div>
  );
}
