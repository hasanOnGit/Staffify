import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import TeamTable from "../components/TeamTable";
import TeamForm from "../components/TeamForm";

function Teams() {
  const [teams, setTeams] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const handleCreateTeam = (team) => {
    setTeams((prev) => [...prev, { id: Date.now(), ...team }]);
    setShowForm(false);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Teams
          </h1>
          <p className="text-sm text-gray-500">
            Create and manage organizational teams
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Create Team
        </button>
      </div>

      {/* Create Team */}
      {showForm && (
        <TeamForm
          onCancel={() => setShowForm(false)}
          onCreate={handleCreateTeam}
        />
      )}

      {/* Team List */}
      <TeamTable teams={teams} />
    </DashboardLayout>
  );
}

export default Teams;
