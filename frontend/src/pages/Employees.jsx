import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import EmployeeTable from "../components/EmployeeTable";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../services/employee";
import { Users, Search, PlusCircle, Filter, RefreshCw, X, Shield, Landmark, User, Briefcase } from "lucide-react";
import toast from "react-hot-toast";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formTab, setFormTab] = useState("personal");

  const [filters, setFilters] = useState({
    department: "",
    status: "",
  });

  const initialForm = {
    name: "",
    email: "",
    phoneNo: "",
    designation: "Software Engineer",
    department: "Engineering",
    gender: "Prefer not to say",
    dob: "",
    bloodGroup: "",
    maritalStatus: "Single",
    presentAddress: "",
    permanentAddress: "",
    emergencyContactName: "",
    emergencyContactNum: "",
    emergencyContactRelation: "",
    dateOfJoining: new Date().toISOString().slice(0, 10),
    employmentType: "Full-time",
    probationStatus: "Confirmed",
    managerName: "",
    workLocation: "Headquarters",
    basicSalary: 45000,
    totalSalary: 65000,
    bankDetails: {
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      accountHolderName: "",
    },
    statutoryDetails: {
      panNumber: "",
      aadhaarNumber: "",
      uanNumber: "",
      pfNumber: "",
    },
    isActive: true,
  };

  const [formData, setFormData] = useState(initialForm);

  /* =============================
     FETCH EMPLOYEES
  ============================= */
  const fetchEmployees = async () => {
    try {
      setPageLoading(true);
      const data = await getEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load employee directory");
      setEmployees([]);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  /* =============================
     FILTER & SEARCH LOGIC
  ============================= */
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        emp.name?.toLowerCase().includes(q) ||
        emp.email?.toLowerCase().includes(q) ||
        emp.employeeId?.toLowerCase().includes(q) ||
        emp.designation?.toLowerCase().includes(q);

      const matchesDept = !filters.department || emp.department === filters.department;
      const matchesStatus =
        !filters.status || String(emp.isActive) === filters.status;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchQuery, filters]);

  /* =============================
     FORM HANDLERS
  ============================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNestedChange = (category, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [field]: value,
      },
    }));
  };

  const handleEdit = (employee) => {
    setFormData({
      ...initialForm,
      ...employee,
      bankDetails: {
        ...initialForm.bankDetails,
        ...(employee.bankDetails || {}),
      },
      statutoryDetails: {
        ...initialForm.statutoryDetails,
        ...(employee.statutoryDetails || {}),
      },
    });
    setEditingId(employee.employeeId);
    setFormTab("personal");
    setShowFormModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      if (editingId) {
        await updateEmployee(editingId, formData);
        toast.success("Employee 360 profile updated successfully!");
      } else {
        await createEmployee(formData);
        toast.success("New employee added to organization!");
      }

      await fetchEmployees();
      setShowFormModal(false);
      setEditingId(null);
      setFormData(initialForm);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to save employee profile");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm("Are you sure you want to permanently delete this employee?")) return;

    try {
      setDeleteLoadingId(employeeId);
      await deleteEmployee(employeeId);
      toast.success("Employee record deleted successfully");
      await fetchEmployees();
    } catch {
      toast.error("Failed to delete employee");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">Employee Directory</h1>
            <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
              greytHR 360
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Full lifecycle records, statutory compliance, banking, and organizational reporting
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchEmployees}
            className="p-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg text-gray-600 transition shadow-2xs"
            title="Refresh"
          >
            <RefreshCw size={15} className={pageLoading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => {
              setFormData(initialForm);
              setEditingId(null);
              setFormTab("personal");
              setShowFormModal(true);
            }}
            className="flex items-center gap-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-medium px-3.5 py-1.5 rounded transition cursor-pointer"
          >
            <PlusCircle size={14} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-[#DFE1E6] rounded p-3.5 mb-5 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-2.5 text-[#6B778C]" />
            <input
              type="text"
              placeholder="Search by name, ID, email, or designation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-[#DFE1E6] rounded text-xs text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-1.5 border px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
                showFilter || filters.department || filters.status
                  ? "bg-[#DEEBFF] text-[#0052CC] border-[#B3D4FF]"
                  : "bg-white text-[#172B4D] border-[#DFE1E6] hover:bg-[#F4F5F7]"
              }`}
            >
              <Filter size={14} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Expandable Filter Details */}
        {showFilter && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-xs">
            <div>
              <label className="block font-medium text-gray-600 mb-1">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-800 focus:outline-purple-600"
              >
                <option value="">All Departments</option>
                {[...new Set(employees.map((e) => e.department).filter(Boolean))].map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-600 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-800 focus:outline-purple-600"
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ department: "", status: "" })}
                className="w-full border border-gray-200 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Directory Table */}
      {pageLoading ? (
        <div className="bg-white border rounded-xl p-12 text-center text-gray-400">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-purple-600" />
          <p className="text-sm font-medium">Loading employee records...</p>
        </div>
      ) : (
        <EmployeeTable
          employees={filteredEmployees}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deleteLoadingId={deleteLoadingId}
        />
      )}

      {/* =========================================================
         ADD / EDIT EMPLOYEE 360 MODAL
         ========================================================= */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-purple-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-base">
                    {editingId ? `Edit Dossier: ${formData.name}` : "Add New Employee Profile"}
                  </h3>
                  <p className="text-xs text-gray-500">greytHR Complete 360 Personnel Setup</p>
                </div>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Tabs */}
            <div className="flex border-b border-[#DFE1E6] bg-[#F4F5F7] px-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFormTab("personal")}
                className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition cursor-pointer ${
                  formTab === "personal"
                    ? "border-[#0052CC] text-[#0052CC] bg-white"
                    : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
                }`}
              >
                <User size={13} />
                <span>Personal & Contacts</span>
              </button>

              <button
                type="button"
                onClick={() => setFormTab("job")}
                className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition cursor-pointer ${
                  formTab === "job"
                    ? "border-[#0052CC] text-[#0052CC] bg-white"
                    : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
                }`}
              >
                <Briefcase size={13} />
                <span>Job & Org</span>
              </button>

              <button
                type="button"
                onClick={() => setFormTab("statutory")}
                className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition cursor-pointer ${
                  formTab === "statutory"
                    ? "border-[#0052CC] text-[#0052CC] bg-white"
                    : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
                }`}
              >
                <Landmark size={13} />
                <span>Bank & Statutory</span>
              </button>
            </div>

            {/* Form Fields Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 text-xs space-y-4">
              {/* TAB 1: PERSONAL */}
              {formTab === "personal" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Rahul Sharma"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Official Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="e.g. rahul.sharma@company.com"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                      <input
                        name="phoneNo"
                        value={formData.phoneNo}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Blood Group</label>
                      <input
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        placeholder="e.g. O+, B+, A-"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Marital Status</label>
                      <select
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                      >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Father's Name</label>
                      <input
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleChange}
                        placeholder="Father's full name"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-purple-600"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Present Address</label>
                      <textarea
                        rows={2}
                        name="presentAddress"
                        value={formData.presentAddress}
                        onChange={handleChange}
                        placeholder="Current residential address"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Permanent Address</label>
                      <textarea
                        rows={2}
                        name="permanentAddress"
                        value={formData.permanentAddress}
                        onChange={handleChange}
                        placeholder="Permanent domicile address"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <p className="font-bold text-gray-700 mb-2">Emergency Contact</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">Contact Name</label>
                        <input
                          name="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={handleChange}
                          placeholder="Contact person"
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">Relationship</label>
                        <input
                          name="emergencyContactRelation"
                          value={formData.emergencyContactRelation}
                          onChange={handleChange}
                          placeholder="Spouse / Parent"
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">Contact Phone</label>
                        <input
                          name="emergencyContactNum"
                          value={formData.emergencyContactNum}
                          onChange={handleChange}
                          placeholder="+91..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: JOB & ORG */}
              {formTab === "job" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Department</label>
                      <input
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="e.g. Engineering, Sales, HR"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Designation</label>
                      <input
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="e.g. Senior Frontend Engineer"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Employment Type</label>
                      <select
                        name="employmentType"
                        value={formData.employmentType}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Intern">Intern</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Probation Status</label>
                      <select
                        name="probationStatus"
                        value={formData.probationStatus}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Probation">Probation</option>
                        <option value="Notice Period">Notice Period</option>
                        <option value="Intern">Intern</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Date of Joining</label>
                      <input
                        type="date"
                        name="dateOfJoining"
                        value={formData.dateOfJoining}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Work Location</label>
                      <input
                        name="workLocation"
                        value={formData.workLocation}
                        onChange={handleChange}
                        placeholder="e.g. Headquarters / Remote"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Reporting Manager Name</label>
                      <input
                        name="managerName"
                        value={formData.managerName}
                        onChange={handleChange}
                        placeholder="e.g. Amit Kumar"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Status</label>
                      <select
                        name="isActive"
                        value={String(formData.isActive)}
                        onChange={(e) =>
                          setFormData({ ...formData, isActive: e.target.value === "true" })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="font-bold text-gray-700 mb-2">Compensation Preview (Monthly CTC)</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">Basic Salary (₹)</label>
                        <input
                          type="number"
                          name="basicSalary"
                          value={formData.basicSalary}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">Total CTC (₹)</label>
                        <input
                          type="number"
                          name="totalSalary"
                          value={formData.totalSalary}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: BANK & STATUTORY */}
              {formTab === "statutory" && (
                <div className="space-y-4">
                  <div>
                    <p className="font-bold text-gray-700 mb-2">Bank Account Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">Bank Name</label>
                        <input
                          value={formData.bankDetails?.bankName || ""}
                          onChange={(e) => handleNestedChange("bankDetails", "bankName", e.target.value)}
                          placeholder="e.g. HDFC Bank, ICICI Bank"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">Account Holder Name</label>
                        <input
                          value={formData.bankDetails?.accountHolderName || ""}
                          onChange={(e) => handleNestedChange("bankDetails", "accountHolderName", e.target.value)}
                          placeholder="As printed in passbook"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">Account Number</label>
                        <input
                          value={formData.bankDetails?.accountNumber || ""}
                          onChange={(e) => handleNestedChange("bankDetails", "accountNumber", e.target.value)}
                          placeholder="Bank account number"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">IFSC Code</label>
                        <input
                          value={formData.bankDetails?.ifscCode || ""}
                          onChange={(e) => handleNestedChange("bankDetails", "ifscCode", e.target.value)}
                          placeholder="e.g. HDFC0001234"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="font-bold text-gray-700 mb-2">Statutory & Tax Compliance</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">PAN Card Number</label>
                        <input
                          value={formData.statutoryDetails?.panNumber || ""}
                          onChange={(e) => handleNestedChange("statutoryDetails", "panNumber", e.target.value)}
                          placeholder="e.g. ABCDE1234F"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">Aadhaar Number (12 Digits)</label>
                        <input
                          value={formData.statutoryDetails?.aadhaarNumber || ""}
                          onChange={(e) => handleNestedChange("statutoryDetails", "aadhaarNumber", e.target.value)}
                          placeholder="12 digit Aadhaar"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">UAN Number</label>
                        <input
                          value={formData.statutoryDetails?.uanNumber || ""}
                          onChange={(e) => handleNestedChange("statutoryDetails", "uanNumber", e.target.value)}
                          placeholder="Universal Account Number"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">PF Account Number</label>
                        <input
                          value={formData.statutoryDetails?.pfNumber || ""}
                          onChange={(e) => handleNestedChange("statutoryDetails", "pfNumber", e.target.value)}
                          placeholder="Provident Fund ID"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Footer Buttons */}
              <div className="pt-3 border-t border-[#DFE1E6] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-3.5 py-1.5 border border-[#DFE1E6] rounded text-xs font-medium text-[#172B4D] hover:bg-[#F4F5F7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-medium disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? "Saving Dossier..." : editingId ? "Update Dossier" : "Save Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Employees;
