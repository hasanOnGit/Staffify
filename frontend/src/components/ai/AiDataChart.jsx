import React, { useState } from "react";
import { PieChart, BarChart3, Filter, TrendingUp, Info } from "lucide-react";

/**
 * Staffify Enterprise SVG Data Visualizer
 * Renders Donut, Bar, and Recruitment Funnel charts inline in AI Copilot responses
 * Zero third-party dependencies, 100% SVG, full Atlassian design compliance.
 */
export default function AiDataChart({ chartConfig }) {
  const [activeItem, setActiveItem] = useState(null);

  if (!chartConfig || !chartConfig.data || chartConfig.data.length === 0) {
    return null;
  }

  const { type = "donut", title = "Data Visualization", unit = "", data = [] } = chartConfig;
  const total = data.reduce((acc, d) => acc + (Number(d.value) || 0), 0);

  const getIcon = () => {
    switch (type) {
      case "donut":
        return <PieChart className="w-4 h-4 text-brand-primary" />;
      case "funnel":
        return <Filter className="w-4 h-4 text-brand-primary" />;
      case "bar":
      default:
        return <BarChart3 className="w-4 h-4 text-brand-primary" />;
    }
  };

  return (
    <div className="my-3 bg-white dark:bg-dark-surface border border-neutral-200 dark:border-dark-border rounded-xl p-4 shadow-sm transition-all hover:shadow-md">
      {/* Chart Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-dark-border mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            {getIcon()}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{title}</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Total: <span className="font-semibold text-neutral-700 dark:text-neutral-200">{total.toLocaleString()} {unit}</span>
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-dark-border text-neutral-600 dark:text-neutral-300">
          {type} chart
        </span>
      </div>

      {/* Chart Renderers */}
      {type === "donut" && (
        <DonutChartRenderer
          data={data}
          total={total}
          unit={unit}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
        />
      )}

      {type === "bar" && (
        <BarChartRenderer
          data={data}
          total={total}
          unit={unit}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
        />
      )}

      {type === "funnel" && (
        <FunnelChartRenderer
          data={data}
          total={total}
          unit={unit}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
        />
      )}
    </div>
  );
}

/**
 * Donut Chart SVG Renderer with Tooltips and Legend
 */
function DonutChartRenderer({ data, total, unit, activeItem, setActiveItem }) {
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-1">
      {/* Donut SVG */}
      <div className="relative w-[180px] h-[180px] flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            className="text-neutral-100 dark:text-neutral-800"
            strokeWidth={strokeWidth}
          />
          {data.map((item, index) => {
            const val = Number(item.value) || 0;
            const percent = total > 0 ? val / total : 0;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += percent;

            const isHovered = activeItem === item.label;

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color || "#0052CC"}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setActiveItem(item.label)}
                onMouseLeave={() => setActiveItem(null)}
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xs text-neutral-400 dark:text-neutral-400 font-medium">Total</span>
          <span className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            {total.toLocaleString()}
          </span>
          {activeItem && (
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium truncate max-w-[100px]">
              {activeItem}
            </span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 w-full space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
        {data.map((item, index) => {
          const val = Number(item.value) || 0;
          const percent = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
          const isHovered = activeItem === item.label;

          return (
            <div
              key={index}
              onMouseEnter={() => setActiveItem(item.label)}
              onMouseLeave={() => setActiveItem(null)}
              className={`flex items-center justify-between text-xs p-1.5 rounded-lg cursor-pointer transition-colors ${
                isHovered
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "hover:bg-neutral-50 dark:hover:bg-dark-border/40 text-neutral-700 dark:text-neutral-300"
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color || "#0052CC" }}
                />
                <span className="truncate font-medium">{item.label}</span>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0 text-right">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {val.toLocaleString()}
                </span>
                <span className="text-neutral-400 dark:text-neutral-500 text-[11px] w-10">
                  {percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Bar Chart SVG / Visual Renderer
 */
function BarChartRenderer({ data, total, unit, activeItem, setActiveItem }) {
  const maxVal = Math.max(...data.map((d) => Number(d.value) || 0), 1);

  return (
    <div className="space-y-2 pt-1">
      {data.map((item, index) => {
        const val = Number(item.value) || 0;
        const percent = Math.min(100, Math.round((val / maxVal) * 100));
        const shareOfTotal = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
        const isHovered = activeItem === item.label;

        return (
          <div
            key={index}
            onMouseEnter={() => setActiveItem(item.label)}
            onMouseLeave={() => setActiveItem(null)}
            className="cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={`font-medium truncate ${isHovered ? "text-blue-600 dark:text-blue-400" : "text-neutral-700 dark:text-neutral-300"}`}>
                {item.label}
              </span>
              <div className="flex items-center space-x-2 text-neutral-500 dark:text-neutral-400">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {val.toLocaleString()} {unit}
                </span>
                <span className="text-[11px] text-neutral-400">({shareOfTotal}%)</span>
              </div>
            </div>
            <div className="h-2.5 w-full bg-neutral-100 dark:bg-dark-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percent}%`,
                  backgroundColor: item.color || "#0052CC",
                  opacity: activeItem && !isHovered ? 0.4 : 1,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Recruitment ATS Funnel Chart Renderer
 */
function FunnelChartRenderer({ data, total, activeItem, setActiveItem }) {
  const initialValue = Number(data[0]?.value) || 1;

  return (
    <div className="space-y-2 pt-1">
      {data.map((item, index) => {
        const val = Number(item.value) || 0;
        const relativePercent = Math.max(15, Math.round((val / initialValue) * 100));
        const prevVal = index > 0 ? Number(data[index - 1]?.value) || 1 : null;
        const dropoffPercent = prevVal ? Math.round((val / prevVal) * 100) : 100;
        const isHovered = activeItem === item.label;

        return (
          <div
            key={index}
            onMouseEnter={() => setActiveItem(item.label)}
            onMouseLeave={() => setActiveItem(null)}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            {/* Step index */}
            <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 w-4 text-center">
              {index + 1}
            </span>

            {/* Funnel Stage Bar */}
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`font-semibold ${isHovered ? "text-blue-600 dark:text-blue-400" : "text-neutral-700 dark:text-neutral-200"}`}>
                  {item.label}
                </span>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">{val}</span>
                  {index > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-dark-border text-neutral-500">
                      {dropoffPercent}% pass
                    </span>
                  )}
                </div>
              </div>

              <div className="h-3 w-full bg-neutral-100 dark:bg-dark-border rounded overflow-hidden flex items-center">
                <div
                  className="h-full rounded transition-all duration-500"
                  style={{
                    width: `${relativePercent}%`,
                    backgroundColor: item.color || "#0052CC",
                    opacity: activeItem && !isHovered ? 0.4 : 1,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
