import { useState, useEffect } from "react";
import { Briefcase, X, Building2, MapPin, DollarSign, Users } from "lucide-react";

function JobModal({ isOpen, onClose, onSave, currentUser }) {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [location, setLocation] = useState("Bangalore, India");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [openings, setOpenings] = useState(1);
  const [experienceRequired, setExperienceRequired] = useState("3-5 Years");
  const [salaryRange, setSalaryRange] = useState("₹15L - ₹22L PA");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");

  useEffect(() => {
    setTitle("");
    setDepartment("Engineering");
    setLocation("Bangalore, India");
    setEmploymentType("Full-time");
    setOpenings(1);
    setExperienceRequired("3-5 Years");
    setSalaryRange("₹15L - ₹22L PA");
    setDescription("");
    setRequirements("");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      department,
      location,
      employmentType,
      openings: Number(openings) || 1,
      experienceRequired,
      salaryRange,
      description,
      requirements,
      hiringManagerId: currentUser?.employeeId || "EMP-MGR-02",
      hiringManagerName: currentUser?.name || "Manager User",
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
              <Briefcase size={14} />
            </div>
            <div>
              <h3 className="font-bold text-[#172B4D] text-sm">Create Job Requisition</h3>
              <p className="text-[11px] text-[#6B778C]">
                Publish open headcount requisition for squad recruitment
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
          <div>
            <label className="font-semibold text-[#172B4D] block mb-1">
              Job Title / Role <span className="text-[#DE350B]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Backend Engineer (Distributed Systems)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">
                Department <span className="text-[#DE350B]">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">
                Location & Workplace
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white"
              >
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">Target Openings</label>
              <input
                type="number"
                min={1}
                value={openings}
                onChange={(e) => setOpenings(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">Experience</label>
              <input
                type="text"
                value={experienceRequired}
                onChange={(e) => setExperienceRequired(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#172B4D] block mb-1">Budgeted Salary Range</label>
            <input
              type="text"
              placeholder="e.g. ₹18L - ₹24L PA"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-[#172B4D] block mb-1">Role Mission & Summary</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key responsibilities and day-to-day deliverables..."
              className="w-full px-3 py-2 border border-[#DFE1E6] rounded text-[#172B4D] resize-none"
            />
          </div>

          <div>
            <label className="font-semibold text-[#172B4D] block mb-1">Key Skill Competencies</label>
            <textarea
              rows={2}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="e.g. React, TypeScript, Node.js, System Design..."
              className="w-full px-3 py-2 border border-[#DFE1E6] rounded text-[#172B4D] resize-none"
            />
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
              Publish Requisition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JobModal;
