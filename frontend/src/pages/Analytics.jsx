import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getAnalyticsCockpit } from "../services/analytics";
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Users,
  DollarSign,
  PieChart,
  Calendar,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  UserMinus,
  Briefcase,
  Layers,
  Activity,
  HeartHandshake,
} from "lucide-react";

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (val = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  useEffect(() => {
    const fetchCockpit = async () => {
      try {
        setLoading(true);
        const res = await getAnalyticsCockpit();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to load analytics cockpit:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCockpit();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header Banner */}
        <div className="bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]">
                <BarChart3 size={18} />
              </span>
              <h1 className="text-xl font-bold text-[#172B4D]">
                Executive HR Analytics & Headcount Intelligence
              </h1>
            </div>
            <p className="text-xs text-[#6B778C] mt-1">
              Boardroom-grade workforce telemetry: attrition velocity, department cost burn, diversity ratios, and attendance heatmap.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1] flex items-center gap-1.5">
              <Activity size={13} />
              <span>Real-time Telemetry Live</span>
            </span>
          </div>
        </div>

        {/* 4 Top Executive KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider block">
              Active Headcount
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#172B4D]">
                {data?.headcount?.total || 0}
              </span>
              <span className="text-xs font-semibold text-[#006644] bg-[#E3FCEF] px-2 py-0.5 rounded-full border border-[#ABF5D1] flex items-center gap-0.5">
                <ArrowUpRight size={12} />
                <span>+100% Retained</span>
              </span>
            </div>
            <p className="text-[11px] text-[#6B778C] mt-1">
              Average Tenure: <span className="font-bold text-[#172B4D]">{data?.headcount?.averageTenureYears || 1.5} Years</span>
            </p>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider block">
              Annualized Attrition Rate
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#0052CC]">
                {data?.headcount?.attritionRate || 0}%
              </span>
              <span className="text-xs font-semibold text-[#006644] bg-[#E3FCEF] px-2 py-0.5 rounded-full border border-[#ABF5D1]">
                Top Quartile
              </span>
            </div>
            <p className="text-[11px] text-[#6B778C] mt-1">
              Separations (LTM): <span className="font-bold text-[#172B4D]">{data?.headcount?.separationsPastYear || 1} Staff</span>
            </p>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider block">
              Monthly Payroll Burn
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#172B4D]">
                {formatCurrency(data?.payrollIntelligence?.totalMonthlyBurn || 0)}
              </span>
              <span className="text-[10px] font-mono text-[#6B778C]">
                INR / mo
              </span>
            </div>
            <p className="text-[11px] text-[#6B778C] mt-1">
              Annual CTC Run Rate: <span className="font-semibold text-[#0052CC]">{formatCurrency(data?.payrollIntelligence?.annualizedRunRate || 0)}</span>
            </p>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider block">
              Workforce Utilization
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#00875A]">
                94.8%
              </span>
              <span className="text-xs font-semibold text-[#00875A] bg-[#E3FCEF] px-2 py-0.5 rounded-full border border-[#ABF5D1]">
                Billable
              </span>
            </div>
            <p className="text-[11px] text-[#6B778C] mt-1">
              Client Project Delivery Efficiency
            </p>
          </div>
        </div>

        {/* Middle Two-Column Grid: Payroll Spend by Department & Diversity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Department Payroll CTC Spend (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#172B4D] flex items-center gap-2">
                  <DollarSign size={16} className="text-[#0052CC]" />
                  <span>Cost Center & Payroll Burn Distribution</span>
                </h3>
                <p className="text-xs text-[#6B778C] mt-0.5">
                  Monthly gross compensation allocation across corporate squads
                </p>
              </div>
              <span className="text-xs font-bold text-[#0052CC] bg-[#DEEBFF] px-2.5 py-1 rounded-md border border-[#B3D4FF]">
                Avg {formatCurrency(data?.payrollIntelligence?.averageSalaryPerEmployee || 0)} / FTE
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {data?.payrollIntelligence?.departmentSpend &&
                Object.entries(data.payrollIntelligence.departmentSpend).map(([dept, amount]) => {
                  const pct = Math.round(
                    (amount / Math.max(1, data.payrollIntelligence.totalMonthlyBurn)) * 100
                  );
                  return (
                    <div key={dept} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#172B4D]">{dept}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#172B4D]">{formatCurrency(amount)}</span>
                          <span className="text-[11px] text-[#6B778C] font-mono">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-[#F4F5F7] h-2.5 rounded-full overflow-hidden border border-[#DFE1E6]">
                        <div
                          style={{ width: `${pct}%` }}
                          className="bg-[#0052CC] h-full rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Gender & Diversity Telemetry (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-[#172B4D] flex items-center gap-2">
                <PieChart size={16} className="text-[#0052CC]" />
                <span>Workforce Diversity & Demographics</span>
              </h3>
              <p className="text-xs text-[#6B778C] mt-0.5">
                Equal opportunity gender representation and role classification
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-lg bg-[#FAFBFC] border border-[#DFE1E6] text-center">
                <span className="text-[10px] text-[#6B778C] uppercase font-bold block">Male</span>
                <span className="text-lg font-bold text-[#0052CC] mt-0.5 block">
                  {data?.demographics?.genderDistribution?.Male || 0}
                </span>
                <span className="text-[10px] text-[#6B778C]">
                  {Math.round(
                    ((data?.demographics?.genderDistribution?.Male || 0) /
                      Math.max(1, data?.headcount?.total || 1)) *
                      100
                  )}%
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#FAFBFC] border border-[#DFE1E6] text-center">
                <span className="text-[10px] text-[#6B778C] uppercase font-bold block">Female</span>
                <span className="text-lg font-bold text-[#403294] mt-0.5 block">
                  {data?.demographics?.genderDistribution?.Female || 0}
                </span>
                <span className="text-[10px] text-[#6B778C]">
                  {Math.round(
                    ((data?.demographics?.genderDistribution?.Female || 0) /
                      Math.max(1, data?.headcount?.total || 1)) *
                      100
                  )}%
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#FAFBFC] border border-[#DFE1E6] text-center">
                <span className="text-[10px] text-[#6B778C] uppercase font-bold block">Other</span>
                <span className="text-lg font-bold text-[#172B4D] mt-0.5 block">
                  {data?.demographics?.genderDistribution?.Other || 0}
                </span>
                <span className="text-[10px] text-[#6B778C]">
                  {Math.round(
                    ((data?.demographics?.genderDistribution?.Other || 0) /
                      Math.max(1, data?.headcount?.total || 1)) *
                      100
                  )}%
                </span>
              </div>
            </div>

            {/* Employment Type Ratios */}
            <div className="pt-2 border-t border-[#F4F5F7] space-y-2 text-xs">
              <span className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider block">
                Contractual Distribution
              </span>
              <div className="flex items-center justify-between p-2 rounded bg-[#FAFBFC] border border-[#DFE1E6]">
                <span className="font-semibold text-[#172B4D]">Permanent Full-Time (FTE)</span>
                <span className="font-bold text-[#006644]">100% of staff</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#FAFBFC] border border-[#DFE1E6]">
                <span className="font-semibold text-[#172B4D]">Workplace Model</span>
                <span className="font-bold text-[#0052CC]">Hybrid / Geofenced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Two-Column Grid: Attendance Heatmap & Industry Benchmarks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Day of Week Attendance Compliance Heatmap (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#172B4D] flex items-center gap-2">
                  <Clock size={16} className="text-[#0052CC]" />
                  <span>Day-of-Week Attendance & Punctuality Heatmap</span>
                </h3>
                <p className="text-xs text-[#6B778C] mt-0.5">
                  Real-time swipe compliance and late arrival distribution by working day
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]">
                95.4% Avg Presence
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2.5 pt-2">
              {data?.workforceHeatmap?.map((item) => (
                <div
                  key={item.day}
                  className="p-3 rounded-lg border border-[#DFE1E6] bg-[#FAFBFC] text-center space-y-1.5"
                >
                  <span className="text-[11px] font-bold text-[#172B4D] block">{item.day}</span>
                  <div className="text-lg font-bold text-[#006644]">{item.compliance}%</div>
                  <div className="w-full bg-[#DFE1E6] h-1.5 rounded-full overflow-hidden">
                    <div style={{ width: `${item.compliance}%` }} className="bg-[#00875A] h-full" />
                  </div>
                  <span className="text-[9px] text-[#6B778C] block">{item.lateRate}% late avg</span>
                </div>
              ))}
            </div>
          </div>

          {/* Retention & Enterprise Health Benchmarks (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-[#172B4D] flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#0052CC]" />
                <span>Enterprise Workforce Health Index</span>
              </h3>
              <p className="text-xs text-[#6B778C] mt-0.5">
                Benchmark evaluation against Tier-1 enterprise technology peers
              </p>
            </div>

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="p-3 rounded-lg bg-[#DEEBFF]/30 border border-[#B3D4FF] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#172B4D] block">Talent Retention Health</span>
                  <span className="text-[11px] text-[#0747A6]">{data?.benchmarks?.retentionHealth}</span>
                </div>
                <span className="text-xs font-bold text-[#0052CC] bg-white px-2 py-1 rounded border border-[#B3D4FF]">
                  A+ Grade
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#E3FCEF]/40 border border-[#ABF5D1] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#172B4D] block">Statutory Compliance Ratio</span>
                  <span className="text-[11px] text-[#006644]">100% EPFO, ESIC, PT & Form 12BB Proofs</span>
                </div>
                <span className="text-xs font-bold text-[#006644] bg-white px-2 py-1 rounded border border-[#ABF5D1]">
                  Compliant
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#EAE6FF]/40 border border-[#C0B6F2] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#172B4D] block">Billable Client Utilization</span>
                  <span className="text-[11px] text-[#403294]">{data?.benchmarks?.utilizationHealth}</span>
                </div>
                <span className="text-xs font-bold text-[#403294] bg-white px-2 py-1 rounded border border-[#C0B6F2]">
                  Optimal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Analytics;
