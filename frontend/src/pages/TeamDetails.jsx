import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import TeamMembersTable from "../components/TeamMembersTable";
import {
  getTeamById,
  addTeamManager,
  removeTeamManager,
  addTeamMember,
  removeTeamMember,
} from "../services/team";
import { getEmployees } from "../services/employee";

function TeamDetails() {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  // Modal states
  const [showAddManagerModal, setShowAddManagerModal] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState("");

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [memberRole, setMemberRole] = useState("Member");

  // Member search
  const [memberSearch, setMemberSearch] = useState("");

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      setError("");
      const [teamData, empData] = await Promise.all([
        getTeamById(teamId),
        getEmployees().catch(() => []),
      ]);
      setTeam(teamData);
      setEmployees(empData || []);
    } catch (err) {
      console.error("Error fetching team details:", err);
      setError("Failed to load team details. Team may not exist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchTeamData();
    }
  }, [teamId]);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  // Add Manager
  const handleAddManager = async (e) => {
    e.preventDefault();
    if (!selectedManagerId) return;

    try {
      await addTeamManager(teamId, selectedManagerId);
      setShowAddManagerModal(false);
      setSelectedManagerId("");
      showToast("Team lead/manager assigned successfully!");
      fetchTeamData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add manager");
    }
  };

  // Remove Manager
  const handleRemoveManager = async (employeeId) => {
    if (!window.confirm("Remove this manager from the team leadership?")) return;
    try {
      await removeTeamManager(teamId, employeeId);
      showToast("Manager removed from team leadership.");
      fetchTeamData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to remove manager");
    }
  };

  // Add Member
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    try {
      await addTeamMember(teamId, {
        employeeId: selectedMemberId,
        role: memberRole.trim() || "Member",
      });
      setShowAddMemberModal(false);
      setSelectedMemberId("");
      setMemberRole("Member");
      showToast("Member assigned to squad successfully!");
      fetchTeamData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add member to team");
    }
  };

  // Remove Member
  const handleRemoveMember = async (employeeId) => {
    if (!window.confirm("Remove this employee from the team roster?")) return;
    try {
      await removeTeamMember(teamId, employeeId);
      showToast("Member removed from team roster.");
      fetchTeamData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to remove member");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-white border rounded-2xl p-16 text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
          Loading squad structure and roster...
        </div>
      </DashboardLayout>
    );
  }

  if (error || !team) {
    return (
      <DashboardLayout>
        <div className="bg-white border rounded-2xl p-12 text-center">
          <p className="text-red-500 font-medium mb-4">{error || "Team not found"}</p>
          <button
            onClick={() => navigate("/teams")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
          >
            ← Back to Teams
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const managers = team.managers || [];
  const members = team.members || [];

  const filteredMembers = members.filter((m) => {
    if (!memberSearch) return true;
    const term = memberSearch.toLowerCase();
    return (
      m.name?.toLowerCase().includes(term) ||
      m.employeeId?.toLowerCase().includes(term) ||
      m.email?.toLowerCase().includes(term) ||
      m.role?.toLowerCase().includes(term)
    );
  });

  return (
    <DashboardLayout>
      {/* Toast Notification */}
      {notification && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm flex items-center justify-between">
          <span>✓ {notification}</span>
          <button onClick={() => setNotification("")} className="text-green-600 font-bold">×</button>
        </div>
      )}

      {/* Back Button & Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/teams")}
          className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 mb-3 transition"
        >
          ← Back to Teams List
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-xl shadow-md flex-shrink-0">
              {team.name?.charAt(0)?.toUpperCase() || "T"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                <span className="font-mono text-xs bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full font-bold border border-purple-100">
                  {team.teamId || "TEAM"}
                </span>
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-medium border border-blue-100">
                  {team.department || "General"}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                {team.description || "Active cross-functional squad and operational division"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-xl text-sm shadow-sm transition flex items-center gap-1.5"
            >
              + Add Member
            </button>
            <button
              onClick={() => setShowAddManagerModal(true)}
              className="bg-white border border-purple-200 hover:bg-purple-50 text-purple-700 font-semibold px-4 py-2 rounded-xl text-sm transition"
            >
              + Assign Lead
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Leadership</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{managers.length} Lead(s)</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Assigned Members</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{members.length} Members</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Department</p>
          <p className="text-xl font-bold text-blue-600 mt-1 truncate">{team.department}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Squad Status</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">● Active</p>
        </div>
      </div>

      {/* Team Leads / Managers Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Team Leads & Managers</h2>
            <p className="text-xs text-gray-500">Supervisors responsible for reporting and performance approvals</p>
          </div>
          <button
            onClick={() => setShowAddManagerModal(true)}
            className="text-xs font-semibold text-purple-600 hover:text-purple-800"
          >
            + Add Lead
          </button>
        </div>

        {managers.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-6 text-center text-gray-400 text-sm">
            No managers currently assigned. Click "+ Assign Lead" to designate a squad supervisor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {managers.map((m, idx) => (
              <div
                key={m.employeeId || idx}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                    {m.name?.charAt(0)?.toUpperCase() || "L"}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.email}</p>
                    <span className="inline-block mt-1 text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-semibold border border-purple-100">
                      {m.role || "Team Lead"} · {m.employeeId}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveManager(m.employeeId)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Remove manager"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Team Members Roster */}
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Team Roster ({members.length})</h2>
            <p className="text-xs text-gray-500">Employees actively working in this squad unit</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search members..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-56"
            />
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs shadow-sm transition whitespace-nowrap"
            >
              + Add Member
            </button>
          </div>
        </div>

        <TeamMembersTable
          members={filteredMembers}
          onRemove={handleRemoveMember}
        />
      </section>

      {/* MODAL: ADD MANAGER */}
      {showAddManagerModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-scaleIn">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="font-bold text-gray-900 text-base">Assign Team Lead / Manager</h3>
              <button
                onClick={() => setShowAddManagerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddManager} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Employee <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedManagerId}
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="">-- Choose an employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.name} ({emp.employeeId}) - {emp.designation || "Staff"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddManagerModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedManagerId}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 disabled:opacity-50"
                >
                  Assign Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MEMBER */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-scaleIn">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="font-bold text-gray-900 text-base">Assign Member to Squad</h3>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Employee <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="">-- Choose an employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.name} ({emp.employeeId}) - {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Squad Role / Functional Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Dev, QA Lead, Contributor"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedMemberId}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 disabled:opacity-50"
                >
                  Assign to Squad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default TeamDetails;
