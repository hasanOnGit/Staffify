import { useEffect, useState, useMemo, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getAuditLogs } from "../services/auditLog";
import { exportToCsv } from "../utils/csvExporter";
import StaffifyLoader from "../components/StaffifyLoader";
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Eye,
  X,
  FileText,
  DollarSign,
  UserCheck,
  Cpu,
} from "lucide-react";
import toast from "react-hot-toast";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      toast.error("Unable to load audit logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        log.logId?.toLowerCase().includes(q) ||
        log.actorName?.toLowerCase().includes(q) ||
        log.action?.toLowerCase().includes(q) ||
        log.targetName?.toLowerCase().includes(q) ||
        log.ipAddress?.includes(q);

      const matchesCategory =
        activeCategory === "All" || log.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [logs, searchQuery, activeCategory]);

  // KPI Metrics
  const metrics = useMemo(() => {
    return {
      total: logs.length,
      security: logs.filter((l) => l.category === "Access & Security").length,
      payroll: logs.filter((l) => l.category === "Payroll & Statutory").length,
      ai: logs.filter((l) => l.category === "AI Studio").length,
    };
  }, [logs]);

  const handleExportCsv = () => {
    exportToCsv({
      filename: `Staffify_Enterprise_Audit_Trail_${new Date().toISOString().split("T")[0]}.csv`,
      headers: [
        { key: "logId", label: "Audit Event ID" },
        {
          key: "timestamp",
          label: "Timestamp (UTC)",
          accessor: (item) => new Date(item.createdAt || item.timestamp).toISOString(),
        },
        { key: "action", label: "Action Taken" },
        { key: "category", label: "Category" },
        { key: "actorName", label: "Actor Name" },
        { key: "actorRole", label: "Actor Role" },
        { key: "targetEntity", label: "Target Entity" },
        { key: "targetName", label: "Target Resource" },
        { key: "ipAddress", label: "IP Address" },
        { key: "status", label: "Execution Status" },
      ],
      data: filteredLogs,
    });
  };

  const getCategoryBadge = (category = "") => {
    switch (category) {
      case "Access & Security":
        return "bg-[#DEEBFF] text-[#0052CC] border-[#B3D4FF] dark:bg-[#0747A6]/30 dark:text-[#93C5FD] dark:border-[#1E3A8A]";
      case "Payroll & Statutory":
        return "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1] dark:bg-[#00875A]/20 dark:text-[#6EE7B7] dark:border-[#065F46]";
      case "AI Studio":
        return "bg-[#EAE6FF] text-[#403294] border-[#C0B6F2] dark:bg-[#5243AA]/30 dark:text-[#C4B5FD] dark:border-[#3730A3]";
      case "Human Resources":
        return "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380] dark:bg-[#FFAB00]/20 dark:text-[#FDE68A] dark:border-[#92400E]";
      default:
        return "bg-[#F4F5F7] text-[#172B4D] border-[#DFE1E6] dark:bg-[#1E293B] dark:text-[#E2E8F0] dark:border-[#334155]";
    }
  };

  const getStatusBadge = (status = "SUCCESS") => {
    if (status === "WARNING") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF8B00] bg-[#FFF0B3] dark:bg-[#FFAB00]/20 dark:text-[#FDE68A] border border-[#FFE380] dark:border-[#92400E] px-2 py-0.5 rounded">
          <AlertTriangle size={11} />
          <span>Warning</span>
        </span>
      );
    }
    if (status === "DENIED" || status === "FAILED") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#DE350B] bg-[#FFEBE6] dark:bg-[#DE350B]/20 dark:text-[#FCA5A5] border border-[#FFBDAD] dark:border-[#991B1B] px-2 py-0.5 rounded">
          <XCircle size={11} />
          <span>Denied</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#006644] bg-[#E3FCEF] dark:bg-[#00875A]/20 dark:text-[#6EE7B7] border border-[#ABF5D1] dark:border-[#065F46] px-2 py-0.5 rounded">
        <CheckCircle2 size={11} />
        <span>Verified</span>
      </span>
    );
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#172B4D] dark:text-[#F1F5F9]">
              Enterprise Audit & Governance Trail
            </h1>
            <span className="text-[11px] bg-[#DEEBFF] dark:bg-[#0747A6]/30 text-[#0747A6] dark:text-[#93C5FD] font-semibold px-2 py-0.5 rounded border border-[#B3D4FF] dark:border-[#1E3A8A]">
              SOC-2 / ISO 27001
            </span>
          </div>
          <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
            Immutable chronological ledger of administrative mutations, salary revisions, and security events
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchLogs}
            className="p-1.5 border border-[#DFE1E6] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:bg-[#F4F5F7] dark:hover:bg-[#334155] rounded text-[#6B778C] dark:text-[#94A3B8] transition cursor-pointer"
            title="Refresh Audit Records"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-1.5 bg-white dark:bg-[#1E293B] hover:bg-[#EBECF0] dark:hover:bg-[#334155] text-[#172B4D] dark:text-[#F1F5F9] border border-[#DFE1E6] dark:border-[#334155] text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer disabled:opacity-50"
            title="Export complete audit trail to CSV"
          >
            <Download size={13} className="text-[#0052CC] dark:text-[#38BDF8]" />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-3.5">
          <div className="flex items-center justify-between text-[#6B778C] dark:text-[#94A3B8] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Audit Events</span>
            <ShieldCheck size={16} className="text-[#0052CC] dark:text-[#38BDF8]" />
          </div>
          <p className="text-2xl font-bold text-[#172B4D] dark:text-[#F1F5F9]">{metrics.total}</p>
        </div>

        <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-3.5">
          <div className="flex items-center justify-between text-[#6B778C] dark:text-[#94A3B8] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Security & Geofence</span>
            <UserCheck size={16} className="text-[#00875A] dark:text-[#34D399]" />
          </div>
          <p className="text-2xl font-bold text-[#172B4D] dark:text-[#F1F5F9]">{metrics.security}</p>
        </div>

        <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-3.5">
          <div className="flex items-center justify-between text-[#6B778C] dark:text-[#94A3B8] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Payroll Modifications</span>
            <DollarSign size={16} className="text-[#FFAB00] dark:text-[#FBBF24]" />
          </div>
          <p className="text-2xl font-bold text-[#172B4D] dark:text-[#F1F5F9]">{metrics.payroll}</p>
        </div>

        <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-3.5">
          <div className="flex items-center justify-between text-[#6B778C] dark:text-[#94A3B8] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Document Letters</span>
            <Cpu size={16} className="text-[#6554C0] dark:text-[#A78BFA]" />
          </div>
          <p className="text-2xl font-bold text-[#172B4D] dark:text-[#F1F5F9]">{metrics.ai}</p>
        </div>
      </div>

      {/* Smart Filter Presets ("1-Click Quick Views") */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-3.5 text-xs font-medium">
        {[
          { id: "All", label: "All Audit Trails" },
          { id: "Access & Security", label: "Access & Security" },
          { id: "Payroll & Statutory", label: "Payroll & Compensation" },
          { id: "Human Resources", label: "Leaves & Squads" },
          { id: "AI Studio", label: "AI Document Studio" },
          { id: "Governance", label: "Policy Governance" },
        ].map((pill) => {
          const isActive = activeCategory === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => setActiveCategory(pill.id)}
              className={`px-3 py-1 rounded-full border transition cursor-pointer whitespace-nowrap text-xs ${
                isActive
                  ? "bg-[#0052CC] text-white border-[#0052CC] font-semibold shadow-2xs"
                  : "bg-white dark:bg-[#151B26] text-[#6B778C] dark:text-[#94A3B8] border-[#DFE1E6] dark:border-[#263042] hover:bg-[#F4F5F7] dark:hover:bg-[#1E293B]"
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Search Toolbar */}
      <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded p-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-[#6B778C] dark:text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by log ID, actor, resource name, or IP address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-[#DFE1E6] dark:border-[#263042] rounded text-xs text-[#172B4D] dark:text-[#F1F5F9] bg-white dark:bg-[#0D121B] focus:outline-none focus:border-[#0052CC]"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-8 text-center shadow-xs">
          <StaffifyLoader mode="card" size="md" text="Loading enterprise audit trail and governance log..." />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white dark:bg-[#151B26] rounded border border-[#DFE1E6] dark:border-[#263042] p-12 text-center text-[#6B778C] dark:text-[#94A3B8]">
          <ShieldCheck size={32} className="mx-auto mb-2 text-[#DFE1E6] dark:text-[#334155]" />
          <p className="font-semibold text-xs text-[#172B4D] dark:text-[#F1F5F9]">No audit events matched</p>
          <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
            Try adjusting your search criteria or category filter
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#151B26] rounded border border-[#DFE1E6] dark:border-[#263042] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-[#F4F5F7] dark:bg-[#101520] text-[#6B778C] dark:text-[#94A3B8] border-b border-[#DFE1E6] dark:border-[#263042] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Event ID / Time</th>
                  <th className="px-4 py-3 text-left">Action & Category</th>
                  <th className="px-4 py-3 text-left">Actor</th>
                  <th className="px-4 py-3 text-left">Target Resource</th>
                  <th className="px-4 py-3 text-left">Client IP</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE1E6] dark:divide-[#263042]">
                {filteredLogs.map((log) => {
                  const eventTime = new Date(log.createdAt || log.timestamp || Date.now());
                  return (
                    <tr
                      key={log.logId}
                      className="hover:bg-[#F4F5F7] dark:hover:bg-[#1A2230] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] text-[#0052CC] dark:text-[#38BDF8] font-bold bg-[#DEEBFF] dark:bg-[#0747A6]/30 px-1.5 py-0.5 rounded border border-[#B3D4FF] dark:border-[#1E3A8A]">
                          {log.logId}
                        </span>
                        <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-1">
                          {eventTime.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          •{" "}
                          {eventTime.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#172B4D] dark:text-[#F1F5F9] font-mono text-[11px]">
                          {log.action}
                        </p>
                        <span
                          className={`inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] font-semibold border ${getCategoryBadge(
                            log.category
                          )}`}
                        >
                          {log.category}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#172B4D] dark:text-[#F1F5F9] leading-tight">
                          {log.actorName}
                        </p>
                        <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
                          {log.actorRole} ({log.actorId})
                        </p>
                      </td>

                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-semibold text-[#172B4D] dark:text-[#F1F5F9] truncate" title={log.targetName}>
                          {log.targetName || log.targetId || "System"}
                        </p>
                        <p className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
                          Entity: {log.targetEntity}
                        </p>
                      </td>

                      <td className="px-4 py-3 font-mono text-[11px] text-[#5E6C84] dark:text-[#94A3B8]">
                        {log.ipAddress || "127.0.0.1"}
                      </td>

                      <td className="px-4 py-3">
                        {getStatusBadge(log.status)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1 text-[#6B778C] hover:text-[#0052CC] hover:bg-[#DEEBFF] dark:hover:bg-[#1E293B] rounded transition cursor-pointer"
                          title="View Audit Payload & Mutation Snapshot"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Detail Payload Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#FAFBFC] dark:bg-[#101520]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#0052CC] dark:text-[#38BDF8]" />
                <div>
                  <h3 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                    Audit Snapshot: {selectedLog.logId}
                  </h3>
                  <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
                    Action: {selectedLog.action}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-[#6B778C] hover:text-[#172B4D] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] p-1 rounded"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 font-mono text-xs flex-1">
              <div className="bg-[#172B4D] dark:bg-[#090D14] p-3 rounded-lg text-white overflow-x-auto border border-[#263042]">
                <pre className="text-emerald-300">
                  {JSON.stringify(
                    {
                      logId: selectedLog.logId,
                      action: selectedLog.action,
                      category: selectedLog.category,
                      actor: {
                        id: selectedLog.actorId,
                        name: selectedLog.actorName,
                        role: selectedLog.actorRole,
                      },
                      target: {
                        entity: selectedLog.targetEntity,
                        id: selectedLog.targetId,
                        name: selectedLog.targetName,
                      },
                      ipAddress: selectedLog.ipAddress,
                      status: selectedLog.status,
                      details: selectedLog.details,
                      timestamp: selectedLog.createdAt,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            <div className="p-3 border-t border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between text-xs bg-[#F4F5F7] dark:bg-[#101520]">
              <span className="text-[#6B778C] dark:text-[#94A3B8] text-[11px]">
                Cryptographically hashed audit entry
              </span>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-3 py-1 bg-white dark:bg-[#1E293B] border border-[#DFE1E6] dark:border-[#334155] rounded font-semibold text-[#172B4D] dark:text-[#F1F5F9] hover:bg-[#F4F5F7] dark:hover:bg-[#334155] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default AuditLogs;
