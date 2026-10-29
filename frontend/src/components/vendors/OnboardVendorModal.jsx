import React, { useState } from "react";
import { X, Building2, User, Mail, Phone, CreditCard, MapPin, CheckCircle2 } from "lucide-react";
import { vendorsApi } from "../../services/api";
import toast from "react-hot-toast";

function OnboardVendorModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    legalName: "",
    category: "General",
    gstin: "",
    pan: "",
    spocName: "",
    email: "",
    phone: "",
    billingAddress: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
    bankDetails: {
      accountNumber: "",
      bankName: "",
      ifscCode: "",
      accountHolderName: "",
    },
    status: "Active",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.legalName || !formData.gstin || !formData.pan || !formData.spocName || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields (Name, GSTIN, PAN, SPOC, Email, Phone).");
      return;
    }

    try {
      setLoading(true);
      await vendorsApi.create(formData);
      toast.success("Vendor onboarded successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to onboard vendor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xl w-full max-w-2xl overflow-hidden my-auto animate-page-enter">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#FAFBFC] dark:bg-[#0F131C]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#DEEBFF] dark:bg-[#1C2331] flex items-center justify-center text-[#0052CC] dark:text-[#579DFF]">
              <Building2 size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                Onboard Staffing Agency / Vendor
              </h2>
              <p className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                Register a new contractor with statutory GSTIN and bank details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#6B778C] dark:text-neutral-400 hover:text-[#172B4D] dark:hover:text-white rounded"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Agency Profile */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-neutral-400">
              Agency Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  Legal Agency Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Security & Allied Solutions Pvt Ltd"
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  Service Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                >
                  <option value="General">General Staffing</option>
                  <option value="Security">Security & Guarding</option>
                  <option value="IT">IT & Tech Staffing</option>
                  <option value="Facilities">Facilities & Sanitization</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  Initial Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Blacklisted">Blacklisted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Statutory Identifiers */}
          <div className="space-y-3 pt-2 border-t border-[#DFE1E6] dark:border-[#263042]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-neutral-400">
              Statutory Credentials (India)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  GSTIN (15 Digits) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  placeholder="27AABCA1234F1Z5"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  Company PAN (10 Digits) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="AABCA1234F"
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white uppercase font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: SPOC Contact */}
          <div className="space-y-3 pt-2 border-t border-[#DFE1E6] dark:border-[#263042]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-neutral-400">
              Primary Point of Contact (SPOC)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  SPOC Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Shinde"
                  value={formData.spocName}
                  onChange={(e) => setFormData({ ...formData, spocName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  Official Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="spoc@agency.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  Phone / Mobile *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98201 12345"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Bank Details */}
          <div className="space-y-3 pt-2 border-t border-[#DFE1E6] dark:border-[#263042]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-neutral-400">
              Disbursement Bank Account
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank"
                  value={formData.bankDetails.bankName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, bankName: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  placeholder="Account number"
                  value={formData.bankDetails.accountNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, accountNumber: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0000240"
                  value={formData.bankDetails.ifscCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankDetails: {
                        ...formData.bankDetails,
                        ifscCode: e.target.value.toUpperCase(),
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  placeholder="Name as per bank record"
                  value={formData.bankDetails.accountHolderName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, accountHolderName: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Address */}
          <div className="space-y-3 pt-2 border-t border-[#DFE1E6] dark:border-[#263042]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-neutral-400">
              Registered Billing Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <input
                  type="text"
                  placeholder="Street / Premises"
                  value={formData.billingAddress.street}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      billingAddress: { ...formData.billingAddress, street: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="City"
                  value={formData.billingAddress.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      billingAddress: { ...formData.billingAddress, city: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="State"
                  value={formData.billingAddress.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      billingAddress: { ...formData.billingAddress, state: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Pincode"
                  value={formData.billingAddress.pincode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      billingAddress: { ...formData.billingAddress, pincode: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-[#DFE1E6] dark:border-[#263042] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#42526E] dark:text-neutral-300 hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] rounded transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] disabled:opacity-50 rounded transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 size={14} />
              <span>{loading ? "Registering..." : "Onboard Vendor"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OnboardVendorModal;
