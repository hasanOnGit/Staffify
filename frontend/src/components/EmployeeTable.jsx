import { useState } from "react";
import { Eye, Edit, Trash2, User } from "lucide-react";
import EmployeeDossierModal from "./EmployeeDossierModal";

function EmployeeTable({ employees = [], onEdit, onDelete, deleteLoadingId }) {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  if (!employees.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 shadow-2xs">
        <User size={36} className="mx-auto mb-2 text-gray-300" />
        <p className="font-semibold text-gray-700">No employees found</p>
        <p className="text-xs text-gray-400 mt-1">Try clearing filters or add a new employee profile</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50/80 text-gray-600 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 text-left">Employee</th>
                <th className="px-5 py-3.5 text-left">Department</th>
                <th className="px-5 py-3.5 text-left">Designation</th>
                <th className="px-5 py-3.5 text-left">Joining Date</th>
                <th className="px-5 py-3.5 text-left">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {employees.map((emp) => (
                <tr key={emp.employeeId} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0">
                        {emp.name ? emp.name.slice(0, 2).toUpperCase() : "EM"}
                      </div>
                      <div>
                        <button
                          onClick={() => setSelectedEmployee(emp)}
                          className="font-semibold text-gray-800 hover:text-purple-600 transition text-left"
                        >
                          {emp.name}
                        </button>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="font-mono text-[11px] text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.2 rounded">
                            {emp.employeeId}
                          </span>
                          <span>•</span>
                          <span>{emp.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-xs font-medium text-gray-700">
                    {emp.department || "General"}
                  </td>

                  <td className="px-5 py-3.5 text-xs text-gray-600">
                    {emp.designation || "Not Set"}
                  </td>

                  <td className="px-5 py-3.5 text-xs font-mono text-gray-500">
                    {emp.dateOfJoining || "-"}
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        emp.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {emp.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View 360 Dossier */}
                      <button
                        onClick={() => setSelectedEmployee(emp)}
                        className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="View Full 360 Dossier"
                      >
                        <Eye size={15} />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEdit(emp)}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit Details"
                      >
                        <Edit size={15} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDelete(emp.employeeId)}
                        disabled={deleteLoadingId === emp.employeeId}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Employee"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee 360 Dossier Modal */}
      <EmployeeDossierModal
        employee={selectedEmployee}
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onEdit={onEdit}
      />
    </>
  );
}

export default EmployeeTable;
