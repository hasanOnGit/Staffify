import React, { useState } from "react";
import { X, Briefcase, Plus, Trash2, MapPin, CheckCircle2 } from "lucide-react";
import { clientsApi } from "../../services/api";
import toast from "react-hot-toast";

function ClientModal({ isOpen, onClose, onSuccess, clientToEdit = null }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    legalName: clientToEdit?.legalName || "",
    industry: clientToEdit?.industry || "Information Technology",
    gstin: clientToEdit?.gstin || "",
    paymentTermsDays: clientToEdit?.paymentTermsDays || 30,
    spocName: clientToEdit?.spocName || "",
    spocEmail: clientToEdit?.spocEmail || "",
    spocPhone: clientToEdit?.spocPhone || "",
    billingAddress: {
      street: clientToEdit?.billingAddress?.street || "",
      city: clientToEdit?.billingAddress?.city || "",
      state: clientToEdit?.billingAddress?.state || "",
      pincode: clientToEdit?.billingAddress?.pincode || "",
      country: "India",
    },
    sites: clientToEdit?.sites?.length
      ? clientToEdit.sites
      : [{ siteName: "Headquarters", location: "Bengaluru", address: "", contactPerson: { name: "", phone: "", email: "" } }],
  });

  if (!isOpen) return null;

  const handleAddSite = () => {
    setFormData({
      ...formData,
      sites: [
        ...formData.sites,
        {
          siteName: `Site ${formData.sites.length + 1}`,
          location: "",
          address: "",
          contactPerson: { name: "", phone: "", email: "" },
        },
      ],
    });
  };

  const handleRemoveSite = (index) => {
    if (formData.sites.length <= 1) {
      toast.error("A client must have at least one site location.");
      return;
    }
    const updated = formData.sites.filter((_, idx) => idx !== index);
    setFormData({ ...formData, sites: updated });
  };

  const handleSiteChange = (index, field, value) => {
    const updated = [...formData.sites];
    if (field.startsWith("contact.")) {
      const subField = field.split(".")[1];
      updated[index].contactPerson = {
        ...updated[index].contactPerson,
        [subField]: value,
      };
    } else {
      updated[index][field] = value;
    }
    setFormData({ ...formData, sites: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.legalName || !formData.gstin || !formData.industry) {
      toast.error("Legal name, GSTIN, and industry are required.");
      return;
    }

    try {
      setLoading(true);
      if (clientToEdit) {
        await clientsApi.update(clientToEdit.clientId, formData);
        toast.success("Client updated successfully!");
      } else {
        await clientsApi.create(formData);
        toast.success("Client registered successfully!");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save client.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xl w-full max-w-2xl overflow-hidden my-auto animate-page-enter">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#FAFBFC] dark:bg-[#0F131C]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#DEEBFF] dark:bg-[#1C2331] flex items-center justify-center text-[#0052CC] dark:text-[#579DFF]">
              <Briefcase size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                {clientToEdit ? "Edit Client & Work Sites" : "Register Enterprise Client"}
              </h2>
              <p className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                Setup enterprise account, billing terms, and physical deployment campuses
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Client Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-neutral-400">
              Corporate Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  Legal Client Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Titanium Tech Hub Enterprises"
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  Industry Vertical *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Information Technology / BFSI"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  GSTIN *
                </label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  placeholder="29AABCT8899E1Z8"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  Payment Credit Terms (Days)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.paymentTermsDays}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentTermsDays: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  Client SPOC Name
                </label>
                <input
                  type="text"
                  placeholder="Key Contact Person"
                  value={formData.spocName}
                  onChange={(e) => setFormData({ ...formData, spocName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Physical Work Sites Section */}
          <div className="space-y-3 pt-2 border-t border-[#DFE1E6] dark:border-[#263042]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-neutral-400 flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#0052CC]" />
                  <span>Physical Deployment Sites / Campuses ({formData.sites.length})</span>
                </h3>
                <p className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                  Workers are assigned directly to these specific branches
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSite}
                className="px-2.5 py-1 text-xs font-semibold text-[#0052CC] dark:text-[#579DFF] bg-[#DEEBFF] dark:bg-[#1C2331] hover:bg-[#B3D4FF] dark:hover:bg-[#263042] rounded transition cursor-pointer flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Add Site</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.sites.map((site, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C] space-y-2.5 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#0052CC] dark:text-[#579DFF] uppercase font-mono">
                      Site #{index + 1}
                    </span>
                    {formData.sites.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSite(index)}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded"
                        title="Remove site"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Site Name (e.g. Campus Alpha / Central Hub)"
                        value={site.siteName}
                        onChange={(e) => handleSiteChange(index, "siteName", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="City / Region (e.g. Bengaluru - E-City)"
                        value={site.location}
                        onChange={(e) => handleSiteChange(index, "location", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Street Address & Pincode"
                        value={site.address}
                        onChange={(e) => handleSiteChange(index, "address", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
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
              <span>{loading ? "Saving Client..." : "Save Client & Sites"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClientModal;
