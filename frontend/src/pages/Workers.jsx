import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  UserCheck,
  Clock,
  Briefcase,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import KpiMetricCard from "../components/KpiMetricCard";
import StatusLozenge from "../components/StatusLozenge";
import OnboardWorkerModal from "../components/workers/OnboardWorkerModal";
import WorkerDossierDrawer from "../components/workers/WorkerDossierDrawer";
import { workersApi } from "../services/api";

const TRADE_TABS = ["All", "Security", "IT", "Facilities", "Logistics", "General"];
const STATUS_PILLS = ["All", "Available", "Deployed", "On Leave"];

function Workers() {
  const [workers, setWorkers] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, deployed: 0, onLeave: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTrade, setSelectedTrade] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Drawers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchWorkers();
  }, [selectedTrade, selectedStatus, searchQuery]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await workersApi.getAll({
        tradeCategory: selectedTrade,
        status: selectedStatus,
        search: searchQuery,
      });
      setWorkers(res.data.data || []);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch workers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDossier = (workerId) => {
    setSelectedWorkerId(workerId);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#172B4D] dark:text-white tracking-tight flex items-center gap-2">
            <Users size={20} className="text-[#0052CC] dark:text-[#579DFF]" />
            Worker Talent Bench Directory
          </h1>
          <p className="text-xs text-[#6B778C] dark:text-neutral-400 mt-0.5">
            Maintain ready talent inventory, statutory Aadhaar & PAN KYC compliance, and client-site deployments
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded bg-[#0052CC] hover:bg-[#0747A6] text-white shadow-xs transition shrink-0 cursor-pointer"
        >
          <Plus size={14} />
          <span>Enroll Worker</span>
        </button>
      </div>

      {/* Top Pulse KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <KpiMetricCard
          title="Total Registered Bench"
          value={stats.total}
          subtitle="All skilled talent in database"
          accentColor="#0052CC"
          icon={Users}
        />
        <KpiMetricCard
          title="Available for Deployment"
          value={stats.available}
          subtitle="Ready to dispatch immediately"
          badgeText="Ready"
          badgeType="success"
          accentColor="#00875A"
          icon={UserCheck}
        />
        <KpiMetricCard
          title="Active On-Site"
          value={stats.deployed}
          subtitle="Deployed at client operations"
          badgeText="Active"
          badgeType="neutral"
          accentColor="#579DFF"
          icon={Briefcase}
        />
        <KpiMetricCard
          title="On Leave / Standby"
          value={stats.onLeave}
          subtitle="Temporarily offline"
          badgeText="Reserve"
          badgeType="warning"
          accentColor="#B9770E"
          icon={Clock}
        />
      </div>

      {/* Control Bar: Search & Filter Tabs */}
      <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg p-3 space-y-3 shadow-xs">
        {/* Top Controls: Search and Status Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B778C] dark:text-neutral-400"
            />
            <input
              type="text"
              placeholder="Search by worker name, ID, primary skill, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-[#172B4D] dark:text-white placeholder-[#6B778C] dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:bg-white dark:focus:bg-[#151B26] transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-semibold text-[#6B778C] dark:text-neutral-400 uppercase tracking-wider mr-1">
              Status:
            </span>
            {STATUS_PILLS.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition cursor-pointer ${
                  selectedStatus === st
                    ? "bg-[#0052CC] text-white shadow-xs"
                    : "text-[#42526E] dark:text-neutral-300 hover:bg-[#EBECF0] dark:hover:bg-[#1C2331]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Trade Category Tabs */}
        <div className="pt-2 border-t border-[#DFE1E6] dark:border-[#263042] flex items-center gap-1 overflow-x-auto text-xs">
          <span className="text-[11px] font-semibold text-[#6B778C] dark:text-neutral-400 uppercase tracking-wider mr-2 shrink-0">
            Trade:
          </span>
          {TRADE_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedTrade(tab)}
              className={`px-3 py-1 rounded text-xs font-medium transition shrink-0 cursor-pointer ${
                selectedTrade === tab
                  ? "bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF] font-semibold"
                  : "text-[#42526E] dark:text-neutral-400 hover:text-[#172B4D] dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Workers Data Table */}
      <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAFBFC] dark:bg-[#151B26] border-b border-[#DFE1E6] dark:border-[#263042] text-[#6B778C] dark:text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="px-4 py-2.5">Worker Profile</th>
                <th className="px-4 py-2.5">Trade & Skill</th>
                <th className="px-4 py-2.5">Statutory KYC</th>
                <th className="px-4 py-2.5">Base Rate</th>
                <th className="px-4 py-2.5">Current Placement</th>
                <th className="px-4 py-2.5">Bench Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE1E6] dark:divide-[#263042]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[#6B778C] dark:text-neutral-400">
                    Loading worker bench directory...
                  </td>
                </tr>
              ) : workers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[#6B778C] dark:text-neutral-400">
                    No workers match the selected trade or status criteria.
                  </td>
                </tr>
              ) : (
                workers.map((w) => (
                  <tr
                    key={w._id}
                    onClick={() => handleOpenDossier(w.workerId)}
                    className="hover:bg-[#F4F5F7] dark:hover:bg-[#151B26]/60 transition cursor-pointer"
                  >
                    {/* Worker Profile */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#DEEBFF] dark:bg-[#1C2331] border border-[#B3D4FF] dark:border-[#263042] flex items-center justify-center font-bold text-xs text-[#0052CC] dark:text-[#579DFF] shrink-0">
                          {w.fullName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-[#172B4D] dark:text-white hover:text-[#0052CC] dark:hover:text-[#579DFF] transition">
                            {w.fullName}
                          </div>
                          <div className="text-[11px] font-mono text-[#6B778C] dark:text-neutral-400">
                            {w.workerId} &bull; {w.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Trade & Skill */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#172B4D] dark:text-neutral-200">
                        {w.primarySkill}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-[#1C2331] text-[#42526E] dark:text-neutral-300">
                          {w.tradeCategory}
                        </span>
                        <span className="text-[10px] text-[#6B778C] dark:text-neutral-400">
                          {w.experienceYears} yrs
                        </span>
                      </div>
                    </td>

                    {/* Statutory KYC */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck
                          size={13}
                          className={
                            w.kycDetails?.policeVerificationStatus === "Verified"
                              ? "text-[#00875A]"
                              : "text-[#B9770E]"
                          }
                        />
                        <span className="text-[11px] font-medium text-[#172B4D] dark:text-neutral-200">
                          Police {w.kycDetails?.policeVerificationStatus || "Pending"}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#6B778C] dark:text-neutral-400 font-mono mt-0.5">
                        {w.kycDetails?.aadhaarNumber ? "Aadhaar verified" : "UIDAI pending"}
                      </div>
                    </td>

                    {/* Base Rate */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#172B4D] dark:text-white">
                        Rs {w.wagePerDayOrMonth?.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#6B778C] dark:text-neutral-400">
                        per {w.billingUnit}
                      </div>
                    </td>

                    {/* Current Placement */}
                    <td className="px-4 py-3">
                      {w.status === "Deployed" && w.currentDeployment?.clientName ? (
                        <div>
                          <div className="font-medium text-[#0052CC] dark:text-[#579DFF] truncate max-w-[150px]">
                            {w.currentDeployment.clientName}
                          </div>
                          <div className="text-[10px] text-[#6B778C] dark:text-neutral-400 truncate max-w-[150px]">
                            {w.currentDeployment.siteName}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#00875A] font-medium inline-flex items-center gap-1">
                          <CheckCircle2 size={12} /> Ready on Bench
                        </span>
                      )}
                    </td>

                    {/* Bench Status */}
                    <td className="px-4 py-3">
                      <StatusLozenge status={w.status} />
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDossier(w.workerId);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#0052CC] dark:text-[#579DFF] hover:bg-[#DEEBFF] dark:hover:bg-[#1C2331] rounded transition"
                      >
                        <span>Dossier</span>
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Worker Modal */}
      <OnboardWorkerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchWorkers()}
      />

      {/* Worker Profile Dossier Drawer */}
      <WorkerDossierDrawer
        workerId={selectedWorkerId}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedWorkerId(null);
        }}
      />
    </div>
  );
}

export default Workers;
