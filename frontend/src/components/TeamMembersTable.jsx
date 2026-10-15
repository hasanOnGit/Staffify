import { Users } from "lucide-react";

function TeamMembersTable({ members = [], onRemove }) {
  return (
    <div className="bg-white border border-[#DFE1E6] rounded overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs divide-y divide-[#DFE1E6]">
          <thead className="bg-[#F4F5F7] text-[#6B778C] font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Employee</th>
              <th className="px-4 py-3 text-left">Designation</th>
              <th className="px-4 py-3 text-left">Team Role</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#DFE1E6] bg-white">
            {members.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-12 text-center text-[#6B778C]">
                  <Users size={32} className="mx-auto mb-2 text-[#DFE1E6]" />
                  <p className="font-semibold text-xs text-[#172B4D]">No members assigned</p>
                  <p className="text-[11px] text-[#6B778C] mt-0.5">Use "Add Member" above to assign employees to this squad.</p>
                </td>
              </tr>
            ) : (
              members.map((member) => {
                const empId = member.employeeId || member.id;
                return (
                  <tr key={empId} className="hover:bg-[#F4F5F7] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-[#0052CC] text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {member.name?.charAt(0)?.toUpperCase() || "E"}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[#172B4D]">{member.name}</span>
                            <span className="text-[10px] font-mono bg-[#DEEBFF] text-[#0747A6] px-1.5 py-0.2 rounded font-medium border border-[#B3D4FF]">
                              {empId}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6B778C] mt-0.5">{member.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-[#5E6C84]">
                      {member.designation || "Member"}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF]">
                        {member.role || "Contributor"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]">
                        {member.status || "Active"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onRemove(empId)}
                        className="px-2 py-1 text-[#DE350B] hover:bg-[#FFEBE6] rounded text-xs font-medium transition cursor-pointer"
                      >
                        Remove
                      </button>
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

export default TeamMembersTable;
