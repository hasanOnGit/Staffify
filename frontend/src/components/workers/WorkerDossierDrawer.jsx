import React, { useEffect, useState } from "react";
import {
  X,
  User,
  ShieldCheck,
  Building,
  Calendar,
  CreditCard,
  Briefcase,
  AlertCircle,
  FileCheck2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import StatusLozenge from "../StatusLozenge";
import { workersApi } from "../../services/api";

function WorkerDossierDrawer({ workerId, isOpen, onClose }) {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && workerId) {
      fetchWorkerDetails();
    }
  }, [isOpen, workerId]);

  const fetchWorkerDetails = async () => {
    try {
      setLoading(true);
      const res = await workersApi.getById(workerId);
      setWorker(res.data.data);
    } catch (err) {
      console.error("Failed to load worker dossier:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const maskAadhaar = (num) => {
    if (!num) return "Not Submitted";
    const cleaned = num.replace(/[^0-9]/g, "");
    if (cleaned.length === 12) {
      return `•••• •••• ${cleaned.slice(-4)}`;
    }
    return num;
  };

  const maskPan = (pan) => {
    if (!pan) return "Not Submitted";
    if (pan.length === 10) {
      return `${pan.slice(0, 5)}••••${pan.slice(-1)}`;
    }
    return pan;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          aria-label="Worker Profile"
          className="w-screen max-w-md bg-white dark:bg-[#0F131C] border-l border-[#DFE1E6] dark:border-[#263042] shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF]">
                {worker?.workerId || workerId}
              </span>
              <span className="text-xs font-bold text-[#172B4D] dark:text-white">
                Worker Profile & Documents
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#6B778C] hover:text-[#172B4D] dark:hover:text-white rounded"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {loading ? (
              <div className="py-12 text-center text-xs text-[#6B778C] dark:text-neutral-400">
                Loading worker profile...
              </div>
            ) : worker ? (
              <>
                {/* Profile Header Card */}
                <div className="p-4 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-[#DEEBFF] dark:bg-[#1C2331] border border-[#B3D4FF] dark:border-[#263042] flex items-center justify-center font-bold text-sm text-[#0052CC] dark:text-[#579DFF] shrink-0">
                    {worker.fullName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "W"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-[#172B4D] dark:text-white truncate">
                        {worker.fullName}
                      </h3>
                      <StatusLozenge status={worker.status} />
                    </div>
                    <p className="text-xs text-[#6B778C] dark:text-neutral-400 truncate mt-0.5">
                      {worker.primarySkill}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#1C2331] text-[#42526E] dark:text-neutral-300">
                        {worker.tradeCategory}
                      </span>
                      <span className="text-[10px] text-[#6B778C] dark:text-neutral-400">
                        {worker.experienceYears} yrs exp
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statutory KYC Verification Status */}
                <div>
                  <h4 className="text-xs font-bold text-[#172B4D] dark:text-neutral-200 uppercase tracking-wide flex items-center gap-1.5 mb-2.5">
                    <ShieldCheck size={14} className="text-[#00875A]" />
                    ID Verification & Documents
                  </h4>
                  <div className="p-3.5 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B778C] dark:text-neutral-400">Police Verification:</span>
                      <StatusLozenge status={worker.kycDetails?.policeVerificationStatus || "Pending"} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B778C] dark:text-neutral-400">Medical Fitness:</span>
                      {worker.kycDetails?.medicalFitnessCleared ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00875A]">
                          <CheckCircle2 size={12} /> Cleared
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#DE350B]">
                          <AlertCircle size={12} /> Pending Medical
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[#DFE1E6] dark:border-[#263042]">
                      <span className="text-[#6B778C] dark:text-neutral-400">Aadhaar:</span>
                      <span className="font-mono font-medium text-[#172B4D] dark:text-neutral-200">
                        {maskAadhaar(worker.kycDetails?.aadhaarNumber)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B778C] dark:text-neutral-400">PAN:</span>
                      <span className="font-mono font-medium text-[#172B4D] dark:text-neutral-200">
                        {maskPan(worker.kycDetails?.panNumber)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bank Account */}
                <div>
                  <h4 className="text-xs font-bold text-[#172B4D] dark:text-neutral-200 uppercase tracking-wide flex items-center gap-1.5 mb-2.5">
                    <CreditCard size={14} className="text-[#0052CC] dark:text-[#579DFF]" />
                    Bank Account Details
                  </h4>
                  <div className="p-3.5 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#6B778C] dark:text-neutral-400">Bank Name:</span>
                      <span className="font-medium text-[#172B4D] dark:text-white">
                        {worker.kycDetails?.bankName || "HDFC Bank"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B778C] dark:text-neutral-400">Account No:</span>
                      <span className="font-mono font-medium text-[#172B4D] dark:text-white">
                        {worker.kycDetails?.bankAccountNumber || "•••• •••• 9283"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B778C] dark:text-neutral-400">IFSC Code:</span>
                      <span className="font-mono font-medium text-[#172B4D] dark:text-white">
                        {worker.kycDetails?.ifscCode || "HDFC0000123"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deployment Status */}
                <div>
                  <h4 className="text-xs font-bold text-[#172B4D] dark:text-neutral-200 uppercase tracking-wide flex items-center gap-1.5 mb-2.5">
                    <Briefcase size={14} className="text-[#0052CC] dark:text-[#579DFF]" />
                    Current Assignment & Pay Rate
                  </h4>
                  <div className="p-3.5 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#6B778C] dark:text-neutral-400">Worker Pay Rate:</span>
                      <span className="font-semibold text-[#172B4D] dark:text-white">
                        Rs {worker.wagePerDayOrMonth?.toLocaleString()} / {worker.billingUnit}
                      </span>
                    </div>

                    {worker.status === "Deployed" && worker.currentDeployment?.clientId ? (
                      <div className="pt-2 border-t border-[#DFE1E6] dark:border-[#263042] space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-[#6B778C] dark:text-neutral-400">Client:</span>
                          <span className="font-medium text-[#0052CC] dark:text-[#579DFF]">
                            {worker.currentDeployment.clientName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B778C] dark:text-neutral-400">Work Site:</span>
                          <span className="text-[#172B4D] dark:text-white">
                            {worker.currentDeployment.siteName || worker.currentDeployment.siteId}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B778C] dark:text-neutral-400">Budget (PO):</span>
                          <span className="font-mono text-[#172B4D] dark:text-white">
                            {worker.currentDeployment.poNumber}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B778C] dark:text-neutral-400">Client Charge Rate:</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            Rs {worker.currentDeployment.billableRate?.toLocaleString()} / {worker.billingUnit}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-[#DFE1E6] dark:border-[#263042] text-[#00875A] font-medium flex items-center gap-1.5">
                        <CheckCircle2 size={13} />
                        Available for immediate assignment.
                      </div>
                    )}
                  </div>
                </div>

                {/* Placement History */}
                {worker.deploymentHistory && worker.deploymentHistory.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-[#172B4D] dark:text-neutral-200 uppercase tracking-wide flex items-center gap-1.5 mb-2.5">
                      <Clock size={14} className="text-[#6B778C]" />
                      Work History
                    </h4>
                    <div className="space-y-2">
                      {worker.deploymentHistory.map((hist) => (
                        <div
                          key={hist._id}
                          className="p-3 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-xs space-y-1"
                        >
                          <div className="flex justify-between items-center font-semibold text-[#172B4D] dark:text-white">
                            <span>{hist.clientName}</span>
                            <StatusLozenge status={hist.status} />
                          </div>
                          <div className="text-[#6B778C] dark:text-neutral-400 flex justify-between">
                            <span>{hist.siteName}</span>
                            <span>{hist.designation}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center text-xs text-[#6B778C] dark:text-neutral-400">
                Worker details not found.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default WorkerDossierDrawer;
