import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Briefcase,
  Receipt,
  FileCheck2,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from "lucide-react";
import KpiMetricCard from "../components/KpiMetricCard";
import StatusLozenge from "../components/StatusLozenge";
import { dashboardApi } from "../services/api";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getStats();
      setData(res.data);
    } catch (err) {
      console.error("Failed to load executive dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats || {};
  const atRiskPOs = data?.atRiskPOs || [];
  const recentDeployments = data?.recentDeployments || [];
  const recentInvoices = data?.recentInvoices || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#172B4D] dark:text-white tracking-tight flex items-center gap-2">
            <LayoutDashboard size={20} className="text-[#0052CC] dark:text-[#579DFF]" />
            Executive Command Center
          </h1>
          <p className="text-xs text-[#6B778C] dark:text-neutral-400 mt-0.5">
            Real-time enterprise intelligence across contractor deployments, talent bench, and Purchase Order burn rates
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ERP Live Feed Active
          </span>
        </div>
      </div>

      {/* Top 4 Primary Pulse KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <KpiMetricCard
          title="Active Contractor Placements"
          value={stats.activeDeployments || 0}
          subtitle={`Across ${stats.totalClients || 0} client corporate sites`}
          accentColor="#0052CC"
          icon={Users}
        />
        <KpiMetricCard
          title="Ready Talent on Bench"
          value={stats.benchWorkers || 0}
          subtitle="Available for instant site deployment"
          badgeText="KYC Ready"
          badgeType="success"
          accentColor="#00875A"
          icon={UserCheck}
        />
        <KpiMetricCard
          title="Overall PO Budget Burn"
          value={`${stats.overallPoBurnRate || 0}%`}
          subtitle={`Rs ${(stats.totalPoBurned || 0).toLocaleString()} of Rs ${(stats.totalPoBudget || 0).toLocaleString()}`}
          badgeText={stats.overallPoBurnRate > 75 ? "High Burn" : "Healthy"}
          badgeType={stats.overallPoBurnRate > 75 ? "danger" : "neutral"}
          accentColor={stats.overallPoBurnRate > 75 ? "#DE350B" : "#579DFF"}
          icon={TrendingUp}
        />
        <KpiMetricCard
          title="Pending Receivables"
          value={`Rs ${(stats.pendingReceivables || 0).toLocaleString()}`}
          subtitle={`Total billed volume: Rs ${(stats.totalInvoiced || 0).toLocaleString()}`}
          badgeText="Receivables"
          badgeType="warning"
          accentColor="#B9770E"
          icon={Receipt}
        />
      </div>

      {/* Quick Actions Command Center Bar */}
      <div>
        <h2 className="text-xs font-bold text-[#6B778C] dark:text-neutral-400 uppercase tracking-wider mb-2.5">
          Quick Actions Command Center
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            to="/workers"
            className="p-3.5 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] hover:border-[#0052CC] dark:hover:border-[#579DFF] hover:shadow-xs transition group flex items-start gap-3"
          >
            <div className="p-2 rounded bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF] group-hover:scale-105 transition shrink-0">
              <UserCheck size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-[#172B4D] dark:text-white group-hover:text-[#0052CC] dark:group-hover:text-[#579DFF] transition">
                Onboard Bench Talent
              </h3>
              <p className="text-[11px] text-[#6B778C] dark:text-neutral-400 truncate">
                Verify Aadhaar, PAN & police clearance
              </p>
            </div>
          </Link>

          <Link
            to="/deployments"
            className="p-3.5 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] hover:border-[#0052CC] dark:hover:border-[#579DFF] hover:shadow-xs transition group flex items-start gap-3"
          >
            <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition shrink-0">
              <Users size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-[#172B4D] dark:text-white group-hover:text-[#0052CC] dark:group-hover:text-[#579DFF] transition">
                Deploy Worker to Site
              </h3>
              <p className="text-[11px] text-[#6B778C] dark:text-neutral-400 truncate">
                Assign contractor against approved PO
              </p>
            </div>
          </Link>

          <Link
            to="/muster-roll"
            className="p-3.5 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] hover:border-[#0052CC] dark:hover:border-[#579DFF] hover:shadow-xs transition group flex items-start gap-3"
          >
            <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition shrink-0">
              <CalendarCheck size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-[#172B4D] dark:text-white group-hover:text-[#0052CC] dark:group-hover:text-[#579DFF] transition">
                Record Site Muster Roll
              </h3>
              <p className="text-[11px] text-[#6B778C] dark:text-neutral-400 truncate">
                Log attendance shifts and 1.5x OT hours
              </p>
            </div>
          </Link>

          <Link
            to="/vendor-invoices"
            className="p-3.5 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] hover:border-[#0052CC] dark:hover:border-[#579DFF] hover:shadow-xs transition group flex items-start gap-3"
          >
            <div className="p-2 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition shrink-0">
              <Receipt size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-[#172B4D] dark:text-white group-hover:text-[#0052CC] dark:group-hover:text-[#579DFF] transition">
                Generate Tax Invoice
              </h3>
              <p className="text-[11px] text-[#6B778C] dark:text-neutral-400 truncate">
                Compute GST & trigger PO write-down
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* PO Watchdog: At-Risk & High-Burn Purchase Orders */}
      <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <div>
              <h2 className="text-xs font-bold text-[#172B4D] dark:text-white uppercase tracking-wider">
                Purchase Order Budget Watchdog
              </h2>
              <p className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                Purchase orders approaching financial budget cap (&gt; 60% burn rate or exhausted)
              </p>
            </div>
          </div>
          <Link
            to="/commercials"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0052CC] dark:text-[#579DFF] hover:underline"
          >
            <span>View All POs</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAFBFC] dark:bg-[#151B26] border-b border-[#DFE1E6] dark:border-[#263042] text-[#6B778C] dark:text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="px-4 py-2.5">PO Number</th>
                <th className="px-4 py-2.5">Client Organization</th>
                <th className="px-4 py-2.5">Contract Scope</th>
                <th className="px-4 py-2.5 text-right">Approved Cap</th>
                <th className="px-4 py-2.5 text-right">Utilized Amount</th>
                <th className="px-4 py-2.5 text-right">Runway Left</th>
                <th className="px-4 py-2.5 w-44">Burn Progress</th>
                <th className="px-4 py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE1E6] dark:divide-[#263042]">
              {atRiskPOs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[#6B778C] dark:text-neutral-400">
                    No purchase orders currently in critical threshold (&gt;60% burn).
                  </td>
                </tr>
              ) : (
                atRiskPOs.map((po) => {
                  const isHigh = po.percent >= 80 || po.status === "Exhausted";
                  return (
                    <tr
                      key={po._id}
                      className="hover:bg-[#F4F5F7] dark:hover:bg-[#151B26]/60 transition"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-[#0052CC] dark:text-[#579DFF]">
                        {po.poNumber}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#172B4D] dark:text-white">
                        {po.clientName}
                      </td>
                      <td className="px-4 py-3 text-[#42526E] dark:text-neutral-300 truncate max-w-[200px]">
                        {po.description || po.contractNumber}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-[#172B4D] dark:text-white">
                        Rs {po.poValue?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[#42526E] dark:text-neutral-300">
                        Rs {po.utilizedAmount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-[#00875A] dark:text-emerald-400">
                        Rs {po.remaining?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-[#EBECF0] dark:bg-[#263042] h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isHigh ? "bg-[#DE350B]" : "bg-[#B9770E]"
                              }`}
                              style={{ width: `${Math.min(100, po.percent)}%` }}
                            />
                          </div>
                          <span
                            className={`font-mono font-bold text-[11px] ${
                              isHigh ? "text-[#DE350B]" : "text-[#B9770E]"
                            }`}
                          >
                            {po.percent}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <StatusLozenge status={po.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dual Column Operations Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Recent Manpower Deployments */}
        <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#172B4D] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Users size={14} className="text-[#0052CC] dark:text-[#579DFF]" />
              Recent Placements & Site Movements
            </h3>
            <Link
              to="/deployments"
              className="text-xs font-medium text-[#0052CC] dark:text-[#579DFF] hover:underline"
            >
              View Matrix
            </Link>
          </div>

          <div className="divide-y divide-[#DFE1E6] dark:divide-[#263042] text-xs">
            {recentDeployments.length === 0 ? (
              <div className="p-6 text-center text-[#6B778C] dark:text-neutral-400">
                No recent deployments recorded.
              </div>
            ) : (
              recentDeployments.map((dep) => (
                <div key={dep._id} className="p-3.5 flex items-center justify-between hover:bg-[#FAFBFC] dark:hover:bg-[#151B26]/60 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF] flex items-center justify-center font-bold text-xs shrink-0">
                      {dep.workerName?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-[#172B4D] dark:text-white">
                        {dep.workerName}
                      </div>
                      <div className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                        {dep.designation} &bull; {dep.clientName} ({dep.siteName})
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-[#172B4D] dark:text-white">
                      Rs {dep.billableRate?.toLocaleString()} / {dep.billingUnit}
                    </div>
                    <div className="text-[10px] text-[#6B778C] dark:text-neutral-400 font-mono">
                      PO: {dep.poNumber}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Recent Invoices & Payouts */}
        <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#172B4D] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Receipt size={14} className="text-[#00875A]" />
              Recent Billing Invoices & Payouts
            </h3>
            <Link
              to="/vendor-invoices"
              className="text-xs font-medium text-[#0052CC] dark:text-[#579DFF] hover:underline"
            >
              View Invoices
            </Link>
          </div>

          <div className="divide-y divide-[#DFE1E6] dark:divide-[#263042] text-xs">
            {recentInvoices.length === 0 ? (
              <div className="p-6 text-center text-[#6B778C] dark:text-neutral-400">
                No recent invoices recorded.
              </div>
            ) : (
              recentInvoices.map((inv) => (
                <div key={inv._id} className="p-3.5 flex items-center justify-between hover:bg-[#FAFBFC] dark:hover:bg-[#151B26]/60 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#0052CC] dark:text-[#579DFF]">
                        {inv.invoiceNumber}
                      </span>
                      <StatusLozenge status={inv.status} />
                    </div>
                    <div className="text-[11px] text-[#6B778C] dark:text-neutral-400 mt-0.5">
                      {inv.vendorName} &bull; Period: {inv.billingPeriod?.month} {inv.billingPeriod?.year}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-[#172B4D] dark:text-white">
                      Rs {inv.grandTotal?.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[#6B778C] dark:text-neutral-400">
                      Incl. 18% GST
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
