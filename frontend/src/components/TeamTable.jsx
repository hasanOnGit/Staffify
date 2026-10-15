import { useNavigate } from "react-router-dom";

function TeamTable({ teams, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm divide-y divide-gray-200">
          <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5 text-left">Team & Code</th>
              <th className="px-6 py-3.5 text-left">Department</th>
              <th className="px-6 py-3.5 text-left">Team Leads / Managers</th>
              <th className="px-6 py-3.5 text-center">Members</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {teams.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                  <div className="w-12 h-12 mx-auto mb-2 text-gray-300">🏢</div>
                  <p className="font-medium text-gray-600">No teams found</p>
                  <p className="text-xs text-gray-400 mt-0.5">Click "Create Team" to define organizational squads.</p>
                </td>
              </tr>
            ) : (
              teams.map((team) => {
                const targetId = team.teamId || team._id;
                const managers = team.managers || [];
                const members = team.members || [];

                return (
                  <tr key={team._id || team.teamId} className="hover:bg-purple-50/40 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                          {team.name?.charAt(0)?.toUpperCase() || "T"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{team.name}</span>
                            <span className="text-[11px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {team.teamId || "TEAM"}
                            </span>
                          </div>
                          {team.description && (
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5 max-w-sm">
                              {team.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {team.department || "General"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {managers.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">No manager assigned</span>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          {managers.map((m, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-purple-50 text-purple-800 border border-purple-100 font-medium"
                              title={m.email}
                            >
                              <span className="w-4 h-4 rounded-full bg-purple-200 text-[10px] flex items-center justify-center font-bold">
                                {m.name?.charAt(0) || "M"}
                              </span>
                              {m.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                        👥 {members.length}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/teams/${targetId}`)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1"
                        >
                          Manage & Roster →
                        </button>
                        {onDelete && (
                          <button
                            onClick={() => onDelete(targetId)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                            title="Delete Team"
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TeamTable;
