import React, { useState, useEffect } from "react";
import {
  Fingerprint,
  ScanFace,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { authenticateBiometricPrompt, triggerBiometricHaptic } from "../utils/biometrics";

export default function BiometricAuthModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Biometric Verification",
  subtitle = "Authenticate with FaceID or Fingerprint to proceed",
  user,
}) {
  const [scanState, setScanState] = useState("ready"); // "ready" | "scanning" | "verified" | "failed"
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setScanState("ready");
      setErrorMessage("");
      // Automatically initiate biometric verification
      handleScan();
    }
  }, [isOpen]);

  const handleScan = async () => {
    setScanState("scanning");
    setErrorMessage("");

    // Simulate scanning laser interval + trigger WebAuthn
    const scanTimer = setTimeout(async () => {
      try {
        const res = await authenticateBiometricPrompt(user);
        if (res.success) {
          setScanState("verified");
          await triggerBiometricHaptic("success");
          setTimeout(() => {
            if (onSuccess) onSuccess(res);
            if (onClose) onClose();
          }, 850);
        } else if (res.cancelled) {
          setScanState("ready");
          setErrorMessage("Biometric prompt cancelled.");
        } else {
          setScanState("failed");
          setErrorMessage("Biometric match failed. Please try again.");
          await triggerBiometricHaptic("error");
        }
      } catch (err) {
        setScanState("failed");
        setErrorMessage("Sensor error. Please retry.");
        await triggerBiometricHaptic("error");
      }
    }, 700);

    return () => clearTimeout(scanTimer);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0F131C] rounded-3xl border border-[#DFE1E6] dark:border-[#263042] shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center space-y-5 animate-in zoom-in-95 duration-200 relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div
          className={`absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
            scanState === "verified"
              ? "bg-[#00875A]/20"
              : scanState === "failed"
              ? "bg-[#DE350B]/20"
              : "bg-[#0052CC]/15"
          }`}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6B778C] hover:text-[#172B4D] dark:hover:text-white hover:bg-[#EBECF0] dark:hover:bg-[#263042] transition-colors"
          aria-label="Cancel"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Text */}
        <div className="space-y-1 pt-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DEEBFF] dark:bg-blue-950/60 text-[#0052CC] dark:text-[#579DFF] text-[10px] font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hardware Security</span>
          </div>
          <h3 className="text-base font-bold text-[#172B4D] dark:text-white">{title}</h3>
          <p className="text-xs text-[#6B778C] dark:text-slate-400 max-w-xs">{subtitle}</p>
        </div>

        {/* Biometric Sensor Reticle with Animated Laser Scanner */}
        <div
          onClick={scanState === "failed" || scanState === "ready" ? handleScan : undefined}
          className={`relative w-28 h-28 rounded-3xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
            scanState === "verified"
              ? "bg-[#E3FCEF] dark:bg-emerald-950/40 border-2 border-[#00875A] text-[#00875A]"
              : scanState === "failed"
              ? "bg-[#FFEBE6] dark:bg-rose-950/40 border-2 border-[#DE350B] text-[#DE350B]"
              : "bg-[#DEEBFF]/40 dark:bg-[#151B26] border-2 border-[#0052CC]/40 text-[#0052CC] dark:text-[#579DFF]"
          }`}
        >
          {/* Animated Laser Scanning Line */}
          {scanState === "scanning" && (
            <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-[#0052CC] dark:via-[#579DFF] to-transparent shadow-[0_0_8px_#0052CC] animate-[bounce_1.4s_infinite]" />
          )}

          {/* Concentric Pulse Rings */}
          {scanState === "scanning" && (
            <span className="absolute inset-0 rounded-3xl border border-[#0052CC] animate-ping opacity-25" />
          )}

          {scanState === "verified" ? (
            <CheckCircle2 className="w-14 h-14 animate-in zoom-in duration-300" />
          ) : scanState === "failed" ? (
            <AlertCircle className="w-14 h-14 animate-in shake duration-300" />
          ) : (
            <div className="relative">
              <Fingerprint className="w-14 h-14" />
              <ScanFace className="w-6 h-6 absolute -bottom-1 -right-1 p-1 bg-white dark:bg-[#0F131C] rounded-full border border-[#DFE1E6] dark:border-[#263042] text-[#0052CC] dark:text-[#579DFF]" />
            </div>
          )}
        </div>

        {/* Status Feedback Message */}
        <div className="space-y-1">
          <p
            className={`text-xs font-bold transition-colors ${
              scanState === "verified"
                ? "text-[#00875A] dark:text-emerald-400"
                : scanState === "failed"
                ? "text-[#DE350B] dark:text-rose-400"
                : "text-[#172B4D] dark:text-white"
            }`}
          >
            {scanState === "ready" && "Tap sensor or look at screen"}
            {scanState === "scanning" && "Verifying Biometric Sensor..."}
            {scanState === "verified" && "Biometric Identity Confirmed"}
            {scanState === "failed" && (errorMessage || "Verification Unsuccessful")}
          </p>

          <p className="text-[11px] text-[#6B778C] dark:text-slate-500 font-mono">
            {scanState === "scanning" ? "Scanning cryptographic key" : user?.name || "Verified Employee"}
          </p>
        </div>

        {/* Action Controls */}
        <div className="w-full pt-2 flex flex-col gap-2">
          {scanState === "failed" && (
            <button
              onClick={handleScan}
              className="w-full py-2.5 rounded-xl bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Biometric Scan</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#6B778C] dark:text-slate-400 hover:text-[#172B4D] dark:hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Use Password / PIN Instead
          </button>
        </div>
      </div>
    </div>
  );
}
