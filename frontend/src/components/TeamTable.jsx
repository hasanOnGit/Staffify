function TeamTable({ teams }) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-6 py-3 text-left">Team</th>
            <th className="px-6 py-3 text-left">Managers</th>
            <th className="px-6 py-3 text-left">Members</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {teams.length === 0 ? (
            <tr>
              <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                No teams created yet
              </td>
            </tr>
          ) : (
            teams.map((team) => (
              <tr key={team.id}>
                <td className="px-6 py-4 font-medium">
                  {team.name}
                </td>
                <td className="px-6 py-4">
                  {team.managers.length}
                </td>
                <td className="px-6 py-4">
                  {team.members.length}
                </td>
                <td className="px-6 py-4">
                  <button className="text-purple-600 text-sm">
                    Manage
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TeamTable;
