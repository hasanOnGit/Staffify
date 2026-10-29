import React, { useState, useEffect } from "react";
import { X, Users, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { deploymentsApi, clientsApi, vendorsApi, commercialsApi } from "../../services/api";
import toast from "react-hot-toast";

function DeployWorkerModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [pos, setPos] = useState([]);

  const [formData, setFormData] = useState({
    workerName: "",
    workerPhone: "",
    vendorId: "",
    clientId: "",
    siteId: "",
    contractId: "",
    poNumber: "",
    designation: "",
    billingUnit: "Monthly",
    billableRate: 50000,
    startDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadPrerequisites();
    }
  }, [isOpen]);

  const loadPrerequisites = async () => {
    try {
      const [cRes, vRes, conRes, poRes] = await Promise.all([
        clientsApi.getAll(),
        vendorsApi.getAll({ status: "Active" }),
        commercialsApi.getContracts(),
        commercialsApi.getPurchaseOrders(),
      ]);

      setClients(cRes.data.data);
      setVendors(vRes.data.data);
      setContracts(conRes.data.data);
      setPos(poRes.data.data.filter((p) => p.status !== "Exhausted"));

      const defaultClient = cRes.data.data[0];
      const defaultVendor = vRes.data.data[0];
      const defaultContract = conRes.data.data[0];
      const defaultPO = poRes.data.data.find((p) => p.status !== "Exhausted");

      setFormData((prev) => ({
        ...prev,
        clientId: defaultClient?.clientId || "",
        siteId: defaultClient?.sites?.[0]?.siteId || "",
        vendorId: defaultVendor?.vendorId || "",
        contractId: defaultContract?.contractNumber || "",
        poNumber: defaultPO?.poNumber || "",
        designation: defaultContract?.rateCards?.[0]?.designation || "Staff",
        billableRate: defaultContract?.rateCards?.[0]?.billableRate || 50000,
      }));
    } catch (err) {
      console.error("Failed to load deployment prerequisites:", err);
    }
  };

  if (!isOpen) return null;

  // Selected client's sites
  const selectedClientObj = clients.find((c) => c.clientId === formData.clientId);
  const clientSites = selectedClientObj?.sites || [];

  // Selected contract's rate cards
  const selectedContractObj = contracts.find(
    (con) => con.contractNumber === formData.contractId
  );
  const rateCards = selectedContractObj?.rateCards || [];

  const handleContractSelect = (contractNumber) => {
    const contract = contracts.find((c) => c.contractNumber === contractNumber);
    const firstRateCard = contract?.rateCards?.[0];

    // Find PO under this contract
    const matchingPO = pos.find((p) => p.contractId === contractNumber);

    setFormData((prev) => ({
      ...prev,
      contractId: contractNumber,
      poNumber: matchingPO?.poNumber || prev.poNumber,
      clientId: contract?.clientId || prev.clientId,
      vendorId: contract?.vendorId || prev.vendorId,
      designation: firstRateCard?.designation || prev.designation,
      billingUnit: firstRateCard?.billingUnit || prev.billingUnit,
      billableRate: firstRateCard?.billableRate || prev.billableRate,
    }));
  };

  const handleDesignationSelect = (designation) => {
    const rc = rateCards.find((r) => r.designation === designation);
    if (rc) {
      setFormData((prev) => ({
        ...prev,
        designation: rc.designation,
        billingUnit: rc.billingUnit,
        billableRate: rc.billableRate,
      }));
    } else {
      setFormData((prev) => ({ ...prev, designation }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.workerName || !formData.siteId || !formData.poNumber || !formData.billableRate) {
      toast.error("Please fill in worker name, client site, PO, and billable rate.");
      return;
    }

    try {
      setLoading(true);
      await deploymentsApi.deployWorker(formData);
      toast.success(`Worker ${formData.workerName} successfully deployed!`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to deploy worker.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xl w-full max-w-xl overflow-hidden my-auto animate-page-enter">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#FAFBFC] dark:bg-[#0F131C]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#DEEBFF] dark:bg-[#1C2331] flex items-center justify-center text-[#0052CC] dark:text-[#579DFF]">
              <UserPlus size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                Assign Worker to Site
              </h2>
              <p className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                Place a worker at a client location under an approved contract and budget
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
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
          {/* Worker Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                Worker Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.workerName}
                onChange={(e) => setFormData({ ...formData, workerName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                Worker Contact Phone
              </label>
              <input
                type="text"
                placeholder="+91 98450 11223"
                value={formData.workerPhone}
                onChange={(e) => setFormData({ ...formData, workerPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
              />
            </div>
          </div>

          {/* Contract & Staffing Agency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                Contract Agreement *
              </label>
              <select
                required
                value={formData.contractId}
                onChange={(e) => handleContractSelect(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
              >
                {contracts.map((con) => (
                  <option key={con.contractNumber} value={con.contractNumber}>
                    {con.contractNumber} ({con.vendorName} → {con.clientName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                Authorized Purchase Order (PO) *
              </label>
              <select
                required
                value={formData.poNumber}
                onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white font-mono"
              >
                {pos.map((p) => (
                  <option key={p.poNumber} value={p.poNumber}>
                    {p.poNumber} — Rem: ₹{(p.remainingBalance || 0).toLocaleString("en-IN")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Client & Physical Site */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                Client Organization
              </label>
              <select
                disabled
                value={formData.clientId}
                className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C] text-[#172B4D] dark:text-neutral-300 opacity-80"
              >
                {clients.map((c) => (
                  <option key={c.clientId} value={c.clientId}>
                    {c.legalName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                Target Work Site / Campus *
              </label>
              <select
                required
                value={formData.siteId}
                onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
              >
                {clientSites.map((s) => (
                  <option key={s.siteId} value={s.siteId}>
                    {s.siteName} ({s.location})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Designation & Rate Card Match */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                Designation / Role *
              </label>
              {rateCards.length > 0 ? (
                <select
                  value={formData.designation}
                  onChange={(e) => handleDesignationSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                >
                  {rateCards.map((rc, idx) => (
                    <option key={idx} value={rc.designation}>
                      {rc.designation}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Engineer"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                Billing Unit
              </label>
              <select
                value={formData.billingUnit}
                onChange={(e) => setFormData({ ...formData, billingUnit: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
              >
                <option value="Hourly">Hourly</option>
                <option value="Daily">Daily</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
                Billable Rate (₹) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={formData.billableRate}
                onChange={(e) => setFormData({ ...formData, billableRate: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#172B4D] dark:text-neutral-300 mb-1">
              Deployment Start Date *
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
              <span>{loading ? "Assigning..." : "Confirm Assignment"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeployWorkerModal;
