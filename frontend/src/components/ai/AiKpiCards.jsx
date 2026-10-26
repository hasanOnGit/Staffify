import { TrendingUp, CheckCircle2, AlertCircle, BarChart2 } from "lucide-react";

export default function AiKpiCards({ kpis = [] }) {
  if (!kpis || !kpis.length) return null;

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 my-2.5">
      {kpis.map((kpi, idx) => {
        const isPositive = kpi.changeType === "positive";
        const isWarning = kpi.changeType === "warning";

        return (
          <div
            key={idx}
            className="p-2.5 rounded-md border border-[#DFE1E6] bg-[#FAFBFC] hover:bg-white transition shadow-2xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[#6B778C] text-[10px] font-medium uppercase tracking-wider mb-1">
              <span>{kpi.label}</span>
              {isPositive ? (
                <CheckCircle2 size={12} className="text-[#00875A]" />
              ) : isWarning ? (
                <AlertCircle size={12} className="text-[#FFAB00]" />
              ) : (
                <BarChart2 size={12} className="text-[#0052CC]" />
              )}
            </div>

            <div className="text-base font-bold text-[#172B4D] tracking-tight">
              {kpi.value}
            </div>

            {kpi.change && (
              <div
                className={`text-[10px] font-medium mt-1 flex items-center gap-1 ${
                  isPositive
                    ? "text-[#00875A]"
                    : isWarning
                    ? "text-[#FF8B00]"
                    : "text-[#6B778C]"
                }`}
              >
                {isPositive && <TrendingUp size={10} />}
                <span>{kpi.change}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
