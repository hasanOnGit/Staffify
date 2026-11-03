import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  FileText,
  CreditCard,
  Building,
  Mail,
  Phone,
  Calendar,
  LogOut,
  QrCode,
  CheckCircle2,
  Download,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award,
  Lock,
  Smartphone,
  Fingerprint,
  ScanFace,
  ShieldCheck,
} from 'lucide-react';

import DigitalIdBadge from '../components/DigitalIdBadge';
import BiometricAuthModal from '../components/BiometricAuthModal';
import {
  getBiometricSettings,
  saveBiometricSettings,
  checkBiometricHardwareSupport,
} from '../utils/biometrics';

export default function MobileProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [downloadSuccess, setDownloadSuccess] = useState(null);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricSettings, setBiometricSettings] = useState(getBiometricSettings());
  const [hardwareInfo, setHardwareInfo] = useState({ supported: true, type: 'FaceID / Fingerprint' });

  useEffect(() => {
    checkBiometricHardwareSupport().then(setHardwareInfo);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDownloadDoc = (docName) => {
    setDownloadSuccess(`Downloaded ${docName} successfully`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const statutoryDocuments = [
    { id: 'pan', name: 'PAN Card Copy', number: 'ABCDE1234F', status: 'Verified', date: '12 Jan 2024' },
    { id: 'aadhaar', name: 'Aadhaar Card', number: 'XXXX-XXXX-8921', status: 'Verified', date: '12 Jan 2024' },
    { id: 'uan', name: 'EPFO UAN Card', number: '101489201948', status: 'Verified', date: '15 Jan 2024' },
    { id: 'offer', name: 'Appointment Letter', number: 'STF/2024/048', status: 'Signed', date: '01 Jan 2024' },
    { id: 'form16', name: 'Form 16 (AY 2025-26)', number: 'TDS Certificate', status: 'Available', date: '30 Jun 2025' }
  ];

  return (
    <div className="pb-8 space-y-4">
      {/* Toast */}
      {downloadSuccess && (
        <div className="p-3.5 rounded-xl bg-[#E3FCEF] dark:bg-emerald-950/40 border border-[#00875A]/30 text-[#00875A] dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Digital Smart Employee ID Card (Interactive 3D Flip) */}
      <DigitalIdBadge user={user} />

      {/* Employment Details */}
      <div className="bg-white dark:bg-[#0F131C] rounded-xl border border-[#DFE1E6] dark:border-[#263042] p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-slate-400">
          Workplace Information
        </h3>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-[#EBECF0] dark:border-[#263042]/50">
            <span className="text-[#6B778C] dark:text-slate-400 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#0052CC]" /> Email Address
            </span>
            <span className="font-semibold text-[#172B4D] dark:text-white">{user?.email || 'aarav.sharma@staffify.com'}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-[#EBECF0] dark:border-[#263042]/50">
            <span className="text-[#6B778C] dark:text-slate-400 flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-[#0052CC]" /> Base Office
            </span>
            <span className="font-semibold text-[#172B4D] dark:text-white">Bangalore HQ (Indiranagar)</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-[#EBECF0] dark:border-[#263042]/50">
            <span className="text-[#6B778C] dark:text-slate-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#0052CC]" /> Date of Joining
            </span>
            <span className="font-semibold text-[#172B4D] dark:text-white">15 Jan 2024</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-[#6B778C] dark:text-slate-400 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#0052CC]" /> System Role
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#DEEBFF] dark:bg-blue-950/60 text-[#0052CC] dark:text-blue-400 font-bold text-[10px]">
              {user?.role || 'Employee'}
            </span>
          </div>
        </div>
      </div>

      {/* Digital Document Vault (GreytHR Parity #5) */}
      <div className="bg-white dark:bg-[#0F131C] rounded-xl border border-[#DFE1E6] dark:border-[#263042] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0052CC]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-slate-400">
              Digital Document Vault
            </h3>
          </div>
          <span className="text-[10px] text-[#00875A] font-bold">5 Verified</span>
        </div>

        <div className="space-y-2">
          {statutoryDocuments.map(doc => (
            <div
              key={doc.id}
              className="p-3 rounded-lg border border-[#EBECF0] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] flex items-center justify-between hover:border-[#0052CC] transition-colors"
            >
              <div>
                <p className="font-bold text-xs text-[#172B4D] dark:text-white">{doc.name}</p>
                <p className="text-[10px] text-[#6B778C] dark:text-slate-400 font-mono mt-0.5">{doc.number}</p>
              </div>
              <button
                onClick={() => handleDownloadDoc(doc.name)}
                className="p-2 rounded-lg bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] text-[#0052CC] dark:text-blue-400 active:scale-95 transition-transform"
                title="Download Document"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Biometric Hardware & Device Security */}
      <div className="bg-white dark:bg-[#0F131C] rounded-xl border border-[#DFE1E6] dark:border-[#263042] p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#DEEBFF] dark:bg-blue-950/60 text-[#0052CC] dark:text-[#579DFF]">
              <Fingerprint className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#172B4D] dark:text-white">
                Biometric Hardware & Security
              </h3>
              <p className="text-[10px] text-[#6B778C] dark:text-slate-400">
                {hardwareInfo.type} • Hardware Verified
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#E3FCEF] dark:bg-emerald-950/40 text-[#00875A] dark:text-emerald-400 border border-[#00875A]/20 text-[10px] font-bold">
            Protected
          </span>
        </div>

        {/* Toggles */}
        <div className="space-y-2.5 pt-1 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-[#EBECF0] dark:border-[#263042]/50">
            <div>
              <p className="font-semibold text-[#172B4D] dark:text-white">Biometric Sign-In</p>
              <p className="text-[10px] text-[#6B778C] dark:text-slate-400">Allow 1-touch FaceID / Fingerprint login</p>
            </div>
            <input
              type="checkbox"
              checked={biometricSettings.enabled}
              onChange={(e) => {
                const updated = saveBiometricSettings({ enabled: e.target.checked });
                if (updated) setBiometricSettings(updated);
              }}
              className="w-4 h-4 rounded text-[#0052CC] accent-[#0052CC] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-1 border-b border-[#EBECF0] dark:border-[#263042]/50">
            <div>
              <p className="font-semibold text-[#172B4D] dark:text-white">Biometric Swipe Confirmation</p>
              <p className="text-[10px] text-[#6B778C] dark:text-slate-400">Require fingerprint / face scan to punch</p>
            </div>
            <input
              type="checkbox"
              checked={biometricSettings.requireOnSwipe}
              onChange={(e) => {
                const updated = saveBiometricSettings({ requireOnSwipe: e.target.checked });
                if (updated) setBiometricSettings(updated);
              }}
              className="w-4 h-4 rounded text-[#0052CC] accent-[#0052CC] cursor-pointer"
            />
          </div>
        </div>

        {/* Test Sensor Action */}
        <button
          onClick={() => setShowBiometricModal(true)}
          className="w-full py-2 rounded-lg border border-[#0052CC]/30 bg-[#DEEBFF]/30 hover:bg-[#DEEBFF]/60 dark:bg-blue-950/30 text-[#0052CC] dark:text-[#579DFF] text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
        >
          <ScanFace className="w-3.5 h-3.5" />
          <span>Test Biometric Sensor (FaceID / Fingerprint)</span>
        </button>
      </div>

      {/* App Information & Logout */}
      <div className="space-y-2 pt-2">
        <div className="bg-white dark:bg-[#0F131C] rounded-xl border border-[#DFE1E6] dark:border-[#263042] p-4 text-xs space-y-2">
          <div className="flex items-center justify-between text-[#6B778C] dark:text-slate-400">
            <span>App Version</span>
            <span className="font-mono text-[#172B4D] dark:text-white">v2.4.0-mobile</span>
          </div>
          <div className="flex items-center justify-between text-[#6B778C] dark:text-slate-400">
            <span>Capacitor Runtime</span>
            <span className="font-mono text-[#172B4D] dark:text-white">Android Native Bridge</span>
          </div>
          <div className="flex items-center justify-between text-[#6B778C] dark:text-slate-400">
            <span>Offline Sync Storage</span>
            <span className="font-mono text-[#00875A]">Ready (IndexedDB)</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-xl border border-[#DE350B]/30 bg-[#FFEBE6] dark:bg-rose-950/30 text-[#DE350B] dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out from StaffifyMOB</span>
        </button>
      </div>

      {/* Biometric Test / Verification Modal */}
      <BiometricAuthModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        user={user}
        onSuccess={() => {
          setDownloadSuccess("Biometric hardware authentication successful!");
          setTimeout(() => setDownloadSuccess(null), 3500);
        }}
        title="Biometric Sensor Test"
        subtitle="Verify your physical FaceID or Fingerprint sensor hardware"
      />
    </div>
  );
}
