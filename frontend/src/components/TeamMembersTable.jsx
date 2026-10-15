function TeamMembersTable({ members = [], onRemove }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm divide-y divide-gray-200">
          <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5 text-left">Employee</th>
              <th className="px-6 py-3.5 text-left">Designation</th>
              <th className="px-6 py-3.5 text-left">Team Role</th>
              <th className="px-6 py-3.5 text-center">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {members.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                  <div className="w-12 h-12 mx-auto mb-2 text-gray-300">👥</div>
                  <p className="font-medium text-gray-600">No members assigned</p>
                  <p className="text-xs text-gray-400 mt-0.5">Use "+ Add Member" above to assign employees to this squad.</p>
                </td>
              </tr>
            ) : (
              members.map((member) => {
                const empId = member.employeeId || member.id;
                return (
                  <tr key={empId} className="hover:bg-purple-50/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold flex items-center justify-center text-xs shadow-sm flex-shrink-0">
                          {member.name?.charAt(0)?.toUpperCase() || "E"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{member.name}</span>
                            <span className="text-[11px] font-mono bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded font-medium border border-purple-100">
                              {empId}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{member.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {member.designation || "Member"}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {member.role || "Contributor"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {member.status || "Active"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onRemove(empId)}
                        className="px-2.5 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg text-xs font-semibold transition"
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
