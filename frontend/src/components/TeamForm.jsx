import { useState } from "react";

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
    <div className="bg-white border border-purple-100 rounded-2xl p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Create New Team</h2>
          <p className="text-xs text-gray-500">Group employees into functional units, departments, or project pods</p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 text-lg font-semibold"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Team Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Core Platform & Architecture"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
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
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Description
          </label>
          <textarea
            rows="2"
            placeholder="Key responsibilities and scope of this team..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-sm disabled:opacity-50"
          >
            {loading ? "Creating..." : "Save Team"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TeamForm;
