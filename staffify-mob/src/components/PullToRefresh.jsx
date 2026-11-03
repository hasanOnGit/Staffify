import React, { useState, useRef, useEffect, useCallback } from "react";
import { RotateCw, ArrowDown } from "lucide-react";
import { hapticLight, hapticSuccess } from "../utils/haptics";

const PULL_THRESHOLD = 65; // Distance in px to trigger refresh
const MAX_PULL = 95;

export default function PullToRefresh({ onRefresh, children }) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [passedThreshold, setPassedThreshold] = useState(false);

  const containerRef = useRef(null);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const thresholdHapticFiredRef = useRef(false);

  const handleTouchStart = (e) => {
    if (refreshing) return;
    const container = containerRef.current;
    // Only allow pull-down if already scrolled to top
    if (!container || container.scrollTop > 2) {
      isPullingRef.current = false;
      return;
    }
    startYRef.current = e.touches[0].clientY;
    isPullingRef.current = true;
    thresholdHapticFiredRef.current = false;
  };

  const handleTouchMove = (e) => {
    if (!isPullingRef.current || refreshing) return;
    const container = containerRef.current;
    if (container && container.scrollTop > 2) {
      isPullingRef.current = false;
      setPullY(0);
      return;
    }

    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0) {
      // Apply elastic damping tension
      const dampened = Math.min(MAX_PULL, Math.pow(diff, 0.82));
      setPullY(dampened);

      if (dampened >= PULL_THRESHOLD && !thresholdHapticFiredRef.current) {
        thresholdHapticFiredRef.current = true;
        setPassedThreshold(true);
        hapticLight();
      } else if (dampened < PULL_THRESHOLD && thresholdHapticFiredRef.current) {
        thresholdHapticFiredRef.current = false;
        setPassedThreshold(false);
      }
    } else {
      setPullY(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPullingRef.current || refreshing) return;
    isPullingRef.current = false;

    if (pullY >= PULL_THRESHOLD) {
      setRefreshing(true);
      setPullY(50); // Keep indicator visible during refresh
      hapticSuccess();
      try {
        if (onRefresh) {
          await onRefresh();
        }
      } catch (err) {
        console.warn("Pull-to-refresh action error:", err);
      } finally {
        setTimeout(() => {
          setRefreshing(false);
          setPullY(0);
          setPassedThreshold(false);
        }, 400);
      }
    } else {
      setPullY(0);
      setPassedThreshold(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative overflow-y-auto overscroll-y-contain flex-1 flex flex-col"
    >
      {/* Pull Indicator Banner */}
      <div
        style={{
          height: `${pullY}px`,
          opacity: pullY > 10 ? Math.min(1, pullY / 40) : 0,
          transition: isPullingRef.current ? "none" : "all 0.25s cubic-bezier(0.25, 1, 0.4, 1)",
        }}
        className="flex items-center justify-center overflow-hidden shrink-0 pointer-events-none select-none"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] shadow-sm text-xs font-semibold text-[#0052CC] dark:text-[#579DFF]">
          {refreshing ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin text-[#0052CC] dark:text-[#579DFF]" />
              <span className="text-[11px] text-[#172B4D] dark:text-slate-200">Updating workspace...</span>
            </>
          ) : passedThreshold ? (
            <>
              <RotateCw className="w-3.5 h-3.5 text-[#00875A] transition-transform rotate-180" />
              <span className="text-[11px] text-[#00875A] font-bold">Release to refresh</span>
            </>
          ) : (
            <>
              <ArrowDown className="w-3.5 h-3.5 text-[#6B778C] transition-transform" />
              <span className="text-[11px] text-[#6B778C] dark:text-slate-400">Pull down to refresh</span>
            </>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
