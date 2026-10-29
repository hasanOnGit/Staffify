import React, { useState } from "react";
import { X, UserPlus, ShieldCheck, CreditCard, FileText } from "lucide-react";
import { workersApi } from "../../services/api";
import toast from "react-hot-toast";

const TRADE_CATEGORIES = ["Security", "IT", "Facilities", "Logistics", "General"];
const POLICE_STATUSES = ["Verified", "Pending", "Failed", "Not Submitted"];

function OnboardWorkerModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    tradeCategory: "General",
    primarySkill: "",
    experienceYears: 2,
    wagePerDayOrMonth: 25000,
    billingUnit: "Monthly",
    kycDetails: {
      aadhaarNumber: "",
      panNumber: "",
      policeVerificationStatus: "Pending",
      medicalFitnessCleared: true,
      bankAccountNumber: "",
      ifscCode: "",
      bankName: "",
    },
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("kyc_")) {
      const kycField = name.replace("kyc_", "");
      setFormData((prev) => ({
        ...prev,
        kycDetails: {
          ...prev.kycDetails,
          [kycField]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.primarySkill || !formData.wagePerDayOrMonth) {
      toast.error("Please fill in all mandatory worker profile fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await workersApi.create(formData);
      toast.success(res.data.message || "Worker added to talent bench successfully.");
      onSuccess?.(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to onboard worker.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#0F131C] rounded-lg shadow-2xl border border-[#DFE1E6] dark:border-[#263042] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF]">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172B4D] dark:text-white">
                Onboard Talent to Worker Bench
              </h2>
              <p className="text-xs text-[#6B778C] dark:text-neutral-400">
                Enroll skilled manpower into ready talent pool with statutory KYC verification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#6B778C] hover:text-[#172B4D] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1C2331] transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Personal & Trade Info */}
          <div>
            <h3 className="text-xs font-bold text-[#172B4D] dark:text-neutral-200 uppercase tracking-wide flex items-center gap-1.5 mb-2.5">
              <FileText size={13} className="text-[#0052CC] dark:text-[#579DFF]" />
              Profile & Trade Specialization
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ramesh@talentpool.in"
                  className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                  Trade Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="tradeCategory"
                  value={formData.tradeCategory}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  {TRADE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                  Primary Skill / Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="primarySkill"
                  required
                  value={formData.primarySkill}
                  onChange={handleChange}
                  placeholder="e.g. Senior Security Supervisor / AWS DevOps Engineer"
                  className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  name="experienceYears"
                  min="0"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                    Base Wage <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="wagePerDayOrMonth"
                    required
                    min="0"
                    value={formData.wagePerDayOrMonth}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                    Unit
                  </label>
                  <select
                    name="billingUnit"
                    value={formData.billingUnit}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Daily">Daily</option>
                    <option value="Hourly">Hourly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Statutory KYC Verification */}
          <div className="pt-2 border-t border-[#DFE1E6] dark:border-[#263042]">
            <h3 className="text-xs font-bold text-[#172B4D] dark:text-neutral-200 uppercase tracking-wide flex items-center gap-1.5 mb-2.5">
              <ShieldCheck size={13} className="text-[#00875A]" />
              Statutory KYC & Compliance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  name="kyc_aadhaarNumber"
                  value={formData.kycDetails.aadhaarNumber}
                  onChange={handleChange}
                  placeholder="12-digit UIDAI number"
                  className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                  PAN Number
                </label>
                <input
                  type="text"
                  name="kyc_panNumber"
                  value={formData.kycDetails.panNumber}
                  onChange={handleChange}
                  placeholder="10-digit PAN"
                  className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                  Police Verification Status
                </label>
                <select
                  name="kyc_policeVerificationStatus"
                  value={formData.kycDetails.policeVerificationStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  {POLICE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="kyc_medicalFitnessCleared"
                    checked={formData.kycDetails.medicalFitnessCleared}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-[#0052CC] border-[#DFE1E6] focus:ring-[#0052CC]"
                  />
                  <span className="text-xs font-medium text-[#172B4D] dark:text-neutral-300">
                    Medical Fitness Certificate Cleared
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="pt-2 border-t border-[#DFE1E6] dark:border-[#263042]">
            <h3 className="text-xs font-bold text-[#172B4D] dark:text-neutral-200 uppercase tracking-wide flex items-center gap-1.5 mb-2.5">
              <CreditCard size={13} className="text-[#0052CC] dark:text-[#579DFF]" />
              Bank Payout Account Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="kyc_bankName"
                  value={formData.kycDetails.bankName}
                  onChange={handleChange}
                  placeholder="e.g. HDFC Bank"
                  className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  name="kyc_bankAccountNumber"
                  value={formData.kycDetails.bankAccountNumber}
                  onChange={handleChange}
                  placeholder="Account number"
                  className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="kyc_ifscCode"
                  value={formData.kycDetails.ifscCode}
                  onChange={handleChange}
                  placeholder="e.g. HDFC0000123"
                  className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-[#DFE1E6] dark:border-[#263042] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-1.5 rounded text-xs font-medium border border-[#DFE1E6] dark:border-[#263042] text-[#42526E] dark:text-neutral-300 hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded text-xs font-semibold bg-[#0052CC] hover:bg-[#0747A6] text-white shadow-xs transition flex items-center gap-1.5"
            >
              {loading ? (
                <span>Adding to Bench...</span>
              ) : (
                <>
                  <UserPlus size={14} />
                  <span>Enroll Worker</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OnboardWorkerModal;
