function EmployeeTable({ employees = [], onEdit, onDelete }) {
  if (!employees.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6 text-center text-gray-500">
        No employees found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-6 py-3 text-left">S.No</th>
            <th className="px-6 py-3 text-left">Employee ID</th>
            <th className="px-6 py-3 text-left">Name</th>
            <th className="px-6 py-3 text-left">Email</th>
            <th className="px-6 py-3 text-left">Designation</th>
            <th className="px-6 py-3 text-left">Department</th>
            <th className="px-6 py-3 text-left">Status</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {employees.map((emp, index) => (
            <tr key={emp.employeeId} className="hover:bg-gray-50">
              
              {/* S.No */}
              <td className="px-6 py-4 font-medium text-gray-700">
                {index + 1}
              </td>

              <td className="px-6 py-4 font-medium text-gray-700">
                {emp.employeeId}
              </td>

              <td className="px-6 py-4">{emp.name}</td>
              <td className="px-6 py-4">{emp.email}</td>
              <td className="px-6 py-4">{emp.designation}</td>
              <td className="px-6 py-4">{emp.department}</td>

              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    emp.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {emp.isActive ? "Active" : "Inactive"}
                </span>
              </td>

              <td className="px-6 py-4 space-x-3">
                <button
                  onClick={() => onEdit(emp)}
                  className="text-blue-600 text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => onDelete(emp.employeeId)}
                  className="text-red-600 text-sm"
                >
                  Delete
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeTable;
