import React, { useEffect, useState } from "react";
import {
  Briefcase,
  UserPlus,
  Search,
  RefreshCw,
  Building2,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Flame,
  UserCheck,
  ChevronDown,
  XCircle,
  Clock,
  Layers,
  ChevronRight,
} from "lucide-react";
import StatusLozenge from "../components/StatusLozenge";
import KpiMetricCard from "../components/KpiMetricCard";
import CreateRequisitionModal from "../components/requisitions/CreateRequisitionModal";
import AllocateWorkersModal from "../components/requisitions/AllocateWorkersModal";
import { requisitionsApi } from "../services/api";
import { useWorkspace } from "../context/WorkspaceContext";
import toast from "react-hot-toast";

export default function Requisitions() {
  const { isAgencyWorkspace, activeVendorId } = useWorkspace();
  const [requisitions, setRequisitions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    fulfilled: 0,
    critical: 0,
    totalPositionsNeeded: 0,
    totalPositionsFilled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [urgencyFilter, setUrgencyFilter] = useState("All");

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);

  // Selected requisition for viewing assigned workers
  const [expandedReqId, setExpandedReqId] = useState(null);

  useEffect(() => {
    loadRequisitions();
  }, [statusFilter, urgencyFilter, activeVendorId]);

  const loadRequisitions = async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        urgency: urgencyFilter !== "All" ? urgencyFilter : undefined,
      };
      const res = await requisitionsApi.getAll(params);
      setRequisitions(res.data?.data || []);
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      toast.error("Failed to load requisitions: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadRequisitions();
  };

  const handleStatusChange = async (reqId, newStatus) => {
    try {
      await requisitionsApi.updateStatus(reqId, newStatus);
      toast.success(`Job demand updated to ${newStatus}`);
      loadRequisitions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update demand status");
    }
  };

  const handleOpenAllocate = (req) => {
    setSelectedRequisition(req);
    setAllocateModalOpen(true);
  };

  const getUrgencyBadge = (urgency) => {
    if (urgency === "Critical") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#DE350B] bg-[#FFEBE6] dark:bg-[#DE350B]/20 px-2 py-0.5 rounded">
          <Flame size={11} />
          <span>Critical</span>
        </span>
      );
    }
    if (urgency === "High") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#B9770E] bg-[#FFF0B3] dark:bg-[#B9770E]/20 px-2 py-0.5 rounded">
          <AlertTriangle size={11} />
          <span>High Urgency</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#0052CC] bg-[#DEEBFF] dark:bg-[#DEEBFF]/20 px-2 py-0.5 rounded">
        <span>Standard</span>
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#172B4D] dark:text-[#F1F5F9] tracking-tight">
            Hiring Demands & Requisitions
          </h2>
          <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
            Manage client workforce requisitions, monitor hiring fulfillment, and allocate bench workers in 1 click
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadRequisitions}
            className="bg-white dark:bg-[#151B26] hover:bg-[#EBECF0] dark:hover:bg-[#1E293B] text-[#172B4D] dark:text-[#F1F5F9] border border-[#DFE1E6] dark:border-[#263042] text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5"
            title="Refresh list"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus size={14} />
            <span>Post Job Demand</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiMetricCard
          title="Open Demands"
          value={stats.open}
          subtitle={`Out of ${stats.total} total requisitions`}
          icon={Briefcase}
        />
        <KpiMetricCard
          title="Positions Needed"
          value={stats.totalPositionsNeeded}
          subtitle="Total manpower requested by clients"
          icon={Layers}
        />
        <KpiMetricCard
          title="Positions Filled"
          value={stats.totalPositionsFilled}
          subtitle={
            stats.totalPositionsNeeded > 0
              ? `${Math.round((stats.totalPositionsFilled / stats.totalPositionsNeeded) * 100)}% overall fulfillment`
              : "0% fulfillment"
          }
          icon={UserCheck}
        />
        <KpiMetricCard
          title="Critical Urgency"
          value={stats.critical}
          subtitle="Requires immediate bench deployment"
          icon={Flame}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B778C] dark:text-[#94A3B8]"
          />
          <input
            type="text"
            placeholder="Search by job title, client, site, or REQ ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F4F5F7] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#6B778C] dark:text-[#94A3B8]">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-[#F4F5F7] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Fulfilled">Fulfilled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#6B778C] dark:text-[#94A3B8]">
              Urgency:
            </span>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-[#F4F5F7] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
            >
              <option value="All">All Urgencies</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requisitions Data Table */}
      <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F4F5F7] dark:bg-[#151B26] border-b border-[#DFE1E6] dark:border-[#263042] text-[#6B778C] dark:text-[#94A3B8] font-semibold">
                <th className="py-2.5 px-3">Demand ID & Role</th>
                <th className="py-2.5 px-3">Client & Work Site</th>
                <th className="py-2.5 px-3">Category & Urgency</th>
                <th className="py-2.5 px-3">Fulfillment Progress</th>
                <th className="py-2.5 px-3">Commercial Rate</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBECF0] dark:divide-[#263042]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-[#6B778C] dark:text-[#94A3B8]">
                    Loading client job demands...
                  </td>
                </tr>
              ) : requisitions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <Briefcase size={32} className="mx-auto text-[#6B778C] dark:text-[#94A3B8] opacity-50 mb-2" />
                    <p className="text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                      No job demands found
                    </p>
                    <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                      Create a new job demand or reset your search filter.
                    </p>
                  </td>
                </tr>
              ) : (
                requisitions.map((req) => {
                  const required = req.requiredHeadcount || 1;
                  const fulfilled = req.fulfilledHeadcount || 0;
                  const percent = Math.min(100, Math.round((fulfilled / required) * 100));
                  const isFulfilled = fulfilled >= required || req.status === "Fulfilled";
                  const isExpanded = expandedReqId === req.requisitionId;

                  return (
                    <React.Fragment key={req.requisitionId || req._id}>
                      <tr className="hover:bg-[#F4F5F7]/60 dark:hover:bg-[#151B26]/60 transition">
                        {/* ID & Role */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                            {req.jobTitle}
                          </div>
                          <div className="text-[10px] font-mono text-[#0052CC] dark:text-[#579DFF] mt-0.5">
                            {req.requisitionId}
                          </div>
                        </td>

                        {/* Client & Work Site */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-1.5">
                            <Building2 size={12} className="text-[#6B778C] dark:text-[#94A3B8] shrink-0" />
                            <span>{req.clientName}</span>
                          </div>
                          <div className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] flex items-center gap-1.5 mt-0.5">
                            <MapPin size={11} className="text-[#6B778C] shrink-0" />
                            <span>{req.siteName}</span>
                          </div>
                        </td>

                        {/* Category & Urgency */}
                        <td className="py-3 px-3">
                          <div className="text-[11px] font-medium text-[#172B4D] dark:text-[#F1F5F9]">
                            {req.tradeCategory || "General"}
                          </div>
                          <div className="mt-1">
                            {getUrgencyBadge(req.urgency)}
                          </div>
                        </td>

                        {/* Fulfillment Progress */}
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                            <span>
                              {fulfilled} of {required} filled
                            </span>
                            <span className="text-[#6B778C] dark:text-[#94A3B8]">{percent}%</span>
                          </div>
                          <div className="w-full bg-[#EBECF0] dark:bg-[#263042] h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isFulfilled ? "bg-[#00875A]" : percent > 0 ? "bg-[#0052CC]" : "bg-[#B9770E]"
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          {req.assignedWorkers?.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setExpandedReqId(isExpanded ? null : req.requisitionId)}
                              className="text-[10px] font-semibold text-[#0052CC] dark:text-[#579DFF] hover:underline flex items-center gap-0.5 mt-1 cursor-pointer"
                            >
                              <span>{req.assignedWorkers.length} worker(s) assigned</span>
                              <ChevronRight size={10} className={`transform transition ${isExpanded ? "rotate-90" : ""}`} />
                            </button>
                          )}
                        </td>

                        {/* Commercial Rate */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                            INR {Number(req.billingRate || 0).toLocaleString("en-IN")}/{req.billingUnit || "mo"}
                          </div>
                          {req.targetWorkerPay > 0 && (
                            <div className="text-[10px] text-[#00875A] dark:text-[#579DFF] mt-0.5">
                              Pay: INR {Number(req.targetWorkerPay).toLocaleString("en-IN")}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <StatusLozenge status={req.status} />
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isFulfilled && req.status !== "Cancelled" && (
                              <button
                                type="button"
                                onClick={() => handleOpenAllocate(req)}
                                className="bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-[11px] font-semibold px-2.5 py-1 rounded transition cursor-pointer flex items-center gap-1 shadow-xs"
                              >
                                <UserPlus size={12} />
                                <span>Allocate</span>
                              </button>
                            )}

                            {req.status === "Open" && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(req.requisitionId || req._id, "Cancelled")}
                                className="text-[11px] text-[#6B778C] hover:text-[#DE350B] p-1 rounded hover:bg-[#FFEBE6] dark:hover:bg-[#DE350B]/20 transition cursor-pointer"
                                title="Cancel Demand"
                              >
                                <XCircle size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Assigned Workers Preview */}
                      {isExpanded && req.assignedWorkers?.length > 0 && (
                        <tr className="bg-[#FAFBFC] dark:bg-[#151B26]/40 border-b border-[#EBECF0] dark:border-[#263042]">
                          <td colSpan="7" className="py-2.5 px-5">
                            <div className="text-[11px] font-bold text-[#6B778C] dark:text-[#94A3B8] mb-1.5 uppercase tracking-wider">
                              Assigned Workers Under This Demand:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {req.assignedWorkers.map((aw, idx) => (
                                <div
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9]"
                                >
                                  <UserCheck size={12} className="text-[#00875A]" />
                                  <span>{aw.workerName}</span>
                                  <span className="text-[10px] font-mono text-[#6B778C] dark:text-[#94A3B8]">
                                    ({aw.workerId})
                                  </span>
                                  <span className="text-[10px] text-[#0052CC] dark:text-[#579DFF]">
                                    Deployment: {aw.deploymentId}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateRequisitionModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={loadRequisitions}
      />

      <AllocateWorkersModal
        isOpen={allocateModalOpen}
        onClose={() => {
          setAllocateModalOpen(false);
          setSelectedRequisition(null);
        }}
        onSuccess={loadRequisitions}
        requisition={selectedRequisition}
      />
    </div>
  );
}
