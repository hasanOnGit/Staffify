import { useState } from "react";
import { Eye, Edit, Trash2, User } from "lucide-react";
import EmployeeDossierModal from "./EmployeeDossierModal";

function EmployeeTable({ employees = [], onEdit, onDelete, deleteLoadingId }) {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  if (!employees.length) {
    return (
      <div className="bg-white rounded border border-[#DFE1E6] p-12 text-center text-[#6B778C]">
        <User size={32} className="mx-auto mb-2 text-[#DFE1E6]" />
        <p className="font-semibold text-xs text-[#172B4D]">No employees found</p>
        <p className="text-[11px] text-[#6B778C] mt-0.5">Try clearing filters or add a new employee profile</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded border border-[#DFE1E6] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-[#F4F5F7] text-[#6B778C] border-b border-[#DFE1E6] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Designation</th>
                <th className="px-4 py-3 text-left">Joining Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#DFE1E6]">
              {employees.map((emp) => (
                <tr key={emp.employeeId} className="hover:bg-[#F4F5F7] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-[#DEEBFF] text-[#0052CC] font-bold flex items-center justify-center text-xs shrink-0">
                        {emp.name ? emp.name.slice(0, 2).toUpperCase() : "EM"}
                      </div>
                      <div>
                        <button
                          onClick={() => setSelectedEmployee(emp)}
                          className="font-semibold text-[#172B4D] hover:text-[#0052CC] transition text-left cursor-pointer"
                        >
                          {emp.name}
                        </button>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#6B778C]">
                          <span className="font-mono text-[10px] text-[#0747A6] font-semibold bg-[#DEEBFF] px-1.5 py-0.2 rounded border border-[#B3D4FF]">
                            {emp.employeeId}
                          </span>
                          <span>•</span>
                          <span>{emp.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-xs font-medium text-[#172B4D]">
                    {emp.department || "General"}
                  </td>

                  <td className="px-4 py-3 text-xs text-[#5E6C84]">
                    {emp.designation || "Not Set"}
                  </td>

                  <td className="px-4 py-3 text-xs font-mono text-[#6B778C]">
                    {emp.dateOfJoining || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        emp.isActive
                          ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                          : "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]"
                      }`}
                    >
                      {emp.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* View 360 Dossier */}
                      <button
                        onClick={() => setSelectedEmployee(emp)}
                        className="p-1 text-[#6B778C] hover:text-[#0052CC] hover:bg-[#DEEBFF] rounded transition cursor-pointer"
                        title="View Full 360 Dossier"
                      >
                        <Eye size={14} />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEdit(emp)}
                        className="p-1 text-[#6B778C] hover:text-[#0052CC] hover:bg-[#DEEBFF] rounded transition cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDelete(emp.employeeId)}
                        disabled={deleteLoadingId === emp.employeeId}
                        className="p-1 text-[#6B778C] hover:text-[#DE350B] hover:bg-[#FFEBE6] rounded transition cursor-pointer"
                        title="Delete Employee"
                      >
                        <Trash2 size={14} />
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
