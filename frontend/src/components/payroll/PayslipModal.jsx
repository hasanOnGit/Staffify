import React from "react";
import { X, Printer, Building2, CheckCircle2, ShieldCheck, Banknote } from "lucide-react";
import StaffifyLogo from "../StaffifyLogo";

function PayslipModal({ isOpen, onClose, payroll, record }) {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#0F131C] rounded-lg shadow-2xl border border-[#DFE1E6] dark:border-[#263042] w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26]">
          <div className="flex items-center gap-2">
            <Banknote size={16} className="text-[#0052CC] dark:text-[#579DFF]" />
            <span className="text-xs font-bold text-[#172B4D] dark:text-white uppercase tracking-wider">
              Salary Payslip & Remittance Advice
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-[#0052CC] text-white hover:bg-[#0747A6] transition"
            >
              <Printer size={13} />
              <span>Print Payslip</span>
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

        {/* Payslip Document Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white dark:bg-[#0F131C] text-xs">
          {/* Company Branding & Header */}
          <div className="flex justify-between items-start pb-4 border-b-2 border-[#DFE1E6] dark:border-[#263042]">
            <div>
              <StaffifyLogo size="md" />
              <div className="mt-1 font-semibold text-xs text-[#172B4D] dark:text-white">
                {payroll?.vendorName || "Staffing Services Agency"}
              </div>
              <div className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                Staffing Partner & Manpower Contractor
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-[#0052CC] dark:text-[#579DFF] block">
                PAYSLIP FOR {payroll?.month?.toUpperCase()} {payroll?.year}
              </span>
              <span className="text-[11px] font-mono text-[#6B778C] dark:text-neutral-400 block mt-0.5">
                Ref: {payroll?.payrollId}
              </span>
            </div>
          </div>

          {/* Employee & Deployment Info Grid */}
          <div className="grid grid-cols-2 gap-4 p-3.5 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26]">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-[#6B778C] dark:text-neutral-400">Employee Name:</span>
                <span className="font-bold text-[#172B4D] dark:text-white">{record.workerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B778C] dark:text-neutral-400">Worker ID:</span>
                <span className="font-mono font-medium text-[#172B4D] dark:text-white">{record.workerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B778C] dark:text-neutral-400">Designation / Role:</span>
                <span className="font-medium text-[#172B4D] dark:text-white">{record.designation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B778C] dark:text-neutral-400">Client Work Site:</span>
                <span className="text-[#172B4D] dark:text-white">{payroll?.siteName || "Client Site Alpha"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-[#6B778C] dark:text-neutral-400">Payable Days:</span>
                <span className="font-bold text-[#172B4D] dark:text-white">{record.payableDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B778C] dark:text-neutral-400">Overtime Hours:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{record.overtimeHours || 0} hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B778C] dark:text-neutral-400">Bank Account:</span>
                <span className="font-mono text-[#172B4D] dark:text-white">{record.bankDetails?.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B778C] dark:text-neutral-400">Bank & IFSC:</span>
                <span className="font-mono text-[#172B4D] dark:text-white">
                  {record.bankDetails?.bankName} ({record.bankDetails?.ifscCode})
                </span>
              </div>
            </div>
          </div>

          {/* Earnings & Deductions Dual Tables */}
          <div className="grid grid-cols-2 gap-4">
            {/* Earnings */}
            <div className="border border-[#DFE1E6] dark:border-[#263042] rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-[#DEEBFF]/50 dark:bg-[#1C2331] font-bold text-[#0052CC] dark:text-[#579DFF] border-b border-[#DFE1E6] dark:border-[#263042] uppercase text-[10px]">
                Gross Earnings
              </div>
              <div className="p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#42526E] dark:text-neutral-300">Basic & Regular Wages</span>
                  <span className="font-mono font-semibold text-[#172B4D] dark:text-white">
                    Rs {record.basePay?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#42526E] dark:text-neutral-300">Overtime Allowance (1.5x)</span>
                  <span className="font-mono font-semibold text-[#172B4D] dark:text-white">
                    Rs {record.overtimePay?.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#DFE1E6] dark:border-[#263042] flex justify-between font-bold">
                  <span className="text-[#172B4D] dark:text-white">Total Gross Wages</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    Rs {record.grossSalary?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Statutory Deductions */}
            <div className="border border-[#DFE1E6] dark:border-[#263042] rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-red-50 dark:bg-red-950/20 font-bold text-red-600 dark:text-red-400 border-b border-[#DFE1E6] dark:border-[#263042] uppercase text-[10px]">
                Statutory Deductions
              </div>
              <div className="p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#42526E] dark:text-neutral-300">Provident Fund (EPF 12%)</span>
                  <span className="font-mono font-semibold text-[#DE350B]">
                    Rs {record.statutoryDeductions?.employeePf?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#42526E] dark:text-neutral-300">ESI Scheme (ESIC 0.75%)</span>
                  <span className="font-mono font-semibold text-[#DE350B]">
                    Rs {record.statutoryDeductions?.esic?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#42526E] dark:text-neutral-300">Professional Tax (PT)</span>
                  <span className="font-mono font-semibold text-[#DE350B]">
                    Rs {record.statutoryDeductions?.professionalTax?.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#DFE1E6] dark:border-[#263042] flex justify-between font-bold">
                  <span className="text-[#172B4D] dark:text-white">Total Deductions</span>
                  <span className="font-mono text-[#DE350B]">
                    Rs {record.statutoryDeductions?.totalDeductions?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary Highlight Box */}
          <div className="p-4 rounded-lg bg-[#E3FCEF] dark:bg-[#00875A]/20 border border-[#00875A]/40 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#006644] dark:text-[#E3FCEF] uppercase tracking-wide block">
                Net Take-Home Salary
              </span>
              <span className="text-[11px] text-[#006644] dark:text-neutral-300">
                Direct NEFT/RTGS Bank Remittance
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold font-mono text-[#006644] dark:text-[#E3FCEF]">
                Rs {record.netSalary?.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Employer Statutory Contributions Reference */}
          <div className="p-3 rounded bg-[#FAFBFC] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] text-[11px] text-[#6B778C] dark:text-neutral-400 space-y-1">
            <div className="font-semibold text-[#172B4D] dark:text-white">
              Statutory Employer Contributions (Compliance Non-Deductible):
            </div>
            <div className="flex justify-between">
              <span>Employer PF Contribution (12%): Rs {record.employerContributions?.employerPf?.toLocaleString()}</span>
              <span>Employer ESIC Contribution (3.25%): Rs {record.employerContributions?.employerEsic?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PayslipModal;
