import React, { useState, useEffect } from "react";
import { X, Briefcase, Plus, AlertCircle, Building2, Calendar, MapPin, DollarSign, Layers } from "lucide-react";
import { clientsApi, commercialsApi, requisitionsApi } from "../../services/api";
import { useWorkspace } from "../../context/WorkspaceContext";
import toast from "react-hot-toast";

export default function CreateRequisitionModal({ isOpen, onClose, onSuccess }) {
  const { isAgencyWorkspace, activeVendorId, activeVendorName } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [pos, setPos] = useState([]);

  const [formData, setFormData] = useState({
    clientId: "",
    siteId: "",
    poNumber: "",
    contractNumber: "",
    jobTitle: "",
    tradeCategory: "General",
    requiredHeadcount: 1,
    urgency: "Normal",
    billingRate: 35000,
    billingUnit: "Monthly",
    targetWorkerPay: 25000,
    startDate: new Date().toISOString().split("T")[0],
    experienceYears: 1,
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadPrerequisites();
    }
  }, [isOpen]);

  const loadPrerequisites = async () => {
    try {
      const [cRes, poRes] = await Promise.all([
        clientsApi.getAll(),
        commercialsApi.getPurchaseOrders(),
      ]);

      const clientList = cRes.data?.data || [];
      const poList = (poRes.data?.data || []).filter((p) => p.status !== "Exhausted");

      setClients(clientList);
      setPos(poList);

      const defaultClient = clientList[0];
      const defaultSite = defaultClient?.sites?.[0];
      const defaultPO = poList.find((p) => p.clientId === defaultClient?.clientId) || poList[0];

      setFormData((prev) => ({
        ...prev,
        clientId: defaultClient?.clientId || "",
        siteId: defaultSite?.siteId || "",
        poNumber: defaultPO?.poNumber || "",
        contractNumber: defaultPO?.contractId || "",
      }));
    } catch (err) {
      console.error("Failed to load requisition prerequisites:", err);
    }
  };

  if (!isOpen) return null;

  const selectedClient = clients.find((c) => c.clientId === formData.clientId);
  const availableSites = selectedClient?.sites || [];
  const clientPOs = pos.filter((p) => !formData.clientId || p.clientId === formData.clientId);

  const handleClientChange = (clientId) => {
    const client = clients.find((c) => c.clientId === clientId);
    const firstSite = client?.sites?.[0];
    const matchingPO = pos.find((p) => p.clientId === clientId);

    setFormData((prev) => ({
      ...prev,
      clientId,
      siteId: firstSite?.siteId || "",
      poNumber: matchingPO?.poNumber || "",
      contractNumber: matchingPO?.contractId || "",
    }));
  };

  const handlePOChange = (poNumber) => {
    const po = pos.find((p) => p.poNumber === poNumber);
    setFormData((prev) => ({
      ...prev,
      poNumber,
      contractNumber: po?.contractId || prev.contractNumber,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.jobTitle.trim()) {
      toast.error("Please enter a job title or role name");
      return;
    }
    if (!formData.clientId) {
      toast.error("Please select a client company");
      return;
    }
    if (!formData.siteId) {
      toast.error("Please select a client work site");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        clientName: selectedClient?.legalName,
        siteName: availableSites.find((s) => s.siteId === formData.siteId)?.siteName,
        vendorId: isAgencyWorkspace && activeVendorId ? activeVendorId : "VND-1002",
        vendorName: isAgencyWorkspace && activeVendorName ? activeVendorName : "Infiniti TechStaffing",
        requiredHeadcount: Number(formData.requiredHeadcount) || 1,
        billingRate: Number(formData.billingRate) || 0,
        targetWorkerPay: Number(formData.targetWorkerPay) || 0,
        experienceYears: Number(formData.experienceYears) || 1,
      };

      await requisitionsApi.create(payload);
      toast.success("Job demand published successfully");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create job demand");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#F4F5F7] dark:bg-[#151B26]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF] flex items-center justify-center font-bold">
              <Briefcase size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                Post New Job Demand
              </h3>
              <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
                Define staffing requisition from client company and assign available workers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6B778C] hover:text-[#172B4D] dark:hover:text-white p-1 rounded hover:bg-[#EBECF0] dark:hover:bg-[#263042] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Section: Client & Location */}
          <div className="bg-[#FAFBFC] dark:bg-[#151B26]/60 border border-[#EBECF0] dark:border-[#263042] rounded-md p-3.5 space-y-3">
            <span className="text-[11px] font-bold text-[#0052CC] dark:text-[#579DFF] uppercase tracking-wide flex items-center gap-1.5">
              <Building2 size={13} />
              <span>Client & Deployment Site</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Client Company *
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  required
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                >
                  <option value="" disabled>Select client</option>
                  {clients.map((c) => (
                    <option key={c.clientId} value={c.clientId}>
                      {c.legalName} ({c.clientId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Work Site / Factory *
                </label>
                <select
                  value={formData.siteId}
                  onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                  required
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                >
                  <option value="" disabled>Select site</option>
                  {availableSites.map((s) => (
                    <option key={s.siteId} value={s.siteId}>
                      {s.siteName} ({s.locationCity || "HQ"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Purchase Order (Optional)
                </label>
                <select
                  value={formData.poNumber}
                  onChange={(e) => handlePOChange(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                >
                  <option value="">None / Open Requisition</option>
                  {clientPOs.map((p) => (
                    <option key={p.poNumber} value={p.poNumber}>
                      {p.poNumber} — {p.title || "PO"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Contract Reference
                </label>
                <input
                  type="text"
                  value={formData.contractNumber}
                  onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                  placeholder="e.g. CTR-2026-01"
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                />
              </div>
            </div>
          </div>

          {/* Section: Job Role & Headcount */}
          <div className="bg-[#FAFBFC] dark:bg-[#151B26]/60 border border-[#EBECF0] dark:border-[#263042] rounded-md p-3.5 space-y-3">
            <span className="text-[11px] font-bold text-[#0052CC] dark:text-[#579DFF] uppercase tracking-wide flex items-center gap-1.5">
              <Layers size={13} />
              <span>Position & Staffing Demand</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Job Role / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder="e.g. Senior Electrician, CNC Operator, Warehouse Lead"
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Trade Category
                </label>
                <select
                  value={formData.tradeCategory}
                  onChange={(e) => setFormData({ ...formData, tradeCategory: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                >
                  <option value="General">General Manpower</option>
                  <option value="Facilities">Facilities & Operations</option>
                  <option value="Security">Security & Patrol</option>
                  <option value="Logistics">Logistics & Warehouse</option>
                  <option value="IT">IT & Tech Staffing</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Needed Headcount *
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  required
                  value={formData.requiredHeadcount}
                  onChange={(e) => setFormData({ ...formData, requiredHeadcount: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Hiring Urgency
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                >
                  <option value="Normal">Normal (Standard)</option>
                  <option value="High">High Urgency</option>
                  <option value="Critical">Critical (Immediate Deployment)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Required Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                  placeholder="Years"
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                />
              </div>
            </div>
          </div>

          {/* Section: Commercials & Rates */}
          <div className="bg-[#FAFBFC] dark:bg-[#151B26]/60 border border-[#EBECF0] dark:border-[#263042] rounded-md p-3.5 space-y-3">
            <span className="text-[11px] font-bold text-[#0052CC] dark:text-[#579DFF] uppercase tracking-wide flex items-center gap-1.5">
              <DollarSign size={13} />
              <span>Commercial Billing & Worker Pay</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Client Bill Rate (INR) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.billingRate}
                  onChange={(e) => setFormData({ ...formData, billingRate: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Billing Unit
                </label>
                <select
                  value={formData.billingUnit}
                  onChange={(e) => setFormData({ ...formData, billingUnit: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                >
                  <option value="Monthly">Monthly Per Head</option>
                  <option value="Daily">Daily Shift Rate</option>
                  <option value="Hourly">Hourly Rate</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Target Worker Pay (INR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.targetWorkerPay}
                  onChange={(e) => setFormData({ ...formData, targetWorkerPay: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Required Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Requirements & Notes
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Night shift rotation, PPE gear mandatory"
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#DFE1E6] dark:border-[#263042]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9] hover:bg-[#EBECF0] dark:hover:bg-[#1E293B] rounded transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-semibold px-4 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Plus size={14} />
              <span>{loading ? "Publishing..." : "Publish Job Demand"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
