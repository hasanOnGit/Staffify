import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getPayslips, getSalaryStructure } from "../services/payroll";
import PayslipModal from "../components/PayslipModal";
import TaxDeclarationModal from "../components/TaxDeclarationModal";
import LoanModal from "../components/LoanModal";
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
} from "lucide-react";

function Payslips() {
  const { user } = useAuth();
  const [payslips, setPayslips] = useState([]);
  const [salaryStructure, setSalaryStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePayslip, setActivePayslip] = useState(null);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);

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
        <div className="border-b border-[#DFE1E6] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-[#172B4D] flex items-center gap-2">
              <FileText size={20} className="text-[#0052CC]" />
              <span>My Payslips & Compensation</span>
            </h1>
            <p className="text-xs text-[#6B778C] mt-0.5">
              Self-service monthly salary statements, statutory deductions, and tax documentation
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowLoanModal(true)}
              className="px-3 py-1.5 bg-white hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6] rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <CreditCard size={13} className="text-[#0052CC]" />
              <span>Salary Advance & Loans</span>
            </button>
            <button
              onClick={() => setShowTaxModal(true)}
              className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <FileCheck size={13} />
              <span>Form 12BB IT Declaration</span>
            </button>
            <span className="text-xs text-[#006644] bg-[#E3FCEF] border border-[#ABF5D1] px-2.5 py-1 rounded font-semibold flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>Salary Credited On-Time</span>
            </span>
          </div>
        </div>

        {/* ========================================================
            1. PERSONAL CTC & COMPENSATION OVERVIEW
            ======================================================== */}
        <div className="bg-white border border-[#DFE1E6] rounded-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
              Annual Compensation Package (CTC)
            </h2>
            <span className="text-[11px] text-[#0052CC] font-semibold bg-[#DEEBFF] px-2 py-0.5 rounded border border-[#B3D4FF]">
              Regime: {salaryStructure?.taxRegime || "New"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded p-3">
              <span className="text-[10px] font-semibold text-[#6B778C] uppercase block">
                Annual CTC
              </span>
              <p className="text-xl font-bold text-[#0052CC] mt-0.5">
                {formatCurrency(salaryStructure?.annualCtc || 600000)}
              </p>
              <span className="text-[10px] text-[#6B778C]">Per Annum</span>
            </div>

            <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded p-3">
              <span className="text-[10px] font-semibold text-[#6B778C] uppercase block">
                Monthly Gross
              </span>
              <p className="text-xl font-bold text-[#172B4D] mt-0.5">
                {formatCurrency(salaryStructure?.monthlyCtc || 50000)}
              </p>
              <span className="text-[10px] text-[#6B778C]">Before Deductions</span>
            </div>

            <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded p-3">
              <span className="text-[10px] font-semibold text-[#6B778C] uppercase block">
                Monthly Basic
              </span>
              <p className="text-xl font-bold text-[#00875A] mt-0.5">
                {formatCurrency(salaryStructure?.basicSalary || 22500)}
              </p>
              <span className="text-[10px] text-[#6B778C]">45% of Gross</span>
            </div>

            <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded p-3">
              <span className="text-[10px] font-semibold text-[#6B778C] uppercase block">
                Monthly HRA
              </span>
              <p className="text-xl font-bold text-[#B9770E] mt-0.5">
                {formatCurrency(salaryStructure?.hra || 11250)}
              </p>
              <span className="text-[10px] text-[#6B778C]">50% of Basic</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. MONTHLY PAYSLIPS ARCHIVE TABLE
            ======================================================== */}
        <div className="bg-white border border-[#DFE1E6] rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#172B4D] text-xs uppercase tracking-wider">
                Monthly Payslip Archive
              </h3>
              <p className="text-[11px] text-[#6B778C]">
                Click on any month to view and print the official Staffify payslip
              </p>
            </div>
          </div>

          {payslips.length === 0 ? (
            <div className="text-center py-8 bg-[#FAFBFC] rounded border border-dashed border-[#DFE1E6]">
              <FileText size={20} className="text-[#6B778C] mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-[#172B4D]">No Payslips Found</p>
              <p className="text-[11px] text-[#6B778C]">
                Your payslips will appear here once monthly payroll is processed.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#DFE1E6] rounded">
              <table className="min-w-full text-xs divide-y divide-[#DFE1E6]">
                <thead className="bg-[#F4F5F7] text-[#6B778C] font-semibold uppercase text-[10px]">
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
                <tbody className="divide-y divide-[#DFE1E6] bg-white">
                  {payslips.map((p) => (
                    <tr key={p._id || p.payslipId} className="hover:bg-[#FAFBFC]">
                      <td className="px-3.5 py-2.5 font-bold text-[#172B4D]">
                        {p.periodString}
                        <span className="text-[10px] text-[#6B778C] block font-mono">
                          {p.payslipId}
                        </span>
                      </td>

                      <td className="px-3.5 py-2.5 text-[#42526E]">
                        {p.attendanceSummary?.payableDays} of {p.attendanceSummary?.totalDays} Days
                        {p.attendanceSummary?.lopDays > 0 && (
                          <span className="text-[10px] text-[#DE350B] block">
                            ({p.attendanceSummary.lopDays}d LOP)
                          </span>
                        )}
                      </td>

                      <td className="px-3.5 py-2.5 text-right font-medium text-[#172B4D]">
                        {formatCurrency(p.earnings?.grossEarnings)}
                      </td>

                      <td className="px-3.5 py-2.5 text-right font-medium text-[#DE350B]">
                        {formatCurrency(p.deductions?.totalDeductions)}
                      </td>

                      <td className="px-3.5 py-2.5 text-right font-bold text-[#00875A] text-sm">
                        {formatCurrency(p.netPay)}
                      </td>

                      <td className="px-3.5 py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]">
                          {p.status || "Paid"}
                        </span>
                      </td>

                      <td className="px-3.5 py-2.5 text-right">
                        <button
                          onClick={() => setActivePayslip(p)}
                          className="px-3 py-1 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold cursor-pointer transition inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <Printer size={12} />
                          <span>View & Print</span>
                        </button>
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
      </div>
    </DashboardLayout>
  );
}

export default Payslips;
