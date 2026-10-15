import { useState } from "react";
import { X } from "lucide-react";

function TeamForm({ onCancel, onCreate }) {
  const [teamName, setTeamName] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    try {
      setLoading(true);
      await onCreate({
        name: teamName.trim(),
        department,
        description: description.trim(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#DFE1E6] rounded p-5 mb-5">
      <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-[#DFE1E6]">
        <div>
          <h2 className="text-sm font-bold text-[#172B4D]">Create New Team</h2>
          <p className="text-xs text-[#6B778C]">Group employees into functional units, departments, or project pods</p>
        </div>
        <button
          onClick={onCancel}
          className="text-[#6B778C] hover:text-[#172B4D] p-1 cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Team Name <span className="text-[#DE350B]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Core Platform & Architecture"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              className="w-full border border-[#DFE1E6] rounded px-3 py-1.5 text-xs text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Department <span className="text-[#DE350B]">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border border-[#DFE1E6] rounded px-3 py-1.5 text-xs text-[#172B4D] focus:outline-none focus:border-[#0052CC] bg-white"
            >
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
              <option value="Quality Assurance">Quality Assurance</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#172B4D] mb-1">
            Description
          </label>
          <textarea
            rows="2"
            placeholder="Key responsibilities and scope of this team..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-[#DFE1E6] rounded px-3 py-1.5 text-xs text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 border border-[#DFE1E6] rounded text-xs font-medium text-[#172B4D] hover:bg-[#F4F5F7] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-medium transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Creating..." : "Save Team"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TeamForm;
