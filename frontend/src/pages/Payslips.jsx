import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getPayslips, getSalaryStructure } from "../services/payroll";
import PayslipModal from "../components/PayslipModal";
import TaxDeclarationModal from "../components/TaxDeclarationModal";
import LoanModal from "../components/LoanModal";
import CtcCalculatorModal from "../components/CtcCalculatorModal";
import {
  FileText,
  DollarSign,
  Calendar,
  Building2,
  Printer,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  CreditCard,
  Download,
  Calculator,
} from "lucide-react";
import { printPayslip, downloadPayslipFile } from "../utils/payslipPrinter";
import { useLocation } from "react-router-dom";

function Payslips() {
  const location = useLocation();
  const { user } = useAuth();
  const [payslips, setPayslips] = useState([]);
  const [salaryStructure, setSalaryStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePayslip, setActivePayslip] = useState(null);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showCtcModal, setShowCtcModal] = useState(false);

  // Handle deep link action triggers (e.g. from AI Copilot /payslips?loan=true)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("loan") === "true" || params.get("advance") === "true") {
      setShowLoanModal(true);
    }
    if (params.get("tax") === "true") {
      setShowTaxModal(true);
    }
    if (params.get("ctc") === "true") {
      setShowCtcModal(true);
    }
  }, [location.search]);

  const formatCurrency = (val = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  useEffect(() => {
    const fetchEssData = async () => {
      try {
        setLoading(true);
        const empId = user?.employeeId || user?.userId;
        if (!empId) {
          setPayslips([]);
          setSalaryStructure(null);
          return;
        }
        const [payslipsRes, structRes] = await Promise.all([
          getPayslips({ employeeId: empId }).catch(() => ({ data: [] })),
          getSalaryStructure(empId).catch(() => ({ data: null })),
        ]);

        setPayslips(payslipsRes.data || []);
        setSalaryStructure(structRes.data || null);
      } catch (err) {
        console.error("Error fetching personal payslips:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEssData();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="border-b border-[#DFE1E6] dark:border-[#263042] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-2">
              <FileText size={20} className="text-[#0052CC] dark:text-[#579DFF]" />
              <span>My Payslips & Compensation</span>
            </h1>
            <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
              Self-service monthly salary statements, statutory deductions, and tax documentation
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowCtcModal(true)}
              className="px-3 py-1.5 bg-white dark:bg-[#151B26] hover:bg-[#EBECF0] dark:hover:bg-[#1C2536] active:scale-[0.98] text-[#172B4D] dark:text-[#F1F5F9] border border-[#DFE1E6] dark:border-[#263042] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Calculator size={13} className="text-[#0052CC] dark:text-[#579DFF]" />
              <span>CTC & Take-Home Calculator</span>
            </button>
            <button
              type="button"
              onClick={() => setShowLoanModal(true)}
              className="px-3 py-1.5 bg-white dark:bg-[#151B26] hover:bg-[#EBECF0] dark:hover:bg-[#1C2536] active:scale-[0.98] text-[#172B4D] dark:text-[#F1F5F9] border border-[#DFE1E6] dark:border-[#263042] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <CreditCard size={13} className="text-[#0052CC] dark:text-[#579DFF]" />
              <span>Salary Advance & Loans</span>
            </button>
            <button
              type="button"
              onClick={() => setShowTaxModal(true)}
              className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <FileCheck size={13} />
              <span>Form 12BB IT Declaration</span>
            </button>
            <span className="text-xs text-[#006644] dark:text-emerald-400 bg-[#E3FCEF] dark:bg-emerald-950/40 border border-[#ABF5D1] dark:border-emerald-800 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>Salary Credited On-Time</span>
            </span>
          </div>
        </div>

        {/* ========================================================
            1. PERSONAL CTC & COMPENSATION OVERVIEW
            ======================================================== */}
        <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#0052CC] dark:text-[#579DFF]" />
                <span>Annual Compensation Package (CTC)</span>
              </h2>
              <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
                Statutory benefits compliant with Indian Labor Law & EPF Act
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#0052CC] dark:text-[#579DFF] font-semibold bg-[#DEEBFF] dark:bg-[#1C2536] px-2.5 py-1 rounded-md border border-[#B3D4FF] dark:border-[#263042]">
                Tax Regime: {salaryStructure?.taxRegime || "New Regime (Sec 115BAC)"}
              </span>
              <span className="text-[11px] text-[#00875A] dark:text-emerald-400 font-semibold bg-[#E3FCEF] dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-[#ABF5D1] dark:border-emerald-800">
                EPF 12% + ESIC 0.75% Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#FAFBFC] dark:bg-[#090D14] border border-[#DFE1E6] dark:border-[#263042] rounded-lg p-3">
              <span className="text-[10px] font-semibold text-[#6B778C] dark:text-[#94A3B8] uppercase block">
                Annual CTC
              </span>
              <p className="text-xl font-bold text-[#0052CC] dark:text-[#579DFF] mt-0.5">
                {formatCurrency(salaryStructure?.annualCtc || 600000)}
              </p>
              <span className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">Per Annum Gross</span>
            </div>

            <div className="bg-[#FAFBFC] dark:bg-[#090D14] border border-[#DFE1E6] dark:border-[#263042] rounded-lg p-3">
              <span className="text-[10px] font-semibold text-[#6B778C] dark:text-[#94A3B8] uppercase block">
                Monthly Gross
              </span>
              <p className="text-xl font-bold text-[#172B4D] dark:text-[#F1F5F9] mt-0.5">
                {formatCurrency(salaryStructure?.monthlyCtc || 50000)}
              </p>
              <span className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">Before Deductions</span>
            </div>

            <div className="bg-[#FAFBFC] dark:bg-[#090D14] border border-[#DFE1E6] dark:border-[#263042] rounded-lg p-3">
              <span className="text-[10px] font-semibold text-[#6B778C] dark:text-[#94A3B8] uppercase block">
                Monthly Basic
              </span>
              <p className="text-xl font-bold text-[#00875A] dark:text-emerald-400 mt-0.5">
                {formatCurrency(salaryStructure?.basicSalary || 22500)}
              </p>
              <span className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">45% of Gross Base</span>
            </div>

            <div className="bg-[#FAFBFC] dark:bg-[#090D14] border border-[#DFE1E6] dark:border-[#263042] rounded-lg p-3">
              <span className="text-[10px] font-semibold text-[#6B778C] dark:text-[#94A3B8] uppercase block">
                Monthly HRA
              </span>
              <p className="text-xl font-bold text-[#B9770E] dark:text-amber-400 mt-0.5">
                {formatCurrency(salaryStructure?.hra || 11250)}
              </p>
              <span className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">50% of Basic Allowance</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. MONTHLY PAYSLIPS ARCHIVE TABLE
            ======================================================== */}
        <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#172B4D] dark:text-[#F1F5F9] text-xs uppercase tracking-wider">
                Monthly Payslip Archive
              </h3>
              <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
                Click on any month to view and print the official Staffify payslip
              </p>
            </div>
          </div>

          {payslips.length === 0 ? (
            <div className="text-center py-8 bg-[#FAFBFC] dark:bg-[#090D14] rounded-lg border border-dashed border-[#DFE1E6] dark:border-[#263042]">
              <FileText size={20} className="text-[#6B778C] dark:text-[#94A3B8] mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9]">No Payslips Found</p>
              <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
                Your payslips will appear here once monthly payroll is processed.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#DFE1E6] dark:border-[#263042] rounded-lg">
              <table className="min-w-full text-xs divide-y divide-[#DFE1E6] dark:divide-[#263042]">
                <thead className="bg-[#F4F5F7] dark:bg-[#090D14] text-[#6B778C] dark:text-[#94A3B8] font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-3.5 py-2.5 text-left">Payslip Period</th>
                    <th className="px-3.5 py-2.5 text-left">Days Paid</th>
                    <th className="px-3.5 py-2.5 text-right">Gross Salary</th>
                    <th className="px-3.5 py-2.5 text-right">Total Deductions</th>
                    <th className="px-3.5 py-2.5 text-right">Net Take-Home</th>
                    <th className="px-3.5 py-2.5 text-center">Status</th>
                    <th className="px-3.5 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1E6] dark:divide-[#263042] bg-white dark:bg-[#151B26]">
                  {payslips.map((p) => (
                    <tr key={p._id || p.payslipId} className="hover:bg-[#FAFBFC] dark:hover:bg-[#1C2536] transition-colors">
                      <td className="px-3.5 py-2.5 font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                        {p.periodString}
                        <span className="text-[10px] text-[#6B778C] dark:text-[#94A3B8] block font-mono">
                          {p.payslipId}
                        </span>
                      </td>

                      <td className="px-3.5 py-2.5 text-[#42526E] dark:text-[#CBD5E1]">
                        {p.attendanceSummary?.payableDays} of {p.attendanceSummary?.totalDays} Days
                        {p.attendanceSummary?.lopDays > 0 && (
                          <span className="text-[10px] text-[#DE350B] dark:text-rose-400 block">
                            ({p.attendanceSummary.lopDays}d LOP)
                          </span>
                        )}
                      </td>

                      <td className="px-3.5 py-2.5 text-right font-medium text-[#172B4D] dark:text-[#F1F5F9]">
                        {formatCurrency(p.earnings?.grossEarnings)}
                      </td>

                      <td className="px-3.5 py-2.5 text-right font-medium text-[#DE350B] dark:text-rose-400">
                        {formatCurrency(p.deductions?.totalDeductions)}
                      </td>

                      <td className="px-3.5 py-2.5 text-right font-bold text-[#00875A] dark:text-emerald-400 text-sm">
                        {formatCurrency(p.netPay)}
                      </td>

                      <td className="px-3.5 py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E3FCEF] dark:bg-emerald-950/40 text-[#006644] dark:text-emerald-400 border border-[#ABF5D1] dark:border-emerald-800">
                          {p.status || "Paid"}
                        </span>
                      </td>

                      <td className="px-3.5 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActivePayslip(p)}
                            className="px-2.5 py-1 bg-[#0052CC] hover:bg-[#0747A6] active:scale-[0.98] text-white rounded text-xs font-semibold cursor-pointer transition inline-flex items-center gap-1 shadow-2xs"
                            title="View official payslip preview"
                          >
                            <Printer size={12} />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadPayslipFile(p)}
                            className="px-2.5 py-1 bg-[#F4F5F7] dark:bg-[#1C2536] hover:bg-[#EBECF0] dark:hover:bg-[#263042] active:scale-[0.98] text-[#172B4D] dark:text-[#F1F5F9] border border-[#DFE1E6] dark:border-[#263042] rounded text-xs font-semibold cursor-pointer transition inline-flex items-center gap-1 shadow-2xs"
                            title="Download official payslip statement"
                          >
                            <Download size={12} className="text-[#0052CC] dark:text-[#579DFF]" />
                            <span>Download</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Printable Staffify Payslip Modal */}
        {activePayslip && (
          <PayslipModal payslip={activePayslip} onClose={() => setActivePayslip(null)} />
        )}

        {/* Form 12BB IT Declaration & Tax Regime Simulator Modal */}
        {showTaxModal && (
          <TaxDeclarationModal
            isOpen={showTaxModal}
            onClose={() => setShowTaxModal(false)}
            employeeId={user?.employeeId || user?.userId}
            employeeName={user?.name || "Employee"}
            annualCtc={salaryStructure?.annualCtc || 600000}
          />
        )}

        {/* Salary Advance & Loan Modal */}
        {showLoanModal && (
          <LoanModal
            isOpen={showLoanModal}
            onClose={() => setShowLoanModal(false)}
            initialEmployeeId={user?.employeeId || user?.userId}
          />
        )}

        {/* Interactive CTC & Take-Home Calculator Modal */}
        <CtcCalculatorModal
          isOpen={showCtcModal}
          onClose={() => setShowCtcModal(false)}
          initialCtc={salaryStructure?.annualCtc || 900000}
        />
      </div>
    </DashboardLayout>
  );
}

export default Payslips;
