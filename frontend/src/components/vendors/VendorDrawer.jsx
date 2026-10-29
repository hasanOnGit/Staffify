import React, { useEffect, useState } from "react";
import {
  X,
  Building2,
  FileCheck2,
  Users,
  MapPin,
  CreditCard,
  Mail,
  Phone,
  ShieldCheck,
  Star,
  ExternalLink,
} from "lucide-react";
import StatusLozenge from "../StatusLozenge";
import { vendorsApi } from "../../services/api";

function VendorDrawer({ vendorId, isOpen, onClose }) {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && vendorId) {
      loadVendor();
    }
  }, [isOpen, vendorId]);

  const loadVendor = async () => {
    try {
      setLoading(true);
      const res = await vendorsApi.getById(vendorId);
      setVendor(res.data.data);
    } catch (err) {
      console.error("Failed to load vendor dossier:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#151B26] border-l border-[#DFE1E6] dark:border-[#263042] h-full shadow-2xl flex flex-col transform transition-transform duration-250 ease-out animate-page-enter"
      >
        {/* Drawer Header */}
        <div className="h-16 px-5 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#FAFBFC] dark:bg-[#0F131C] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#DEEBFF] dark:bg-[#1C2331] flex items-center justify-center text-[#0052CC] dark:text-[#579DFF]">
              <Building2 size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#6B778C] dark:text-neutral-400">
                  {vendor?.vendorId || vendorId}
                </span>
                {vendor && <StatusLozenge status={vendor.status} size="xs" />}
              </div>
              <h2 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9] truncate max-w-sm">
                {vendor?.legalName || "Loading Agency..."}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#6B778C] dark:text-neutral-400 hover:text-[#172B4D] dark:hover:text-white rounded hover:bg-[#EBECF0] dark:hover:bg-[#1C2331]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-8 text-xs text-[#6B778C] dark:text-neutral-400">
            Loading Agency Dossier...
          </div>
        ) : vendor ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* KPI Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C]">
                <span className="text-[10px] uppercase font-bold text-[#6B778C] dark:text-neutral-400 block">
                  Category
                </span>
                <span className="text-xs font-bold text-[#0052CC] dark:text-[#579DFF]">
                  {vendor.category}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C]">
                <span className="text-[10px] uppercase font-bold text-[#6B778C] dark:text-neutral-400 block">
                  Active Contracts
                </span>
                <span className="text-xs font-bold text-[#172B4D] dark:text-white">
                  {vendor.contracts?.length || 0} Agreements
                </span>
              </div>
              <div className="p-3 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C]">
                <span className="text-[10px] uppercase font-bold text-[#6B778C] dark:text-neutral-400 block">
                  Deployed Staff
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {vendor.deployments?.filter((d) => d.status === "Active").length || 0} Workers
                </span>
              </div>
            </div>

            {/* Statutory Details Card */}
            <div className="p-4 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-neutral-400 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#0052CC]" />
                <span>Statutory & Tax Identification</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#6B778C] dark:text-neutral-400 block">GSTIN</span>
                  <span className="font-mono font-bold text-[#172B4D] dark:text-white">
                    {vendor.gstin || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B778C] dark:text-neutral-400 block">PAN</span>
                  <span className="font-mono font-bold text-[#172B4D] dark:text-white">
                    {vendor.pan || "N/A"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-[#6B778C] dark:text-neutral-400 block">SPOC Contact</span>
                  <span className="font-semibold text-[#172B4D] dark:text-white">
                    {vendor.spocName} ({vendor.phone})
                  </span>
                  <span className="block text-[#6B778C] dark:text-neutral-400 text-[11px]">
                    {vendor.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank Details Card */}
            <div className="p-4 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C] space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-neutral-400 flex items-center gap-1.5">
                <CreditCard size={14} className="text-[#0052CC]" />
                <span>Payout Bank Account</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#6B778C] dark:text-neutral-400 block">Bank</span>
                  <span className="font-medium text-[#172B4D] dark:text-white">
                    {vendor.bankDetails?.bankName || "Not configured"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B778C] dark:text-neutral-400 block">IFSC Code</span>
                  <span className="font-mono font-bold text-[#172B4D] dark:text-white">
                    {vendor.bankDetails?.ifscCode || "N/A"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-[#6B778C] dark:text-neutral-400 block">Account Number</span>
                  <span className="font-mono font-bold text-[#172B4D] dark:text-white">
                    {vendor.bankDetails?.accountNumber || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Contracts Tab */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-neutral-400 flex items-center gap-1.5">
                <FileCheck2 size={14} className="text-[#0052CC]" />
                <span>Associated Contracts ({vendor.contracts?.length || 0})</span>
              </h3>

              {vendor.contracts?.length > 0 ? (
                <div className="space-y-2">
                  {vendor.contracts.map((c) => (
                    <div
                      key={c._id}
                      className="p-3 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#0052CC] dark:text-[#579DFF]">
                          {c.contractNumber}
                        </span>
                        <StatusLozenge status={c.status} size="xs" />
                      </div>
                      <p className="text-xs font-semibold text-[#172B4D] dark:text-white">
                        {c.title || c.clientName}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-[#6B778C] dark:text-neutral-400">
                        <span>Client: {c.clientName}</span>
                        <span>{c.rateCards?.length || 0} Rate Cards</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6B778C] dark:text-neutral-400 italic">
                  No contracts active for this agency.
                </p>
              )}
            </div>

            {/* Deployed Personnel List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-neutral-400 flex items-center gap-1.5">
                <Users size={14} className="text-[#0052CC]" />
                <span>Deployed Personnel ({vendor.deployments?.length || 0})</span>
              </h3>

              {vendor.deployments?.length > 0 ? (
                <div className="space-y-2">
                  {vendor.deployments.map((d) => (
                    <div
                      key={d._id}
                      className="p-2.5 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[#172B4D] dark:text-white block">
                          {d.workerName}
                        </span>
                        <span className="text-[11px] text-[#6B778C] dark:text-neutral-400 block">
                          {d.designation} • {d.siteName}
                        </span>
                      </div>
                      <div className="text-right">
                        <StatusLozenge status={d.status} size="xs" />
                        <span className="block text-[11px] font-mono text-[#0052CC] dark:text-[#579DFF] mt-0.5">
                          ₹{d.billableRate.toLocaleString("en-IN")}/{d.billingUnit?.charAt(0) || "M"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6B778C] dark:text-neutral-400 italic">
                  No active workers deployed currently.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default VendorDrawer;
