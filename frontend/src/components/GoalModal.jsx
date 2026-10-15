import { useState, useEffect } from "react";
import { Target, X, Plus, Check } from "lucide-react";

function GoalModal({ isOpen, onClose, onSave, employeeId, employeeName, department, initialData }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Core Deliverable");
  const [cycle, setCycle] = useState("Q4 2026");
  const [weightage, setWeightage] = useState(25);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [status, setStatus] = useState("In Progress");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setCategory(initialData.category || "Core Deliverable");
      setCycle(initialData.cycle || "Q4 2026");
      setWeightage(initialData.weightage || 25);
      setProgressPercentage(initialData.progressPercentage || 0);
      setStatus(initialData.status || "In Progress");
      setDueDate(initialData.dueDate || "");
    } else {
      setTitle("");
      setDescription("");
      setCategory("Core Deliverable");
      setCycle("Q4 2026");
      setWeightage(25);
      setProgressPercentage(0);
      setStatus("In Progress");
      setDueDate("");
    }
  }, [initialData, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      goalId: initialData?.goalId,
      employeeId,
      employeeName,
      department,
      title,
      description,
      category,
      cycle,
      weightage: Number(weightage),
      progressPercentage: Number(progressPercentage),
      status: Number(progressPercentage) >= 100 ? "Completed" : status,
      dueDate,
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
              <Target size={14} />
            </div>
            <h3 className="font-bold text-[#172B4D] text-sm">
              {initialData ? "Edit Goal / OKR" : "Add New Goal / OKR"}
            </h3>
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
          <div>
            <label className="font-semibold text-[#172B4D] block mb-1">
              Goal Title <span className="text-[#DE350B]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Deliver Mobile Check-in MVP with 99% uptime"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC] text-[#172B4D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC] bg-white text-[#172B4D]"
              >
                <option value="Core Deliverable">Core Deliverable</option>
                <option value="Skill Development">Skill Development</option>
                <option value="Operational Excellence">Operational Excellence</option>
                <option value="Leadership & Culture">Leadership & Culture</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">Appraisal Cycle</label>
              <select
                value={cycle}
                onChange={(e) => setCycle(e.target.value)}
                className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC] bg-white text-[#172B4D]"
              >
                <option value="Q4 2026">Q4 2026</option>
                <option value="Q1 2027">Q1 2027</option>
                <option value="Annual 2026-27">Annual 2026-27</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">Weightage (%)</label>
              <input
                type="number"
                min="5"
                max="100"
                value={weightage}
                onChange={(e) => setWeightage(e.target.value)}
                className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC] text-[#172B4D]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC] bg-white text-[#172B4D]"
              />
            </div>
          </div>

          {/* Progress Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-semibold text-[#172B4D]">Progress Completion</label>
              <span className="font-bold text-[#0052CC] bg-[#DEEBFF] px-2 py-0.5 rounded text-[11px]">
                {progressPercentage}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progressPercentage}
              onChange={(e) => {
                const val = Number(e.target.value);
                setProgressPercentage(val);
                if (val >= 100) setStatus("Completed");
                else if (val > 0 && status === "Not Started") setStatus("In Progress");
              }}
              className="w-full accent-[#0052CC] cursor-pointer"
            />
          </div>

          <div>
            <label className="font-semibold text-[#172B4D] block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC] bg-white text-[#172B4D]"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="On Track">On Track</option>
              <option value="At Risk">At Risk</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-[#172B4D] block mb-1">
              Description & Key Results
            </label>
            <textarea
              rows="3"
              placeholder="Outline specific measurable outcomes and milestones..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC] text-[#172B4D]"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-[#DFE1E6]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-[#DFE1E6] rounded text-xs text-[#172B4D] hover:bg-[#EBECF0] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Check size={13} />
              <span>{initialData ? "Save Changes" : "Create Goal"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GoalModal;
