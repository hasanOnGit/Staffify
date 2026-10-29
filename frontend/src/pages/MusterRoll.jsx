import React, { useEffect, useState } from "react";
import {
  CalendarCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building,
  Save,
  Lock,
  FileSpreadsheet,
  AlertCircle,
  X,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import KpiMetricCard from "../components/KpiMetricCard";
import StatusLozenge from "../components/StatusLozenge";
import { musterRollApi, clientsApi } from "../services/api";
import toast from "react-hot-toast";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function MusterRoll() {
  const [musterRolls, setMusterRolls] = useState([]);
  const [selectedMusterRoll, setSelectedMusterRoll] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingModalOpen, setIsGeneratingModalOpen] = useState(false);

  // Filters
  const [filterMonth, setFilterMonth] = useState("All");
  const [filterYear, setFilterYear] = useState("2026");

  // Editable records for selected muster roll
  const [activeRecords, setActiveRecords] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Generate modal form state
  const [generateForm, setGenerateForm] = useState({
    clientId: "",
    siteId: "",
    month: "March",
    year: 2026,
  });
  const [availableSites, setAvailableSites] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchMusterRolls();
  }, [filterMonth, filterYear]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [cRes, mrRes] = await Promise.all([
        clientsApi.getAll(),
        musterRollApi.getAll({ month: filterMonth, year: filterYear }),
      ]);
      setClients(cRes.data.data || []);
      setMusterRolls(mrRes.data.data || []);
      if (mrRes.data.data?.length > 0) {
        selectSheet(mrRes.data.data[0]);
      }
    } catch (err) {
      console.error("Failed to load muster roll data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMusterRolls = async () => {
    try {
      const res = await musterRollApi.getAll({ month: filterMonth, year: filterYear });
      setMusterRolls(res.data.data || []);
      if (res.data.data?.length > 0 && !selectedMusterRoll) {
        selectSheet(res.data.data[0]);
      }
    } catch (err) {
      console.error("Failed to refresh muster rolls:", err);
    }
  };

  const selectSheet = (mr) => {
    setSelectedMusterRoll(mr);
    setActiveRecords(JSON.parse(JSON.stringify(mr.records || [])));
  };

  const handleRecordChange = (index, field, value) => {
    const val = Number(value) || 0;
    setActiveRecords((prev) => {
      const updated = [...prev];
      const rec = { ...updated[index], [field]: val };

      // Recalculate line gross total in UI immediately
      const effectiveDays = rec.daysPresent + (rec.halfDays || 0) * 0.5;
      const basePay = Math.round(effectiveDays * rec.normalDailyRate);
      const otRate = rec.otHourlyRate || Math.round((rec.normalDailyRate / 8) * 1.5);
      const otPay = Math.round((rec.overtimeHours || 0) * otRate);
      rec.totalEarned = basePay + otPay;

      updated[index] = rec;
      return updated;
    });
  };

  const handleSaveRecords = async () => {
    if (!selectedMusterRoll) return;
    try {
      setIsSaving(true);
      const res = await musterRollApi.update(selectedMusterRoll._id, {
        records: activeRecords,
      });
      toast.success("Attendance sheet saved with recalculated wages.");
      setSelectedMusterRoll(res.data.data);
      setActiveRecords(JSON.parse(JSON.stringify(res.data.data.records)));
      fetchMusterRolls();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save attendance.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveMusterRoll = async () => {
    if (!selectedMusterRoll) return;
    if (
      !window.confirm(
        `Are you sure you want to approve & lock muster roll ${selectedMusterRoll.musterRollId}? Locked sheets cannot be edited.`
      )
    ) {
      return;
    }

    try {
      const res = await musterRollApi.approve(selectedMusterRoll._id);
      toast.success("Muster roll approved and locked for billing!");
      setSelectedMusterRoll(res.data.data);
      fetchMusterRolls();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve muster roll.");
    }
  };

  const handleClientChange = (e) => {
    const cid = e.target.value;
    const client = clients.find((c) => c.clientId === cid);
    setGenerateForm((prev) => ({
      ...prev,
      clientId: cid,
      siteId: client?.sites?.[0]?.siteId || "",
    }));
    setAvailableSites(client?.sites || []);
  };

  const handleGenerateMusterRoll = async (e) => {
    e.preventDefault();
    if (!generateForm.clientId || !generateForm.siteId) {
      toast.error("Please select both a client and a work site.");
      return;
    }

    try {
      setIsGenerating(true);
      const res = await musterRollApi.generate(generateForm);
      toast.success(res.data.message || "Muster roll generated successfully!");
      setIsGeneratingModalOpen(false);
      fetchMusterRolls();
      selectSheet(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate muster roll.");
    } finally {
      setIsGenerating(false);
    }
  };

  // KPI Calculations across all loaded muster rolls
  const totalSheets = musterRolls.length;
  const totalDaysBilled = musterRolls.reduce((acc, m) => acc + (m.totalDaysBilled || 0), 0);
  const totalOtHours = musterRolls.reduce((acc, m) => acc + (m.totalOtHours || 0), 0);
  const totalGrossPay = musterRolls.reduce((acc, m) => acc + (m.totalGrossPay || 0), 0);

  const isApproved = selectedMusterRoll?.status === "Approved" || selectedMusterRoll?.status === "Billed";

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#172B4D] dark:text-white tracking-tight flex items-center gap-2">
            <CalendarCheck size={20} className="text-[#0052CC] dark:text-[#579DFF]" />
            Site Muster Roll & Overtime Tracking
          </h1>
          <p className="text-xs text-[#6B778C] dark:text-neutral-400 mt-0.5">
            Log client-site contractor attendance, monthly shifts, LOP, and overtime (OT) hours feeding directly into billing
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsGeneratingModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded bg-[#0052CC] hover:bg-[#0747A6] text-white shadow-xs transition shrink-0 cursor-pointer"
        >
          <Plus size={14} />
          <span>Generate Muster Roll</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <KpiMetricCard
          title="Active Muster Rolls"
          value={totalSheets}
          subtitle="Monthly site attendance sheets"
          accentColor="#0052CC"
          icon={FileSpreadsheet}
        />
        <KpiMetricCard
          title="Billed Contractor Days"
          value={totalDaysBilled.toFixed(1)}
          subtitle="Effective regular man-days"
          badgeText="Work Days"
          badgeType="neutral"
          accentColor="#579DFF"
          icon={TrendingUp}
        />
        <KpiMetricCard
          title="Total Overtime Hours"
          value={`${totalOtHours} hrs`}
          subtitle="Computed at 1.5x statutory multiplier"
          badgeText="OT Pool"
          badgeType="warning"
          accentColor="#B9770E"
          icon={Clock}
        />
        <KpiMetricCard
          title="Gross Labor Volume"
          value={`Rs ${totalGrossPay.toLocaleString()}`}
          subtitle="Direct wage base before GST"
          badgeText="Verified"
          badgeType="success"
          accentColor="#00875A"
          icon={CheckCircle2}
        />
      </div>

      {/* Main Workspace: Sheet Selector + Attendance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Muster Roll Selector Column */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg p-3 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#172B4D] dark:text-white uppercase tracking-wider">
                Site Roster Sheets
              </span>
              <span className="text-[11px] font-mono text-[#6B778C] dark:text-neutral-400">
                {musterRolls.length} available
              </span>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-[#6B778C] dark:text-neutral-400 uppercase mb-1">
                  Month
                </label>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full px-2 py-1 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0052CC]"
                >
                  <option value="All">All Months</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#6B778C] dark:text-neutral-400 uppercase mb-1">
                  Year
                </label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full px-2 py-1 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0052CC]"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>
          </div>

          {/* List of Muster Rolls */}
          <div className="space-y-2">
            {musterRolls.length === 0 ? (
              <div className="p-6 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg text-center text-xs text-[#6B778C] dark:text-neutral-400">
                No muster rolls found for this period. Click "+ Generate Muster Roll" to create one.
              </div>
            ) : (
              musterRolls.map((mr) => {
                const isSelected = selectedMusterRoll?._id === mr._id;
                return (
                  <div
                    key={mr._id}
                    onClick={() => selectSheet(mr)}
                    className={`p-3 rounded-lg border transition cursor-pointer text-xs ${
                      isSelected
                        ? "bg-[#DEEBFF]/50 dark:bg-[#1C2331] border-[#0052CC] dark:border-[#579DFF] shadow-xs"
                        : "bg-white dark:bg-[#0F131C] border-[#DFE1E6] dark:border-[#263042] hover:bg-[#FAFBFC] dark:hover:bg-[#151B26]"
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-[#172B4D] dark:text-white mb-1">
                      <span className="font-mono text-[#0052CC] dark:text-[#579DFF]">
                        {mr.musterRollId}
                      </span>
                      <StatusLozenge status={mr.status} />
                    </div>
                    <div className="font-medium text-[#172B4D] dark:text-neutral-200 truncate">
                      {mr.clientName}
                    </div>
                    <div className="text-[11px] text-[#6B778C] dark:text-neutral-400 truncate">
                      {mr.siteName} &bull; {mr.month} {mr.year}
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between text-[11px]">
                      <span className="text-[#6B778C] dark:text-neutral-400">
                        {mr.totalHeadcount} workers &bull; {mr.totalOtHours}h OT
                      </span>
                      <span className="font-bold text-[#172B4D] dark:text-white">
                        Rs {mr.totalGrossPay?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Interactive Attendance & OT Grid */}
        <div className="lg:col-span-8">
          {selectedMusterRoll ? (
            <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xs overflow-hidden flex flex-col">
              {/* Sheet Header */}
              <div className="p-4 border-b border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF]">
                      {selectedMusterRoll.musterRollId}
                    </span>
                    <StatusLozenge status={selectedMusterRoll.status} />
                    {isApproved && (
                      <span className="text-[10px] font-medium text-[#00875A] flex items-center gap-1">
                        <Lock size={11} /> Locked by {selectedMusterRoll.approvedBy || "Supervisor"}
                      </span>
                    )}
                  </div>
                  <h2 className="text-sm font-bold text-[#172B4D] dark:text-white mt-1">
                    {selectedMusterRoll.clientName} — {selectedMusterRoll.siteName}
                  </h2>
                  <p className="text-xs text-[#6B778C] dark:text-neutral-400">
                    Period: {selectedMusterRoll.month} {selectedMusterRoll.year} &bull; {activeRecords.length} Deployed Contractors
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!isApproved && (
                    <>
                      <button
                        type="button"
                        onClick={handleSaveRecords}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-[#DFE1E6] dark:border-[#263042] text-[#172B4D] dark:text-white hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] transition cursor-pointer"
                      >
                        <Save size={13} />
                        <span>{isSaving ? "Saving..." : "Save Edits"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleApproveMusterRoll}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-[#00875A] hover:bg-[#006644] text-white shadow-xs transition cursor-pointer"
                      >
                        <CheckCircle2 size={13} />
                        <span>Lock & Approve</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Attendance Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAFBFC] dark:bg-[#151B26] border-b border-[#DFE1E6] dark:border-[#263042] text-[#6B778C] dark:text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
                      <th className="px-3 py-2.5">Contractor</th>
                      <th className="px-3 py-2.5">Role</th>
                      <th className="px-3 py-2.5 text-right">Daily Rate</th>
                      <th className="px-3 py-2.5 text-center w-20">Days Present</th>
                      <th className="px-3 py-2.5 text-center w-20">Half Days</th>
                      <th className="px-3 py-2.5 text-center w-20">OT Hours</th>
                      <th className="px-3 py-2.5 text-right">OT Rate (1.5x)</th>
                      <th className="px-3 py-2.5 text-right">Gross Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE1E6] dark:divide-[#263042]">
                    {activeRecords.map((r, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-[#F4F5F7] dark:hover:bg-[#151B26]/60 transition"
                      >
                        {/* Contractor */}
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-[#172B4D] dark:text-white">
                            {r.workerName}
                          </div>
                          <div className="text-[10px] font-mono text-[#6B778C] dark:text-neutral-400">
                            {r.workerId}
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-3 py-2.5 text-[#42526E] dark:text-neutral-300">
                          {r.designation}
                        </td>

                        {/* Daily Rate */}
                        <td className="px-3 py-2.5 text-right font-mono text-[#172B4D] dark:text-white">
                          Rs {r.normalDailyRate?.toLocaleString()}
                        </td>

                        {/* Days Present */}
                        <td className="px-3 py-2.5 text-center">
                          {isApproved ? (
                            <span className="font-bold text-[#172B4D] dark:text-white">
                              {r.daysPresent}
                            </span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              max="31"
                              value={r.daysPresent}
                              onChange={(e) => handleRecordChange(idx, "daysPresent", e.target.value)}
                              className="w-16 text-center px-1.5 py-1 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0052CC]"
                            />
                          )}
                        </td>

                        {/* Half Days */}
                        <td className="px-3 py-2.5 text-center">
                          {isApproved ? (
                            <span className="text-[#6B778C] dark:text-neutral-400">{r.halfDays}</span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              max="15"
                              value={r.halfDays}
                              onChange={(e) => handleRecordChange(idx, "halfDays", e.target.value)}
                              className="w-14 text-center px-1.5 py-1 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0052CC]"
                            />
                          )}
                        </td>

                        {/* OT Hours */}
                        <td className="px-3 py-2.5 text-center">
                          {isApproved ? (
                            <span className="font-bold text-amber-600 dark:text-amber-400">
                              {r.overtimeHours}h
                            </span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={r.overtimeHours}
                              onChange={(e) => handleRecordChange(idx, "overtimeHours", e.target.value)}
                              className="w-16 text-center px-1.5 py-1 text-xs font-semibold rounded border border-[#DFE1E6] dark:border-[#263042] bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 focus:outline-none focus:ring-1 focus:ring-[#0052CC]"
                            />
                          )}
                        </td>

                        {/* OT Hourly Rate */}
                        <td className="px-3 py-2.5 text-right font-mono text-[#6B778C] dark:text-neutral-400">
                          Rs {r.otHourlyRate || Math.round((r.normalDailyRate / 8) * 1.5)} / hr
                        </td>

                        {/* Line Total */}
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-[#172B4D] dark:text-white">
                          Rs {r.totalEarned?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* Summary Footer */}
                  <tfoot>
                    <tr className="bg-[#FAFBFC] dark:bg-[#151B26] font-bold text-[#172B4D] dark:text-white border-t-2 border-[#DFE1E6] dark:border-[#263042]">
                      <td colSpan={3} className="px-3 py-3 uppercase tracking-wider text-[11px]">
                        Site Totals
                      </td>
                      <td className="px-3 py-3 text-center">
                        {activeRecords.reduce((acc, r) => acc + (Number(r.daysPresent) || 0), 0)} d
                      </td>
                      <td className="px-3 py-3 text-center">
                        {activeRecords.reduce((acc, r) => acc + (Number(r.halfDays) || 0), 0)}
                      </td>
                      <td className="px-3 py-3 text-center text-amber-600 dark:text-amber-400">
                        {activeRecords.reduce((acc, r) => acc + (Number(r.overtimeHours) || 0), 0)} hrs
                      </td>
                      <td className="px-3 py-3 text-right text-[11px] text-[#6B778C] dark:text-neutral-400">
                        Net Payout:
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-sm text-[#0052CC] dark:text-[#579DFF]">
                        Rs {activeRecords.reduce((acc, r) => acc + (Number(r.totalEarned) || 0), 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-12 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg text-center text-xs text-[#6B778C] dark:text-neutral-400">
              Select a muster roll from the left panel to inspect and edit contractor attendance.
            </div>
          )}
        </div>
      </div>

      {/* Generate Muster Roll Modal */}
      {isGeneratingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F131C] rounded-lg shadow-2xl border border-[#DFE1E6] dark:border-[#263042] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={16} className="text-[#0052CC] dark:text-[#579DFF]" />
                <h3 className="text-xs font-bold text-[#172B4D] dark:text-white uppercase tracking-wider">
                  Generate Site Muster Roll
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGeneratingModalOpen(false)}
                className="p-1 text-[#6B778C] hover:text-[#172B4D] dark:hover:text-white rounded"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleGenerateMusterRoll} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                  Client Organization <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={generateForm.clientId}
                  onChange={handleClientChange}
                  className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  <option value="">Select Client...</option>
                  {clients.map((c) => (
                    <option key={c.clientId} value={c.clientId}>
                      {c.legalName} ({c.clientId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                  Physical Work Site <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={generateForm.siteId}
                  onChange={(e) => setGenerateForm({ ...generateForm, siteId: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  <option value="">Select Work Site...</option>
                  {availableSites.map((s) => (
                    <option key={s.siteId} value={s.siteId}>
                      {s.siteName} ({s.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                    Month
                  </label>
                  <select
                    value={generateForm.month}
                    onChange={(e) => setGenerateForm({ ...generateForm, month: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={generateForm.year}
                    onChange={(e) => setGenerateForm({ ...generateForm, year: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  />
                </div>
              </div>

              <div className="p-3 rounded bg-[#DEEBFF]/50 dark:bg-[#1C2331] border border-[#B3D4FF] dark:border-[#263042] text-[11px] text-[#0747A6] dark:text-[#579DFF] leading-relaxed">
                Muster roll generation automatically crawls all active manpower deployments assigned to this site, computes daily rates, and initializes standard 26 billable days.
              </div>

              <div className="pt-3 border-t border-[#DFE1E6] dark:border-[#263042] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGeneratingModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded border border-[#DFE1E6] dark:border-[#263042] text-[#42526E] dark:text-neutral-300 hover:bg-[#EBECF0] dark:hover:bg-[#1C2331]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-1.5 text-xs font-semibold rounded bg-[#0052CC] hover:bg-[#0747A6] text-white shadow-xs transition flex items-center gap-1.5"
                >
                  {isGenerating ? (
                    <span>Generating...</span>
                  ) : (
                    <>
                      <Plus size={13} />
                      <span>Generate Sheet</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MusterRoll;
