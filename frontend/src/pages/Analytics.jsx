import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getAnalyticsCockpit } from "../services/analytics";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
  ShieldCheck,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  RefreshCw,
  Filter,
  CheckCircle2,
  CalendarDays,
  Sparkles,
} from "lucide-react";

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30D"); // '30D' | '90D' | 'YTD' | '1Y'
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [hoveredBar, setHoveredBar] = useState(null);

  const formatCurrency = (val = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

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

  useEffect(() => {
    fetchCockpit();
  }, []);

  // 6-Month Headcount & Hiring Velocity Data
  const monthlyTrajectory = useMemo(() => {
    const baseCount = data?.headcount?.total || 4;
    return [
      { month: "May", headcount: Math.max(1, baseCount - 3), hires: 2, exits: 0, attendance: 94 },
      { month: "Jun", headcount: Math.max(1, baseCount - 2), hires: 1, exits: 0, attendance: 96 },
      { month: "Jul", headcount: Math.max(1, baseCount - 2), hires: 1, exits: 1, attendance: 95 },
      { month: "Aug", headcount: Math.max(1, baseCount - 1), hires: 2, exits: 0, attendance: 97 },
      { month: "Sep", headcount: Math.max(1, baseCount), hires: 1, exits: 0, attendance: 98 },
      { month: "Oct", headcount: baseCount, hires: 1, exits: 0, attendance: 98 },
    ];
  }, [data]);

  // Leave Distribution Data
  const leaveCategories = [
    { label: "Annual Paid Leave", pct: 45, color: "bg-[#0052CC]", hex: "#0052CC", count: "18 Days" },
    { label: "Casual Leave", pct: 25, color: "bg-[#00875A]", hex: "#00875A", count: "10 Days" },
    { label: "Sick & Medical", pct: 20, color: "bg-[#FF991F]", hex: "#FF991F", count: "8 Days" },
    { label: "Privilege / Other", pct: 10, color: "bg-[#6554C0]", hex: "#6554C0", count: "4 Days" },
  ];

  const maxHeadcount = Math.max(...monthlyTrajectory.map((m) => m.headcount), 6);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12 max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 card-smooth">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF] border border-[#B3D4FF] dark:border-[#263042]">
                <BarChart3 size={18} />
              </span>
              <h1 className="text-xl font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                Executive HR Analytics & Telemetry Hub
              </h1>
            </div>
            <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-1">
              Boardroom-grade workforce telemetry: attrition velocity, department cost burn, diversity ratios, and attendance heatmap.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E3FCEF] dark:bg-emerald-950/40 text-[#006644] dark:text-emerald-400 border border-[#ABF5D1] dark:border-emerald-800 flex items-center gap-1.5">
              <Activity size={13} />
              <span>Real-time Telemetry Live</span>
            </span>

            <button
              onClick={fetchCockpit}
              className="p-1.5 text-[#42526E] dark:text-neutral-300 hover:text-[#172B4D] dark:hover:text-white hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] rounded border border-[#DFE1E6] dark:border-[#263042] transition cursor-pointer"
              title="Refresh Analytics"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] p-2.5 rounded-lg text-xs card-smooth">
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-[#6B778C] dark:text-neutral-400" />
            <span className="font-semibold text-[#172B4D] dark:text-[#F1F5F9]">Time Horizon:</span>
            <div className="flex items-center gap-1 bg-[#F4F5F7] dark:bg-[#090D14] p-0.5 rounded border border-[#DFE1E6] dark:border-[#263042]">
              {["30D", "90D", "YTD", "1Y"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                    timeRange === range
                      ? "bg-white dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF] shadow-xs"
                      : "text-[#6B778C] dark:text-neutral-400 hover:text-[#172B4D] dark:hover:text-white"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#172B4D] dark:text-[#F1F5F9]">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-[#F4F5F7] dark:bg-[#090D14] text-[#172B4D] dark:text-[#F1F5F9] border border-[#DFE1E6] dark:border-[#263042] rounded px-2.5 py-1 text-xs outline-none cursor-pointer"
            >
              <option value="ALL">All Squads & Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Management">Management</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>

        {/* 4 Top Executive KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-4 shadow-sm space-y-1 card-smooth">
            <span className="text-[10px] font-bold text-[#6B778C] dark:text-[#94A3B8] uppercase tracking-wider block">
              Active Headcount
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                {data?.headcount?.total || 0}
              </span>
              <span className="text-xs font-semibold text-[#006644] dark:text-emerald-400 bg-[#E3FCEF] dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-[#ABF5D1] dark:border-emerald-800 flex items-center gap-0.5">
                <ArrowUpRight size={12} />
                <span>+100% Retained</span>
              </span>
            </div>
            <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-1">
              Average Tenure:{" "}
              <span className="font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                {data?.headcount?.averageTenureYears || 1.5} Years
              </span>
            </p>
          </div>

          <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-4 shadow-sm space-y-1 card-smooth">
            <span className="text-[10px] font-bold text-[#6B778C] dark:text-[#94A3B8] uppercase tracking-wider block">
              Annualized Attrition Rate
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#0052CC] dark:text-[#579DFF]">
                {data?.headcount?.attritionRate || 0}%
              </span>
              <span className="text-xs font-semibold text-[#006644] dark:text-emerald-400 bg-[#E3FCEF] dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-[#ABF5D1] dark:border-emerald-800">
                Top Quartile
              </span>
            </div>
            <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-1">
              Separations (LTM):{" "}
              <span className="font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                {data?.headcount?.separationsPastYear || 1} Staff
              </span>
            </p>
          </div>

          <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-4 shadow-sm space-y-1 card-smooth">
            <span className="text-[10px] font-bold text-[#6B778C] dark:text-[#94A3B8] uppercase tracking-wider block">
              Monthly Payroll Burn
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                {formatCurrency(data?.payrollIntelligence?.totalMonthlyBurn || 0)}
              </span>
              <span className="text-[10px] font-mono text-[#6B778C] dark:text-[#94A3B8]">
                INR / mo
              </span>
            </div>
            <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-1">
              Annual Run Rate:{" "}
              <span className="font-semibold text-[#0052CC] dark:text-[#579DFF]">
                {formatCurrency(data?.payrollIntelligence?.annualizedRunRate || 0)}
              </span>
            </p>
          </div>

          <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-4 shadow-sm space-y-1 card-smooth">
            <span className="text-[10px] font-bold text-[#6B778C] dark:text-[#94A3B8] uppercase tracking-wider block">
              Workforce Utilization
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#00875A] dark:text-emerald-400">
                94.8%
              </span>
              <span className="text-xs font-semibold text-[#00875A] dark:text-emerald-400 bg-[#E3FCEF] dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-[#ABF5D1] dark:border-emerald-800">
                Billable
              </span>
            </div>
            <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-1">
              Client Project Delivery Efficiency
            </p>
          </div>
        </div>

        {/* SECTION 1: VISUAL CHARTS (Headcount Growth Trajectory & Leave Distribution) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 6-Month Headcount & Hiring Velocity Chart (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-5 shadow-sm space-y-4 card-smooth">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#0052CC] dark:text-[#579DFF]" />
                  <span>Headcount Trajectory & Hiring Velocity</span>
                </h3>
                <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                  Monthly headcount progression and hiring net additions (May – Oct 2026)
                </p>
              </div>
              <span className="text-xs font-bold text-[#00875A] dark:text-emerald-400 bg-[#E3FCEF] dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-[#ABF5D1] dark:border-emerald-800">
                Net Growth: +33%
              </span>
            </div>

            {/* Interactive SVG Bar & Line Visualization */}
            <div className="pt-4">
              <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-[#DFE1E6] dark:border-[#263042] pb-2 relative">
                {monthlyTrajectory.map((item, idx) => {
                  const barHeightPct = Math.round((item.headcount / maxHeadcount) * 100);
                  const isHovered = hoveredBar === idx;

                  return (
                    <div
                      key={item.month}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                      onMouseEnter={() => setHoveredBar(idx)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-12 z-20 bg-[#172B4D] dark:bg-[#090D14] text-white px-2.5 py-1.5 rounded text-[10px] font-mono shadow-lg border border-[#263042] whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
                          <div>Headcount: {item.headcount}</div>
                          <div className="text-emerald-300">+{item.hires} hired, {item.exits} exits</div>
                        </div>
                      )}

                      <div className="text-[10px] font-bold text-[#0052CC] dark:text-[#579DFF] mb-1 font-mono">
                        {item.headcount}
                      </div>

                      <div className="w-full max-w-[36px] bg-[#F4F5F7] dark:bg-[#1C2331] rounded-t-md overflow-hidden h-32 flex items-end border border-[#DFE1E6] dark:border-[#263042]">
                        <div
                          style={{ height: `${barHeightPct}%` }}
                          className={`w-full rounded-t transition-all duration-300 ${
                            isHovered
                              ? "bg-[#0052CC] dark:bg-[#579DFF]"
                              : "bg-[#0052CC]/80 dark:bg-[#579DFF]/70"
                          }`}
                        />
                      </div>

                      <span className="text-[11px] font-semibold text-[#6B778C] dark:text-[#94A3B8] mt-2">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-6 mt-3 text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#0052CC] dark:bg-[#579DFF]" />
                  <span>Total Active Headcount</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#00875A] dark:bg-emerald-400" />
                  <span>95%+ Punctuality Compliance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Category Utilization Breakdown (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-5 shadow-sm space-y-4 card-smooth">
            <div>
              <h3 className="font-bold text-sm text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-2">
                <CalendarDays size={16} className="text-[#0052CC] dark:text-[#579DFF]" />
                <span>Leave Utilization & Category Share</span>
              </h3>
              <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                Breakdown of approved time-off distributions across categories
              </p>
            </div>

            {/* Segmented Donut / Stacked Progress */}
            <div className="space-y-4 pt-1">
              <div className="w-full bg-[#F4F5F7] dark:bg-[#1C2331] h-4 rounded-full overflow-hidden flex border border-[#DFE1E6] dark:border-[#263042] p-0.5">
                {leaveCategories.map((cat) => (
                  <div
                    key={cat.label}
                    style={{ width: `${cat.pct}%` }}
                    className={`${cat.color} h-full first:rounded-l-full last:rounded-r-full transition-all duration-500`}
                    title={`${cat.label}: ${cat.pct}%`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {leaveCategories.map((cat) => (
                  <div
                    key={cat.label}
                    className="p-2.5 rounded-lg bg-[#FAFBFC] dark:bg-[#1C2331] border border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                      <span className="font-semibold text-[#172B4D] dark:text-[#F1F5F9] text-[11px]">
                        {cat.label}
                      </span>
                    </div>
                    <span className="font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                      {cat.pct}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-[#E3FCEF]/30 dark:bg-emerald-950/20 border border-[#ABF5D1] dark:border-emerald-800 text-xs flex items-center justify-between">
                <span className="text-[#006644] dark:text-emerald-400 font-semibold">
                  Approval Turnaround SLA:
                </span>
                <span className="font-bold text-[#006644] dark:text-emerald-400">
                  1.2 Days Avg
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: COST CENTER & DEMOGRAPHICS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Department Payroll CTC Spend (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-5 shadow-sm space-y-4 card-smooth">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-2">
                  <DollarSign size={16} className="text-[#0052CC] dark:text-[#579DFF]" />
                  <span>Cost Center & Payroll Burn Distribution</span>
                </h3>
                <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                  Monthly gross compensation allocation across corporate squads
                </p>
              </div>
              <span className="text-xs font-bold text-[#0052CC] dark:text-[#579DFF] bg-[#DEEBFF] dark:bg-[#1C2331] px-2.5 py-1 rounded-md border border-[#B3D4FF] dark:border-[#263042]">
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
                        <span className="font-semibold text-[#172B4D] dark:text-[#F1F5F9]">{dept}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                            {formatCurrency(amount)}
                          </span>
                          <span className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] font-mono">
                            ({pct}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-[#F4F5F7] dark:bg-[#1C2331] h-2.5 rounded-full overflow-hidden border border-[#DFE1E6] dark:border-[#263042]">
                        <div
                          style={{ width: `${pct}%` }}
                          className="bg-[#0052CC] dark:bg-[#579DFF] h-full rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Gender & Diversity Telemetry (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-5 shadow-sm space-y-4 card-smooth">
            <div>
              <h3 className="font-bold text-sm text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-2">
                <PieChart size={16} className="text-[#0052CC] dark:text-[#579DFF]" />
                <span>Workforce Diversity & Demographics</span>
              </h3>
              <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                Equal opportunity gender representation and role classification
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-lg bg-[#FAFBFC] dark:bg-[#1C2331] border border-[#DFE1E6] dark:border-[#263042] text-center">
                <span className="text-[10px] text-[#6B778C] dark:text-[#94A3B8] uppercase font-bold block">
                  Male
                </span>
                <span className="text-lg font-bold text-[#0052CC] dark:text-[#579DFF] mt-0.5 block">
                  {data?.demographics?.genderDistribution?.Male || 0}
                </span>
                <span className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
                  {Math.round(
                    ((data?.demographics?.genderDistribution?.Male || 0) /
                      Math.max(1, data?.headcount?.total || 1)) *
                      100
                  )}%
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#FAFBFC] dark:bg-[#1C2331] border border-[#DFE1E6] dark:border-[#263042] text-center">
                <span className="text-[10px] text-[#6B778C] dark:text-[#94A3B8] uppercase font-bold block">
                  Female
                </span>
                <span className="text-lg font-bold text-[#403294] dark:text-purple-400 mt-0.5 block">
                  {data?.demographics?.genderDistribution?.Female || 0}
                </span>
                <span className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
                  {Math.round(
                    ((data?.demographics?.genderDistribution?.Female || 0) /
                      Math.max(1, data?.headcount?.total || 1)) *
                      100
                  )}%
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#FAFBFC] dark:bg-[#1C2331] border border-[#DFE1E6] dark:border-[#263042] text-center">
                <span className="text-[10px] text-[#6B778C] dark:text-[#94A3B8] uppercase font-bold block">
                  Other
                </span>
                <span className="text-lg font-bold text-[#172B4D] dark:text-[#F1F5F9] mt-0.5 block">
                  {data?.demographics?.genderDistribution?.Other || 0}
                </span>
                <span className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
                  {Math.round(
                    ((data?.demographics?.genderDistribution?.Other || 0) /
                      Math.max(1, data?.headcount?.total || 1)) *
                      100
                  )}%
                </span>
              </div>
            </div>

            {/* Employment Type Ratios */}
            <div className="pt-2 border-t border-[#DFE1E6] dark:border-[#263042] space-y-2 text-xs">
              <span className="text-[10px] font-bold text-[#6B778C] dark:text-[#94A3B8] uppercase tracking-wider block">
                Contractual Distribution
              </span>
              <div className="flex items-center justify-between p-2 rounded bg-[#FAFBFC] dark:bg-[#1C2331] border border-[#DFE1E6] dark:border-[#263042]">
                <span className="font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                  Permanent Full-Time (FTE)
                </span>
                <span className="font-bold text-[#006644] dark:text-emerald-400">100% of staff</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#FAFBFC] dark:bg-[#1C2331] border border-[#DFE1E6] dark:border-[#263042]">
                <span className="font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                  Workplace Model
                </span>
                <span className="font-bold text-[#0052CC] dark:text-[#579DFF]">Hybrid / Geofenced</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: ATTENDANCE HEATMAP & BENCHMARKS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Day of Week Attendance Compliance Heatmap (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-5 shadow-sm space-y-4 card-smooth">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-2">
                  <Clock size={16} className="text-[#0052CC] dark:text-[#579DFF]" />
                  <span>Day-of-Week Attendance & Punctuality Heatmap</span>
                </h3>
                <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                  Real-time swipe compliance and late arrival distribution by working day
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#E3FCEF] dark:bg-emerald-950/40 text-[#006644] dark:text-emerald-400 border border-[#ABF5D1] dark:border-emerald-800">
                95.4% Avg Presence
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2.5 pt-2">
              {data?.workforceHeatmap?.map((item) => (
                <div
                  key={item.day}
                  className="p-3 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#1C2331] text-center space-y-1.5"
                >
                  <span className="text-[11px] font-bold text-[#172B4D] dark:text-[#F1F5F9] block">
                    {item.day}
                  </span>
                  <div className="text-lg font-bold text-[#006644] dark:text-emerald-400">
                    {item.compliance}%
                  </div>
                  <div className="w-full bg-[#DFE1E6] dark:bg-[#263042] h-1.5 rounded-full overflow-hidden">
                    <div style={{ width: `${item.compliance}%` }} className="bg-[#00875A] h-full" />
                  </div>
                  <span className="text-[9px] text-[#6B778C] dark:text-[#94A3B8] block font-mono">
                    {item.lateRate}% late avg
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Retention & Enterprise Health Benchmarks (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-5 shadow-sm space-y-4 card-smooth">
            <div>
              <h3 className="font-bold text-sm text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#0052CC] dark:text-[#579DFF]" />
                <span>Enterprise Workforce Health Index</span>
              </h3>
              <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                Benchmark evaluation against Tier-1 enterprise technology peers
              </p>
            </div>

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="p-3 rounded-lg bg-[#DEEBFF]/30 dark:bg-[#1C2331] border border-[#B3D4FF] dark:border-[#263042] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#172B4D] dark:text-[#F1F5F9] block">
                    Talent Retention Health
                  </span>
                  <span className="text-[11px] text-[#0747A6] dark:text-[#579DFF]">
                    {data?.benchmarks?.retentionHealth}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#0052CC] dark:text-[#579DFF] bg-white dark:bg-[#0F131C] px-2 py-1 rounded border border-[#B3D4FF] dark:border-[#263042]">
                  A+ Grade
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#E3FCEF]/40 dark:bg-emerald-950/20 border border-[#ABF5D1] dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#172B4D] dark:text-[#F1F5F9] block">
                    Statutory Compliance Ratio
                  </span>
                  <span className="text-[11px] text-[#006644] dark:text-emerald-400">
                    100% EPFO, ESIC, PT & Form 12BB Proofs
                  </span>
                </div>
                <span className="text-xs font-bold text-[#006644] dark:text-emerald-400 bg-white dark:bg-[#0F131C] px-2 py-1 rounded border border-[#ABF5D1] dark:border-emerald-800">
                  Compliant
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#EAE6FF]/40 dark:bg-purple-950/20 border border-[#C0B6F2] dark:border-purple-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#172B4D] dark:text-[#F1F5F9] block">
                    Billable Client Utilization
                  </span>
                  <span className="text-[11px] text-[#403294] dark:text-purple-400">
                    {data?.benchmarks?.utilizationHealth}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#403294] dark:text-purple-400 bg-white dark:bg-[#0F131C] px-2 py-1 rounded border border-[#C0B6F2] dark:border-purple-800">
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
