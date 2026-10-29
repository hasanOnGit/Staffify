import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  Building2,
  Briefcase,
  MapPin,
  CheckCircle2,
  XCircle,
  FileCheck2,
} from "lucide-react";
import StatusLozenge from "../components/StatusLozenge";
import KpiMetricCard from "../components/KpiMetricCard";
import DeployWorkerModal from "../components/deployments/DeployWorkerModal";
import { deploymentsApi } from "../services/api";
import toast from "react-hot-toast";

function Deployments() {
  const [deployments, setDeployments] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, terminated: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadDeployments();
  }, [statusFilter]);

  const loadDeployments = async () => {
    try {
      setLoading(true);
      const res = await deploymentsApi.getAll({
        search,
        status: statusFilter,
      });
      setDeployments(res.data.data);
      setStats(res.data.stats);
    } catch (err) {
      toast.error("Failed to load deployments: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadDeployments();
  };

  const handleUpdateStatus = async (deploymentId, newStatus) => {
    try {
      await deploymentsApi.updateStatus(deploymentId, { status: newStatus });
      toast.success(`Deployment status updated to ${newStatus}`);
      loadDeployments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#172B4D] dark:text-[#F1F5F9] tracking-tight">
            Work Assignments
          </h2>
          <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
            Assign and manage workers placed at client sites under active contracts and purchase orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadDeployments}
            className="bg-white dark:bg-[#151B26] hover:bg-[#EBECF0] dark:hover:bg-[#1E293B] text-[#172B4D] dark:text-[#F1F5F9] border border-[#DFE1E6] dark:border-[#263042] text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5"
            title="Refresh list"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus size={14} />
            <span>Assign Worker</span>
          </button>
        </div>
      </div>

      {/* Staffify KpiMetricCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiMetricCard
          title="Active Assignments"
          value={stats.active}
          context="Currently working on site"
          badgeText="Active"
          accentColor="#00875A"
          icon={Users}
          iconBg="bg-[#E3FCEF] dark:bg-emerald-950/40"
          iconColor="text-[#00875A] dark:text-emerald-400"
        />

        <KpiMetricCard
          title="Total Assignments"
          value={stats.total}
          context="All registered assignments"
          badgeText="Total"
          accentColor="#0052CC"
          icon={Users}
          iconBg="bg-[#DEEBFF] dark:bg-[#1C2331]"
          iconColor="text-[#0052CC] dark:text-[#579DFF]"
        />

        <KpiMetricCard
          title="Completed Assignments"
          value={stats.completed}
          context="Finished contracts or terms"
          badgeText="Completed"
          accentColor="#579DFF"
          icon={CheckCircle2}
          iconBg="bg-[#DEEBFF] dark:bg-[#1C2331]"
          iconColor="text-[#0052CC] dark:text-[#579DFF]"
        />

        <KpiMetricCard
          title="Ended Early"
          value={stats.terminated}
          context="Recalled or ended early"
          badgeText="Ended"
          accentColor="#DE350B"
          icon={XCircle}
          iconBg="bg-[#FFEBE6] dark:bg-rose-950/40"
          iconColor="text-[#DE350B] dark:text-rose-400"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B778C] dark:text-[#94A3B8]"
          />
          <input
            type="text"
            placeholder="Search worker, ID, site, PO, agency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Terminated">Ended Early</option>
        </select>
      </div>

      {/* Staffify Atlassian Table */}
      <div className="bg-white dark:bg-[#151B26] rounded border border-[#DFE1E6] dark:border-[#263042] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F5F7] dark:bg-[#1C2331] text-[#6B778C] dark:text-[#94A3B8] border-b border-[#DFE1E6] dark:border-[#263042] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Worker & ID</th>
                <th className="px-4 py-3">Staffing Agency</th>
                <th className="px-4 py-3">Client & Work Site</th>
                <th className="px-4 py-3">Budget (PO) & Contract</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Client Rate</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE1E6] dark:divide-[#263042]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-xs text-[#6B778C] dark:text-[#94A3B8]">
                    Loading assignments...
                  </td>
                </tr>
              ) : deployments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-xs text-[#6B778C] dark:text-[#94A3B8]">
                    No worker assignments found. Click "Assign Worker" to create one.
                  </td>
                </tr>
              ) : (
                deployments.map((d) => (
                  <tr
                    key={d._id}
                    className="hover:bg-[#F4F5F7] dark:hover:bg-[#1C2331]/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#172B4D] dark:text-white">
                        {d.workerName}
                      </div>
                      <span className="font-mono text-[10px] text-[#0747A6] dark:text-[#579DFF] font-semibold bg-[#DEEBFF] dark:bg-[#1C2331] px-1.5 py-0.2 rounded border border-[#B3D4FF] dark:border-[#263042] inline-block mt-0.5">
                        {d.workerId}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[#172B4D] dark:text-neutral-200 font-medium">
                        {d.vendorName}
                      </div>
                      <div className="text-[10px] font-mono text-[#6B778C] dark:text-[#94A3B8]">
                        {d.vendorId}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#172B4D] dark:text-neutral-200">
                        {d.clientName}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
                        <MapPin size={11} className="text-[#0052CC]" />
                        <span>{d.siteName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] text-[#0747A6] dark:text-[#579DFF] font-semibold bg-[#DEEBFF] dark:bg-[#1C2331] px-1.5 py-0.2 rounded border border-[#B3D4FF] dark:border-[#263042] inline-block">
                        {d.poNumber}
                      </span>
                      <div className="text-[10px] text-[#6B778C] dark:text-[#94A3B8] font-mono mt-0.5">
                        {d.contractNumber}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusLozenge status={d.designation} size="xs" />
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-[#172B4D] dark:text-white">
                      ₹{d.billableRate.toLocaleString("en-IN")}/{d.billingUnit?.charAt(0) || "M"}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
                      {new Date(d.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusLozenge status={d.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {d.status === "Active" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(d.deploymentId, "Completed")}
                            className="px-2 py-0.5 text-[10px] font-semibold text-[#006644] dark:text-emerald-400 hover:bg-[#E3FCEF] dark:hover:bg-emerald-950/40 rounded transition"
                            title="Mark assignment completed"
                          >
                            Complete
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(d.deploymentId, "Terminated")}
                            className="px-2 py-0.5 text-[10px] font-semibold text-[#DE350B] hover:bg-[#FFEBE6] dark:hover:bg-rose-950/40 rounded transition"
                            title="End assignment"
                          >
                            End Early
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#6B778C] dark:text-[#94A3B8] italic">
                          Closed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <DeployWorkerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadDeployments}
      />
    </div>
  );
}

export default Deployments;
