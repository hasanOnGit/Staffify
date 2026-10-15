import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import TeamTable from "../components/TeamTable";
import TeamForm from "../components/TeamForm";
import { getTeams, createTeam, deleteTeam } from "../services/team";
import { Plus, X, Search, CheckCircle2 } from "lucide-react";

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [alertMsg, setAlertMsg] = useState("");

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const data = await getTeams();
      setTeams(data || []);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async (formData) => {
    try {
      await createTeam(formData);
      setAlertMsg("Team created successfully.");
      setShowForm(false);
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to create team");
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    try {
      await deleteTeam(teamId);
      setAlertMsg("Team removed successfully.");
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to delete team");
    }
  };

  // Metrics calculation
  const totalTeams = teams.length;
  const uniqueDepts = new Set(teams.map((t) => t.department).filter(Boolean)).size;
  const totalManagers = teams.reduce((acc, t) => acc + (t.managers?.length || 0), 0);
  const totalAssignedMembers = teams.reduce((acc, t) => acc + (t.members?.length || 0), 0);

  // Filter logic
  const filteredTeams = teams.filter((t) => {
    const matchesSearch =
      (t.name && t.name.toLowerCase().includes(search.toLowerCase())) ||
      (t.teamId && t.teamId.toLowerCase().includes(search.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()));

    const matchesDept =
      departmentFilter === "All" ||
      (t.department && t.department.toLowerCase() === departmentFilter.toLowerCase());

    return matchesSearch && matchesDept;
  });

  return (
    <DashboardLayout>
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#172B4D]">
              Teams & Organization
            </h1>
            <span className="bg-[#DEEBFF] text-[#0747A6] text-xs px-2 py-0.5 rounded font-semibold border border-[#B3D4FF]">
              Staffify Org Unit
            </span>
          </div>
          <p className="text-xs text-[#6B778C] mt-0.5">
            Configure functional cross-department squads, team leadership, and member rosters
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium px-3.5 py-1.5 rounded text-xs transition flex items-center gap-1.5 cursor-pointer"
        >
          {showForm ? (
            <>
              <X size={13} />
              <span>Close Form</span>
            </>
          ) : (
            <>
              <Plus size={13} />
              <span>Create Team</span>
            </>
          )}
        </button>
      </div>

      {/* Alert Notification */}
      {alertMsg && (
        <div className="mb-4 p-3 bg-[#E3FCEF] border border-[#ABF5D1] text-[#006644] rounded text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[#00875A]" />
            <span>{alertMsg}</span>
          </div>
          <button onClick={() => setAlertMsg("")} className="text-[#006644] hover:text-[#DE350B] p-0.5">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <div className="bg-white p-3.5 rounded border border-[#DFE1E6]" style={{ borderTop: "3px solid #0052CC" }}>
          <p className="text-[11px] font-semibold text-[#6B778C] uppercase tracking-wider">Total Teams</p>
          <p className="text-xl font-bold text-[#172B4D] mt-1">{totalTeams}</p>
        </div>
        <div className="bg-white p-3.5 rounded border border-[#DFE1E6]" style={{ borderTop: "3px solid #00875A" }}>
          <p className="text-[11px] font-semibold text-[#6B778C] uppercase tracking-wider">Departments</p>
          <p className="text-xl font-bold text-[#172B4D] mt-1">{uniqueDepts}</p>
        </div>
        <div className="bg-white p-3.5 rounded border border-[#DFE1E6]" style={{ borderTop: "3px solid #403294" }}>
          <p className="text-[11px] font-semibold text-[#6B778C] uppercase tracking-wider">Team Leaders</p>
          <p className="text-xl font-bold text-[#172B4D] mt-1">{totalManagers}</p>
        </div>
        <div className="bg-white p-3.5 rounded border border-[#DFE1E6]" style={{ borderTop: "3px solid #FF991F" }}>
          <p className="text-[11px] font-semibold text-[#6B778C] uppercase tracking-wider">Total Roster</p>
          <p className="text-xl font-bold text-[#172B4D] mt-1">{totalAssignedMembers}</p>
        </div>
      </div>

      {/* Team Create Form */}
      {showForm && (
        <TeamForm
          onCancel={() => setShowForm(false)}
          onCreate={handleCreateTeam}
        />
      )}

      {/* Filters & Search */}
      <div className="bg-white p-3.5 rounded border border-[#DFE1E6] mb-5 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex-1 w-full md:w-auto relative">
          <Search size={14} className="absolute left-3 top-2.5 text-[#6B778C]" />
          <input
            type="text"
            placeholder="Search teams by name, ID or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-[#DFE1E6] rounded text-xs text-[#172B4D] focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-medium text-[#6B778C]">Department:</label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="border border-[#DFE1E6] rounded px-2.5 py-1.5 text-xs text-[#172B4D] focus:outline-none focus:border-[#0052CC] bg-white"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Design">Design</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
          </select>
        </div>
      </div>

      {/* Team List Table */}
      {loading ? (
        <div className="bg-white border border-[#DFE1E6] rounded p-12 text-center text-[#6B778C]">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#0052CC] mx-auto mb-3"></div>
          <p className="text-xs">Loading organization teams...</p>
        </div>
      ) : (
        <TeamTable teams={filteredTeams} onDelete={handleDeleteTeam} />
      )}
    </DashboardLayout>
  );
}

export default Teams;
