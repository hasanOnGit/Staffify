import { useNavigate } from "react-router-dom";
import { Building2, Users, Trash2, ArrowRight } from "lucide-react";

function TeamTable({ teams, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-[#DFE1E6] rounded overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs divide-y divide-[#DFE1E6]">
          <thead className="bg-[#F4F5F7] text-[#6B778C] font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Team & Code</th>
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">Team Leads / Managers</th>
              <th className="px-4 py-3 text-center">Members</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#DFE1E6] bg-white">
            {teams.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-12 text-center text-[#6B778C]">
                  <Building2 size={32} className="mx-auto mb-2 text-[#DFE1E6]" />
                  <p className="font-semibold text-xs text-[#172B4D]">No teams found</p>
                  <p className="text-[11px] text-[#6B778C] mt-0.5">Click "Create Team" to define organizational squads.</p>
                </td>
              </tr>
            ) : (
              teams.map((team) => {
                const targetId = team.teamId || team._id;
                const managers = team.managers || [];
                const members = team.members || [];

                return (
                  <tr key={team._id || team.teamId} className="hover:bg-[#F4F5F7] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#DEEBFF] text-[#0052CC] font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {team.name?.charAt(0)?.toUpperCase() || "T"}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[#172B4D]">{team.name}</span>
                            <span className="text-[10px] font-mono bg-[#F4F5F7] text-[#6B778C] px-1.5 py-0.5 rounded border border-[#DFE1E6]">
                              {team.teamId || "TEAM"}
                            </span>
                          </div>
                          {team.description && (
                            <p className="text-[11px] text-[#6B778C] line-clamp-1 mt-0.5 max-w-sm">
                              {team.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF]">
                        {team.department || "General"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {managers.length === 0 ? (
                        <span className="text-[11px] text-[#6B778C] italic">No manager assigned</span>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {managers.map((m, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-[#EAE6FF] text-[#403294] border border-[#C0B6F2] font-medium"
                              title={m.email}
                            >
                              <span className="w-3.5 h-3.5 rounded-full bg-[#C0B6F2] text-[9px] flex items-center justify-center font-bold">
                                {m.name?.charAt(0) || "M"}
                              </span>
                              {m.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F4F5F7] text-[#172B4D] border border-[#DFE1E6]">
                        <Users size={11} className="text-[#6B778C]" />
                        {members.length}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/teams/${targetId}`)}
                          className="px-2.5 py-1 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-medium transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>Manage</span>
                          <ArrowRight size={11} />
                        </button>
                        {onDelete && (
                          <button
                            onClick={() => onDelete(targetId)}
                            className="p-1 text-[#6B778C] hover:text-[#DE350B] rounded hover:bg-[#FFEBE6] transition cursor-pointer"
                            title="Delete Team"
                          >
                            <Trash2 size={13} />
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
