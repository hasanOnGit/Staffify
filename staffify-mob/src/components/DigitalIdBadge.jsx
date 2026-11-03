import React, { useState } from "react";
import {
  QrCode,
  ShieldCheck,
  RotateCcw,
  Building2,
  Phone,
  Mail,
  Heart,
  Calendar,
  KeyRound,
  BadgeCheck,
  Lock,
} from "lucide-react";
import { hapticLight } from "../utils/haptics";

// Persona-aligned metadata for realistic corporate verification
const PERSONA_DEFAULTS = {
  Admin: {
    emergencyName: "Vikram Sharma",
    emergencyRel: "Spouse",
    emergencyPhone: "+91 98111 22334",
    bloodGroup: "B+ Positive",
    clearance: "Level 4 • Organization Admin & Root Security",
    campus: "Global Headquarters • Executive Suite 801",
    validity: "Dec 2028",
    issued: "15 Jan 2023",
  },
  Manager: {
    emergencyName: "Karthik Sundaram",
    emergencyRel: "Spouse",
    emergencyPhone: "+91 98222 33445",
    bloodGroup: "A+ Positive",
    clearance: "Level 3 • Engineering Manager & Approvals",
    campus: "Tech Park Campus • Tower B, 5th Floor",
    validity: "Dec 2027",
    issued: "01 Jun 2023",
  },
  Employee: {
    emergencyName: "Pooja Sharma",
    emergencyRel: "Spouse",
    emergencyPhone: "+91 98765 43210",
    bloodGroup: "O+ Positive",
    clearance: "Level 2 • Engineering Staff & Cloud Access",
    campus: "Tech Park Campus • Tower B, 3rd Floor",
    validity: "Dec 2026",
    issued: "01 Feb 2024",
  },
};

export default function DigitalIdBadge({ user }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const role = user?.role || "Employee";
  const defaults = PERSONA_DEFAULTS[role] || PERSONA_DEFAULTS.Employee;

  const empId = user?.employeeId || user?.userId || "EMP-042";
  const empName = user?.name || "Aarav Sharma";
  const designation = user?.designation || "Senior Software Engineer";
  const department = user?.department || "Engineering";
  const email = user?.email || "employee@staffify.com";

  const bloodGroup = user?.bloodGroup || defaults.bloodGroup;
  const emergencyName = user?.emergencyContact?.name || defaults.emergencyName;
  const emergencyRel = user?.emergencyContact?.relation || defaults.emergencyRel;
  const emergencyPhone = user?.emergencyContact?.phone || defaults.emergencyPhone;
  const clearance = defaults.clearance;
  const campus = defaults.campus;
  const validity = defaults.validity;

  return (
    <div className="w-full select-none" style={{ perspective: "1000px" }}>
      <div
        onClick={() => {
          hapticLight();
          setIsFlipped(!isFlipped);
        }}
        className="relative w-full cursor-pointer min-h-[260px] h-[260px]"
        style={{
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
        }}
      >
        {/* ========================================================
            FRONT FACE OF DIGITAL ID BADGE
            ======================================================== */}
        <div
          className={`absolute inset-0 w-full h-full bg-gradient-to-br from-[#0052CC] via-[#0747A6] to-[#00388B] rounded-2xl p-5 text-white shadow-xl flex flex-col justify-between transition-all duration-500 ease-in-out ${
            isFlipped ? "pointer-events-none" : "pointer-events-auto"
          }`}
          style={{
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            WebkitTransform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            opacity: isFlipped ? 0 : 1,
            zIndex: isFlipped ? 0 : 20,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {/* Top Header */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-sm">
                S
              </div>
              <div>
                <p className="font-black text-sm tracking-wider uppercase">Staffify Global Inc.</p>
                <p className="text-[10px] text-blue-200">Official Mobile ID Card</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active Status</span>
              </span>
            </div>
          </div>

          {/* Photo & Identity Section */}
          <div className="flex items-center gap-4 relative z-10 py-1">
            <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-xl font-black shadow-inner overflow-hidden shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={empName} className="w-full h-full object-cover" />
              ) : (
                empName.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="space-y-0.5 min-w-0">
              <h2 className="text-lg font-bold leading-tight truncate">{empName}</h2>
              <p className="text-xs text-blue-100 font-medium truncate">{designation}</p>
              <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-blue-200">
                <span className="font-bold">{empId}</span>
                <span>•</span>
                <span className="truncate">{department}</span>
              </div>
            </div>
          </div>

          {/* Bottom NFC Chip & Barcode Strip */}
          <div className="pt-3 border-t border-white/20 flex items-center justify-between relative z-10">
            <div className="space-y-0.5">
              <p className="text-[9px] uppercase tracking-wider text-blue-200 font-bold">
                Biometric NFC Gate Key
              </p>
              <div className="flex items-center gap-1 font-mono text-[10px] tracking-widest text-white/90">
                <span>STF</span>
                <span>9924</span>
                <span>8810</span>
                <span>{empId.replace(/[^0-9]/g, "").padStart(4, "0")}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(true);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Flip Card</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            BACK FACE OF DIGITAL ID BADGE
            ======================================================== */}
        <div
          className={`absolute inset-0 w-full h-full bg-gradient-to-br from-[#091E42] via-[#0F131C] to-[#151B26] border border-[#263042] rounded-2xl p-4 text-white shadow-xl flex flex-col justify-between transition-all duration-500 ease-in-out ${
            isFlipped ? "pointer-events-auto" : "pointer-events-none"
          }`}
          style={{
            transform: isFlipped ? "rotateY(0deg)" : "rotateY(-180deg)",
            WebkitTransform: isFlipped ? "rotateY(0deg)" : "rotateY(-180deg)",
            opacity: isFlipped ? 1 : 0,
            zIndex: isFlipped ? 20 : 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {/* Top Bar: Security & Verification Status */}
          <div className="flex items-center justify-between border-b border-[#263042] pb-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#579DFF]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
                Security & Employment Verification
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              Valid: {validity}
            </span>
          </div>

          {/* Central Body: Scannable Turnstile QR + Official Work Dossier */}
          <div className="grid grid-cols-12 gap-3 items-center py-1">
            {/* Scannable Verification QR Code */}
            <div className="col-span-4 flex flex-col items-center justify-center p-2 rounded-xl bg-white text-[#091E42] shadow-md">
              <QrCode className="w-16 h-16" />
              <span className="text-[8px] font-mono font-bold tracking-tighter text-slate-700 mt-1">
                {empId}
              </span>
            </div>

            {/* Employment Dossier */}
            <div className="col-span-8 space-y-1.5 text-[11px]">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                  Work Email
                </span>
                <span className="text-white font-medium truncate block">{email}</span>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                  Access Clearance
                </span>
                <span className="text-[#579DFF] font-semibold text-[10px] block truncate">
                  {clearance}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#263042]/70">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                    <Heart className="w-2.5 h-2.5 text-rose-400" /> Blood Group
                  </span>
                  <span className="text-rose-300 font-bold text-[10px]">{bloodGroup}</span>
                </div>

                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5 text-emerald-400" /> Emergency SOS
                  </span>
                  <span className="text-slate-200 font-semibold text-[10px] block truncate">
                    {emergencyName} ({emergencyRel})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer: Official Property Disclaimer & Flip Back */}
          <div className="pt-2 border-t border-[#263042] flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-[9px] text-slate-400 font-mono leading-tight">
                Campus: {campus}
              </p>
              <p className="text-[8px] text-slate-500 truncate">
                Property of Staffify Global Inc. If found, return to Security Desk.
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] text-white text-[10px] font-bold flex items-center gap-1 shrink-0 active:scale-95 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Front</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
