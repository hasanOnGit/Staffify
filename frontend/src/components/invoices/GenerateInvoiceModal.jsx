import React, { useState, useEffect } from "react";
import { X, Receipt, CheckCircle2, AlertCircle, Calculator } from "lucide-react";
import { invoicesApi, vendorsApi, clientsApi, commercialsApi, deploymentsApi } from "../../services/api";
import toast from "react-hot-toast";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function GenerateInvoiceModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [clients, setClients] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [previewWorkers, setPreviewWorkers] = useState([]);

  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    vendorId: "",
    clientId: "",
    contractId: "",
    poNumber: "",
    month: months[new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1],
    year: currentYear,
    customDaysWorked: {},
  });

  useEffect(() => {
    if (isOpen) {
      loadPrerequisites();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.vendorId && formData.clientId) {
      loadActiveDeployments();
    }
  }, [formData.vendorId, formData.clientId]);

  const loadPrerequisites = async () => {
    try {
      const [vRes, cRes, conRes] = await Promise.all([
        vendorsApi.getAll({ status: "Active" }),
        clientsApi.getAll(),
        commercialsApi.getContracts(),
      ]);

      setVendors(vRes.data.data);
      setClients(cRes.data.data);
      setContracts(conRes.data.data);

      if (vRes.data.data.length && !formData.vendorId) {
        setFormData((prev) => ({ ...prev, vendorId: vRes.data.data[0].vendorId }));
      }
      if (cRes.data.data.length && !formData.clientId) {
        setFormData((prev) => ({ ...prev, clientId: cRes.data.data[0].clientId }));
      }
    } catch (err) {
      console.error("Failed to load invoice prerequisites:", err);
    }
  };

  const loadActiveDeployments = async () => {
    try {
      const res = await deploymentsApi.getAll({
        vendorId: formData.vendorId,
        clientId: formData.clientId,
        status: "Active",
      });
      setPreviewWorkers(res.data.data);

      if (res.data.data.length > 0) {
        const first = res.data.data[0];
        setFormData((prev) => ({
          ...prev,
          contractId: first.contractNumber || prev.contractId,
          poNumber: first.poNumber || prev.poNumber,
        }));
      }
    } catch (err) {
      console.error("Failed to load matching deployments:", err);
    }
  };

  if (!isOpen) return null;

  // Compute estimated subtotal
  const standardDays = 26;
  const estimatedSubtotal = previewWorkers.reduce((acc, dep) => {
    const days = formData.customDaysWorked[dep.workerId] || standardDays;
    let lineTotal = 0;
    if (dep.billingUnit === "Hourly") {
      lineTotal = Math.round(days * 8 * dep.billableRate);
    } else if (dep.billingUnit === "Daily") {
      lineTotal = Math.round(days * dep.billableRate);
    } else {
      lineTotal = Math.round((days / standardDays) * dep.billableRate);
    }
    return acc + lineTotal;
  }, 0);

  const estimatedGst = Math.round((estimatedSubtotal * 18) / 100);
  const estimatedGrandTotal = estimatedSubtotal + estimatedGst;

  const handleDaysChange = (workerId, days) => {
    setFormData((prev) => ({
      ...prev,
      customDaysWorked: {
        ...prev.customDaysWorked,
        [workerId]: Number(days),
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (previewWorkers.length === 0) {
      toast.error("No active worker deployments found for this vendor/client pair.");
      return;
    }

    try {
      setLoading(true);
      await invoicesApi.generate(formData);
      toast.success("Monthly invoice generated successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate invoice.");
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
              <Receipt size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                Generate Monthly Vendor Invoice
              </h2>
              <p className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                Pulls deployed contractors, calculates pro-rated billable amounts, and appends 18% GST
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
          {/* Vendor & Client Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                Staffing Agency (Vendor) *
              </label>
              <select
                required
                value={formData.vendorId}
                onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
              >
                {vendors.map((v) => (
                  <option key={v.vendorId} value={v.vendorId}>
                    {v.legalName}
                  </option>
                ))}
              </select>
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
                    {c.legalName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Billing Period */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                Billing Month *
              </label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                Billing Year *
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white font-mono"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                Deducting PO
              </label>
              <input
                type="text"
                readOnly
                value={formData.poNumber || "Auto-detected"}
                className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C] text-[#0052CC] dark:text-[#579DFF] font-mono font-bold"
              />
            </div>
          </div>

          {/* Deployed Personnel Table */}
          <div className="space-y-2 pt-2 border-t border-[#DFE1E6] dark:border-[#263042]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-neutral-400">
                Deployed Contractors ({previewWorkers.length})
              </span>
              <span className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                Standard: 26 working days
              </span>
            </div>

            {previewWorkers.length === 0 ? (
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <AlertCircle size={15} />
                <span>No active worker deployments found for this agency and client.</span>
              </div>
            ) : (
              <div className="border border-[#DFE1E6] dark:border-[#263042] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs text-[#172B4D] dark:text-[#F1F5F9]">
                  <thead className="bg-[#FAFBFC] dark:bg-[#0F131C] text-[10px] uppercase font-bold text-[#6B778C] dark:text-neutral-400">
                    <tr>
                      <th className="px-3 py-2">Worker & Role</th>
                      <th className="px-3 py-2">Site</th>
                      <th className="px-3 py-2">Rate</th>
                      <th className="px-3 py-2 w-24">Days Worked</th>
                      <th className="px-3 py-2 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE1E6] dark:divide-[#263042]">
                    {previewWorkers.map((dep) => {
                      const days = formData.customDaysWorked[dep.workerId] || standardDays;
                      const lineTotal = Math.round((days / standardDays) * dep.billableRate);

                      return (
                        <tr key={dep._id} className="hover:bg-[#F4F5F7] dark:hover:bg-[#1C2331]">
                          <td className="px-3 py-2">
                            <div className="font-semibold">{dep.workerName}</div>
                            <div className="text-[10px] text-[#6B778C] dark:text-neutral-400">
                              {dep.designation}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-[11px] text-[#6B778C] dark:text-neutral-400">
                            {dep.siteName}
                          </td>
                          <td className="px-3 py-2 font-mono text-[11px]">
                            ₹{dep.billableRate.toLocaleString("en-IN")}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min={0}
                              max={31}
                              value={days}
                              onChange={(e) => handleDaysChange(dep.workerId, e.target.value)}
                              className="w-16 px-2 py-1 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white font-mono"
                            />
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-semibold text-[#0052CC] dark:text-[#579DFF]">
                            ₹{lineTotal.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Subtotal, GST & Total Summary Card */}
          <div className="p-3.5 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#42526E] dark:text-neutral-300">
              <span>Subtotal (Net Contractor Services):</span>
              <span className="font-mono font-semibold">₹{estimatedSubtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#42526E] dark:text-neutral-300">
              <span>Applicable GST (18% Statutory):</span>
              <span className="font-mono font-semibold">₹{estimatedGst.toLocaleString("en-IN")}</span>
            </div>
            <div className="pt-2 border-t border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between text-sm font-bold text-[#172B4D] dark:text-white">
              <span>Estimated Invoice Grand Total:</span>
              <span className="font-mono text-[#0052CC] dark:text-[#579DFF]">
                ₹{estimatedGrandTotal.toLocaleString("en-IN")}
              </span>
            </div>
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
              disabled={loading || previewWorkers.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] disabled:opacity-50 rounded transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 size={14} />
              <span>{loading ? "Generating..." : "Generate Invoice"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GenerateInvoiceModal;
