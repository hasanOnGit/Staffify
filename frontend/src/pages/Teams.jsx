import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import TeamTable from "../components/TeamTable";
import TeamForm from "../components/TeamForm";
import { getTeams, createTeam, deleteTeam } from "../services/team";

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

  const handleCreateTeam = async (payload) => {
    try {
      await createTeam(payload);
      setShowForm(false);
      setAlertMsg("Team created successfully!");
      fetchTeams();
      setTimeout(() => setAlertMsg(""), 3500);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create team");
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    try {
      await deleteTeam(teamId);
      setAlertMsg("Team deleted successfully!");
      fetchTeams();
      setTimeout(() => setAlertMsg(""), 3500);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete team");
    }
  };

  // Filtered teams
  const filteredTeams = teams.filter((t) => {
    const matchesDept =
      departmentFilter === "All" ||
      t.department?.toLowerCase() === departmentFilter.toLowerCase();
    const matchesSearch =
      search === "" ||
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.teamId?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesSearch;
  });

  // Calculate metrics
  const totalTeams = teams.length;
  const uniqueDepts = new Set(teams.map((t) => t.department)).size;
  const totalAssignedMembers = teams.reduce(
    (acc, t) => acc + (t.members?.length || 0),
    0
  );
  const totalManagers = teams.reduce(
    (acc, t) => acc + (t.managers?.length || 0),
    0
  );

  return (
    <DashboardLayout>
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Teams & Organization
            </h1>
            <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              greytHR Org Unit
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Configure functional cross-department squads, team leadership, and member rosters.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-sm transition flex items-center gap-2"
        >
          {showForm ? "✕ Close Form" : "+ Create Team"}
        </button>
      </div>

      {/* Alert Notification */}
      {alertMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm flex items-center justify-between animate-fadeIn">
          <span>✓ {alertMsg}</span>
          <button onClick={() => setAlertMsg("")} className="text-green-600 font-bold">×</button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Teams</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalTeams}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Departments</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{uniqueDepts}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Team Leaders</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{totalManagers}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Roster</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{totalAssignedMembers}</p>
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
      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex-1 w-full md:w-auto relative">
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search teams by name, ID or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-medium text-gray-600">Department:</label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
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
        <div className="bg-white border rounded-2xl p-12 text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
          Loading organization teams...
        </div>
      ) : (
        <TeamTable teams={filteredTeams} onDelete={handleDeleteTeam} />
      )}
    </DashboardLayout>
  );
}

export default Teams;
