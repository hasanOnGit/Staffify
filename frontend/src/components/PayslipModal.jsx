import { useRef, useEffect } from "react";
import { Printer, X, Building2, CheckCircle2 } from "lucide-react";

function PayslipModal({ payslip, onClose }) {
  const printRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[#091E42]/70 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
    >
      {/* Modal Container: constrained to 92vh, flex column, header always pinned on top */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl border border-[#DFE1E6] w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden my-auto relative animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Sticky Action Header (Always Visible at Top of Modal) */}
        <div className="sticky top-0 z-30 px-4 sm:px-5 py-3 bg-[#F4F5F7] border-b border-[#DFE1E6] flex items-center justify-between shrink-0 shadow-2xs print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#0052CC] text-white flex items-center justify-center">
              <Building2 size={13} />
            </div>
            <div>
              <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wide block leading-tight">
                Payslip Preview
              </span>
              <span className="text-[10px] text-[#6B778C] block leading-tight">
                {payslip.periodString} • {payslip.employeeId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">Print / Download PDF</span>
              <span className="sm:hidden">Print</span>
            </button>

            <button
              onClick={onClose}
              className="px-2.5 py-1.5 text-[#172B4D] bg-white hover:bg-[#EBECF0] border border-[#DFE1E6] rounded text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-2xs"
              title="Close Modal (Esc)"
            >
              <X size={14} />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            SCROLLABLE PRINTABLE PAYSLIP DOCUMENT (Staffify Format)
            ======================================================== */}
        <div
          ref={printRef}
          className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-5 text-[#172B4D] bg-white print:p-0 print:overflow-visible"
        >
          {/* 1. Company Letterhead */}
          <div className="border-b-2 border-[#172B4D] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#0052CC] text-white flex items-center justify-center font-bold text-xs">
                  S
                </div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#172B4D]">
                  STAFFIFY ENTERPRISE TECHNOLOGIES PVT. LTD.
                </h1>
              </div>
              <p className="text-[11px] text-[#6B778C] mt-1 leading-snug">
                DLF Cyber City, Tower B, Level 8, Gurugram, Haryana - 122002, India
              </p>
              <p className="text-[11px] text-[#6B778C] leading-snug">
                CIN: U72200HR2024PTC098765 • Email: payroll@staffify.com
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0052CC] block">
                Payslip For The Month Of
              </span>
              <span className="text-base font-bold text-[#172B4D] block mt-0.5">
                {payslip.periodString || "October 2026"}
              </span>
              <span className="text-[10px] text-[#6B778C] font-mono block mt-0.5">
                Ref: {payslip.payslipId}
              </span>
            </div>
          </div>

          {/* 2. Employee Metadata & Bank Details Grid */}
          <div className="border border-[#DFE1E6] rounded text-xs divide-y divide-[#DFE1E6]">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#DFE1E6] bg-[#FAFBFC] p-2.5">
              <div>
                <span className="text-[10px] text-[#6B778C] uppercase font-bold block">
                  Employee ID
                </span>
                <span className="font-semibold text-[#172B4D]">{payslip.employeeId}</span>
              </div>
              <div className="pl-2.5">
                <span className="text-[10px] text-[#6B778C] uppercase font-bold block">
                  Employee Name
                </span>
                <span className="font-semibold text-[#172B4D]">{payslip.employeeName}</span>
              </div>
              <div className="pl-2.5">
                <span className="text-[10px] text-[#6B778C] uppercase font-bold block">
                  Designation
                </span>
                <span className="font-semibold text-[#172B4D]">{payslip.designation}</span>
              </div>
              <div className="pl-2.5">
                <span className="text-[10px] text-[#6B778C] uppercase font-bold block">
                  Department
                </span>
                <span className="font-semibold text-[#172B4D]">{payslip.department}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#DFE1E6] p-2.5">
              <div>
                <span className="text-[10px] text-[#6B778C] uppercase font-bold block">
                  Bank Name
                </span>
                <span className="font-semibold text-[#172B4D]">
                  {payslip.bankDetails?.bankName || "HDFC Bank"}
                </span>
              </div>
              <div className="pl-2.5">
                <span className="text-[10px] text-[#6B778C] uppercase font-bold block">
                  Bank Account No.
                </span>
                <span className="font-mono text-[#172B4D]">
                  {payslip.bankDetails?.accountNumber
                    ? `••••${payslip.bankDetails.accountNumber.slice(-4)}`
                    : "••••7890"}
                </span>
              </div>
              <div className="pl-2.5">
                <span className="text-[10px] text-[#6B778C] uppercase font-bold block">
                  IFSC Code
                </span>
                <span className="font-mono text-[#172B4D]">
                  {payslip.bankDetails?.ifscCode || "HDFC0000123"}
                </span>
              </div>
              <div className="pl-2.5">
                <span className="text-[10px] text-[#6B778C] uppercase font-bold block">
                  Date of Joining
                </span>
                <span className="text-[#172B4D]">{payslip.dateOfJoining || "15-Jan-2024"}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#DFE1E6] bg-[#FAFBFC] p-2.5">
              <div>
                <span className="text-[10px] text-[#6B778C] uppercase font-bold block">
                  PAN Number
                </span>
                <span className="font-mono text-[#172B4D]">
                  {payslip.statutoryDetails?.panNumber || "ABCDE1234F"}
                </span>
              </div>
              <div className="pl-2.5">
                <span className="text-[10px] text-[#6B778C] uppercase font-bold block">
                  Universal Account No (UAN)
                </span>
                <span className="font-mono text-[#172B4D]">
                  {payslip.statutoryDetails?.uanNumber || "101234567890"}
                </span>
              </div>
              <div className="pl-2.5">
                <span className="text-[10px] text-[#6B778C] uppercase font-bold block">
                  PF Number
                </span>
                <span className="font-mono text-[#172B4D]">
                  {payslip.statutoryDetails?.pfNumber || "MH/BAN/0012345/000/0001"}
                </span>
              </div>
              <div className="pl-2.5">
                <span className="text-[10px] text-[#6B778C] uppercase font-bold block">
                  ESI Number
                </span>
                <span className="font-mono text-[#172B4D]">
                  {payslip.statutoryDetails?.esiNumber || "31000123450000001"}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Attendance Reconciliation Strip */}
          <div className="bg-[#DEEBFF]/30 border border-[#B3D4FF] rounded p-2.5 grid grid-cols-5 text-center text-xs">
            <div>
              <span className="text-[10px] text-[#0747A6] uppercase font-bold block">
                Total Days
              </span>
              <span className="font-bold text-[#172B4D]">
                {payslip.attendanceSummary?.totalDays || 31}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#0747A6] uppercase font-bold block">
                Days Worked
              </span>
              <span className="font-bold text-[#172B4D]">
                {payslip.attendanceSummary?.workedDays || 31}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#0747A6] uppercase font-bold block">
                Paid Leave
              </span>
              <span className="font-bold text-[#172B4D]">
                {payslip.attendanceSummary?.paidLeaveDays || 0}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#0747A6] uppercase font-bold block">
                Loss of Pay (LOP)
              </span>
              <span className="font-bold text-[#DE350B]">
                {payslip.attendanceSummary?.lopDays || 0}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#0747A6] uppercase font-bold block">
                Payable Days
              </span>
              <span className="font-bold text-[#00875A]">
                {payslip.attendanceSummary?.payableDays || 31}
              </span>
            </div>
          </div>

          {/* 4. Two-Column Earnings & Deductions Table */}
          <div className="border border-[#DFE1E6] rounded overflow-hidden">
            <div className="grid grid-cols-2 bg-[#F4F5F7] border-b border-[#DFE1E6] text-xs font-bold uppercase text-[#172B4D]">
              <div className="p-2.5 border-r border-[#DFE1E6]">Earnings</div>
              <div className="p-2.5">Deductions</div>
            </div>

            <div className="grid grid-cols-2 text-xs divide-x divide-[#DFE1E6]">
              {/* Earnings Column */}
              <div className="divide-y divide-[#DFE1E6]">
                <div className="flex justify-between p-2">
                  <span className="text-[#42526E]">Basic Salary</span>
                  <span className="font-medium text-[#172B4D]">
                    {formatCurrency(payslip.earnings?.basic)}
                  </span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-[#42526E]">House Rent Allowance (HRA)</span>
                  <span className="font-medium text-[#172B4D]">
                    {formatCurrency(payslip.earnings?.hra)}
                  </span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-[#42526E]">Conveyance Allowance</span>
                  <span className="font-medium text-[#172B4D]">
                    {formatCurrency(payslip.earnings?.conveyance)}
                  </span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-[#42526E]">Medical Allowance</span>
                  <span className="font-medium text-[#172B4D]">
                    {formatCurrency(payslip.earnings?.medicalAllowance)}
                  </span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-[#42526E]">Special Allowance</span>
                  <span className="font-medium text-[#172B4D]">
                    {formatCurrency(payslip.earnings?.specialAllowance)}
                  </span>
                </div>
              </div>

              {/* Deductions Column */}
              <div className="divide-y divide-[#DFE1E6]">
                <div className="flex justify-between p-2">
                  <span className="text-[#42526E]">Provident Fund (EPF)</span>
                  <span className="font-medium text-[#172B4D]">
                    {formatCurrency(payslip.deductions?.epf)}
                  </span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-[#42526E]">Employee State Insurance (ESI)</span>
                  <span className="font-medium text-[#172B4D]">
                    {formatCurrency(payslip.deductions?.esi)}
                  </span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-[#42526E]">Professional Tax (PT)</span>
                  <span className="font-medium text-[#172B4D]">
                    {formatCurrency(payslip.deductions?.professionalTax)}
                  </span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-[#42526E]">Tax Deducted at Source (TDS)</span>
                  <span className="font-medium text-[#172B4D]">
                    {formatCurrency(payslip.deductions?.tds)}
                  </span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-[#42526E]">Loss of Pay (LOP) Deduction</span>
                  <span className="font-medium text-[#DE350B]">
                    {formatCurrency(payslip.deductions?.lopDeduction)}
                  </span>
                </div>
              </div>
            </div>

            {/* Totals Row */}
            <div className="grid grid-cols-2 bg-[#FAFBFC] border-t-2 border-[#DFE1E6] text-xs font-bold text-[#172B4D]">
              <div className="p-2.5 flex justify-between border-r border-[#DFE1E6]">
                <span>Total Gross Earnings</span>
                <span className="text-[#00875A]">
                  {formatCurrency(payslip.earnings?.grossEarnings)}
                </span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span>Total Deductions</span>
                <span className="text-[#DE350B]">
                  {formatCurrency(payslip.deductions?.totalDeductions)}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Net Pay in Numbers and Words */}
          <div className="bg-[#E3FCEF] border border-[#ABF5D1] rounded p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase font-bold text-[#006644] block">
                Net Salary Payable
              </span>
              <p className="text-xs text-[#006644] italic mt-0.5 font-medium">
                {payslip.netPayInWords || "Rupees Fifty-Two Thousand Four Hundred Only"}
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="text-2xl font-bold text-[#006644] tracking-tight">
                {formatCurrency(payslip.netPay)}
              </span>
              <span className="text-[10px] text-[#006644] font-medium block">
                Disbursed to Bank Account
              </span>
            </div>
          </div>

          {/* 6. Signature & Legal Disclaimer */}
          <div className="pt-4 border-t border-[#DFE1E6] flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 text-[11px] text-[#6B778C]">
            <div>
              <p className="flex items-center gap-1 text-[#00875A] font-semibold">
                <CheckCircle2 size={13} />
                <span>Digitally Authenticated by Staffify Payroll Engine</span>
              </p>
              <p className="mt-0.5">
                This is a computer-generated statutory payslip and does not require a physical
                signature.
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="h-8 border-b border-[#172B4D] w-32 mb-1" />
              <p className="font-semibold text-[#172B4D]">Authorised Signatory</p>
              <p className="text-[10px]">Staffify Enterprise HR</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PayslipModal;
