import React from "react";
import {
  X,
  Printer,
  ShieldCheck,
  Building2,
  MapPin,
  Calendar,
  Phone,
  CheckCircle2,
  User,
  QrCode,
  AlertCircle,
} from "lucide-react";
import StaffifyLogo from "../StaffifyLogo";

export default function WorkerIdCardModal({ isOpen, onClose, worker }) {
  if (!isOpen || !worker) return null;

  const handlePrint = () => {
    window.print();
  };

  const fullName =
    worker.fullName ||
    `${worker.firstName || ""} ${worker.lastName || ""}`.trim() ||
    worker.workerId;

  const isPoliceVerified =
    worker.kycDetails?.policeVerificationStatus === "Verified" ||
    worker.compliance?.policeVerified;

  const isMedicalCleared =
    worker.kycDetails?.medicalFitnessCleared ??
    worker.compliance?.medicalCleared ??
    true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="printable-modal bg-white dark:bg-[#0F131C] rounded-lg shadow-2xl border border-[#DFE1E6] dark:border-[#263042] w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Toolbar (hidden in print) */}
        <div className="print:hidden flex items-center justify-between px-5 py-3 border-b border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#0052CC] dark:text-[#579DFF]" />
            <span className="text-xs font-bold text-[#172B4D] dark:text-white uppercase tracking-wider">
              Standard Worker Gate Pass & ID Card
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-[#0052CC] text-white hover:bg-[#0747A6] transition cursor-pointer"
            >
              <Printer size={13} />
              <span>Print / Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-[#6B778C] hover:text-[#172B4D] dark:hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="printable-content flex-1 overflow-y-auto p-6 space-y-6 bg-[#F4F5F7] dark:bg-[#090D14]">
          {/* Card Wrapper (Standard CR80 Printable Dimensions) */}
          <div className="max-w-md mx-auto bg-white border-2 border-[#0052CC] rounded-xl overflow-hidden shadow-lg print:shadow-none print-avoid-break">
            {/* Top Lanyard Hole & Card Header */}
            <div className="bg-[#0052CC] text-white p-3 text-center relative">
              <div className="w-8 h-2 bg-white/30 rounded-full mx-auto mb-1.5 print:hidden" />
              <div className="text-[10px] font-bold tracking-wider uppercase opacity-90">
                Licensed Manpower Contractor
              </div>
              <h2 className="text-sm font-bold tracking-tight">
                {worker.vendorName || "Infiniti TechStaffing Services LLP"}
              </h2>
              <div className="text-[9px] text-blue-100 mt-0.5">
                GSTIN: 27AABCA1234F1Z5 &bull; PAN: AABCA1234F
              </div>
            </div>

            {/* Sub-Header Strip */}
            <div className="bg-[#0747A6] text-white px-3 py-1 text-center text-[10px] font-bold tracking-widest uppercase">
              Worker Identity & Site Access Gate Pass
            </div>

            {/* Card Body */}
            <div className="p-4 bg-white text-[#172B4D] space-y-3.5">
              {/* Photo & Core Bio */}
              <div className="flex items-start gap-3.5">
                {/* Photo Placeholder */}
                <div className="w-20 h-24 rounded-lg bg-[#FAFBFC] border-2 border-[#DFE1E6] flex flex-col items-center justify-center shrink-0 overflow-hidden text-center p-1">
                  <User size={32} className="text-[#6B778C] opacity-60" />
                  <span className="text-[8px] font-bold text-[#6B778C] mt-1 uppercase">Photo</span>
                </div>

                {/* Worker Identity Details */}
                <div className="flex-1 space-y-1">
                  <h3 className="text-base font-bold text-[#172B4D] leading-tight">
                    {fullName}
                  </h3>
                  <div className="text-xs font-semibold text-[#0052CC]">
                    {worker.primarySkill || worker.designation || "Specialist Worker"}
                  </div>
                  <div className="text-[11px] text-[#6B778C]">
                    Worker ID: <strong className="font-mono text-[#172B4D]">{worker.workerId}</strong>
                  </div>
                  <div className="text-[10px] text-[#6B778C]">
                    Category: <strong className="text-[#172B4D]">{worker.tradeCategory || "General"}</strong>
                  </div>
                </div>
              </div>

              {/* Site Assignment Box */}
              <div className="p-2.5 rounded-lg bg-[#DEEBFF]/40 border border-[#B3D4FF] text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 text-[#0052CC] font-bold text-[10px] uppercase">
                  <MapPin size={12} />
                  <span>Authorized Client Work Site</span>
                </div>
                <div className="flex justify-between text-[#172B4D]">
                  <span className="text-[#6B778C]">Client:</span>
                  <span className="font-semibold">
                    {worker.currentDeployment?.clientName || "Direct / Ready Pool"}
                  </span>
                </div>
                <div className="flex justify-between text-[#172B4D]">
                  <span className="text-[#6B778C]">Site Location:</span>
                  <span className="font-semibold">
                    {worker.currentDeployment?.siteName || "Headquarters Facility"}
                  </span>
                </div>
              </div>

              {/* Statutory Clearance Badges Grid */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-1.5 rounded border border-[#DFE1E6] bg-[#FAFBFC] flex items-center gap-1.5">
                  <ShieldCheck size={14} className={isPoliceVerified ? "text-[#00875A]" : "text-[#B9770E]"} />
                  <div>
                    <div className="font-bold">Police Clearance</div>
                    <div className="text-[9px] text-[#6B778C]">
                      {isPoliceVerified ? "Verified Safe" : "In Progress"}
                    </div>
                  </div>
                </div>

                <div className="p-1.5 rounded border border-[#DFE1E6] bg-[#FAFBFC] flex items-center gap-1.5">
                  <CheckCircle2 size={14} className={isMedicalCleared ? "text-[#00875A]" : "text-[#DE350B]"} />
                  <div>
                    <div className="font-bold">Medical Fitness</div>
                    <div className="text-[9px] text-[#6B778C]">
                      {isMedicalCleared ? "Fit for Duty" : "Pending"}
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Verification & Signatures */}
              <div className="pt-2 border-t border-[#DFE1E6] flex items-center justify-between gap-3">
                {/* QR Code Mockup */}
                <div className="flex items-center gap-2">
                  <div className="p-1 border border-[#DFE1E6] rounded bg-[#FAFBFC]">
                    <QrCode size={36} className="text-[#172B4D]" />
                  </div>
                  <div className="text-[9px] text-[#6B778C] leading-tight">
                    Scan for Live<br />
                    Deployment Status<br />
                    & Labor Records
                  </div>
                </div>

                {/* Signatures */}
                <div className="text-right">
                  <div className="border-t border-dashed border-[#DFE1E6] pt-1 mt-4 w-28 text-center">
                    <span className="text-[9px] text-[#6B778C] block">
                      Issuing Authority
                    </span>
                    <span className="text-[8px] font-bold text-[#0052CC] block">
                      Infiniti Staffing
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="bg-[#F4F5F7] px-3 py-1.5 text-center text-[9px] text-[#6B778C] border-t border-[#DFE1E6]">
              This pass is property of the agency. If found, please return to security gate. Emergency: +91 98201 12345
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
