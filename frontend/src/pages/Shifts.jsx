import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  Sliders,
  CheckCircle2,
  Building2,
  MapPin,
  Sparkles,
  X,
  Plus,
} from "lucide-react";
import KpiMetricCard from "../components/KpiMetricCard";
import StatusLozenge from "../components/StatusLozenge";
import { shiftsApi, clientsApi } from "../services/api";
import { useWorkspace } from "../context/WorkspaceContext";
import toast from "react-hot-toast";

export default function Shifts() {
  const { isAgencyWorkspace, activeVendorId } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("All");

  // Current week start (Monday)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split("T")[0];
  });

  const [rosterData, setRosterData] = useState({
    dates: [],
    shifts: [],
    data: [],
    stats: {
      totalWorkers: 0,
      totalAssignments: 0,
      nightShiftCount: 0,
      weeklyOffCount: 0,
      coverageRate: 100,
    },
  });

  // Modals state
  const [autoScheduleModalOpen, setAutoScheduleModalOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [templateType, setTemplateType] = useState("3_SHIFT_ROTATION");
  const [swapData, setSwapData] = useState({
    worker1Id: "",
    worker2Id: "",
    date: "",
  });

  // Cell editing popover state
  const [editingCell, setEditingCell] = useState(null); // { workerId, workerName, date, currentShift }

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    loadRoster();
  }, [currentWeekStart, selectedClient, activeVendorId]);

  const loadClients = async () => {
    try {
      const res = await clientsApi.getAll();
      setClients(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load clients:", err);
    }
  };

  const loadRoster = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: currentWeekStart,
        clientId: selectedClient !== "All" ? selectedClient : undefined,
      };
      const res = await shiftsApi.getRoster(params);
      if (res.data) {
        setRosterData(res.data);
      }
    } catch (err) {
      toast.error("Failed to load shift roster: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePrevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d.toISOString().split("T")[0]);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d.toISOString().split("T")[0]);
  };

  const handleCurrentWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    setCurrentWeekStart(monday.toISOString().split("T")[0]);
  };

  const handleAssignShift = async (workerId, workerName, date, shiftCode) => {
    try {
      await shiftsApi.assignShift({
        workerId,
        workerName,
        date,
        shiftCode,
      });
      toast.success(`Assigned ${shiftCode} on ${date}`);
      setEditingCell(null);
      loadRoster();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign shift");
    }
  };

  const handleBulkApplyTemplate = async () => {
    try {
      const res = await shiftsApi.bulkApplyTemplate({
        startDate: currentWeekStart,
        clientId: selectedClient !== "All" ? selectedClient : undefined,
        templateType,
      });
      toast.success(res.data?.message || "Weekly rotation applied successfully!");
      setAutoScheduleModalOpen(false);
      loadRoster();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply shift template");
    }
  };

  const handleSwapSubmit = async (e) => {
    e.preventDefault();
    if (!swapData.worker1Id || !swapData.worker2Id || !swapData.date) {
      toast.error("Please fill in both workers and the target date");
      return;
    }
    if (swapData.worker1Id === swapData.worker2Id) {
      toast.error("Cannot swap shift with the same worker");
      return;
    }

    try {
      const res = await shiftsApi.swapShifts(swapData);
      toast.success(res.data?.message || "Shifts swapped successfully!");
      setSwapModalOpen(false);
      loadRoster();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to swap shifts");
    }
  };

  const getShiftBadge = (shiftCode) => {
    switch (shiftCode) {
      case "MS":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]">
            <Sunrise size={10} />
            <span>MS</span>
          </span>
        );
      case "ES":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FFF0B3] text-[#8A5408] border border-[#FFE380]">
            <Sunset size={10} />
            <span>ES</span>
          </span>
        );
      case "NS":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EAE6FF] text-[#403294] border border-[#C0B6F2]">
            <Moon size={10} />
            <span>NS</span>
          </span>
        );
      case "WO":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#EBECF0] text-[#42526E] border border-[#DFE1E6]">
            <span>OFF</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF]">
            <Sun size={10} />
            <span>GS</span>
          </span>
        );
    }
  };

  const formatDateHeader = (dateStr) => {
    const d = new Date(dateStr);
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = d.getDate();
    const isSunday = d.getDay() === 0;
    return (
      <div className={`text-center ${isSunday ? "text-[#DE350B]" : ""}`}>
        <div className="font-bold text-xs">{dayName}</div>
        <div className="text-[10px] opacity-75">{dayNum}</div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#172B4D] dark:text-[#F1F5F9] tracking-tight flex items-center gap-2">
            <span>Shift Schedules & Squad Rosters</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]">
              24x7 Operations
            </span>
          </h2>
          <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
            Manage site shifts (Morning, Evening, Night), weekly squad rosters, and 1-click rotation schedules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadRoster}
            className="bg-white dark:bg-[#151B26] hover:bg-[#EBECF0] dark:hover:bg-[#1E293B] text-[#172B4D] dark:text-[#F1F5F9] border border-[#DFE1E6] dark:border-[#263042] text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5"
            title="Refresh roster"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setSwapModalOpen(true)}
            className="bg-white dark:bg-[#151B26] hover:bg-[#EBECF0] dark:hover:bg-[#1E293B] text-[#172B4D] dark:text-[#F1F5F9] border border-[#DFE1E6] dark:border-[#263042] text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeftRight size={13} />
            <span>Shift Swap</span>
          </button>

          <button
            type="button"
            onClick={() => setAutoScheduleModalOpen(true)}
            className="bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles size={14} />
            <span>Auto-Schedule Week</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiMetricCard
          title="Active Workers on Site"
          value={rosterData.stats?.totalWorkers || 0}
          subtitle="Contractors scheduled this week"
          icon={Users}
        />
        <KpiMetricCard
          title="Scheduled Shifts"
          value={rosterData.stats?.totalAssignments || 0}
          subtitle="7-day assignments across squads"
          icon={Calendar}
        />
        <KpiMetricCard
          title="Night Shifts (NS)"
          value={rosterData.stats?.nightShiftCount || 0}
          subtitle="Overnight facility coverage"
          icon={Moon}
        />
        <KpiMetricCard
          title="Weekly Offs (WO)"
          value={rosterData.stats?.weeklyOffCount || 0}
          subtitle="Mandated statutory rest days"
          icon={CheckCircle2}
        />
      </div>

      {/* Controls & Week Navigator */}
      <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        {/* Week Navigator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#F4F5F7] dark:bg-[#151B26]">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-[#EBECF0] dark:hover:bg-[#263042] text-[#172B4D] dark:text-[#F1F5F9] transition cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-3 text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9]">
              {rosterData.dates[0]} to {rosterData.dates[rosterData.dates.length - 1]}
            </span>
            <button
              type="button"
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-[#EBECF0] dark:hover:bg-[#263042] text-[#172B4D] dark:text-[#F1F5F9] transition cursor-pointer"
              title="Next Week"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleCurrentWeek}
            className="text-xs font-semibold px-2.5 py-1 text-[#0052CC] dark:text-[#579DFF] hover:underline cursor-pointer"
          >
            This Week
          </button>
        </div>

        {/* Client Selector & Legend */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#6B778C] dark:text-[#94A3B8]">
              Client:
            </span>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="text-xs px-2.5 py-1 bg-[#F4F5F7] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
            >
              <option value="All">All Client Sites</option>
              {clients.map((c) => (
                <option key={c.clientId} value={c.clientId}>
                  {c.legalName}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Legend */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-[#EBECF0] dark:border-[#263042]">
            <span className="text-[10px] font-semibold text-[#6B778C]">Shifts:</span>
            {getShiftBadge("MS")}
            {getShiftBadge("ES")}
            {getShiftBadge("NS")}
            {getShiftBadge("GS")}
            {getShiftBadge("WO")}
          </div>
        </div>
      </div>

      {/* Roster Grid Matrix */}
      <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F4F5F7] dark:bg-[#151B26] border-b border-[#DFE1E6] dark:border-[#263042] text-[#6B778C] dark:text-[#94A3B8]">
                <th className="py-2.5 px-3 min-w-[200px]">Worker & Role</th>
                <th className="py-2.5 px-3 min-w-[160px]">Client Work Site</th>
                {rosterData.dates.map((dateStr) => (
                  <th key={dateStr} className="py-2.5 px-2 text-center min-w-[80px]">
                    {formatDateHeader(dateStr)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBECF0] dark:divide-[#263042]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-[#6B778C] dark:text-[#94A3B8]">
                    Loading 7-day shift roster matrix...
                  </td>
                </tr>
              ) : rosterData.data?.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <Calendar size={32} className="mx-auto text-[#6B778C] dark:text-[#94A3B8] opacity-50 mb-2" />
                    <p className="text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                      No active workers deployed for this client or week
                    </p>
                    <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                      Assign workers to work sites first in Work Assignments.
                    </p>
                  </td>
                </tr>
              ) : (
                rosterData.data.map((row) => (
                  <tr key={row.workerId} className="hover:bg-[#F4F5F7]/50 dark:hover:bg-[#151B26]/50 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-[#172B4D] dark:text-[#F1F5F9]">{row.workerName}</div>
                      <div className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">{row.workerId} &bull; {row.designation}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-[#172B4D] dark:text-[#F1F5F9] truncate">{row.clientName}</div>
                      <div className="text-[10px] text-[#6B778C] dark:text-[#94A3B8] truncate">{row.siteName}</div>
                    </td>
                    {rosterData.dates.map((dateStr) => {
                      const currentShift = row.schedule?.[dateStr] || "GS";
                      return (
                        <td key={dateStr} className="py-2.5 px-1.5 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingCell({
                                workerId: row.workerId,
                                workerName: row.workerName,
                                date: dateStr,
                                currentShift,
                              })
                            }
                            className="w-full py-1 rounded hover:ring-2 hover:ring-[#0052CC] transition cursor-pointer flex justify-center"
                            title={`Click to change shift for ${dateStr}`}
                          >
                            {getShiftBadge(currentShift)}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Auto-Schedule Week */}
      {autoScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#F4F5F7] dark:bg-[#151B26]">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#0052CC] dark:text-[#579DFF]" />
                <h3 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                  Auto-Schedule Weekly Roster
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAutoScheduleModalOpen(false)}
                className="text-[#6B778C] hover:text-[#172B4D] p-1 rounded cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-[#6B778C] dark:text-[#94A3B8]">
                Select a rotation strategy to schedule all deployed workers across the 7 days of the selected week ({currentWeekStart}).
              </p>

              <div className="space-y-2.5">
                <label
                  onClick={() => setTemplateType("3_SHIFT_ROTATION")}
                  className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition ${
                    templateType === "3_SHIFT_ROTATION"
                      ? "border-[#0052CC] bg-[#DEEBFF]/30 dark:bg-[#1C2331]"
                      : "border-[#DFE1E6] dark:border-[#263042] hover:bg-[#F4F5F7]"
                  }`}
                >
                  <input
                    type="radio"
                    name="template"
                    checked={templateType === "3_SHIFT_ROTATION"}
                    onChange={() => setTemplateType("3_SHIFT_ROTATION")}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                      3-Shift Continuous Rotation (24x7)
                    </div>
                    <div className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                      Evenly distributes squads across Morning (MS), Evening (ES), and Night (NS) shifts with Sunday Weekly Off.
                    </div>
                  </div>
                </label>

                <label
                  onClick={() => setTemplateType("STANDARD_DAY")}
                  className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition ${
                    templateType === "STANDARD_DAY"
                      ? "border-[#0052CC] bg-[#DEEBFF]/30 dark:bg-[#1C2331]"
                      : "border-[#DFE1E6] dark:border-[#263042] hover:bg-[#F4F5F7]"
                  }`}
                >
                  <input
                    type="radio"
                    name="template"
                    checked={templateType === "STANDARD_DAY"}
                    onChange={() => setTemplateType("STANDARD_DAY")}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                      Standard Day Rotation (GS Mon-Sat)
                    </div>
                    <div className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                      Schedules General Shift (09:00 - 18:00) Monday through Saturday with Sunday off.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#DFE1E6] dark:border-[#263042] bg-[#F4F5F7] dark:bg-[#151B26] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAutoScheduleModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9] hover:bg-[#EBECF0] rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkApplyTemplate}
                className="bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold px-4 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>Apply Rotation Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Shift Swap */}
      {swapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#F4F5F7] dark:bg-[#151B26]">
              <div className="flex items-center gap-2">
                <ArrowLeftRight size={16} className="text-[#0052CC] dark:text-[#579DFF]" />
                <h3 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                  Peer Shift Swap
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSwapModalOpen(false)}
                className="text-[#6B778C] hover:text-[#172B4D] p-1 rounded cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSwapSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Target Date *
                </label>
                <select
                  value={swapData.date}
                  onChange={(e) => setSwapData({ ...swapData, date: e.target.value })}
                  required
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                >
                  <option value="">Select Date</option>
                  {rosterData.dates.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Worker 1 (Requester) *
                </label>
                <select
                  value={swapData.worker1Id}
                  onChange={(e) => setSwapData({ ...swapData, worker1Id: e.target.value })}
                  required
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                >
                  <option value="">Select Worker 1</option>
                  {rosterData.data.map((w) => (
                    <option key={w.workerId} value={w.workerId}>
                      {w.workerName} ({w.workerId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Worker 2 (Teammate / Peer) *
                </label>
                <select
                  value={swapData.worker2Id}
                  onChange={(e) => setSwapData({ ...swapData, worker2Id: e.target.value })}
                  required
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                >
                  <option value="">Select Worker 2</option>
                  {rosterData.data.map((w) => (
                    <option key={w.workerId} value={w.workerId}>
                      {w.workerName} ({w.workerId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-[#DFE1E6] dark:border-[#263042] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSwapModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9] hover:bg-[#EBECF0] rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold px-4 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeftRight size={14} />
                  <span>Execute Swap</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Cell Shift Changer Modal */}
      {editingCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xl w-full max-w-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#F4F5F7] dark:bg-[#151B26]">
              <div>
                <h4 className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                  Assign Shift
                </h4>
                <p className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
                  {editingCell.workerName} &bull; {editingCell.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCell(null)}
                className="text-[#6B778C] hover:text-[#172B4D] p-1 rounded cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-3 space-y-1.5">
              {rosterData.shifts.map((s) => (
                <button
                  key={s.shiftCode}
                  type="button"
                  onClick={() =>
                    handleAssignShift(
                      editingCell.workerId,
                      editingCell.workerName,
                      editingCell.date,
                      s.shiftCode
                    )
                  }
                  className={`w-full p-2 rounded border text-left flex items-center justify-between transition cursor-pointer ${
                    editingCell.currentShift === s.shiftCode
                      ? "border-[#0052CC] bg-[#DEEBFF]/40 dark:bg-[#1C2331]"
                      : "border-[#EBECF0] dark:border-[#263042] hover:bg-[#F4F5F7] dark:hover:bg-[#151B26]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {getShiftBadge(s.shiftCode)}
                    <div>
                      <div className="text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
                        {s.startTime} - {s.endTime} ({s.fullDayHours} hrs)
                      </div>
                    </div>
                  </div>
                  {s.isNightShift && (
                    <span className="text-[9px] font-semibold text-[#403294] bg-[#EAE6FF] px-1.5 py-0.5 rounded">
                      +Rs {s.nightAllowance}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
