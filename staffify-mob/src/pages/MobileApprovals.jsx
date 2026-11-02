import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  User,
  Award,
  FileCheck2,
  AlertCircle,
  ChevronRight,
  Filter,
  Check,
  X,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import api from '../services/api';

import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function MobileApprovals() {
  const { user, isManager, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('leaves'); // 'leaves' | 'compoff' | 'regularization'
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  // If accessed by non-Manager, enforce strict RBAC restriction
  if (!isManager && !isAdmin) {
    return (
      <div className="p-6 text-center space-y-4 pt-10 animate-in fade-in duration-300">
        <div className="w-14 h-14 rounded-3xl bg-[#FFEBE6] dark:bg-rose-950/40 text-[#DE350B] flex items-center justify-center mx-auto border border-[#DE350B]/20 shadow-xs">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-[#FFEBE6] text-[#DE350B] text-[10px] font-extrabold uppercase tracking-wider">
            Access Restricted
          </span>
          <h2 className="text-lg font-bold text-[#172B4D] dark:text-white">Manager Authority Required</h2>
          <p className="text-xs text-[#6B778C] dark:text-slate-400 max-w-xs mx-auto">
            The Approvals Deck is reserved for Line Managers and HR Administrators. Employee accounts operate under Self-Service mode.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2 max-w-xs mx-auto">
          <button
            onClick={() => navigate("/leaves")}
            className="w-full py-2.5 rounded-2xl bg-[#0052CC] text-white text-xs font-bold shadow-xs active:scale-95 transition-transform"
          >
            Go to My Leaves & Balances
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-2.5 rounded-2xl border border-[#DFE1E6] dark:border-[#263042] text-[#6B778C] text-xs font-bold active:scale-95 transition-transform"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Demo queue data for mobile quick-response experience
  const [pendingLeaves, setPendingLeaves] = useState([
    {
      id: 'lv-01',
      employeeName: 'Priya Sharma',
      employeeId: 'EMP-014',
      type: 'Casual Leave',
      dates: '08 Nov - 09 Nov 2026',
      duration: '2 Days',
      reason: 'Family wedding ceremony in Pune',
      appliedAt: '2 hours ago',
      balanceRemaining: '4.5 days'
    },
    {
      id: 'lv-02',
      employeeName: 'Rahul Verma',
      employeeId: 'EMP-029',
      type: 'Sick Leave',
      dates: '05 Nov 2026',
      duration: '1 Day',
      reason: 'Viral fever and medical consultation',
      appliedAt: 'Yesterday',
      balanceRemaining: '6 days'
    }
  ]);

  const [pendingCompOffs, setPendingCompOffs] = useState([
    {
      id: 'co-01',
      employeeName: 'Aman Patel',
      employeeId: 'EMP-033',
      weekendWorked: 'Sunday, 26 Oct 2026',
      hoursLogged: '8.5 hrs',
      project: 'Production Hotfix Deployment',
      jiraTicket: 'ENG-4912',
      appliedAt: '3 days ago'
    }
  ]);

  const [pendingRegularizations, setPendingRegularizations] = useState([
    {
      id: 'reg-01',
      employeeName: 'Neha Deshmukh',
      employeeId: 'EMP-041',
      date: '02 Nov 2026',
      originalPunches: 'In: 10:14 AM (Late) | Out: 07:15 PM',
      requestedPunches: 'In: 09:30 AM | Out: 07:15 PM',
      reason: 'Biometric fingerprint sensor was offline at Entrance Gate 2',
      appliedAt: '5 hours ago'
    }
  ]);

  const handleApprove = (type, id) => {
    if (type === 'leaves') {
      setPendingLeaves(prev => prev.filter(item => item.id !== id));
      setActionSuccess('Leave request approved successfully');
    } else if (type === 'compoff') {
      setPendingCompOffs(prev => prev.filter(item => item.id !== id));
      setActionSuccess('Comp-Off credit granted and added to employee ledger');
    } else if (type === 'regularization') {
      setPendingRegularizations(prev => prev.filter(item => item.id !== id));
      setActionSuccess('Attendance regularization approved');
    }
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleReject = (type, id) => {
    if (type === 'leaves') {
      setPendingLeaves(prev => prev.filter(item => item.id !== id));
      setActionSuccess('Leave request rejected');
    } else if (type === 'compoff') {
      setPendingCompOffs(prev => prev.filter(item => item.id !== id));
      setActionSuccess('Comp-Off claim rejected');
    } else if (type === 'regularization') {
      setPendingRegularizations(prev => prev.filter(item => item.id !== id));
      setActionSuccess('Attendance regularization rejected');
    }
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const totalPending = pendingLeaves.length + pendingCompOffs.length + pendingRegularizations.length;

  return (
    <div className="pb-8 space-y-4">
      {/* Header Banner */}
      <div className="bg-[#0052CC] text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Manager Approvals Deck
            </div>
            <h1 className="text-xl font-bold">Pending Actions</h1>
            <p className="text-xs text-blue-100 mt-0.5">
              {totalPending} requests awaiting your review
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-2xl border border-white/20">
            {totalPending}
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-[#E3FCEF] dark:bg-emerald-950/40 border border-[#00875A]/30 text-[#00875A] dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Segmented Tab Control */}
      <div className="flex bg-[#EBECF0] dark:bg-[#151B26] p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'leaves'
              ? 'bg-white dark:bg-[#0052CC] text-[#0052CC] dark:text-white shadow-sm'
              : 'text-[#6B778C] dark:text-slate-400'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Leaves ({pendingLeaves.length})
        </button>
        <button
          onClick={() => setActiveTab('compoff')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'compoff'
              ? 'bg-white dark:bg-[#0052CC] text-[#0052CC] dark:text-white shadow-sm'
              : 'text-[#6B778C] dark:text-slate-400'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Comp-Off ({pendingCompOffs.length})
        </button>
        <button
          onClick={() => setActiveTab('regularization')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'regularization'
              ? 'bg-white dark:bg-[#0052CC] text-[#0052CC] dark:text-white shadow-sm'
              : 'text-[#6B778C] dark:text-slate-400'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          Swipes ({pendingRegularizations.length})
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {/* LEAVES TAB */}
        {activeTab === 'leaves' && (
          pendingLeaves.length > 0 ? (
            pendingLeaves.map(req => (
              <div
                key={req.id}
                className="bg-white dark:bg-[#0F131C] p-4 rounded-xl border border-[#DFE1E6] dark:border-[#263042] shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#172B4D] dark:text-white">{req.employeeName}</h3>
                      <span className="text-[10px] text-[#6B778C] dark:text-slate-400 font-mono">({req.employeeId})</span>
                    </div>
                    <p className="text-xs text-[#0052CC] dark:text-blue-400 font-medium mt-0.5">{req.type} - {req.duration}</p>
                  </div>
                  <span className="text-[10px] text-[#6B778C] dark:text-slate-400">{req.appliedAt}</span>
                </div>

                <div className="p-3 bg-[#FAFBFC] dark:bg-[#151B26] rounded-lg text-xs space-y-1 border border-[#EBECF0] dark:border-[#263042]">
                  <div className="flex items-center justify-between text-[#6B778C] dark:text-slate-400">
                    <span>Requested Period:</span>
                    <span className="font-semibold text-[#172B4D] dark:text-white">{req.dates}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#6B778C] dark:text-slate-400">
                    <span>Remaining Balance:</span>
                    <span className="font-semibold text-[#00875A] dark:text-emerald-400">{req.balanceRemaining}</span>
                  </div>
                  <div className="pt-1.5 border-t border-[#EBECF0] dark:border-[#263042]">
                    <span className="text-[#6B778C] dark:text-slate-400">Reason: </span>
                    <span className="italic text-[#172B4D] dark:text-slate-200">{req.reason}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleReject('leaves', req.id)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#DE350B]/30 text-[#DE350B] bg-[#FFEBE6]/50 dark:bg-rose-950/30 text-xs font-bold active:scale-[0.98] transition-transform"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove('leaves', req.id)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#00875A] text-white text-xs font-bold active:scale-[0.98] transition-transform shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-[#0F131C] p-8 rounded-xl border border-[#DFE1E6] dark:border-[#263042] text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-[#00875A] mx-auto opacity-70" />
              <h3 className="font-bold text-sm text-[#172B4D] dark:text-white">All Caught Up!</h3>
              <p className="text-xs text-[#6B778C] dark:text-slate-400">No pending leave requests in your approval queue.</p>
            </div>
          )
        )}

        {/* COMP-OFF TAB */}
        {activeTab === 'compoff' && (
          pendingCompOffs.length > 0 ? (
            pendingCompOffs.map(claim => (
              <div
                key={claim.id}
                className="bg-white dark:bg-[#0F131C] p-4 rounded-xl border border-[#DFE1E6] dark:border-[#263042] shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#172B4D] dark:text-white">{claim.employeeName}</h3>
                      <span className="text-[10px] text-[#6B778C] dark:text-slate-400 font-mono">({claim.employeeId})</span>
                    </div>
                    <p className="text-xs text-[#B9770E] dark:text-amber-400 font-semibold mt-0.5">Weekend Overtime Claim</p>
                  </div>
                  <span className="text-[10px] text-[#6B778C] dark:text-slate-400">{claim.appliedAt}</span>
                </div>

                <div className="p-3 bg-[#FAFBFC] dark:bg-[#151B26] rounded-lg text-xs space-y-1.5 border border-[#EBECF0] dark:border-[#263042]">
                  <div className="flex items-center justify-between text-[#6B778C] dark:text-slate-400">
                    <span>Weekend Worked:</span>
                    <span className="font-semibold text-[#172B4D] dark:text-white">{claim.weekendWorked}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#6B778C] dark:text-slate-400">
                    <span>Hours Logged:</span>
                    <span className="font-semibold text-[#0052CC] dark:text-blue-400">{claim.hoursLogged}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#6B778C] dark:text-slate-400">
                    <span>Project / Ticket:</span>
                    <span className="font-mono text-[#172B4D] dark:text-slate-200">{claim.jiraTicket} - {claim.project}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleReject('compoff', claim.id)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#DE350B]/30 text-[#DE350B] bg-[#FFEBE6]/50 dark:bg-rose-950/30 text-xs font-bold active:scale-[0.98] transition-transform"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove('compoff', claim.id)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#00875A] text-white text-xs font-bold active:scale-[0.98] transition-transform shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    Grant Credit
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-[#0F131C] p-8 rounded-xl border border-[#DFE1E6] dark:border-[#263042] text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-[#00875A] mx-auto opacity-70" />
              <h3 className="font-bold text-sm text-[#172B4D] dark:text-white">All Clear!</h3>
              <p className="text-xs text-[#6B778C] dark:text-slate-400">No pending comp-off credit claims.</p>
            </div>
          )
        )}

        {/* REGULARIZATION TAB */}
        {activeTab === 'regularization' && (
          pendingRegularizations.length > 0 ? (
            pendingRegularizations.map(item => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#0F131C] p-4 rounded-xl border border-[#DFE1E6] dark:border-[#263042] shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#172B4D] dark:text-white">{item.employeeName}</h3>
                      <span className="text-[10px] text-[#6B778C] dark:text-slate-400 font-mono">({item.employeeId})</span>
                    </div>
                    <p className="text-xs text-[#0052CC] dark:text-blue-400 font-semibold mt-0.5">Punch Regularization: {item.date}</p>
                  </div>
                  <span className="text-[10px] text-[#6B778C] dark:text-slate-400">{item.appliedAt}</span>
                </div>

                <div className="p-3 bg-[#FAFBFC] dark:bg-[#151B26] rounded-lg text-xs space-y-1.5 border border-[#EBECF0] dark:border-[#263042]">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-[#DE350B]">Original Recorded:</span>
                    <p className="font-mono text-[#6B778C] dark:text-slate-400">{item.originalPunches}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-[#00875A]">Requested Adjustment:</span>
                    <p className="font-mono font-semibold text-[#172B4D] dark:text-white">{item.requestedPunches}</p>
                  </div>
                  <div className="pt-1.5 border-t border-[#EBECF0] dark:border-[#263042]">
                    <span className="text-[#6B778C] dark:text-slate-400">Reason: </span>
                    <span className="italic text-[#172B4D] dark:text-slate-200">{item.reason}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleReject('regularization', item.id)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#DE350B]/30 text-[#DE350B] bg-[#FFEBE6]/50 dark:bg-rose-950/30 text-xs font-bold active:scale-[0.98] transition-transform"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove('regularization', item.id)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#00875A] text-white text-xs font-bold active:scale-[0.98] transition-transform shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    Approve Punch
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-[#0F131C] p-8 rounded-xl border border-[#DFE1E6] dark:border-[#263042] text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-[#00875A] mx-auto opacity-70" />
              <h3 className="font-bold text-sm text-[#172B4D] dark:text-white">Clean Slate!</h3>
              <p className="text-xs text-[#6B778C] dark:text-slate-400">No punch regularizations waiting for action.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
