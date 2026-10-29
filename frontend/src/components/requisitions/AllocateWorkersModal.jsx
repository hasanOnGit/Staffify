import React, { useState, useEffect } from "react";
import {
  X,
  UserCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  ShieldCheck,
  Check,
  Users,
} from "lucide-react";
import { workersApi, requisitionsApi } from "../../services/api";
import StatusLozenge from "../StatusLozenge";
import toast from "react-hot-toast";

export default function AllocateWorkersModal({ isOpen, onClose, onSuccess, requisition }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedWorkerIds, setSelectedWorkerIds] = useState([]);

  useEffect(() => {
    if (isOpen && requisition) {
      setSelectedWorkerIds([]);
      setSearch("");
      loadAvailableWorkers();
    }
  }, [isOpen, requisition]);

  const loadAvailableWorkers = async () => {
    try {
      setLoading(true);
      const res = await workersApi.getAll({ status: "Available" });
      const workers = res.data?.data || [];
      setAvailableWorkers(workers);
    } catch (err) {
      toast.error("Failed to load available workers: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !requisition) return null;

  const neededHeadcount = requisition.requiredHeadcount || 1;
  const fulfilledCount = requisition.fulfilledHeadcount || 0;
  const remainingSlots = Math.max(0, neededHeadcount - fulfilledCount);

  // Filter available workers by search query
  const filteredWorkers = availableWorkers.filter((w) => {
    const q = search.toLowerCase();
    const fullName = `${w.firstName || ""} ${w.lastName || ""}`.toLowerCase();
    const matchesQuery =
      fullName.includes(q) ||
      (w.workerId && w.workerId.toLowerCase().includes(q)) ||
      (w.tradeCategory && w.tradeCategory.toLowerCase().includes(q)) ||
      (w.skillCategory && w.skillCategory.toLowerCase().includes(q));
    return matchesQuery;
  });

  const toggleWorkerSelection = (workerId) => {
    if (selectedWorkerIds.includes(workerId)) {
      setSelectedWorkerIds(selectedWorkerIds.filter((id) => id !== workerId));
    } else {
      if (selectedWorkerIds.length >= remainingSlots && remainingSlots > 0) {
        toast.error(`This requisition only has ${remainingSlots} open position(s) remaining.`);
        return;
      }
      setSelectedWorkerIds([...selectedWorkerIds, workerId]);
    }
  };

  const handleSelectAllFiltered = () => {
    const selectable = filteredWorkers.slice(0, remainingSlots).map((w) => w.workerId);
    setSelectedWorkerIds(selectable);
  };

  const handleClearSelection = () => {
    setSelectedWorkerIds([]);
  };

  const handleAllocate = async () => {
    if (selectedWorkerIds.length === 0) {
      toast.error("Please select at least one worker to allocate");
      return;
    }

    try {
      setSubmitting(true);
      const res = await requisitionsApi.allocateWorkers(
        requisition.requisitionId || requisition._id,
        selectedWorkerIds
      );

      toast.success(res.data?.message || `Successfully allocated ${selectedWorkerIds.length} worker(s)!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to allocate workers");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#F4F5F7] dark:bg-[#151B26]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF] flex items-center justify-center font-bold">
              <UserCheck size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                  Allocate Workers
                </h3>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#EBECF0] dark:bg-[#263042] text-[#172B4D] dark:text-[#F1F5F9]">
                  {requisition.requisitionId}
                </span>
              </div>
              <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
                Assign ready bench workers to {requisition.clientName} &bull; {requisition.siteName}
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

        {/* Demand Info Strip */}
        <div className="px-5 py-3 bg-[#FAFBFC] dark:bg-[#151B26]/80 border-b border-[#EBECF0] dark:border-[#263042] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-semibold text-[#172B4D] dark:text-[#F1F5F9] text-sm">
              {requisition.jobTitle}
            </div>
            <div className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] flex items-center gap-2 mt-0.5">
              <span>Category: <strong className="text-[#172B4D] dark:text-[#F1F5F9]">{requisition.tradeCategory || "General"}</strong></span>
              <span>&bull;</span>
              <span>Bill Rate: <strong className="text-[#172B4D] dark:text-[#F1F5F9]">INR {Number(requisition.billingRate || 0).toLocaleString("en-IN")}/{requisition.billingUnit || "mo"}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] text-[#6B778C] dark:text-[#94A3B8]">Hiring Quota</div>
              <div className="font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                {fulfilledCount} / {neededHeadcount} Filled ({remainingSlots} remaining)
              </div>
            </div>
            <StatusLozenge status={requisition.status} />
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="px-5 py-3 border-b border-[#EBECF0] dark:border-[#263042] flex items-center justify-between gap-3 bg-white dark:bg-[#0F131C]">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B778C] dark:text-[#94A3B8]"
            />
            <input
              type="text"
              placeholder="Filter available bench workers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllFiltered}
              disabled={filteredWorkers.length === 0 || remainingSlots === 0}
              className="text-[11px] font-semibold text-[#0052CC] dark:text-[#579DFF] hover:underline disabled:opacity-40 cursor-pointer"
            >
              Fill Open Slots ({Math.min(filteredWorkers.length, remainingSlots)})
            </button>
            <span className="text-[#DFE1E6] dark:text-[#263042]">|</span>
            <button
              type="button"
              onClick={handleClearSelection}
              disabled={selectedWorkerIds.length === 0}
              className="text-[11px] font-semibold text-[#6B778C] dark:text-[#94A3B8] hover:underline disabled:opacity-40 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Worker List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {loading ? (
            <div className="text-center py-10 text-xs text-[#6B778C] dark:text-[#94A3B8]">
              Loading available bench workers...
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-10">
              <Users size={28} className="mx-auto text-[#6B778C] dark:text-[#94A3B8] opacity-50 mb-2" />
              <p className="text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                No available bench workers found
              </p>
              <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                All workers are either deployed or no available workers match your filter.
              </p>
            </div>
          ) : (
            filteredWorkers.map((worker) => {
              const isSelected = selectedWorkerIds.includes(worker.workerId);
              const fullName = `${worker.firstName || ""} ${worker.lastName || ""}`.trim();
              const isKycVerified =
                worker.compliance?.aadhaarVerified &&
                worker.compliance?.bankVerified;

              return (
                <div
                  key={worker.workerId}
                  onClick={() => toggleWorkerSelection(worker.workerId)}
                  className={`flex items-center justify-between p-3 rounded-md border transition cursor-pointer ${
                    isSelected
                      ? "bg-[#DEEBFF]/30 dark:bg-[#1C2331] border-[#0052CC] dark:border-[#579DFF]"
                      : "bg-white dark:bg-[#151B26]/50 border-[#EBECF0] dark:border-[#263042] hover:border-[#B3D4FF] dark:hover:border-[#384860]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox button */}
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                        isSelected
                          ? "bg-[#0052CC] border-[#0052CC] text-white"
                          : "border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C]"
                      }`}
                    >
                      {isSelected && <Check size={11} strokeWidth={3} />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                          {fullName}
                        </span>
                        <span className="text-[10px] font-mono text-[#6B778C] dark:text-[#94A3B8]">
                          {worker.workerId}
                        </span>
                        {isKycVerified ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-[#00875A] bg-[#E3FCEF] dark:bg-[#00875A]/20 px-1.5 py-0.2 rounded">
                            <ShieldCheck size={10} />
                            <span>KYC Verified</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold text-[#6B778C] bg-[#EBECF0] dark:bg-[#263042] px-1.5 py-0.2 rounded">
                            Standard
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                        <span>{worker.tradeCategory || "General"}</span>
                        <span>&bull;</span>
                        <span>{worker.skillCategory || "Skilled"}</span>
                        <span>&bull;</span>
                        <span>Expected Pay: INR {Number(worker.monthlyBasePay || 22000).toLocaleString("en-IN")}/mo</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#E3FCEF] text-[#00875A] dark:bg-[#00875A]/20">
                      Bench Ready
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#DFE1E6] dark:border-[#263042] bg-[#F4F5F7] dark:bg-[#151B26] flex items-center justify-between">
          <div className="text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
            <span>Selected: </span>
            <span className="text-[#0052CC] dark:text-[#579DFF] font-bold">
              {selectedWorkerIds.length}
            </span>
            <span className="text-[#6B778C] dark:text-[#94A3B8]"> / {remainingSlots} positions needed</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9] hover:bg-[#EBECF0] dark:hover:bg-[#1E293B] rounded transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAllocate}
              disabled={selectedWorkerIds.length === 0 || submitting}
              className="bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-semibold px-4 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserCheck size={14} />
              <span>
                {submitting
                  ? "Allocating Workers..."
                  : `1-Click Allocate (${selectedWorkerIds.length})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
