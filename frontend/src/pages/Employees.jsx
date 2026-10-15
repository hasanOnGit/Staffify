import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import EmployeeTable from "../components/EmployeeTable";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../services/employee";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    department: "",
    status: "",
  });

  const initialForm = {
    name: "",
    email: "",
    designation: "",
    department: "",
    dateOfJoining: "",
    isActive: "",
  };

  const [formData, setFormData] = useState(initialForm);

  /* =============================
     FETCH EMPLOYEES
  ============================= */
  const fetchEmployees = async () => {
    try {
      setPageLoading(true);
      const data = await getEmployees();
      setEmployees(data);
    } catch {
      setError("Failed to load employees");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  /* =============================
     FILTER LOGIC
  ============================= */
  const filteredEmployees = employees.filter((emp) => {
    const departmentMatch =
      !filters.department || emp.department === filters.department;

    const statusMatch =
      !filters.status || String(emp.isActive) === filters.status;

    return departmentMatch && statusMatch;
  });

  /* =============================
     INPUT CHANGE
  ============================= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* =============================
     SAVE (CREATE / UPDATE)
  ============================= */
  const handleSave = async () => {
    try {
      setActionLoading(true);

      if (editingId) {
        await updateEmployee(editingId, formData);
      } else {
        await createEmployee(formData);
      }

      await fetchEmployees();
      setShowForm(false);
      setEditingId(null);
      setFormData(initialForm);
    } catch {
      setError("Failed to save employee");
    } finally {
      setActionLoading(false);
    }
  };

  /* =============================
     EDIT
  ============================= */
  const handleEdit = (employee) => {
    setFormData(employee);
    setEditingId(employee.employeeId);
    setShowForm(true);
  };

  /* =============================
     DELETE
  ============================= */
  const handleDelete = async (employeeId) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;

    try {
      setDeleteLoadingId(employeeId);
      await deleteEmployee(employeeId);
      await fetchEmployees();
    } catch {
      setError("Failed to delete employee");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <DashboardLayout>
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Employee Directory</h1>
          <p className="text-sm text-gray-500">
            Manage all employees in Staffify
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Button */}
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className=" bg-purple-600  text-white border px-4 py-2 rounded-md text-sm hover:bg-purple-700"
          >
            Filter
          </button>

          {/* Add Employee */}
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData(initialForm);
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700"
          >
            + Add Employee
          </button>
        </div>
      </div>

      {/* ================= FILTER PANEL ================= */}
      {showFilter && (
        <div className="bg-white border rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Filter Employees</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Department Filter */}
            <select
              value={filters.department}
              onChange={(e) =>
                setFilters({ ...filters, department: e.target.value })
              }
              className="border px-3 py-2 rounded-md"
            >
              <option value="">All Departments</option>
              {[...new Set(employees.map((emp) => emp.department))].map(
                (dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                )
              )}
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="border px-3 py-2 rounded-md"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() =>
                setFilters({ department: "", status: "" })
              }
              className="border px-4 py-2 rounded-md hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* ================= PAGE LOADER ================= */}
      {pageLoading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
        </div>
      )}

      {error && <p className="text-red-600">{error}</p>}

      {/* ================= TABLE ================= */}
      {!pageLoading && !error && (
        <EmployeeTable
          employees={filteredEmployees}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deleteLoadingId={deleteLoadingId}
        />
      )}

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="bg-white border rounded-xl p-6 mt-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Employee" : "Add Employee"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="border px-3 py-2 rounded-md"
            />

            <input
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="border px-3 py-2 rounded-md"
            />

            <input
              name="designation"
              placeholder="Designation"
              value={formData.designation}
              onChange={handleChange}
              className="border px-3 py-2 rounded-md"
            />

            <input
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
              className="border px-3 py-2 rounded-md"
            />

            <input
              type="date"
              name="dateOfJoining"
              value={formData.dateOfJoining}
              onChange={handleChange}
              className="border px-3 py-2 rounded-md"
            />

            <select
              name="isActive"
              value={formData.isActive}
              onChange={handleChange}
              className="border px-3 py-2 rounded-md"
            >
              <option value="">Select Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded-md"
              disabled={actionLoading}
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={actionLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md"
            >
              {actionLoading
                ? "Processing..."
                : editingId
                ? "Update"
                : "Save"}
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Employees;
