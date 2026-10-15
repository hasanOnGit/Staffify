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
import { ArrowLeft, Plus, X, CheckCircle2, Circle, Search } from "lucide-react";

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
        <div className="mb-4 p-3 bg-[#E3FCEF] border border-[#ABF5D1] text-[#006644] rounded text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[#00875A]" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification("")} className="text-[#006644] hover:text-[#DE350B] p-0.5">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Back Button & Header */}
      <div className="mb-5">
        <button
          onClick={() => navigate("/teams")}
          className="text-xs font-semibold text-[#0052CC] hover:underline flex items-center gap-1.5 mb-2.5 transition cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>Back to Teams List</span>
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#DFE1E6] p-4 rounded">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded bg-[#0052CC] text-white font-bold flex items-center justify-center text-lg flex-shrink-0">
              {team.name?.charAt(0)?.toUpperCase() || "T"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-[#172B4D]">{team.name}</h1>
                <span className="font-mono text-[11px] bg-[#DEEBFF] text-[#0747A6] px-2 py-0.5 rounded font-semibold border border-[#B3D4FF]">
                  {team.teamId || "TEAM"}
                </span>
                <span className="text-[11px] bg-[#EAE6FF] text-[#403294] px-2 py-0.5 rounded font-medium border border-[#C0B6F2]">
                  {team.department || "General"}
                </span>
              </div>
              <p className="text-xs text-[#6B778C] mt-1 max-w-2xl">
                {team.description || "Active cross-functional squad and operational division"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium px-3 py-1.5 rounded text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Member</span>
            </button>
            <button
              onClick={() => setShowAddManagerModal(true)}
              className="bg-white border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#172B4D] font-medium px-3 py-1.5 rounded text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={13} />
              <span>Assign Lead</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-white border border-[#DFE1E6] rounded p-3.5" style={{ borderTop: "3px solid #0052CC" }}>
          <p className="text-[11px] text-[#6B778C] uppercase tracking-wider font-semibold">Leadership</p>
          <p className="text-xl font-bold text-[#172B4D] mt-1">{managers.length} Lead(s)</p>
        </div>
        <div className="bg-white border border-[#DFE1E6] rounded p-3.5" style={{ borderTop: "3px solid #00875A" }}>
          <p className="text-[11px] text-[#6B778C] uppercase tracking-wider font-semibold">Assigned Members</p>
          <p className="text-xl font-bold text-[#172B4D] mt-1">{members.length} Members</p>
        </div>
        <div className="bg-white border border-[#DFE1E6] rounded p-3.5" style={{ borderTop: "3px solid #403294" }}>
          <p className="text-[11px] text-[#6B778C] uppercase tracking-wider font-semibold">Department</p>
          <p className="text-xl font-bold text-[#172B4D] mt-1 truncate">{team.department}</p>
        </div>
        <div className="bg-white border border-[#DFE1E6] rounded p-3.5" style={{ borderTop: "3px solid #FF991F" }}>
          <p className="text-[11px] text-[#6B778C] uppercase tracking-wider font-semibold">Squad Status</p>
          <p className="text-xl font-bold text-[#00875A] mt-1 flex items-center gap-1.5">
            <Circle size={6} className="fill-[#00875A] text-[#00875A]" />
            Active
          </p>
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
                  <div className="w-9 h-9 rounded-full bg-[#DEEBFF] text-[#0052CC] font-bold flex items-center justify-center text-xs">
                    {m.name?.charAt(0)?.toUpperCase() || "L"}
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-[#172B4D]">{m.name}</p>
                    <p className="text-[11px] text-[#6B778C]">{m.email}</p>
                    <span className="inline-block mt-0.5 text-[10px] bg-[#DEEBFF] text-[#0747A6] px-1.5 py-0.5 rounded font-semibold border border-[#B3D4FF]">
                      {m.role || "Team Lead"} · {m.employeeId}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveManager(m.employeeId)}
                  className="p-1.5 text-[#6B778C] hover:text-[#DE350B] hover:bg-[#FFEBE6] rounded transition cursor-pointer"
                  title="Remove manager"
                >
                  <X size={13} />
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
            <h2 className="text-sm font-bold text-[#172B4D]">Team Roster ({members.length})</h2>
            <p className="text-xs text-[#6B778C]">Employees actively assigned to this squad</p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search size={13} className="absolute left-2.5 top-2 text-[#6B778C]" />
              <input
                type="text"
                placeholder="Search members..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 border border-[#DFE1E6] rounded text-xs text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
              />
            </div>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium px-3 py-1.5 rounded text-xs transition whitespace-nowrap flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Member</span>
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded max-w-md w-full p-5 shadow-lg border border-[#DFE1E6]">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#DFE1E6]">
              <h3 className="font-bold text-[#172B4D] text-sm">Assign Team Lead / Manager</h3>
              <button
                onClick={() => setShowAddManagerModal(false)}
                className="text-[#6B778C] hover:text-[#172B4D] p-1"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAddManager} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                  Select Employee <span className="text-[#DE350B]">*</span>
                </label>
                <select
                  value={selectedManagerId}
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  required
                  className="w-full border border-[#DFE1E6] rounded px-3 py-2 text-xs text-[#172B4D] focus:outline-none focus:border-[#0052CC] bg-white"
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
                  className="px-3 py-1.5 border border-[#DFE1E6] rounded text-xs font-medium text-[#172B4D] hover:bg-[#F4F5F7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedManagerId}
                  className="px-3.5 py-1.5 bg-[#0052CC] text-white rounded text-xs font-medium hover:bg-[#0747A6] disabled:opacity-50 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded max-w-md w-full p-5 shadow-lg border border-[#DFE1E6]">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#DFE1E6]">
              <h3 className="font-bold text-[#172B4D] text-sm">Assign Member to Squad</h3>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-[#6B778C] hover:text-[#172B4D] p-1"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                  Select Employee <span className="text-[#DE350B]">*</span>
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  required
                  className="w-full border border-[#DFE1E6] rounded px-3 py-2 text-xs text-[#172B4D] focus:outline-none focus:border-[#0052CC] bg-white"
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
                <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                  Squad Role / Functional Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Dev, QA Lead, Contributor"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full border border-[#DFE1E6] rounded px-3 py-2 text-xs text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-3 py-1.5 border border-[#DFE1E6] rounded text-xs font-medium text-[#172B4D] hover:bg-[#F4F5F7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedMemberId}
                  className="px-3.5 py-1.5 bg-[#0052CC] text-white rounded text-xs font-medium hover:bg-[#0747A6] disabled:opacity-50 cursor-pointer"
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
