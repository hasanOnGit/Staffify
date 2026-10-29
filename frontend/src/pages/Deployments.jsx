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
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#172B4D] dark:text-[#F1F5F9] tracking-tight">
            Workforce Deployment Matrix
          </h2>
          <p className="text-xs text-[#6B778C] dark:text-neutral-400">
            Real-time assignment roster mapping contingent workers to client sites under authorized POs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadDeployments}
            className="p-2 text-[#42526E] dark:text-neutral-300 hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] rounded border border-[#DFE1E6] dark:border-[#263042] transition cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] rounded transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus size={14} />
            <span>Deploy Worker</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B778C] dark:text-neutral-400">
              Active Deployments
            </span>
            <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-2">
            {stats.active}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
            Currently on duty
          </span>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B778C] dark:text-neutral-400">
              Total Roster Historic
            </span>
            <Users size={16} className="text-[#0052CC] dark:text-[#579DFF]" />
          </div>
          <p className="text-2xl font-bold text-[#172B4D] dark:text-[#F1F5F9] mt-2">
            {stats.total}
          </p>
          <span className="text-[11px] text-neutral-500">
            All registered placements
          </span>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B778C] dark:text-neutral-400">
              Completed Tours
            </span>
            <CheckCircle2 size={16} className="text-[#0052CC]" />
          </div>
          <p className="text-2xl font-bold text-[#172B4D] dark:text-[#F1F5F9] mt-2">
            {stats.completed}
          </p>
          <span className="text-[11px] text-neutral-500">
            Full-term concluded assignments
          </span>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B778C] dark:text-neutral-400">
              Terminated Early
            </span>
            <XCircle size={16} className="text-[#DE350B]" />
          </div>
          <p className="text-2xl font-bold text-[#DE350B] mt-2">
            {stats.terminated}
          </p>
          <span className="text-[11px] text-rose-500">
            Recalled / Replaced
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 rounded-lg bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B778C] dark:text-neutral-400"
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
          <option value="All">All Deployment Statuses</option>
          <option value="Active">Active Duty</option>
          <option value="Completed">Completed Tour</option>
          <option value="Terminated">Terminated</option>
        </select>
      </div>

      {/* Deployments Table */}
      <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#172B4D] dark:text-[#F1F5F9]">
            <thead className="bg-[#FAFBFC] dark:bg-[#0F131C] border-b border-[#DFE1E6] dark:border-[#263042] text-[10px] uppercase font-bold text-[#6B778C] dark:text-neutral-400 tracking-wider">
              <tr>
                <th className="px-4 py-3">Worker & ID</th>
                <th className="px-4 py-3">Staffing Agency</th>
                <th className="px-4 py-3">Client & Work Site</th>
                <th className="px-4 py-3">PO & Contract</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Billable Rate</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE1E6] dark:divide-[#263042]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-xs text-[#6B778C]">
                    Loading deployment roster...
                  </td>
                </tr>
              ) : deployments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-xs text-[#6B778C]">
                    No worker deployments found. Click "Deploy Worker" to assign.
                  </td>
                </tr>
              ) : (
                deployments.map((d) => (
                  <tr
                    key={d._id}
                    className="hover:bg-[#F4F5F7] dark:hover:bg-[#1C2331] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#172B4D] dark:text-white">
                        {d.workerName}
                      </div>
                      <div className="font-mono text-[10px] text-[#0052CC] dark:text-[#579DFF]">
                        {d.workerId}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[#172B4D] dark:text-neutral-200">
                        {d.vendorName}
                      </div>
                      <div className="text-[10px] font-mono text-[#6B778C] dark:text-neutral-400">
                        {d.vendorId}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#172B4D] dark:text-neutral-200">
                        {d.clientName}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-[#6B778C] dark:text-neutral-400">
                        <MapPin size={11} className="text-[#0052CC]" />
                        <span>{d.siteName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px]">
                      <div className="font-bold text-[#0052CC] dark:text-[#579DFF]">
                        {d.poNumber}
                      </div>
                      <div className="text-[10px] text-[#6B778C] dark:text-neutral-400">
                        {d.contractNumber}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#DEEBFF] text-[#0052CC] dark:bg-[#1C2331] dark:text-[#579DFF]">
                        {d.designation}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-[#172B4D] dark:text-white">
                      ₹{d.billableRate.toLocaleString("en-IN")}/{d.billingUnit?.charAt(0) || "M"}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-[#6B778C] dark:text-neutral-400">
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
                            title="Mark tour completed"
                          >
                            Complete
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(d.deploymentId, "Terminated")}
                            className="px-2 py-0.5 text-[10px] font-semibold text-[#DE350B] hover:bg-[#FFEBE6] dark:hover:bg-rose-950/40 rounded transition"
                            title="Terminate assignment"
                          >
                            Terminate
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#6B778C] dark:text-neutral-400 italic">
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
