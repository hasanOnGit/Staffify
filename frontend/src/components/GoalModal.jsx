import { useState, useEffect } from "react";
import {
  Target,
  X,
  Plus,
  Check,
  CheckCircle2,
  Trash2,
  Info,
  Sliders,
  Calendar,
  Sparkles,
} from "lucide-react";

function GoalModal({
  isOpen,
  onClose,
  onSave,
  employeeId,
  employeeName,
  department,
  initialData,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keyResults, setKeyResults] = useState(["", ""]);
  const [category, setCategory] = useState("Core Deliverable");
  const [cycle, setCycle] = useState("Q4 2026");
  const [weightage, setWeightage] = useState(25);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [status, setStatus] = useState("In Progress");
  const [dueDate, setDueDate] = useState("");
  const [activeMode, setActiveMode] = useState("guided"); // "guided" or "raw"

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

      // Extract bullet points as key results if present
      const rawDesc = initialData.description || "";
      const bulletLines = rawDesc
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.startsWith("•") || l.startsWith("-") || l.startsWith("*"))
        .map((l) => l.replace(/^[•\-*]\s*/, ""));

      if (bulletLines.length > 0) {
        setKeyResults(bulletLines);
      } else {
        setKeyResults(["", ""]);
      }
    } else {
      setTitle("");
      setDescription("");
      setKeyResults(["", ""]);
      setCategory("Core Deliverable");
      setCycle("Q4 2026");
      setWeightage(25);
      setProgressPercentage(0);
      setStatus("In Progress");
      // Default due date: 30 days ahead
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setDueDate(d.toISOString().split("T")[0]);
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

  const handleAddKeyResult = () => {
    if (keyResults.length < 5) {
      setKeyResults([...keyResults, ""]);
    }
  };

  const handleUpdateKeyResult = (index, value) => {
    const updated = [...keyResults];
    updated[index] = value;
    setKeyResults(updated);
  };

  const handleRemoveKeyResult = (index) => {
    if (keyResults.length > 1) {
      setKeyResults(keyResults.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Compile description including key results if in guided mode
    let finalDescription = description.trim();
    const validKrs = keyResults.filter((k) => k.trim().length > 0);
    if (validKrs.length > 0) {
      const krsText = validKrs.map((k) => `• ${k.trim()}`).join("\n");
      finalDescription = finalDescription
        ? `${finalDescription}\n\nKey Milestones:\n${krsText}`
        : `Key Milestones:\n${krsText}`;
    }

    onSave({
      goalId: initialData?.goalId,
      employeeId,
      employeeName,
      department,
      title: title.trim(),
      description: finalDescription,
      category,
      cycle,
      weightage: Number(weightage),
      progressPercentage: Number(progressPercentage),
      status: Number(progressPercentage) >= 100 ? "Completed" : status,
      dueDate,
    });
  };

  // Helper for progress status label
  const getProgressLabel = (p) => {
    if (p >= 100) return "Completed — Goal Achieved!";
    if (p >= 70) return "Near Completion — Final Stretch";
    if (p >= 40) return "Solid Momentum — Halfway Done";
    if (p > 0) return "In Progress — Getting Started";
    return "Not Started Yet (0%)";
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl border border-[#DFE1E6] w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Friendly Header */}
        <div className="sticky top-0 z-20 px-5 py-3.5 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-[#DFE1E6] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0052CC] text-white flex items-center justify-center shadow-xs">
              <Target size={16} />
            </div>
            <div>
              <h3 className="font-bold text-[#172B4D] text-sm flex items-center gap-2">
                <span>{initialData ? "Update Objective & OKR" : "Set New Objective & OKR"}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DEEBFF] text-[#0052CC]">
                  {cycle}
                </span>
              </h3>
              <p className="text-[11px] text-[#6B778C]">
                Define what you want to achieve and measure progress with concrete milestones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#6B778C] hover:text-[#172B4D] hover:bg-[#EBECF0] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Guided Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Quick Explainer Callout */}
          <div className="p-3 bg-[#DEEBFF]/30 border border-[#B3D4FF] rounded-lg flex items-start gap-2.5 text-[11px] text-[#0747A6]">
            <Info size={15} className="text-[#0052CC] shrink-0 mt-0.5" />
            <div>
              <strong>Quick Tip:</strong> An <strong>Objective</strong> is your inspiring destination.
              <strong> Key Results</strong> are the 2 or 3 measurable steps that prove you reached it.
            </div>
          </div>

          {/* 1. Objective Title */}
          <div>
            <label className="font-bold text-[#172B4D] block mb-1 text-xs">
              1. What is your Objective? <span className="text-[#DE350B]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Launch high-speed mobile check-in app with 99.9% uptime"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-[#DFE1E6] rounded-md px-3 py-2 text-xs font-semibold text-[#172B4D] outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] bg-white placeholder:text-[#A5ADBA]"
            />
            <p className="text-[10px] text-[#6B778C] mt-1">
              Make it clear, ambitious, and focused on an actual business or skill outcome.
            </p>
          </div>

          {/* 2. Key Results (Measurable Steps) */}
          <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-lg p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-[#172B4D] text-xs block">
                  2. Key Results & Measurable Milestones
                </label>
                <p className="text-[10px] text-[#6B778C]">
                  How will you measure success along the way? (Checkable on your card)
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddKeyResult}
                disabled={keyResults.length >= 4}
                className="text-[11px] font-semibold text-[#0052CC] hover:text-[#0747A6] flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <Plus size={12} />
                <span>Add Step</span>
              </button>
            </div>

            <div className="space-y-2">
              {keyResults.map((kr, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#DEEBFF] text-[#0052CC] font-bold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <input
                    type="text"
                    placeholder={`e.g. ${
                      idx === 0
                        ? "Complete system architecture & API design"
                        : idx === 1
                        ? "Run internal beta testing with 20 active team users"
                        : "Attain 95%+ test coverage and sign-off"
                    }`}
                    value={kr}
                    onChange={(e) => handleUpdateKeyResult(idx, e.target.value)}
                    className="flex-1 border border-[#DFE1E6] rounded px-2.5 py-1.5 text-xs bg-white text-[#172B4D] outline-none focus:border-[#0052CC]"
                  />
                  {keyResults.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyResult(idx)}
                      className="p-1 rounded text-[#6B778C] hover:text-[#DE350B] hover:bg-[#FFEBE6] transition cursor-pointer"
                      title="Remove milestone"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Category & Target Quarter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-[#DFE1E6] rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-[#0052CC] bg-white text-[#172B4D] cursor-pointer"
              >
                <option value="Core Deliverable">Core Deliverable (Main Work)</option>
                <option value="Skill Development">Skill Development & Learning</option>
                <option value="Operational Excellence">Operational Excellence & Quality</option>
                <option value="Leadership & Culture">Leadership & Team Culture</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">
                Target Timeline & Quarter
              </label>
              <select
                value={cycle}
                onChange={(e) => setCycle(e.target.value)}
                className="w-full border border-[#DFE1E6] rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-[#0052CC] bg-white text-[#172B4D] cursor-pointer"
              >
                <option value="Q4 2026">Q4 2026 (Oct - Dec)</option>
                <option value="Q1 2027">Q1 2027 (Jan - Mar)</option>
                <option value="Annual 2026-27">Annual 2026-27 Goals</option>
              </select>
            </div>
          </div>

          {/* 4. Priority Level & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">
                Priority & Focus Level
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                {[
                  { label: "Standard", wt: 25 },
                  { label: "High Focus", wt: 35 },
                  { label: "Top Priority", wt: 50 },
                ].map((tier) => (
                  <button
                    key={tier.label}
                    type="button"
                    onClick={() => setWeightage(tier.wt)}
                    className={`p-1.5 rounded border text-[11px] font-semibold transition cursor-pointer ${
                      weightage === tier.wt
                        ? "bg-[#0052CC] text-white border-[#0052CC]"
                        : "bg-white text-[#42526E] border-[#DFE1E6] hover:bg-[#F4F5F7]"
                    }`}
                  >
                    {tier.label}
                    <span className="block text-[9px] opacity-80">{tier.wt}% wt</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">
                Target Completion Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-[#DFE1E6] rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-[#0052CC] bg-white text-[#172B4D]"
              />
            </div>
          </div>

          {/* 5. Interactive Progress Slider */}
          <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-lg p-3.5 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <label className="font-bold text-[#172B4D] text-xs block">
                  Current Completion Progress
                </label>
                <span className="text-[11px] text-[#0052CC] font-medium">
                  {getProgressLabel(progressPercentage)}
                </span>
              </div>
              <span className="font-black text-sm text-[#0052CC] bg-[#DEEBFF] px-2.5 py-0.5 rounded border border-[#B3D4FF]">
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
                else if (val > 0 && status === "Not Started") setStatus("On Track");
              }}
              className="w-full accent-[#0052CC] cursor-pointer"
            />

            {/* Quick status toggle */}
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span className="text-[#6B778C]">Confidence State:</span>
              <div className="flex items-center gap-1.5">
                {["On Track", "In Progress", "At Risk", "Completed"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setStatus(st);
                      if (st === "Completed") setProgressPercentage(100);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition cursor-pointer ${
                      status === st
                        ? st === "Completed"
                          ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                          : st === "At Risk"
                          ? "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]"
                          : "bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]"
                        : "bg-white text-[#6B778C] border-[#DFE1E6] hover:bg-[#F4F5F7]"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-between items-center pt-3 border-t border-[#DFE1E6]">
            <span className="text-[11px] text-[#6B778C]">
              Assigned to: <strong>{employeeName || "Employee"}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 border border-[#DFE1E6] rounded text-xs font-semibold text-[#172B4D] hover:bg-[#EBECF0] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Check size={13} />
                <span>{initialData ? "Save Updates" : "Create Objective"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GoalModal;
