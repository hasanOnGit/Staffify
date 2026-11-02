import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  CreditCard,
  Download,
  Building,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  FileText,
  TrendingDown,
  Printer,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";
import api from "../services/api";

const MONTHS = [
  { val: 1, name: "January" },
  { val: 2, name: "February" },
  { val: 3, name: "March" },
  { val: 4, name: "April" },
  { val: 5, name: "May" },
  { val: 6, name: "June" },
  { val: 7, name: "July" },
  { val: 8, name: "August" },
  { val: 9, name: "September" },
  { val: 10, name: "October" },
  { val: 11, name: "November" },
  { val: 12, name: "December" },
];

export default function MobilePayslips() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(10); // October
  const [selectedYear, setSelectedYear] = useState(2026);
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(null);

  const formatCurrency = (val = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const grossEarnings = 85000;
  const basicSalary = 42500;
  const hra = 21250;
  const specialAllowance = 21250;

  const epf = 5100;
  const esic = 0;
  const pt = 200;
  const tds = 4200;
  const totalDeductions = epf + esic + pt + tds;
  const netPay = grossEarnings - totalDeductions;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    setDownloadSuccess(`Official PDF payslip downloaded for ${MONTHS.find(m => m.val === selectedMonth)?.name} ${selectedYear}`);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  return (
    <div className="pb-8 space-y-4">
      {/* Toast */}
      {downloadSuccess && (
        <div className="p-3.5 rounded-xl bg-[#E3FCEF] dark:bg-emerald-950/40 border border-[#00875A]/30 text-[#00875A] dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Header with Month/Year Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-[#172B4D] dark:text-white">Compensation & Payslips</h1>
          <p className="text-[11px] text-[#6B778C] dark:text-slate-400">Monthly breakdown & statutory tax filings</p>
        </div>
        <div className="flex items-center gap-1.5">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white rounded-lg px-2 py-1 text-xs font-semibold"
          >
            {MONTHS.map((m) => (
              <option key={m.val} value={m.val}>
                {m.name.slice(0, 3)}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white rounded-lg px-2 py-1 text-xs font-semibold"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </div>

      {/* Hero Net Take-Home Card */}
      <div className="bg-gradient-to-br from-[#0052CC] via-[#0747A6] to-[#00388B] text-white p-5 rounded-2xl shadow-md space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between text-blue-100 text-xs relative z-10">
          <span>Net Take-Home Pay</span>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            Disbursed
          </span>
        </div>

        <div className="relative z-10">
          <p className="text-3xl font-black tracking-tight">{formatCurrency(netPay)}</p>
          <p className="text-[11px] text-blue-200 mt-1">
            Transferred to HDFC Bank • UTR: HDFC20261031994821
          </p>
        </div>

        <div className="pt-2 border-t border-white/20 flex items-center justify-between relative z-10">
          <div className="text-[10px] text-blue-200">
            <span>Pay Period: </span>
            <span className="font-semibold text-white">01 Oct - 31 Oct 2026</span>
          </div>
          <button
            onClick={() => setPayslipModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Statement</span>
          </button>
        </div>
      </div>

      {/* Salary Breakdown Summary Card */}
      <div className="bg-white dark:bg-[#0F131C] rounded-2xl border border-[#DFE1E6] dark:border-[#263042] p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-slate-400">
          Itemized Earnings & Deductions
        </h3>

        {/* Dual Grid: Earnings vs Deductions */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Earnings */}
          <div className="p-3 rounded-xl bg-[#FAFBFC] dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042] space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#EBECF0] dark:border-[#263042]">
              <span className="font-bold text-[#00875A]">Earnings</span>
              <span className="font-bold text-[#172B4D] dark:text-white">{formatCurrency(grossEarnings)}</span>
            </div>
            <div className="space-y-1 text-[11px] text-[#6B778C] dark:text-slate-400">
              <div className="flex justify-between">
                <span>Basic Salary</span>
                <span className="font-medium text-[#172B4D] dark:text-slate-200">{formatCurrency(basicSalary)}</span>
              </div>
              <div className="flex justify-between">
                <span>HRA</span>
                <span className="font-medium text-[#172B4D] dark:text-slate-200">{formatCurrency(hra)}</span>
              </div>
              <div className="flex justify-between">
                <span>Special Allowance</span>
                <span className="font-medium text-[#172B4D] dark:text-slate-200">{formatCurrency(specialAllowance)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="p-3 rounded-xl bg-[#FAFBFC] dark:bg-[#151B26] border border-[#EBECF0] dark:border-[#263042] space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#EBECF0] dark:border-[#263042]">
              <span className="font-bold text-[#DE350B]">Deductions</span>
              <span className="font-bold text-[#DE350B]">{formatCurrency(totalDeductions)}</span>
            </div>
            <div className="space-y-1 text-[11px] text-[#6B778C] dark:text-slate-400">
              <div className="flex justify-between">
                <span>EPF (12%)</span>
                <span className="font-medium text-[#172B4D] dark:text-slate-200">{formatCurrency(epf)}</span>
              </div>
              <div className="flex justify-between">
                <span>Prof. Tax (PT)</span>
                <span className="font-medium text-[#172B4D] dark:text-slate-200">{formatCurrency(pt)}</span>
              </div>
              <div className="flex justify-between">
                <span>TDS (IT Act)</span>
                <span className="font-medium text-[#172B4D] dark:text-slate-200">{formatCurrency(tds)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 1-Tap Action Button */}
        <button
          onClick={handleDownload}
          className="w-full py-3 rounded-xl bg-[#0052CC] text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-transform shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Download Official PDF Payslip</span>
        </button>
      </div>

      {/* Official Payslip View Modal */}
      {payslipModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-fade-in"
          onClick={() => setPayslipModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#0F131C] w-full max-w-sm rounded-3xl p-5 border border-[#DFE1E6] dark:border-[#263042] shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#DFE1E6] dark:border-[#263042] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#172B4D] dark:text-white">Staffify Global Inc.</h3>
                <p className="text-[10px] text-[#6B778C] dark:text-slate-400">
                  Payslip for {MONTHS.find(m => m.val === selectedMonth)?.name} {selectedYear}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPayslipModalOpen(false)}
                aria-label="Close"
                className="w-7 h-7 rounded-full bg-[#F4F5F7] dark:bg-[#263042] text-[#6B778C] dark:text-slate-300 hover:text-[#DE350B] dark:hover:text-[#DE350B] hover:bg-[#FFEBE6] dark:hover:bg-rose-950/40 flex items-center justify-center transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Employee Meta */}
            <div className="p-3 bg-[#FAFBFC] dark:bg-[#151B26] rounded-xl text-xs space-y-1 border border-[#EBECF0] dark:border-[#263042]">
              <div className="flex justify-between text-[#6B778C] dark:text-slate-400">
                <span>Employee Name:</span>
                <span className="font-bold text-[#172B4D] dark:text-white">{user?.name || "Aarav Sharma"}</span>
              </div>
              <div className="flex justify-between text-[#6B778C] dark:text-slate-400">
                <span>Employee ID:</span>
                <span className="font-mono text-[#172B4D] dark:text-white">{user?.employeeId || "EMP-042"}</span>
              </div>
              <div className="flex justify-between text-[#6B778C] dark:text-slate-400">
                <span>Designation:</span>
                <span className="text-[#172B4D] dark:text-white">{user?.designation || "Senior Software Engineer"}</span>
              </div>
              <div className="flex justify-between text-[#6B778C] dark:text-slate-400">
                <span>EPFO UAN:</span>
                <span className="font-mono text-[#172B4D] dark:text-white">101489201948</span>
              </div>
            </div>

            {/* Summary Net Badge */}
            <div className="p-3.5 bg-[#E3FCEF] dark:bg-emerald-950/40 rounded-xl text-center border border-[#00875A]/20">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#00875A]">Net Salary Payable</p>
              <p className="text-2xl font-black text-[#00875A] mt-0.5">{formatCurrency(netPay)}</p>
            </div>

            {/* Print and Download Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl border border-[#DFE1E6] dark:border-[#263042] text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-transform"
              >
                <Printer className="w-4 h-4 text-[#0052CC]" />
                <span>Print Sheet</span>
              </button>
              <button
                onClick={() => {
                  handleDownload();
                  setPayslipModalOpen(false);
                }}
                className="py-2.5 px-3 rounded-xl bg-[#0052CC] text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-transform shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
