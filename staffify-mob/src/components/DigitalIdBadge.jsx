import React, { useState } from "react";
import {
  QrCode,
  ShieldCheck,
  RotateCcw,
  Building2,
  Phone,
  Heart,
  Calendar,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function DigitalIdBadge({ user }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const empId = user?.employeeId || user?.userId || "EMP-042";
  const empName = user?.name || "Aarav Sharma";
  const designation = user?.designation || "Senior Software Engineer";
  const department = user?.department || "Engineering";

  // Simulated emergency and medical details
  const bloodGroup = user?.bloodGroup || "O+ Positive";
  const emergencyContactName = user?.emergencyContact?.name || "Pooja Sharma";
  const emergencyContactRelation = user?.emergencyContact?.relation || "Spouse";
  const emergencyContactPhone = user?.emergencyContact?.phone || "+91 98765 43210";
  const dateOfJoining = user?.dateOfJoining || "01 Feb 2024";

  return (
    <div className="w-full select-none" style={{ perspective: "1000px" }}>
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative w-full cursor-pointer transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ========================================================
            FRONT FACE OF DIGITAL ID BADGE
            ======================================================== */}
        <div
          className="w-full bg-gradient-to-br from-[#0052CC] via-[#0747A6] to-[#00388B] rounded-2xl p-5 text-white shadow-xl space-y-4 relative overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Watermark Security Hologram */}
          <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4 pointer-events-none">
            <QrCode className="w-48 h-48" />
          </div>

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
                <span>Active</span>
              </span>
            </div>
          </div>

          {/* Photo & Identity Section */}
          <div className="flex items-center gap-4 relative z-10 pt-1">
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
                Biometric Gate Pass &bull; NFC Key
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
            BACK FACE OF DIGITAL ID BADGE (Rotated 180deg)
            ======================================================== */}
        <div
          className="absolute inset-0 w-full bg-gradient-to-br from-[#091E42] via-[#0F131C] to-[#151B26] border border-[#263042] rounded-2xl p-5 text-white shadow-xl space-y-3 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#263042] pb-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#579DFF]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Security & Verification
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">ID: {empId}</span>
          </div>

          {/* Center: QR Code & Medical / Emergency Info */}
          <div className="flex items-center gap-4 py-1">
            <div className="p-2.5 bg-white rounded-xl text-[#091E42] shadow-md shrink-0">
              <QrCode className="w-20 h-20" />
            </div>

            <div className="space-y-1.5 text-xs min-w-0 flex-1">
              <div className="flex items-center justify-between bg-[#151B26] p-1.5 rounded-lg border border-[#263042]">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-400" />
                  <span>Blood Group</span>
                </span>
                <span className="font-bold text-rose-300 text-[11px]">{bloodGroup}</span>
              </div>

              <div className="bg-[#151B26] p-1.5 rounded-lg border border-[#263042] space-y-0.5">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#579DFF]" />
                  <span>Emergency SOS</span>
                </span>
                <p className="font-semibold text-slate-200 text-[11px] truncate">
                  {emergencyContactName} ({emergencyContactRelation})
                </p>
                <p className="font-mono text-emerald-400 text-[10px]">{emergencyContactPhone}</p>
              </div>
            </div>
          </div>

          {/* Campus & Flip Back Action */}
          <div className="pt-2 border-t border-[#263042] flex items-center justify-between text-[10px] text-slate-400">
            <div>
              <p className="font-semibold text-slate-300">Bangalore HQ Campus</p>
              <p className="text-[9px] text-slate-500">Scan at turnstile for gate access</p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] text-white font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
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
