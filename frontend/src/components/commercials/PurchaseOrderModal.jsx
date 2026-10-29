import React, { useState, useEffect } from "react";
import { X, FileCheck2, CheckCircle2 } from "lucide-react";
import { commercialsApi, clientsApi } from "../../services/api";
import toast from "react-hot-toast";

function PurchaseOrderModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [contracts, setContracts] = useState([]);

  const [formData, setFormData] = useState({
    clientId: "",
    contractId: "",
    poValue: 1000000,
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0],
    description: "",
    status: "Active",
  });

  useEffect(() => {
    if (isOpen) {
      loadPrerequisites();
    }
  }, [isOpen]);

  const loadPrerequisites = async () => {
    try {
      const [cRes, conRes] = await Promise.all([
        clientsApi.getAll(),
        commercialsApi.getContracts(),
      ]);
      setClients(cRes.data.data);
      setContracts(conRes.data.data);

      if (cRes.data.data.length && !formData.clientId) {
        setFormData((prev) => ({ ...prev, clientId: cRes.data.data[0].clientId }));
      }
      if (conRes.data.data.length && !formData.contractId) {
        setFormData((prev) => ({ ...prev, contractId: conRes.data.data[0].contractNumber }));
      }
    } catch (err) {
      console.error("Failed to load PO prerequisites:", err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientId || !formData.contractId || !formData.poValue) {
      toast.error("Please fill in Client, Contract, and PO Budget Value.");
      return;
    }

    try {
      setLoading(true);
      await commercialsApi.createPurchaseOrder(formData);
      toast.success("Purchase Order issued successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create PO.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xl w-full max-w-lg overflow-hidden my-auto animate-page-enter">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#FAFBFC] dark:bg-[#0F131C]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#DEEBFF] dark:bg-[#1C2331] flex items-center justify-center text-[#0052CC] dark:text-[#579DFF]">
              <FileCheck2 size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                Issue Client Purchase Order (PO)
              </h2>
              <p className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                Authorize spending budget under an active client contract
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
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
              Client Entity *
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
              Associated Contract Agreement *
            </label>
            <select
              required
              value={formData.contractId}
              onChange={(e) => setFormData({ ...formData, contractId: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
            >
              {contracts.map((con) => (
                <option key={con.contractNumber} value={con.contractNumber}>
                  {con.contractNumber} — {con.title || con.clientName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
              Approved PO Budget Value (₹) *
            </label>
            <input
              type="number"
              required
              min={1000}
              step={1000}
              placeholder="e.g. 2500000"
              value={formData.poValue}
              onChange={(e) => setFormData({ ...formData, poValue: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white font-mono font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                Expiry Date *
              </label>
              <input
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
              PO Scope / Work Description
            </label>
            <input
              type="text"
              placeholder="e.g. Q2 Guarding or Software Augmentation PO"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-[#DFE1E6] dark:border-[#263042] flex items-center justify-end gap-2">
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
              <span>{loading ? "Issuing..." : "Issue Purchase Order"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PurchaseOrderModal;
