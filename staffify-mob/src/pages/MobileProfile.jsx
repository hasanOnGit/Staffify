import React, { useState } from 'react';
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
  Smartphone
} from 'lucide-react';

export default function MobileProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showIdFlip, setShowIdFlip] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(null);

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

      {/* Digital Smart Employee ID Card */}
      <div className="relative group">
        <div className="bg-gradient-to-br from-[#0052CC] via-[#0747A6] to-[#00388B] rounded-2xl p-5 text-white shadow-lg space-y-4 relative overflow-hidden">
          {/* Card Watermark pattern */}
          <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4 pointer-events-none">
            <QrCode className="w-48 h-48" />
          </div>

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
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-400/30">
              Active Status
            </span>
          </div>

          <div className="flex items-center gap-4 relative z-10 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-xl font-black shadow-inner">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                user?.name?.slice(0, 2).toUpperCase() || 'EM'
              )}
            </div>
            <div className="space-y-0.5">
              <h2 className="text-lg font-bold leading-tight">{user?.name || 'Aarav Sharma'}</h2>
              <p className="text-xs text-blue-100 font-medium">{user?.designation || 'Senior Software Engineer'}</p>
              <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-blue-200">
                <span>{user?.employeeId || 'EMP-0042'}</span>
                <span>•</span>
                <span>{user?.department || 'Engineering'}</span>
              </div>
            </div>
          </div>

          {/* Barcode & Security Chip Simulation */}
          <div className="pt-3 border-t border-white/20 flex items-center justify-between relative z-10">
            <div className="space-y-1">
              <p className="text-[9px] uppercase tracking-wider text-blue-200 font-bold">Biometric NFC Gate Key</p>
              <div className="flex items-center gap-1 font-mono text-[10px] tracking-widest text-white/90">
                <span>STF</span>
                <span>9924</span>
                <span>8810</span>
                <span>0042</span>
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-white text-[#0052CC]">
              <QrCode className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}
