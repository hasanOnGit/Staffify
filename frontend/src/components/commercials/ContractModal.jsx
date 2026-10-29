import React, { useState, useEffect } from "react";
import { X, FileCheck2, Plus, Trash2, Calculator, CheckCircle2 } from "lucide-react";
import { commercialsApi, clientsApi, vendorsApi } from "../../services/api";
import toast from "react-hot-toast";

function ContractModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    clientId: "",
    vendorId: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
    status: "Active",
    termsAndConditions: "",
    rateCards: [
      {
        designation: "Full Stack Engineer",
        billingUnit: "Monthly",
        baseCost: 100000,
        markupPercent: 20,
        billableRate: 120000,
      },
    ],
  });

  useEffect(() => {
    if (isOpen) {
      loadPrerequisites();
    }
  }, [isOpen]);

  const loadPrerequisites = async () => {
    try {
      const [cRes, vRes] = await Promise.all([clientsApi.getAll(), vendorsApi.getAll()]);
      setClients(cRes.data.data);
      setVendors(vRes.data.data.filter((v) => v.status === "Active"));

      if (cRes.data.data.length && !formData.clientId) {
        setFormData((prev) => ({ ...prev, clientId: cRes.data.data[0].clientId }));
      }
      if (vRes.data.data.length && !formData.vendorId) {
        setFormData((prev) => ({ ...prev, vendorId: vRes.data.data[0].vendorId }));
      }
    } catch (err) {
      console.error("Failed to load clients/vendors:", err);
    }
  };

  if (!isOpen) return null;

  const handleAddRateCard = () => {
    setFormData({
      ...formData,
      rateCards: [
        ...formData.rateCards,
        {
          designation: "Senior Staff",
          billingUnit: "Monthly",
          baseCost: 50000,
          markupPercent: 15,
          billableRate: 57500,
        },
      ],
    });
  };

  const handleRemoveRateCard = (index) => {
    if (formData.rateCards.length <= 1) {
      toast.error("Contract must contain at least one rate card item.");
      return;
    }
    const updated = formData.rateCards.filter((_, idx) => idx !== index);
    setFormData({ ...formData, rateCards: updated });
  };

  const handleRateCardChange = (index, field, value) => {
    const updated = [...formData.rateCards];
    updated[index][field] = value;

    // Auto-calculate billableRate when baseCost or markupPercent change
    if (field === "baseCost" || field === "markupPercent") {
      const base = Number(field === "baseCost" ? value : updated[index].baseCost) || 0;
      const markup = Number(field === "markupPercent" ? value : updated[index].markupPercent) || 0;
      updated[index].billableRate = Math.round(base * (1 + markup / 100));
    }

    setFormData({ ...formData, rateCards: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientId || !formData.vendorId || !formData.startDate || !formData.endDate) {
      toast.error("Please fill in client, vendor, and validity dates.");
      return;
    }

    try {
      setLoading(true);
      await commercialsApi.createContract(formData);
      toast.success("Contract and Rate Cards registered successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create contract.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xl w-full max-w-3xl overflow-hidden my-auto animate-page-enter">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#FAFBFC] dark:bg-[#0F131C]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#DEEBFF] dark:bg-[#1C2331] flex items-center justify-center text-[#0052CC] dark:text-[#579DFF]">
              <FileCheck2 size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                Create Commercial Contract & Rate Cards
              </h2>
              <p className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                Establish vendor-client staffing master agreement with computed markup margins
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Agreement Basics */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-neutral-400">
              Contract Terms
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  Agreement Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q1 Engineering Augmentation MSA"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  Client Organization *
                </label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                >
                  {clients.map((c) => (
                    <option key={c.clientId} value={c.clientId}>
                      {c.legalName} ({c.clientId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  Staffing Agency / Vendor *
                </label>
                <select
                  required
                  value={formData.vendorId}
                  onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                >
                  {vendors.map((v) => (
                    <option key={v.vendorId} value={v.vendorId}>
                      {v.legalName} ({v.vendorId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Rate Card Builder */}
          <div className="space-y-3 pt-2 border-t border-[#DFE1E6] dark:border-[#263042]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-neutral-400 flex items-center gap-1.5">
                  <Calculator size={14} className="text-[#0052CC]" />
                  <span>Rate Card Calculator (Billable Rate = Base Cost × [1 + Markup%])</span>
                </h3>
                <p className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                  Configure role-based commercial billing rates with agency markup
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddRateCard}
                className="px-2.5 py-1 text-xs font-semibold text-[#0052CC] dark:text-[#579DFF] bg-[#DEEBFF] dark:bg-[#1C2331] hover:bg-[#B3D4FF] dark:hover:bg-[#263042] rounded transition cursor-pointer flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Add Role</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.rateCards.map((rc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C] grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                >
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold text-[#6B778C] dark:text-neutral-400 mb-0.5">
                      Designation / Role
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Full Stack Engineer"
                      value={rc.designation}
                      onChange={(e) => handleRateCardChange(idx, "designation", e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-[#6B778C] dark:text-neutral-400 mb-0.5">
                      Billing Unit
                    </label>
                    <select
                      value={rc.billingUnit}
                      onChange={(e) => handleRateCardChange(idx, "billingUnit", e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white"
                    >
                      <option value="Hourly">Hourly</option>
                      <option value="Daily">Daily</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-[#6B778C] dark:text-neutral-400 mb-0.5">
                      Base Cost (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={rc.baseCost}
                      onChange={(e) => handleRateCardChange(idx, "baseCost", Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-bold text-[#6B778C] dark:text-neutral-400 mb-0.5">
                      Markup %
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={rc.markupPercent}
                      onChange={(e) =>
                        handleRateCardChange(idx, "markupPercent", Number(e.target.value))
                      }
                      className="w-full px-2 py-1 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-[#0052CC] dark:text-[#579DFF] mb-0.5">
                      Billable Rate (₹)
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={rc.billableRate}
                      className="w-full px-2 py-1 text-xs rounded border border-[#B3D4FF] dark:border-[#263042] bg-[#DEEBFF]/50 dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF] font-mono font-bold"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    {formData.rateCards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRateCard(idx)}
                        className="p-1 text-rose-500 hover:text-rose-700 rounded mt-3"
                        title="Remove role"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
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
              <span>{loading ? "Creating..." : "Save Contract & Rates"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContractModal;
