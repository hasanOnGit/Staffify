import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  getTimesheets,
  getTimesheetSummary,
  saveTimesheet,
  approveTimesheet,
  rejectTimesheet,
} from "../services/timesheet";
import toast from "react-hot-toast";
import {
  Clock,
  Calendar,
  Plus,
  CheckCircle2,
  X,
  Check,
  Building2,
  FolderKanban,
  FileText,
  AlertCircle,
  TrendingUp,
  Percent,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Trash2,
  Save,
  Send,
  User,
} from "lucide-react";

const DEFAULT_PROJECTS = [
  { projectId: "PRJ-PAYROLL", projectName: "Statutory Payroll & Tax Engine", clientName: "Enterprise Fintech Corp" },
  { projectId: "PRJ-GEOFENCE", projectName: "GPS Perimeter Verification", clientName: "Enterprise Mobility" },
  { projectId: "PRJ-ATS", projectName: "Recruitment Kanban Pipeline", clientName: "Global Talent Systems" },
  { projectId: "PRJ-INTERNAL", projectName: "Internal Engineering Retros & Architecture", clientName: "Internal" },
];

function getMondayOfCurrentWeek() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const mon = new Date(d.setDate(diff));
  return mon.toISOString().split("T")[0];
}

function Timesheets() {
  const { user, isAdmin, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState("grid"); // "grid" | "approvals" | "archive"
  const [timesheets, setTimesheets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(getMondayOfCurrentWeek());

  // Current active timesheet draft rows
  const [entries, setEntries] = useState([
    {
      projectId: "PRJ-PAYROLL",
      projectName: "Statutory Payroll & Tax Engine",
      clientName: "Enterprise Fintech Corp",
      taskCategory: "Development",
      mon: 8,
      tue: 8,
      wed: 8,
      thu: 8,
      fri: 6,
      sat: 0,
      sun: 0,
      total: 38,
      isBillable: true,
      notes: "Architecting ECR & 12BB tax proof engine",
    },
    {
      projectId: "PRJ-INTERNAL",
      projectName: "Internal Engineering Retros & Architecture",
      clientName: "Internal",
      taskCategory: "Architecture",
      mon: 0,
      tue: 0,
      wed: 0,
      thu: 0,
      fri: 2,
      sat: 0,
      sun: 0,
      total: 2,
      isBillable: false,
      notes: "Sprint retro and modular refactoring",
    },
  ]);

  const [activeSheetMeta, setActiveSheetMeta] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sheetsRes, sumRes] = await Promise.all([
        getTimesheets(),
        getTimesheetSummary(),
      ]);
      if (sheetsRes.success) {
        setTimesheets(sheetsRes.data || []);
        // Find if sheet exists for selectedWeek and current employee
        const empId = user?.employeeId || user?.userId;
        const currentSheet = sheetsRes.data.find(
          (s) => s.weekStartDate === selectedWeek && (isAdmin ? true : s.employeeId === empId)
        );
        if (currentSheet) {
          setActiveSheetMeta(currentSheet);
          if (currentSheet.entries && currentSheet.entries.length > 0) {
            setEntries(currentSheet.entries);
          }
        } else {
          setActiveSheetMeta(null);
        }
      }
      if (sumRes.success) setSummary(sumRes.data || null);
    } catch (err) {
      console.error("Timesheet load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedWeek]);

  // Compute live totals
  const { totalHours, billableHours, utilizationPercent } = useMemo(() => {
    let tot = 0;
    let bill = 0;
    entries.forEach((e) => {
      const rowSum =
        (Number(e.mon) || 0) +
        (Number(e.tue) || 0) +
        (Number(e.wed) || 0) +
        (Number(e.thu) || 0) +
        (Number(e.fri) || 0) +
        (Number(e.sat) || 0) +
        (Number(e.sun) || 0);
      tot += rowSum;
      if (e.isBillable !== false) bill += rowSum;
    });
    const util = tot > 0 ? Number(((bill / tot) * 100).toFixed(1)) : 0;
    return { totalHours: tot, billableHours: bill, utilizationPercent: util };
  }, [entries]);

  const handleCellChange = (index, day, val) => {
    const num = Math.min(24, Math.max(0, Number(val) || 0));
    setEntries((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [day]: num,
      };
      return copy;
    });
  };

  const handleAddRow = () => {
    setEntries((prev) => [
      ...prev,
      {
        projectId: "PRJ-NEW",
        projectName: "Client Services Delivery",
        clientName: "Enterprise Client",
        taskCategory: "Development",
        mon: 0,
        tue: 0,
        wed: 0,
        thu: 0,
        fri: 0,
        sat: 0,
        sun: 0,
        total: 0,
        isBillable: true,
        notes: "",
      },
    ]);
  };

  const handleRemoveRow = (index) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveOrSubmit = async (submitNow = false) => {
    try {
      setSaving(true);
      const payload = {
        employeeId: user?.employeeId || user?.userId || "EMP-DEV-03",
        employeeName: user?.name || "Employee User",
        department: user?.department || "Engineering",
        weekStartDate: selectedWeek,
        weekEndDate: selectedWeek,
        entries,
        submitNow,
      };

      const res = await saveTimesheet(payload);
      if (res.success) {
        toast.success(res.message);
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save timesheet");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await approveTimesheet(id, { approvedBy: user?.name || "Manager User" });
      if (res.success) {
        toast.success(res.message);
        loadData();
      }
    } catch (err) {
      toast.error("Approval failed");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection remarks for this timesheet:") || "Requires hour adjustments";
    try {
      const res = await rejectTimesheet(id, { rejectionReason: reason });
      if (res.success) {
        toast.success(res.message);
        loadData();
      }
    } catch (err) {
      toast.error("Rejection failed");
    }
  };

  const pendingApprovals = useMemo(() => {
    return timesheets.filter((t) => t.status === "Submitted");
  }, [timesheets]);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header Banner */}
        <div className="bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]">
                <Clock size={18} />
              </span>
              <h1 className="text-xl font-bold text-[#172B4D]">
                Project Timesheets & Billable Hours Tracker
              </h1>
            </div>
            <p className="text-xs text-[#6B778C] mt-1">
              Client services time allocations, project deliverable tracking, billable utilization, and manager signoff.
            </p>
          </div>

          {/* Week Selector */}
          <div className="flex items-center gap-2 bg-[#FAFBFC] border border-[#DFE1E6] p-1.5 rounded-lg">
            <span className="text-xs font-semibold text-[#172B4D] flex items-center gap-1.5 px-2">
              <Calendar size={13} className="text-[#0052CC]" />
              <span>Week: {selectedWeek}</span>
            </span>
          </div>
        </div>

        {/* 4 Top KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider block">
              Week Logged Hours
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-[#172B4D]">{totalHours} hrs</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]">
                Target: 40h
              </span>
            </div>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider block">
              Billable Client Hours
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-[#006644]">{billableHours} hrs</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]">
                Client Billable
              </span>
            </div>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider block">
              Billable Utilization
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-[#0052CC]">{utilizationPercent}%</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]">
                Target: 85%+
              </span>
            </div>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider block">
              Current Status
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  activeSheetMeta?.status === "Approved"
                    ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                    : activeSheetMeta?.status === "Submitted"
                    ? "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]"
                    : "bg-[#FAFBFC] text-[#42526E] border-[#DFE1E6]"
                }`}
              >
                {activeSheetMeta?.status || "Draft"}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#DFE1E6] pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("grid")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "grid"
                ? "border-[#0052CC] text-[#0052CC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <FolderKanban size={14} />
            <span>Weekly Timesheet Grid</span>
          </button>

          {(isAdmin || isManager) && (
            <button
              type="button"
              onClick={() => setActiveTab("approvals")}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                activeTab === "approvals"
                  ? "border-[#0052CC] text-[#0052CC]"
                  : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
              }`}
            >
              <CheckCircle2 size={14} />
              <span>Timesheet Approvals Tray</span>
              {pendingApprovals.length > 0 && (
                <span className="text-[10px] bg-[#FFEBE6] text-[#DE350B] font-bold px-1.5 py-0.2 rounded-full border border-[#FFBDAD]">
                  {pendingApprovals.length}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("archive")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "archive"
                ? "border-[#0052CC] text-[#0052CC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <FileText size={14} />
            <span>Past Timesheets Archive</span>
          </button>
        </div>

        {/* TAB 1: WEEKLY TIMESHEET GRID */}
        {activeTab === "grid" && (
          <div className="space-y-4">
            <div className="bg-white border border-[#DFE1E6] rounded-xl shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[850px]">
                <thead className="bg-[#F4F5F7] text-[#42526E] uppercase text-[10px] font-bold border-b border-[#DFE1E6]">
                  <tr>
                    <th className="px-4 py-3 min-w-[220px]">Project & Task</th>
                    <th className="px-3 py-3">Client</th>
                    <th className="px-2 py-3 text-center">Type</th>
                    <th className="px-2 py-3 text-center">Mon</th>
                    <th className="px-2 py-3 text-center">Tue</th>
                    <th className="px-2 py-3 text-center">Wed</th>
                    <th className="px-2 py-3 text-center">Thu</th>
                    <th className="px-2 py-3 text-center">Fri</th>
                    <th className="px-2 py-3 text-center">Sat</th>
                    <th className="px-2 py-3 text-center">Sun</th>
                    <th className="px-3 py-3 text-center font-bold">Total</th>
                    <th className="px-3 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1E6]">
                  {entries.map((entry, idx) => {
                    const rowSum =
                      (Number(entry.mon) || 0) +
                      (Number(entry.tue) || 0) +
                      (Number(entry.wed) || 0) +
                      (Number(entry.thu) || 0) +
                      (Number(entry.fri) || 0) +
                      (Number(entry.sat) || 0) +
                      (Number(entry.sun) || 0);

                    return (
                      <tr key={idx} className="hover:bg-[#FAFBFC] transition">
                        <td className="px-4 py-2.5">
                          <input
                            type="text"
                            value={entry.projectName}
                            onChange={(e) => {
                              const copy = [...entries];
                              copy[idx].projectName = e.target.value;
                              setEntries(copy);
                            }}
                            className="w-full font-semibold text-[#172B4D] border-b border-transparent hover:border-[#DFE1E6] focus:border-[#0052CC] focus:outline-none bg-transparent"
                          />
                          <input
                            type="text"
                            placeholder="Add task details or ticket ref..."
                            value={entry.notes || ""}
                            onChange={(e) => {
                              const copy = [...entries];
                              copy[idx].notes = e.target.value;
                              setEntries(copy);
                            }}
                            className="w-full text-[10px] text-[#6B778C] border-b border-transparent hover:border-[#DFE1E6] focus:border-[#0052CC] focus:outline-none bg-transparent mt-0.5"
                          />
                        </td>

                        <td className="px-3 py-2.5">
                          <span className="text-[11px] font-medium text-[#42526E]">
                            {entry.clientName}
                          </span>
                        </td>

                        <td className="px-2 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...entries];
                              copy[idx].isBillable = !copy[idx].isBillable;
                              setEntries(copy);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                              entry.isBillable !== false
                                ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                                : "bg-[#F4F5F7] text-[#6B778C] border-[#DFE1E6]"
                            }`}
                          >
                            {entry.isBillable !== false ? "Billable" : "Non-Billable"}
                          </button>
                        </td>

                        {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => (
                          <td key={day} className="px-1.5 py-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max="24"
                              value={entry[day] || 0}
                              onChange={(e) => handleCellChange(idx, day, e.target.value)}
                              className="w-12 text-center font-mono font-semibold py-1 border border-[#DFE1E6] rounded-md focus:outline-none focus:border-[#0052CC] bg-white text-xs"
                            />
                          </td>
                        ))}

                        <td className="px-3 py-2.5 text-center font-mono font-bold text-sm text-[#0052CC]">
                          {rowSum}h
                        </td>

                        <td className="px-3 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            className="p-1 text-[#6B778C] hover:text-[#DE350B] rounded hover:bg-[#FFEBE6] transition cursor-pointer"
                            title="Remove row"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot className="bg-[#FAFBFC] border-t-2 border-[#DFE1E6] font-bold text-xs text-[#172B4D]">
                  <tr>
                    <td colSpan={3} className="px-4 py-3">
                      Total Allocated Weekly Hours
                    </td>
                    {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => {
                      const daySum = entries.reduce(
                        (acc, curr) => acc + (Number(curr[day]) || 0),
                        0
                      );
                      return (
                        <td key={day} className="px-1.5 py-3 text-center font-mono">
                          {daySum}h
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 text-center font-mono text-base text-[#0052CC]">
                      {totalHours}h
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddRow}
                className="px-3.5 py-2 bg-white hover:bg-[#F4F5F7] text-[#172B4D] border border-[#DFE1E6] text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs self-start"
              >
                <Plus size={14} className="text-[#0052CC]" />
                <span>Add Project Task Row</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveOrSubmit(false)}
                  className="px-4 py-2 bg-white hover:bg-[#F4F5F7] text-[#42526E] border border-[#DFE1E6] text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveOrSubmit(true)}
                  className="px-5 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send size={14} />
                  <span>Submit for Manager Approval</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPROVALS TRAY */}
        {activeTab === "approvals" && (
          <div className="space-y-4">
            <div className="bg-[#DEEBFF]/30 border border-[#B3D4FF] rounded-xl p-4 flex items-center justify-between text-xs text-[#0747A6]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#0052CC]" />
                <span className="font-medium">
                  Review and approve employee weekly billable hours for project accounting.
                </span>
              </div>
              <span className="font-bold bg-white px-2.5 py-1 rounded-md border border-[#B3D4FF]">
                {pendingApprovals.length} Pending Timesheets
              </span>
            </div>

            <div className="bg-white border border-[#DFE1E6] rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F5F7] text-[#42526E] uppercase text-[10px] font-bold border-b border-[#DFE1E6]">
                  <tr>
                    <th className="px-4 py-3">Timesheet ID</th>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Week Period</th>
                    <th className="px-4 py-3 text-center">Total Hours</th>
                    <th className="px-4 py-3 text-center">Billable Hours</th>
                    <th className="px-4 py-3 text-center">Utilization</th>
                    <th className="px-4 py-3 text-right">Decisions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1E6]">
                  {pendingApprovals.length > 0 ? (
                    pendingApprovals.map((ts) => (
                      <tr key={ts._id || ts.timesheetId} className="hover:bg-[#FAFBFC] transition">
                        <td className="px-4 py-3 font-mono font-bold text-[#172B4D]">{ts.timesheetId}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#172B4D]">{ts.employeeName}</p>
                          <p className="text-[10px] text-[#6B778C]">{ts.department} • {ts.employeeId}</p>
                        </td>
                        <td className="px-4 py-3 text-[#42526E]">Week of {ts.weekStartDate}</td>
                        <td className="px-4 py-3 text-center font-bold text-[#172B4D]">{ts.totalHours}h</td>
                        <td className="px-4 py-3 text-center font-bold text-[#006644]">{ts.billableHours}h</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]">
                            {ts.utilizationPercent}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApprove(ts._id || ts.timesheetId)}
                              className="px-2.5 py-1 bg-[#00875A] hover:bg-[#006644] text-white text-[11px] font-semibold rounded-md transition cursor-pointer flex items-center gap-1"
                            >
                              <Check size={12} />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(ts._id || ts.timesheetId)}
                              className="px-2.5 py-1 text-[#DE350B] hover:bg-[#FFEBE6] border border-[#FFBDAD] text-[11px] font-semibold rounded-md transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-[#6B778C]">
                        All submitted timesheets have been reviewed. The approval tray is clear.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PAST ARCHIVE */}
        {activeTab === "archive" && (
          <div className="bg-white border border-[#DFE1E6] rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F5F7] text-[#42526E] uppercase text-[10px] font-bold border-b border-[#DFE1E6]">
                <tr>
                  <th className="px-4 py-3">Week</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3 text-center">Total Hours</th>
                  <th className="px-4 py-3 text-center">Billable Hours</th>
                  <th className="px-4 py-3 text-center">Utilization</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Approver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE1E6]">
                {timesheets.map((ts) => (
                  <tr key={ts._id || ts.timesheetId} className="hover:bg-[#FAFBFC]">
                    <td className="px-4 py-3 font-semibold text-[#172B4D]">Week of {ts.weekStartDate}</td>
                    <td className="px-4 py-3">{ts.employeeName}</td>
                    <td className="px-4 py-3 text-center font-bold">{ts.totalHours}h</td>
                    <td className="px-4 py-3 text-center font-bold text-[#006644]">{ts.billableHours}h</td>
                    <td className="px-4 py-3 text-center font-mono">{ts.utilizationPercent}%</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        ts.status === "Approved" ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]" : "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]"
                      }`}>
                        {ts.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-[#6B778C]">{ts.managerApproval?.approvedBy || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Timesheets;
