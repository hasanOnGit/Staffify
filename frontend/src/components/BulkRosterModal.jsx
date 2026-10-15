import { useState, useEffect } from "react";
import { Calendar, Users, Clock, Check, X, Layers, AlertCircle } from "lucide-react";

function BulkRosterModal({ isOpen, onClose, onSave, employees = [], shifts = [] }) {
  const [scope, setScope] = useState("department"); // "department" | "employees"
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [selectedShift, setSelectedShift] = useState("GS");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeWeekends, setIncludeWeekends] = useState(false);

  useEffect(() => {
    const today = new Date();
    const ymd = today.toISOString().split("T")[0];
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 13);
    const endYmd = nextWeek.toISOString().split("T")[0];

    setStartDate(ymd);
    setEndDate(endYmd);
    setSelectedEmployeeIds([]);
    setScope("department");
    setSelectedDept("All");
    setSelectedShift("GS");
    setIncludeWeekends(false);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const departments = ["All", ...new Set(employees.map((e) => e.department).filter(Boolean))];

  const handleToggleEmployee = (empId) => {
    if (selectedEmployeeIds.includes(empId)) {
      setSelectedEmployeeIds(selectedEmployeeIds.filter((id) => id !== empId));
    } else {
      setSelectedEmployeeIds([...selectedEmployeeIds, empId]);
    }
  };

  const handleSelectAllEmployees = () => {
    if (selectedEmployeeIds.length === employees.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(employees.map((e) => e.employeeId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !selectedShift) return;

    onSave({
      scope,
      department: scope === "department" ? selectedDept : undefined,
      employeeIds: scope === "employees" ? selectedEmployeeIds : [],
      startDate,
      endDate,
      shiftCode: selectedShift,
      includeWeekends,
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl border border-[#DFE1E6] w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 px-5 py-3.5 bg-[#F4F5F7] border-b border-[#DFE1E6] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#0052CC] text-white flex items-center justify-center">
              <Layers size={14} />
            </div>
            <div>
              <h3 className="font-bold text-[#172B4D] text-sm">Bulk Shift Assignment</h3>
              <p className="text-[11px] text-[#6B778C]">
                Schedule rotational rosters across departments or squads
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#6B778C] hover:text-[#172B4D] hover:bg-[#EBECF0] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Target Scope */}
          <div>
            <label className="font-semibold text-[#172B4D] block mb-1.5">Target Scope</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScope("department")}
                className={`py-2 px-3 rounded border text-center font-medium transition cursor-pointer ${
                  scope === "department"
                    ? "border-[#0052CC] bg-[#DEEBFF] text-[#0052CC]"
                    : "border-[#DFE1E6] bg-white text-[#42526E] hover:bg-[#F4F5F7]"
                }`}
              >
                Department / Squad
              </button>
              <button
                type="button"
                onClick={() => setScope("employees")}
                className={`py-2 px-3 rounded border text-center font-medium transition cursor-pointer ${
                  scope === "employees"
                    ? "border-[#0052CC] bg-[#DEEBFF] text-[#0052CC]"
                    : "border-[#DFE1E6] bg-white text-[#42526E] hover:bg-[#F4F5F7]"
                }`}
              >
                Selected Employees
              </button>
            </div>
          </div>

          {/* Department Selection */}
          {scope === "department" ? (
            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">
                Select Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === "All" ? "All Departments (Entire Organization)" : dept}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-[#172B4D]">
                  Select Employees ({selectedEmployeeIds.length} chosen)
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllEmployees}
                  className="text-[11px] text-[#0052CC] hover:underline font-medium cursor-pointer"
                >
                  {selectedEmployeeIds.length === employees.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              <div className="max-h-36 overflow-y-auto border border-[#DFE1E6] rounded p-2 space-y-1 bg-[#FAFBFC]">
                {employees.map((emp) => (
                  <label
                    key={emp.employeeId}
                    className="flex items-center gap-2 p-1.5 rounded hover:bg-white transition cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployeeIds.includes(emp.employeeId)}
                      onChange={() => handleToggleEmployee(emp.employeeId)}
                      className="rounded border-[#DFE1E6] text-[#0052CC] focus:ring-[#0052CC]"
                    />
                    <span className="font-medium text-[#172B4D]">{emp.name}</span>
                    <span className="text-[10px] text-[#6B778C]">({emp.employeeId} • {emp.department})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Shift Selection */}
          <div>
            <label className="font-semibold text-[#172B4D] block mb-1">
              Select Shift Pattern <span className="text-[#DE350B]">*</span>
            </label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white font-medium"
            >
              {shifts.map((s) => (
                <option key={s.shiftCode} value={s.shiftCode}>
                  [{s.shiftCode}] {s.name} ({s.startTime} - {s.endTime})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">
                Start Date <span className="text-[#DE350B]">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">
                End Date <span className="text-[#DE350B]">*</span>
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
              />
            </div>
          </div>

          {/* Weekend policy */}
          <div className="p-3 bg-[#F4F5F7] rounded border border-[#DFE1E6] space-y-1">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-[#172B4D]">
              <input
                type="checkbox"
                checked={includeWeekends}
                onChange={(e) => setIncludeWeekends(e.target.checked)}
                className="rounded border-[#DFE1E6] text-[#0052CC] focus:ring-[#0052CC]"
              />
              <span>Include Saturdays and Sundays in Assignment</span>
            </label>
            <p className="text-[11px] text-[#6B778C] pl-5">
              If unchecked, weekend days will remain designated as Weekly Off (WO).
            </p>
          </div>

          {/* Sticky Form Action Footer */}
          <div className="pt-3 border-t border-[#DFE1E6] flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#42526E] font-medium rounded text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-xs transition shadow-sm cursor-pointer"
            >
              Apply Shift Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BulkRosterModal;
