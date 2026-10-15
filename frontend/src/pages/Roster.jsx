import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  getShifts,
  getRosterMatrix,
  assignShift,
  bulkAssignShift,
  getShiftSwaps,
  submitShiftSwap,
  reviewShiftSwap,
} from "../services/roster";
import { getEmployees } from "../services/employee";
import BulkRosterModal from "../components/BulkRosterModal";
import ShiftSwapModal from "../components/ShiftSwapModal";
import {
  Calendar,
  Clock,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Plus,
  Layers,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  ShieldCheck,
  Check,
  X,
  FileText,
  Sliders,
} from "lucide-react";

function Roster() {
  const { user, isAdmin, isManager } = useAuth();
  const canManageRoster = isAdmin || isManager;

  const [activeTab, setActiveTab] = useState("matrix"); // "matrix" | "shifts" | "swaps"
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Matrix State
  const [matrixData, setMatrixData] = useState(null);
  const [currentMonday, setCurrentMonday] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d.setDate(diff));
    return mon.toISOString().split("T")[0];
  });
  const [selectedDept, setSelectedDept] = useState("All");
  const [searchEmployee, setSearchEmployee] = useState("");

  // Quick cell edit popover
  const [activeCellEdit, setActiveCellEdit] = useState(null); // { employeeId, date, currentShift }

  // Shifts definitions
  const [shifts, setShifts] = useState([]);

  // Swaps State
  const [swaps, setSwaps] = useState([]);
  const [swapFilterStatus, setSwapFilterStatus] = useState("All");

  // Employees list for modals
  const [employees, setEmployees] = useState([]);

  // Modals
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  // Load Matrix Data
  const loadMatrix = async () => {
    setLoading(true);
    try {
      const res = await getRosterMatrix({
        startDate: currentMonday,
        department: selectedDept,
      });
      if (res.success) {
        setMatrixData(res.data);
      }
    } catch (err) {
      console.error("Failed to load roster matrix:", err);
      setMessage({ type: "error", text: "Failed to load roster matrix." });
    } finally {
      setLoading(false);
    }
  };

  // Load Shifts
  const loadShifts = async () => {
    try {
      const res = await getShifts();
      if (res.success) setShifts(res.data || []);
    } catch (err) {
      console.error("Failed to load shifts:", err);
    }
  };

  // Load Swaps
  const loadSwaps = async () => {
    try {
      const params = {};
      if (!canManageRoster) {
        params.employeeId = user?.employeeId;
      }
      const res = await getShiftSwaps(params);
      if (res.success) setSwaps(res.data || []);
    } catch (err) {
      console.error("Failed to load shift swaps:", err);
    }
  };

  // Load employees for assignment
  const loadEmployeesList = async () => {
    try {
      const res = await getEmployees();
      if (res.success) setEmployees(res.data || []);
    } catch (err) {
      console.error("Failed to load employees:", err);
    }
  };

  useEffect(() => {
    loadShifts();
    loadEmployeesList();
  }, []);

  useEffect(() => {
    if (activeTab === "matrix") {
      loadMatrix();
    } else if (activeTab === "swaps") {
      loadSwaps();
    }
  }, [activeTab, currentMonday, selectedDept]);

  // Navigate Weeks
  const handlePrevWeek = () => {
    const d = new Date(currentMonday);
    d.setDate(d.getDate() - 7);
    setCurrentMonday(d.toISOString().split("T")[0]);
    setActiveCellEdit(null);
  };

  const handleNextWeek = () => {
    const d = new Date(currentMonday);
    d.setDate(d.getDate() + 7);
    setCurrentMonday(d.toISOString().split("T")[0]);
    setActiveCellEdit(null);
  };

  const handleCurrentWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d.setDate(diff));
    setCurrentMonday(mon.toISOString().split("T")[0]);
    setActiveCellEdit(null);
  };

  // Quick cell assignment
  const handleCellShiftSelect = async (shiftCode) => {
    if (!activeCellEdit) return;
    try {
      await assignShift({
        employeeId: activeCellEdit.employeeId,
        date: activeCellEdit.date,
        shiftCode,
        assignedBy: user?.name || "Manager",
      });

      // Update locally in matrixData
      setMatrixData((prev) => {
        if (!prev) return prev;
        const updatedMatrix = prev.matrix.map((row) => {
          if (row.employeeId === activeCellEdit.employeeId) {
            return {
              ...row,
              schedule: {
                ...row.schedule,
                [activeCellEdit.date]: { shiftCode, isDefault: false },
              },
            };
          }
          return row;
        });
        return { ...prev, matrix: updatedMatrix };
      });

      setActiveCellEdit(null);
    } catch (err) {
      console.error("Failed to assign shift:", err);
      setMessage({ type: "error", text: "Failed to update shift for selected date." });
    }
  };

  // Bulk Assign
  const handleSaveBulkRoster = async (payload) => {
    try {
      const res = await bulkAssignShift({
        ...payload,
        assignedBy: user?.name || "Admin",
      });
      setMessage({ type: "success", text: res.message || "Bulk shifts assigned successfully." });
      setIsBulkModalOpen(false);
      await loadMatrix();
    } catch (err) {
      console.error("Error bulk assigning shifts:", err);
      setMessage({ type: "error", text: "Failed to apply bulk shift schedule." });
    }
  };

  // Submit Shift Swap
  const handleSaveShiftSwap = async (payload) => {
    try {
      const res = await submitShiftSwap(payload);
      setMessage({ type: "success", text: res.message || "Shift swap request submitted." });
      setIsSwapModalOpen(false);
      if (activeTab === "swaps") await loadSwaps();
    } catch (err) {
      console.error("Error submitting shift swap:", err);
      setMessage({ type: "error", text: "Failed to submit shift swap request." });
    }
  };

  // Review Shift Swap
  const handleReviewSwap = async (swapId, status) => {
    try {
      const res = await reviewShiftSwap(swapId, {
        status,
        reviewedBy: user?.name || "Manager",
        reviewComment: status === "Approved" ? "Approved by squad lead." : "Operational constraints.",
      });
      setMessage({ type: "success", text: res.message || `Shift swap marked as ${status}.` });
      await loadSwaps();
      if (status === "Approved") await loadMatrix();
    } catch (err) {
      console.error("Failed to review swap:", err);
      setMessage({ type: "error", text: "Failed to update shift swap." });
    }
  };

  // Filter matrix rows by search query
  const filteredMatrix = (matrixData?.matrix || []).filter((row) => {
    if (!searchEmployee) return true;
    return (
      row.name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      row.employeeId.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      row.department.toLowerCase().includes(searchEmployee.toLowerCase())
    );
  });

  // Calculate shift stats for current week
  const shiftCounts = { GS: 0, MS: 0, ES: 0, NS: 0, WO: 0 };
  if (matrixData?.matrix) {
    matrixData.matrix.forEach((row) => {
      Object.values(row.schedule).forEach((val) => {
        const code = val?.shiftCode || "GS";
        if (shiftCounts[code] !== undefined) {
          shiftCounts[code]++;
        }
      });
    });
  }

  // Helper to get shift styling
  const getShiftBadge = (shiftCode) => {
    switch (shiftCode) {
      case "GS":
        return "bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]";
      case "MS":
        return "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]";
      case "ES":
        return "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]";
      case "NS":
        return "bg-[#EAE6FF] text-[#403294] border-[#C0B6F2]";
      case "WO":
      default:
        return "bg-[#F4F5F7] text-[#42526E] border-[#DFE1E6]";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[#DFE1E6]">
          <div>
            <h1 className="text-xl font-bold text-[#172B4D] flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#0052CC] text-white flex items-center justify-center">
                <Calendar size={16} />
              </div>
              <span>Shift Scheduling & Multi-Roster Planner</span>
            </h1>
            <p className="text-xs text-[#6B778C] mt-0.5">
              Staffify Rotational Turnout Engine • Multi-Roster Planner, Shift Policies, and Peer Swaps
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {canManageRoster && (
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Layers size={14} />
                Bulk Assign Shifts
              </button>
            )}
            <button
              onClick={() => setIsSwapModalOpen(true)}
              className="px-3.5 py-1.5 bg-white border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#172B4D] font-medium rounded text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeftRight size={14} className="text-[#6554C0]" />
              Request Shift Swap
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {message && (
          <div
            className={`p-3 rounded border text-xs font-medium flex items-center justify-between ${
              message.type === "success"
                ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                : "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]"
            }`}
          >
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="text-[#6B778C] hover:text-[#172B4D] p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex border-b border-[#DFE1E6] gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab("matrix")}
            className={`pb-2.5 flex items-center gap-1.5 cursor-pointer transition relative ${
              activeTab === "matrix"
                ? "text-[#0052CC] font-bold border-b-2 border-[#0052CC]"
                : "text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <Calendar size={14} />
            Weekly Roster Matrix
          </button>

          <button
            onClick={() => setActiveTab("shifts")}
            className={`pb-2.5 flex items-center gap-1.5 cursor-pointer transition relative ${
              activeTab === "shifts"
                ? "text-[#0052CC] font-bold border-b-2 border-[#0052CC]"
                : "text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <Clock size={14} />
            Shift Policies & Definitions
            <span className="ml-1 px-1.5 py-0.2 bg-[#F4F5F7] text-[#42526E] rounded-full text-[10px]">
              {shifts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("swaps")}
            className={`pb-2.5 flex items-center gap-1.5 cursor-pointer transition relative ${
              activeTab === "swaps"
                ? "text-[#0052CC] font-bold border-b-2 border-[#0052CC]"
                : "text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <ArrowLeftRight size={14} />
            Shift Swap Tray
            {swaps.filter((s) => s.status === "Pending Approval").length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-[#FFE380] text-[#172B4D] font-bold rounded-full text-[10px]">
                {swaps.filter((s) => s.status === "Pending Approval").length}
              </span>
            )}
          </button>
        </div>

        {/* ========================================================
            TAB 1: WEEKLY ROSTER MATRIX
            ======================================================== */}
        {activeTab === "matrix" && (
          <div className="space-y-4">
            {/* Week Navigator & Metrics Strip */}
            <div className="bg-white border border-[#DFE1E6] rounded p-3 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-2xs">
              {/* Navigation buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevWeek}
                  className="p-1.5 rounded border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#42526E] transition cursor-pointer"
                  title="Previous Week"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={handleCurrentWeek}
                  className="px-2.5 py-1 rounded border border-[#DFE1E6] hover:bg-[#F4F5F7] text-xs font-semibold text-[#172B4D] transition cursor-pointer"
                >
                  This Week
                </button>
                <button
                  onClick={handleNextWeek}
                  className="p-1.5 rounded border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#42526E] transition cursor-pointer"
                  title="Next Week"
                >
                  <ChevronRight size={14} />
                </button>

                <div className="text-xs font-bold text-[#172B4D] ml-2">
                  Week: {matrixData?.startDate} to {matrixData?.endDate}
                </div>
              </div>

              {/* Shift distribution pill badges */}
              <div className="flex items-center gap-2 flex-wrap text-[11px]">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded border bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF] font-semibold">
                  GS: {shiftCounts.GS}
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded border bg-[#E3FCEF] text-[#006644] border-[#ABF5D1] font-semibold">
                  MS: {shiftCounts.MS}
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded border bg-[#FFF0B3] text-[#172B4D] border-[#FFE380] font-semibold">
                  ES: {shiftCounts.ES}
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded border bg-[#EAE6FF] text-[#403294] border-[#C0B6F2] font-semibold">
                  NS: {shiftCounts.NS}
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded border bg-[#F4F5F7] text-[#42526E] border-[#DFE1E6] font-semibold">
                  WO: {shiftCounts.WO}
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white border border-[#DFE1E6] rounded p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-2.5 top-2.5 text-[#6B778C]" />
                <input
                  type="text"
                  placeholder="Filter by employee name / ID..."
                  value={searchEmployee}
                  onChange={(e) => setSearchEmployee(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] outline-none focus:ring-1 focus:ring-[#0052CC]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={13} className="text-[#6B778C]" />
                <span className="text-[#6B778C] font-medium text-[11px]">Department:</span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="px-2.5 py-1.5 border border-[#DFE1E6] rounded font-medium text-[#172B4D] bg-white cursor-pointer"
                >
                  <option value="All">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Operations">Operations</option>
                  <option value="Product">Product</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>
            </div>

            {/* Roster Grid Matrix Table */}
            <div className="bg-white border border-[#DFE1E6] rounded overflow-hidden shadow-2xs relative">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F4F5F7] border-b border-[#DFE1E6] text-[#42526E]">
                      <th className="py-2.5 px-3 text-left font-bold w-52 shrink-0 border-r border-[#DFE1E6]">
                        Employee
                      </th>
                      {matrixData?.days?.map((day) => (
                        <th
                          key={day.date}
                          className={`py-2.5 px-2 text-center font-bold border-r border-[#DFE1E6] last:border-r-0 ${
                            day.isWeekend ? "bg-[#EBECF0]/60 text-[#172B4D]" : ""
                          }`}
                        >
                          <span className="block text-[11px]">{day.dayName}</span>
                          <span className="block text-[10px] text-[#6B778C] font-medium">
                            {day.date.slice(5)}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE1E6]">
                    {filteredMatrix.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="p-8 text-center text-xs text-[#6B778C]"
                        >
                          No employee records match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredMatrix.map((row) => (
                        <tr key={row.employeeId} className="hover:bg-[#FAFBFC] transition">
                          {/* Employee Info */}
                          <td className="py-2.5 px-3 border-r border-[#DFE1E6] bg-white">
                            <div className="font-bold text-[#172B4D] truncate">{row.name}</div>
                            <div className="text-[10px] text-[#6B778C] truncate">
                              {row.employeeId} • {row.department}
                            </div>
                          </td>

                          {/* 7 Days Shifts */}
                          {matrixData?.days?.map((day) => {
                            const entry = row.schedule?.[day.date];
                            const shiftCode = entry?.shiftCode || (day.isWeekend ? "WO" : "GS");
                            const isEditingThis =
                              activeCellEdit?.employeeId === row.employeeId &&
                              activeCellEdit?.date === day.date;

                            return (
                              <td
                                key={day.date}
                                className={`py-2 px-1.5 text-center border-r border-[#DFE1E6] last:border-r-0 relative ${
                                  day.isWeekend ? "bg-[#FAFBFC]/50" : ""
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!canManageRoster) return;
                                    if (isEditingThis) {
                                      setActiveCellEdit(null);
                                    } else {
                                      setActiveCellEdit({
                                        employeeId: row.employeeId,
                                        date: day.date,
                                        currentShift: shiftCode,
                                      });
                                    }
                                  }}
                                  disabled={!canManageRoster}
                                  className={`w-full py-1 px-1.5 rounded text-[11px] font-bold border transition text-center ${getShiftBadge(
                                    shiftCode
                                  )} ${
                                    canManageRoster
                                      ? "cursor-pointer hover:brightness-95"
                                      : "cursor-default"
                                  }`}
                                  title={
                                    canManageRoster
                                      ? `Click to reassign shift (${shiftCode})`
                                      : shiftCode
                                  }
                                >
                                  {shiftCode}
                                </button>

                                {/* Quick Shift Edit Popover */}
                                {isEditingThis && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute z-30 top-10 left-1/2 -translate-x-1/2 bg-white rounded shadow-xl border border-[#DFE1E6] p-2 min-w-[130px] space-y-1 text-left animate-in fade-in"
                                  >
                                    <div className="text-[10px] font-bold text-[#6B778C] uppercase px-1 pb-1 border-b border-[#EBECF0]">
                                      Assign Shift
                                    </div>
                                    {shifts.map((s) => (
                                      <button
                                        key={s.shiftCode}
                                        type="button"
                                        onClick={() => handleCellShiftSelect(s.shiftCode)}
                                        className="w-full text-left px-2 py-1 rounded text-[11px] font-medium hover:bg-[#F4F5F7] flex items-center justify-between cursor-pointer"
                                      >
                                        <span className="font-bold text-[#172B4D]">
                                          {s.shiftCode}
                                        </span>
                                        <span className="text-[10px] text-[#6B778C]">
                                          {s.startTime}
                                        </span>
                                      </button>
                                    ))}
                                    <div className="pt-1 border-t border-[#EBECF0]">
                                      <button
                                        type="button"
                                        onClick={() => setActiveCellEdit(null)}
                                        className="w-full text-center text-[10px] text-[#6B778C] hover:text-[#172B4D] py-0.5 cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}
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
          </div>
        )}

        {/* ========================================================
            TAB 2: SHIFT POLICIES & DEFINITIONS
            ======================================================== */}
        {activeTab === "shifts" && (
          <div className="space-y-4">
            <div className="bg-white border border-[#DFE1E6] rounded p-4 shadow-2xs">
              <h3 className="font-bold text-sm text-[#172B4D] flex items-center gap-2">
                <Clock size={16} className="text-[#0052CC]" />
                Standard Enterprise Shift Definitions & Grace Thresholds
              </h3>
              <p className="text-xs text-[#6B778C] mt-1">
                Staffify compliant working hours, late mark grace periods, and weekly rest allocations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {shifts.map((s) => (
                <div
                  key={s.shiftCode}
                  className="bg-white border border-[#DFE1E6] rounded-md p-4 shadow-2xs hover:shadow-xs transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold border ${getShiftBadge(
                        s.shiftCode
                      )}`}
                    >
                      {s.shiftCode}
                    </span>
                    <span className="text-[11px] text-[#6B778C] font-semibold">
                      {s.isNightShift ? "Overnight Shift" : "Day Shift"}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-[#172B4D]">{s.name}</h4>
                    <p className="text-xs text-[#5E6C84] mt-1 leading-relaxed">
                      {s.description || "Operational turnout schedule"}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#EBECF0] space-y-1.5 text-xs text-[#172B4D]">
                    <div className="flex justify-between">
                      <span className="text-[#6B778C]">Shift Window:</span>
                      <span className="font-bold">
                        {s.startTime} - {s.endTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B778C]">Grace Minutes:</span>
                      <span className="font-bold">{s.graceMinutes} mins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B778C]">Full Day Threshold:</span>
                      <span className="font-bold">{s.fullDayHours} hours</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: SHIFT SWAP TRAY
            ======================================================== */}
        {activeTab === "swaps" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-[#DFE1E6] rounded p-4 shadow-2xs">
              <div>
                <h3 className="font-bold text-sm text-[#172B4D] flex items-center gap-1.5">
                  <ArrowLeftRight size={16} className="text-[#6554C0]" />
                  Peer Shift Swap Management
                </h3>
                <p className="text-xs text-[#6B778C] mt-0.5">
                  Review peer exchange requests and automated roster schedule reconciliation
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={swapFilterStatus}
                  onChange={(e) => setSwapFilterStatus(e.target.value)}
                  className="px-2.5 py-1.5 border border-[#DFE1E6] rounded text-xs font-medium text-[#172B4D] bg-white cursor-pointer"
                >
                  <option value="All">All Swap Requests</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <button
                  onClick={() => setIsSwapModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus size={14} />
                  New Swap Request
                </button>
              </div>
            </div>

            {/* Swaps List */}
            {swaps.length === 0 ? (
              <div className="bg-white border border-[#DFE1E6] rounded p-12 text-center">
                <ArrowLeftRight size={32} className="mx-auto text-[#A5ADBA] mb-2" />
                <h3 className="font-bold text-sm text-[#172B4D]">No Shift Swaps Found</h3>
                <p className="text-xs text-[#6B778C] mt-1 mb-4">
                  Employees can request shift swaps with eligible teammates for rotational coverage.
                </p>
                <button
                  onClick={() => setIsSwapModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-xs transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  Create First Swap Request
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {swaps
                  .filter((s) => swapFilterStatus === "All" || s.status === swapFilterStatus)
                  .map((swp) => (
                    <div
                      key={swp.swapId}
                      className="bg-white border border-[#DFE1E6] rounded-md p-4 shadow-2xs hover:shadow-xs transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#EBECF0]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#172B4D]">{swp.swapId}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              swp.status === "Approved"
                                ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                                : swp.status === "Rejected"
                                ? "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]"
                                : "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]"
                            }`}
                          >
                            {swp.status}
                          </span>
                        </div>

                        {/* Manager approval actions */}
                        {canManageRoster && swp.status === "Pending Approval" && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReviewSwap(swp.swapId, "Approved")}
                              className="px-3 py-1 bg-[#00875A] hover:bg-[#006644] text-white font-medium rounded text-xs transition flex items-center gap-1 cursor-pointer"
                            >
                              <Check size={12} />
                              Approve Swap
                            </button>
                            <button
                              onClick={() => handleReviewSwap(swp.swapId, "Rejected")}
                              className="px-3 py-1 bg-white border border-[#DE350B] text-[#DE350B] hover:bg-[#FFEBE6] font-medium rounded text-xs transition flex items-center gap-1 cursor-pointer"
                            >
                              <X size={12} />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Swap details grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-xs">
                        <div className="p-2.5 bg-[#FAFBFC] rounded border border-[#EBECF0]">
                          <span className="text-[10px] font-bold text-[#6B778C] uppercase block mb-1">
                            Requester
                          </span>
                          <div className="font-bold text-[#172B4D]">{swp.requesterName}</div>
                          <div className="text-[#6B778C] text-[11px] mt-0.5">
                            Giving Date: <strong>{swp.requesterDate}</strong> ([{swp.requesterShift}])
                          </div>
                        </div>

                        <div className="p-2.5 bg-[#FAFBFC] rounded border border-[#EBECF0]">
                          <span className="text-[10px] font-bold text-[#6B778C] uppercase block mb-1">
                            Peer Replacement
                          </span>
                          <div className="font-bold text-[#172B4D]">{swp.peerName}</div>
                          <div className="text-[#6B778C] text-[11px] mt-0.5">
                            Taking Date: <strong>{swp.peerDate}</strong> ([{swp.peerShift}])
                          </div>
                        </div>
                      </div>

                      {swp.reason && (
                        <p className="text-xs text-[#5E6C84] mt-2.5 pt-2 border-t border-[#EBECF0] italic">
                          "{swp.reason}"
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <BulkRosterModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          onSave={handleSaveBulkRoster}
          employees={employees}
          shifts={shifts}
        />

        <ShiftSwapModal
          isOpen={isSwapModalOpen}
          onClose={() => setIsSwapModalOpen(false)}
          onSave={handleSaveShiftSwap}
          currentUser={user}
          employees={employees}
          shifts={shifts}
        />
      </div>
    </DashboardLayout>
  );
}

export default Roster;
