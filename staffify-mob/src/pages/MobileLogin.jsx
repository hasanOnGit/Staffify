import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StaffifyLogo from '../components/StaffifyLogo';
import {
  Smartphone,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Fingerprint,
  AlertCircle,
  Building2,
  Users,
  UserCheck,
  ScanFace,
} from 'lucide-react';
import BiometricAuthModal from '../components/BiometricAuthModal';

export default function MobileLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setError('Unable to reach Staffify server. Please check connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const quickLoginAs = async (role) => {
    setLoading(true);
    setError(null);
    let targetEmail = 'admin@staffify.com';
    let targetPassword = 'Admin@123';

    if (role === 'manager') {
      targetEmail = 'manager@staffify.com';
      targetPassword = 'Manager@123';
    } else if (role === 'employee') {
      targetEmail = 'employee@staffify.com';
      targetPassword = 'Employee@123';
    }

    setEmail(targetEmail);
    setPassword(targetPassword);

    try {
      const res = await login(targetEmail, targetPassword);
      if (res.success) {
        navigate('/');
      } else {
        // Fallback demo mock session if backend database user does not exist
        navigate('/');
      }
    } catch (err) {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricSuccess = async () => {
    setShowBiometricModal(false);
    const savedUser = localStorage.getItem('staffify_user');
    let role = 'employee';
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === 'Admin') role = 'admin';
        else if (parsed.role === 'Manager') role = 'manager';
      } catch {}
    }
    await quickLoginAs(role);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#090D14] flex flex-col justify-between px-6 py-10 max-w-md mx-auto">
      {/* Top Branding */}
      <div className="pt-6 space-y-6">
        <div className="space-y-3">
          <StaffifyLogo size="lg" subtitle="MOB" />
          <p className="text-xs text-[#6B778C] dark:text-slate-400 font-medium">Enterprise Mobile Companion Suite</p>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#172B4D] dark:text-white">Sign In to Your Workspace</h2>
          <p className="text-xs text-[#6B778C] dark:text-slate-400">
            Access GPS punch-in, payslips, leave balances, and manager approvals.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-[#FFEBE6] dark:bg-rose-950/40 border border-[#DE350B]/30 text-[#DE350B] dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#172B4D] dark:text-slate-300">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#6B778C] dark:text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-sm text-[#172B4D] dark:text-white placeholder-[#8993A4] dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#172B4D] dark:text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#6B778C] dark:text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-sm text-[#172B4D] dark:text-white placeholder-[#8993A4] dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.99] transition-transform disabled:opacity-60"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to StaffifyMOB</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Biometric Quick Touch / Native WebAuthn Scan */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setShowBiometricModal(true)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#0052CC] dark:text-[#579DFF] py-2 px-3.5 rounded-xl border border-[#0052CC]/30 bg-[#DEEBFF]/50 dark:bg-blue-950/40 active:scale-95 transition-all shadow-xs"
          >
            <Fingerprint className="w-4 h-4 text-[#0052CC] dark:text-[#579DFF]" />
            <ScanFace className="w-4 h-4 text-[#0052CC] dark:text-[#579DFF]" />
            <span>Sign in with FaceID / Fingerprint</span>
          </button>
        </div>

        {/* 1-Tap Demo Switcher */}
        <div className="pt-4 border-t border-[#DFE1E6] dark:border-[#263042] space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B778C] dark:text-slate-500 text-center">
            Instant Demo Profiles
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickLoginAs('admin')}
              className="p-2.5 rounded-xl border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-center active:scale-[0.98] transition-all hover:border-[#0052CC]"
            >
              <Building2 className="w-4 h-4 mx-auto text-[#0052CC] mb-1" />
              <p className="text-[11px] font-bold text-[#172B4D] dark:text-white">Admin</p>
              <p className="text-[9px] text-[#6B778C] dark:text-slate-500">Full Access</p>
            </button>
            <button
              type="button"
              onClick={() => quickLoginAs('manager')}
              className="p-2.5 rounded-xl border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-center active:scale-[0.98] transition-all hover:border-[#0052CC]"
            >
              <Users className="w-4 h-4 mx-auto text-[#00875A] mb-1" />
              <p className="text-[11px] font-bold text-[#172B4D] dark:text-white">Manager</p>
              <p className="text-[9px] text-[#6B778C] dark:text-slate-500">Approvals</p>
            </button>
            <button
              type="button"
              onClick={() => quickLoginAs('employee')}
              className="p-2.5 rounded-xl border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-center active:scale-[0.98] transition-all hover:border-[#0052CC]"
            >
              <UserCheck className="w-4 h-4 mx-auto text-[#B9770E] mb-1" />
              <p className="text-[11px] font-bold text-[#172B4D] dark:text-white">Employee</p>
              <p className="text-[9px] text-[#6B778C] dark:text-slate-500">Self Service</p>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-6 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 text-[10px] text-[#6B778C] dark:text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00875A]" />
          <span>256-Bit SSL Encrypted Enterprise Gateway</span>
        </div>
        <p className="text-[10px] text-[#8993A4] dark:text-slate-600">
          StaffifyMOB v2.4.0 (Build 20261102)
        </p>
      </div>

      {/* Biometric Verification Modal */}
      <BiometricAuthModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        onSuccess={handleBiometricSuccess}
        title="Biometric Sign In"
        subtitle="Authenticate with your device FaceID or Fingerprint sensor to sign in securely"
      />
    </div>
  );
}
