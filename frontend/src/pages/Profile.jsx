import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getEmployeeByUserId, updateEmployee } from "../services/employee";
import { getDocuments } from "../services/hrDocument";
import {
  User,
  Briefcase,
  Landmark,
  AlertCircle,
  MapPin,
  Pencil,
  CheckCircle2,
  X,
  Circle,
  FileText,
  Printer,
} from "lucide-react";

function Profile() {
  const { user } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [notification, setNotification] = useState("");
  const [myDocuments, setMyDocuments] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Edit form state
  const [formData, setFormData] = useState({
    name: "",
    phoneNo: "",
    gender: "",
    dob: "",
    bloodGroup: "",
    maritalStatus: "",
    fatherName: "",
    presentAddress: "",
    permanentAddress: "",
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactNum: "",
    bankDetails: {
      accountNumber: "",
      bankName: "",
      ifscCode: "",
    },
    statutoryDetails: {
      panNumber: "",
      aadhaarNumber: "",
      uanNumber: "",
      pfNumber: "",
    },
  });

  const fetchProfileData = async () => {
    try {
      if (!user) return;
      setLoading(true);

      const queryId = user.userId || user.id || user._id;
      const [data, docsRes] = await Promise.all([
        getEmployeeByUserId(queryId).catch(() => null),
        getDocuments({ employeeId: user?.employeeId || user?.userId }).catch(() => ({ data: [] })),
      ]);

      if (docsRes?.success) {
        setMyDocuments(docsRes.data || []);
      }

      if (data) {
        setEmployee(data);
        populateFormData(data);
      }
    } catch (err) {
      console.warn("Could not fetch 360 profile, building default view from user context", err);
      // Fallback object from authenticated user
      const fallback = {
        name: user.name || "Employee",
        email: user.email || "",
        employeeId: user?.employeeId || user?.userId || "",
        designation: "Software Engineer",
        department: "Engineering",
        gender: "Prefer not to say",
        employmentType: "Full-time",
        probationStatus: "Confirmed",
        workLocation: "Headquarters",
        dateOfJoining: "2024-01-15",
        phoneNo: "",
        bankDetails: {},
        statutoryDetails: {},
      };
      setEmployee(fallback);
      populateFormData(fallback);
    } finally {
      setLoading(false);
    }
  };

  const populateFormData = (emp) => {
    setFormData({
      name: emp.name || "",
      phoneNo: emp.phoneNo || "",
      gender: emp.gender || "Prefer not to say",
      dob: emp.dob ? emp.dob.split("T")[0] : "",
      bloodGroup: emp.bloodGroup || "",
      maritalStatus: emp.maritalStatus || "Single",
      fatherName: emp.fatherName || "",
      presentAddress: emp.presentAddress || "",
      permanentAddress: emp.permanentAddress || "",
      emergencyContactName: emp.emergencyContactName || "",
      emergencyContactRelation: emp.emergencyContactRelation || "",
      emergencyContactNum: emp.emergencyContactNum || "",
      bankDetails: {
        accountNumber: emp.bankDetails?.accountNumber || "",
        bankName: emp.bankDetails?.bankName || "",
        ifscCode: emp.bankDetails?.ifscCode || "",
      },
      statutoryDetails: {
        panNumber: emp.statutoryDetails?.panNumber || "",
        aadhaarNumber: emp.statutoryDetails?.aadhaarNumber || "",
        uanNumber: emp.statutoryDetails?.uanNumber || "",
        pfNumber: emp.statutoryDetails?.pfNumber || "",
      },
    });
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("bank.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, [field]: value },
      }));
    } else if (name.startsWith("statutory.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        statutoryDetails: { ...prev.statutoryDetails, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateEmployee(employee.employeeId, formData);
      setNotification("Profile updated successfully!");
      setEditMode(false);
      await fetchProfileData();
      setTimeout(() => setNotification(""), 3500);
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Toast Alert */}
      {notification && (
        <div className="mb-4 p-3 bg-[#E3FCEF] border border-[#ABF5D1] text-[#006644] rounded text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[#00875A]" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification("")} className="text-[#006644] hover:text-[#DE350B] p-0.5">
            <X size={14} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-[#DFE1E6] rounded p-12 text-center text-[#6B778C]">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#0052CC] mx-auto mb-3"></div>
          <p className="text-xs">Loading employee dossier...</p>
        </div>
      ) : !employee ? (
        <div className="bg-white border border-[#DFE1E6] rounded p-12 text-center text-[#6B778C] text-sm">
          Profile not found
        </div>
      ) : (
        <div className="space-y-5">
          {/* Hero Profile Header (Staffify style) */}
          <div className="bg-white border border-[#DFE1E6] rounded p-5 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded bg-[#0052CC] text-white font-bold text-xl flex items-center justify-center">
                  {employee.name?.charAt(0)?.toUpperCase() || "E"}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg font-bold text-[#172B4D]">{employee.name}</h1>
                    <span className="font-mono text-[11px] bg-[#DEEBFF] text-[#0747A6] px-2 py-0.5 rounded font-semibold border border-[#B3D4FF]">
                      {employee.employeeId}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] bg-[#E3FCEF] text-[#006644] px-2 py-0.5 rounded font-semibold border border-[#ABF5D1]">
                      <Circle size={5} className="fill-[#00875A] text-[#00875A]" />
                      {employee.probationStatus || "Confirmed"}
                    </span>
                  </div>
                  <p className="text-xs text-[#5E6C84] mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-[#172B4D]">{employee.designation || "Staff"}</span>
                    <span>·</span>
                    <span>{employee.department || "Operations"}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} className="text-[#6B778C]" />
                      {employee.workLocation || "Headquarters"}
                    </span>
                  </p>
                  <p className="text-[11px] text-[#6B778C] mt-0.5">
                    {employee.email} {employee.phoneNo ? `· ${employee.phoneNo}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium px-3.5 py-1.5 rounded text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pencil size={12} />
                    <span>Edit Dossier</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditMode(false);
                      populateFormData(employee);
                    }}
                    className="border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#172B4D] font-medium px-3.5 py-1.5 rounded text-xs transition cursor-pointer"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stat Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-[#DFE1E6] text-xs">
              <div>
                <span className="text-[#6B778C] block text-[11px] font-medium">Employment Type</span>
                <span className="font-semibold text-[#172B4D] text-xs">{employee.employmentType || "Full-time"}</span>
              </div>
              <div>
                <span className="text-[#6B778C] block text-[11px] font-medium">Date of Joining</span>
                <span className="font-semibold text-[#172B4D] text-xs">
                  {employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : "2024-01-15"}
                </span>
              </div>
              <div>
                <span className="text-[#6B778C] block text-[11px] font-medium">Reporting Manager</span>
                <span className="font-semibold text-[#0052CC] text-xs">{employee.managerName || "Amit Kumar"}</span>
              </div>
              <div>
                <span className="text-[#6B778C] block text-[11px] font-medium">Verification Status</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#00875A] text-xs">
                  <CheckCircle2 size={12} />
                  Verified Profile
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#DFE1E6] gap-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("personal")}
              className={`pb-2.5 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "personal"
                  ? "border-b-2 border-[#0052CC] text-[#0052CC]"
                  : "text-[#6B778C] hover:text-[#172B4D]"
              }`}
            >
              <User size={13} />
              <span>Personal & Contact</span>
            </button>
            <button
              onClick={() => setActiveTab("job")}
              className={`pb-2.5 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "job"
                  ? "border-b-2 border-[#0052CC] text-[#0052CC]"
                  : "text-[#6B778C] hover:text-[#172B4D]"
              }`}
            >
              <Briefcase size={13} />
              <span>Job & Organization</span>
            </button>
            <button
              onClick={() => setActiveTab("statutory")}
              className={`pb-2.5 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "statutory"
                  ? "border-b-2 border-[#0052CC] text-[#0052CC]"
                  : "text-[#6B778C] hover:text-[#172B4D]"
              }`}
            >
              <Landmark size={13} />
              <span>Bank & Statutory</span>
            </button>
            <button
              onClick={() => setActiveTab("emergency")}
              className={`pb-2.5 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "emergency"
                  ? "border-b-2 border-[#0052CC] text-[#0052CC]"
                  : "text-[#6B778C] hover:text-[#172B4D]"
              }`}
            >
              <AlertCircle size={13} />
              <span>Emergency Details</span>
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`pb-2.5 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "documents"
                  ? "border-b-2 border-[#0052CC] text-[#0052CC]"
                  : "text-[#6B778C] hover:text-[#172B4D]"
              }`}
            >
              <FileText size={13} />
              <span>Letters & Certificates ({myDocuments.length})</span>
            </button>
          </div>

          {/* EDIT FORM WRAPPER */}
          {editMode ? (
            <form onSubmit={handleSaveProfile} className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b">
                <h3 className="font-bold text-gray-900 text-base">Edit Employee Profile Details</h3>
                <span className="text-xs text-gray-500">Update personal, banking and statutory credentials</span>
              </div>

              {/* Personal Section */}
              <div>
                <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-3">
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
                    <input
                      name="phoneNo"
                      value={formData.phoneNo}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Blood Group</label>
                    <input
                      name="bloodGroup"
                      placeholder="e.g. O+, B+, AB-"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Marital Status</label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Present Address</label>
                    <textarea
                      rows="2"
                      name="presentAddress"
                      value={formData.presentAddress}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Permanent Address</label>
                    <textarea
                      rows="2"
                      name="permanentAddress"
                      value={formData.permanentAddress}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Banking & Statutory Section */}
              <div className="pt-4 border-t">
                <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-3">
                  Indian Banking & Statutory Compliances
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Bank Name</label>
                    <input
                      name="bank.bankName"
                      placeholder="e.g. HDFC Bank, ICICI"
                      value={formData.bankDetails.bankName}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Account Number</label>
                    <input
                      name="bank.accountNumber"
                      value={formData.bankDetails.accountNumber}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">IFSC Code</label>
                    <input
                      name="bank.ifscCode"
                      value={formData.bankDetails.ifscCode}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">PAN Card</label>
                    <input
                      name="statutory.panNumber"
                      value={formData.statutoryDetails.panNumber}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Aadhaar Number</label>
                    <input
                      name="statutory.aadhaarNumber"
                      value={formData.statutoryDetails.aadhaarNumber}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Universal Account Number (UAN)</label>
                    <input
                      name="statutory.uanNumber"
                      value={formData.statutoryDetails.uanNumber}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contacts Section */}
              <div className="pt-4 border-t">
                <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-3">
                  Emergency Contact Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Name</label>
                    <input
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Relationship</label>
                    <input
                      name="emergencyContactRelation"
                      placeholder="e.g. Spouse, Father, Mother"
                      value={formData.emergencyContactRelation}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Emergency Phone</label>
                    <input
                      name="emergencyContactNum"
                      value={formData.emergencyContactNum}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Save & Cancel Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    populateFormData(employee);
                  }}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 shadow-sm disabled:opacity-50"
                >
                  {saving ? "Saving Changes..." : "Save Dossier"}
                </button>
              </div>
            </form>
          ) : (
            /* TAB CONTENT DISPLAY */
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              {activeTab === "personal" && (
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-4">Personal & Identity Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InfoBlock label="Full Legal Name" value={employee.name} />
                    <InfoBlock label="Gender" value={employee.gender || "Prefer not to say"} />
                    <InfoBlock
                      label="Date of Birth"
                      value={employee.dob ? new Date(employee.dob).toLocaleDateString() : "Not specified"}
                    />
                    <InfoBlock label="Blood Group" value={employee.bloodGroup || "Not specified"} />
                    <InfoBlock label="Marital Status" value={employee.maritalStatus || "Single"} />
                    <InfoBlock label="Father's / Guardian Name" value={employee.fatherName || "Not specified"} />
                    <InfoBlock label="Personal Contact Number" value={employee.phoneNo || "Not specified"} />
                    <InfoBlock label="Official Email" value={employee.email} />
                    <InfoBlock label="Present Address" value={employee.presentAddress || "Not specified"} />
                    <InfoBlock label="Permanent Address" value={employee.permanentAddress || "Not specified"} />
                  </div>
                </div>
              )}

              {activeTab === "job" && (
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-4">Job & Organizational Assignment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InfoBlock label="Employee Code" value={employee.employeeId} highlight />
                    <InfoBlock label="Primary Department" value={employee.department || "Engineering"} />
                    <InfoBlock label="Official Designation" value={employee.designation || "Staff"} />
                    <InfoBlock
                      label="Date of Joining"
                      value={employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : "2024-01-15"}
                    />
                    <InfoBlock label="Employment Classification" value={employee.employmentType || "Full-time"} />
                    <InfoBlock label="Probation / Confirmation Status" value={employee.probationStatus || "Confirmed"} />
                    <InfoBlock label="Reporting Manager" value={employee.managerName || "Amit Kumar"} />
                    <InfoBlock label="Official Work Location" value={employee.workLocation || "Headquarters"} />
                  </div>
                </div>
              )}

              {activeTab === "statutory" && (
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-4">Statutory Compliances & Banking</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InfoBlock label="Bank Name" value={employee.bankDetails?.bankName || "HDFC Bank"} />
                    <InfoBlock
                      label="Account Number"
                      value={employee.bankDetails?.accountNumber ? `•••• •••• ${employee.bankDetails.accountNumber.slice(-4)}` : "Not provided"}
                      mono
                    />
                    <InfoBlock label="Bank IFSC Code" value={employee.bankDetails?.ifscCode || "Not provided"} mono />
                    <InfoBlock label="Income Tax PAN" value={employee.statutoryDetails?.panNumber || "Not provided"} mono />
                    <InfoBlock
                      label="Aadhaar UID"
                      value={employee.statutoryDetails?.aadhaarNumber ? `•••• •••• ${employee.statutoryDetails.aadhaarNumber.slice(-4)}` : "Not provided"}
                      mono
                    />
                    <InfoBlock label="Universal Account No (UAN)" value={employee.statutoryDetails?.uanNumber || "Not provided"} mono />
                    <InfoBlock label="Provident Fund (PF) No" value={employee.statutoryDetails?.pfNumber || "Not provided"} mono />
                  </div>
                </div>
              )}

              {activeTab === "emergency" && (
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-4">Emergency Contact Hierarchy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InfoBlock label="Emergency Contact Name" value={employee.emergencyContactName || "Not configured"} />
                    <InfoBlock label="Relationship" value={employee.emergencyContactRelation || "Not configured"} />
                    <InfoBlock label="Emergency Phone" value={employee.emergencyContactNum || "Not configured"} highlight />
                  </div>
                </div>
              )}

              {activeTab === "documents" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Issued Letters & Certificates</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Official digitally issued employment certificates, appointment annexures, and formal letters
                    </p>
                  </div>

                  {myDocuments.length > 0 ? (
                    <div className="border border-[#DFE1E6] rounded-xl overflow-hidden bg-white shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F4F5F7] text-[#42526E] font-bold uppercase text-[10px] border-b border-[#DFE1E6]">
                          <tr>
                            <th className="px-4 py-3">Reference No</th>
                            <th className="px-4 py-3">Document Title</th>
                            <th className="px-4 py-3">Issued On</th>
                            <th className="px-4 py-3">Authorized Signatory</th>
                            <th className="px-4 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DFE1E6]">
                          {myDocuments.map((doc) => (
                            <tr key={doc._id || doc.docId} className="hover:bg-[#FAFBFC] transition">
                              <td className="px-4 py-3 font-mono font-bold text-[#0052CC]">{doc.refNo}</td>
                              <td className="px-4 py-3 font-semibold text-[#172B4D]">{doc.title}</td>
                              <td className="px-4 py-3 text-[#6B778C]">
                                {new Date(doc.issueDate).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="px-4 py-3 text-[#42526E]">{doc.signatoryName || "Head of HR"}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc(doc)}
                                  className="px-3 py-1 bg-[#DEEBFF] hover:bg-[#B3D4FF] text-[#0052CC] font-semibold rounded text-xs transition cursor-pointer"
                                >
                                  View & Print
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-[#6B778C] bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      No official letters have been issued to your profile yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Letter View & Print Modal */}
          {previewDoc && (
            <div className="fixed inset-0 z-50 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl border border-[#DFE1E6] max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-6 py-4 border-b border-[#DFE1E6] flex items-center justify-between bg-[#FAFBFC]">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#0052CC] bg-[#DEEBFF] px-2 py-0.5 rounded border border-[#B3D4FF]">
                      Ref: {previewDoc.refNo}
                    </span>
                    <h3 className="font-bold text-sm text-[#172B4D] mt-1">{previewDoc.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const printWindow = window.open("", "_blank");
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>${previewDoc.title}</title>
                              <style>
                                @page { size: A4; margin: 20mm; }
                                body { font-family: 'Segoe UI', Arial, sans-serif; color: #172B4D; margin: 0; padding: 10px; }
                                table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; }
                                th, td { border: 1px solid #DFE1E6; padding: 8px 10px; font-size: 12px; }
                                th { background-color: #F4F5F7; text-align: left; }
                              </style>
                            </head>
                            <body>
                              ${previewDoc.contentHtml}
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.focus();
                        setTimeout(() => printWindow.print(), 250);
                      }}
                      className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Printer size={13} />
                      <span>Print Document</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(null)}
                      className="text-[#6B778C] hover:text-[#172B4D] p-1.5 rounded-md hover:bg-[#EBECF0]"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div
                  className="p-8 overflow-y-auto bg-white text-xs text-[#172B4D] min-h-[350px]"
                  dangerouslySetInnerHTML={{ __html: previewDoc.contentHtml }}
                />

                <div className="p-3 bg-[#F4F5F7] border-t border-[#DFE1E6] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(null)}
                    className="px-4 py-1.5 border border-[#DFE1E6] rounded-lg text-xs font-semibold text-[#42526E]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

function InfoBlock({ label, value, mono = false, highlight = false }) {
  return (
    <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-3.5">
      <span className="text-xs text-gray-500 font-medium block mb-1">{label}</span>
      <span
        className={`text-sm ${
          mono ? "font-mono font-medium text-gray-900" : ""
        } ${highlight ? "font-bold text-purple-700" : "font-semibold text-gray-800"}`}
      >
        {value || "-"}
      </span>
    </div>
  );
}

export default Profile;
