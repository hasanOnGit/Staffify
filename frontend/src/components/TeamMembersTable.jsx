function TeamMembersTable({ members, onRemove }) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-6 py-3 text-left">Employee</th>
            <th className="px-6 py-3 text-left">Role</th>
            <th className="px-6 py-3 text-left">Status</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {members.length === 0 ? (
            <tr>
              <td
                colSpan="4"
                className="px-6 py-10 text-center text-gray-500"
              >
                No members assigned to this team
              </td>
            </tr>
          ) : (
            members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-800">
                    {member.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {member.email}
                  </p>
                </td>

                <td className="px-6 py-4 text-gray-700">
                  {member.role}
                </td>

                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    {member.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => onRemove(member.id)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Remove
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

export default TeamMembersTable;
