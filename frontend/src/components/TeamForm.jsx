import { useState } from "react";

function TeamForm({ onCancel, onCreate }) {
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!teamName) return;
    onCreate({
      name: teamName,
      description,
      managers: [],
      members: [],
    });
  };

  return (
    <div className="bg-white border rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">
        Create Team
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          placeholder="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        />

        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onCancel}
          className="border px-4 py-2 rounded-md text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Create
        </button>
      </div>
    </div>
  );
}

export default TeamForm;
