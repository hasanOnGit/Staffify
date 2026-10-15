import { useState } from "react";
import { X, User, Briefcase, Landmark, ShieldCheck, Phone, Mail, MapPin, Calendar, HeartPulse } from "lucide-react";

function EmployeeDossierModal({ employee, isOpen, onClose, onEdit }) {
  const [activeTab, setActiveTab] = useState("personal");

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header Profile Hero */}
        <div className="bg-gradient-to-r from-purple-800 to-indigo-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md text-white font-bold text-2xl flex items-center justify-center shadow-inner">
              {employee.name ? employee.name.slice(0, 2).toUpperCase() : "EM"}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{employee.name}</h2>
                <span className="text-[11px] font-mono bg-white/20 px-2 py-0.5 rounded-full">
                  {employee.employeeId}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    employee.isActive
                      ? "bg-emerald-400/20 text-emerald-200 border border-emerald-400/30"
                      : "bg-rose-400/20 text-rose-200 border border-rose-400/30"
                  }`}
                >
                  {employee.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="text-purple-200 text-sm mt-0.5">
                {employee.designation || "Role Not Specified"} • {employee.department || "General"}
              </p>

              <div className="flex items-center gap-4 text-xs text-purple-200 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail size={13} /> {employee.email}
                </span>
                {employee.phoneNo && (
                  <span className="flex items-center gap-1">
                    <Phone size={13} /> {employee.phoneNo}
                  </span>
                )}
                {employee.workLocation && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} /> {employee.workLocation}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50/50 px-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("personal")}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition ${
              activeTab === "personal"
                ? "border-purple-600 text-purple-700 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <User size={14} />
            <span>Personal & Contact</span>
          </button>

          <button
            onClick={() => setActiveTab("job")}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition ${
              activeTab === "job"
                ? "border-purple-600 text-purple-700 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Briefcase size={14} />
            <span>Job & Organization</span>
          </button>

          <button
            onClick={() => setActiveTab("statutory")}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition ${
              activeTab === "statutory"
                ? "border-purple-600 text-purple-700 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Landmark size={14} />
            <span>Bank & Statutory</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {/* PERSONAL TAB */}
          {activeTab === "personal" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <InfoItem label="Gender" value={employee.gender} />
                <InfoItem label="Date of Birth" value={employee.dob || "Not specified"} />
                <InfoItem label="Blood Group" value={employee.bloodGroup || "Not specified"} />
                <InfoItem label="Marital Status" value={employee.maritalStatus || "Single"} />
                <InfoItem label="Father's / Guardian's Name" value={employee.fatherName || "-"} />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-bold text-gray-800 mb-3 uppercase tracking-wider text-[11px] text-purple-700">
                  Address Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-gray-400 font-medium mb-1">Present Address</p>
                    <p className="text-gray-800 font-semibold leading-relaxed">
                      {employee.presentAddress || "No present address recorded"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-gray-400 font-medium mb-1">Permanent Address</p>
                    <p className="text-gray-800 font-semibold leading-relaxed">
                      {employee.permanentAddress || "No permanent address recorded"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-bold text-gray-800 mb-3 uppercase tracking-wider text-[11px] text-purple-700 flex items-center gap-1.5">
                  <HeartPulse size={14} /> Emergency Contact
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-rose-50/40 border border-rose-100 p-3.5 rounded-lg">
                  <InfoItem label="Contact Person" value={employee.emergencyContactName || "-"} />
                  <InfoItem label="Relationship" value={employee.emergencyContactRelation || "-"} />
                  <InfoItem label="Emergency Phone" value={employee.emergencyContactNum || "-"} />
                </div>
              </div>
            </div>
          )}

          {/* JOB & ORG TAB */}
          {activeTab === "job" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <InfoItem label="Department" value={employee.department} />
                <InfoItem label="Designation" value={employee.designation} />
                <InfoItem label="Employment Type" value={employee.employmentType || "Full-time"} />
                <InfoItem label="Probation Status" value={employee.probationStatus || "Confirmed"} />
                <InfoItem label="Date of Joining" value={employee.dateOfJoining || "-"} />
                <InfoItem label="Work Location" value={employee.workLocation || "Headquarters"} />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-bold text-gray-800 mb-3 uppercase tracking-wider text-[11px] text-purple-700">
                  Reporting Hierarchy
                </h4>
                <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 font-medium text-[11px]">Reporting Manager</p>
                    <p className="text-gray-900 font-bold text-sm mt-0.5">
                      {employee.managerName || "HR Department / Direct Report"}
                    </p>
                    {employee.managerId && (
                      <p className="text-[11px] text-purple-600 font-mono">{employee.managerId}</p>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold uppercase bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                    Manager
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-bold text-gray-800 mb-3 uppercase tracking-wider text-[11px] text-purple-700">
                  Compensation Structure Preview
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-gray-400 font-medium">Basic Salary</p>
                    <p className="text-base font-bold text-gray-900 mt-0.5 font-mono">
                      ₹{Number(employee.basicSalary || 0).toLocaleString("en-IN")}/mo
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-gray-400 font-medium">Total CTC</p>
                    <p className="text-base font-bold text-purple-700 mt-0.5 font-mono">
                      ₹{Number(employee.totalSalary || 0).toLocaleString("en-IN")}/mo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BANK & STATUTORY TAB */}
          {activeTab === "statutory" && (
            <div className="space-y-5">
              <div>
                <h4 className="font-bold text-gray-800 mb-3 uppercase tracking-wider text-[11px] text-purple-700">
                  Bank Account Information
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <InfoItem label="Bank Name" value={employee.bankDetails?.bankName || "Not Provided"} />
                  <InfoItem label="Account Holder Name" value={employee.bankDetails?.accountHolderName || employee.name} />
                  <InfoItem label="Account Number" value={employee.bankDetails?.accountNumber || "••••••••••••"} />
                  <InfoItem label="IFSC Code" value={employee.bankDetails?.ifscCode || "Not Provided"} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-bold text-gray-800 mb-3 uppercase tracking-wider text-[11px] text-purple-700">
                  Statutory & Compliance (Indian Tax & Labor Standard)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg">
                    <p className="text-gray-500 font-medium">PAN Card Number</p>
                    <p className="text-blue-900 font-bold font-mono text-sm mt-0.5">
                      {employee.statutoryDetails?.panNumber || "Not Linked"}
                    </p>
                  </div>
                  <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg">
                    <p className="text-gray-500 font-medium">Aadhaar Number</p>
                    <p className="text-blue-900 font-bold font-mono text-sm mt-0.5">
                      {employee.statutoryDetails?.aadhaarNumber ? `•••• •••• ${employee.statutoryDetails.aadhaarNumber.slice(-4)}` : "Not Linked"}
                    </p>
                  </div>
                  <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg">
                    <p className="text-gray-500 font-medium">UAN Number</p>
                    <p className="text-blue-900 font-bold font-mono text-sm mt-0.5">
                      {employee.statutoryDetails?.uanNumber || "Not Generated"}
                    </p>
                  </div>
                  <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg">
                    <p className="text-gray-500 font-medium">PF Account Number</p>
                    <p className="text-blue-900 font-bold font-mono text-sm mt-0.5">
                      {employee.statutoryDetails?.pfNumber || "Not Generated"}
                    </p>
                  </div>
                  <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg">
                    <p className="text-gray-500 font-medium">ESI Number</p>
                    <p className="text-blue-900 font-bold font-mono text-sm mt-0.5">
                      {employee.statutoryDetails?.esiNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            Profile Last Updated: {new Date(employee.updatedAt || Date.now()).toLocaleDateString()}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-white transition"
            >
              Close
            </button>
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(employee);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition"
              >
                Edit Dossier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-gray-400 font-medium text-[11px]">{label}</p>
      <p className="text-gray-800 font-semibold text-xs mt-0.5">{value || "-"}</p>
    </div>
  );
}

export default EmployeeDossierModal;
