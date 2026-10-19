import { useState } from "react";
import {
  X,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  Building,
  CreditCard,
  Laptop,
  UserCheck,
  AlertTriangle,
  Send,
  DollarSign,
} from "lucide-react";
import { updateClearance, finalizeSettlement } from "../services/settlement";
import toast from "react-hot-toast";

function SettlementModal({ isOpen, onClose, settlement, onUpdated }) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "clearances", "statement"
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState("");

  if (!isOpen || !settlement) return null;

  const formatCurrency = (val = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleClear = async (department, nextStatus) => {
    try {
      setLoading(true);
      await updateClearance(settlement.settlementId, {
        department,
        status: nextStatus,
        remarks: remarks || `Department clearance set to ${nextStatus}`,
      });
      toast.success(`${department.toUpperCase()} department clearance marked as ${nextStatus}`);
      if (onUpdated) onUpdated();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update clearance");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    try {
      setLoading(true);
      await finalizeSettlement(settlement.settlementId, {
        paymentMode: "Direct Bank Transfer",
        transactionRef: "NEFT-SETTLE-" + Date.now().toString().slice(-6),
      });
      toast.success("Settlement finalized and marked as Disbursed/Paid");
      if (onUpdated) onUpdated();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to finalize settlement");
    } finally {
      setLoading(false);
    }
  };

  const cl = settlement.clearances || {};
  const ern = settlement.earnings || {};
  const ded = settlement.deductions || {};

  return (
    <div className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-[#DFE1E6] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DFE1E6] flex items-center justify-between bg-[#FAFBFC] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172B4D] flex items-center gap-2">
                <span>Full & Final (F&F) Settlement Dossier</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    settlement.settlementStatus === "Paid"
                      ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                      : settlement.settlementStatus === "Settled"
                      ? "bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]"
                      : "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]"
                  }`}
                >
                  {settlement.settlementStatus.replace(/_/g, " ")}
                </span>
              </h2>
              <p className="text-xs text-[#6B778C]">
                {settlement.employeeName} ({settlement.employeeId}) • {settlement.designation} • {settlement.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-2.5 py-1 bg-white hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6] rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={13} />
              <span>Print Statement</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-[#6B778C] hover:bg-[#EBECF0] hover:text-[#172B4D] transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="px-6 pt-3 border-b border-[#DFE1E6] bg-white flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t border-b-2 transition cursor-pointer ${
              activeTab === "overview"
                ? "border-[#0052CC] text-[#0052CC] bg-[#FAFBFC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            Settlement Summary & Payout
          </button>
          <button
            onClick={() => setActiveTab("clearances")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t border-b-2 transition cursor-pointer ${
              activeTab === "clearances"
                ? "border-[#0052CC] text-[#0052CC] bg-[#FAFBFC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            Multi-Department NOC Clearances
          </button>
          <button
            onClick={() => setActiveTab("statement")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t border-b-2 transition cursor-pointer ${
              activeTab === "statement"
                ? "border-[#0052CC] text-[#0052CC] bg-[#FAFBFC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            Formal F&F Payout Statement
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#172B4D]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Key Highlights Banner */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-[#F4F5F7] border border-[#DFE1E6] rounded">
                  <span className="text-[10px] uppercase font-bold text-[#6B778C] block">Service Tenancy</span>
                  <span className="text-base font-bold text-[#172B4D]">
                    {ern.yearsOfService || 2.5} Years
                  </span>
                  <p className="text-[10px] text-[#6B778C] mt-0.5">
                    Joined: {new Date(settlement.joiningDate).toLocaleDateString("en-IN")}
                  </p>
                </div>

                <div className="p-3 bg-[#F4F5F7] border border-[#DFE1E6] rounded">
                  <span className="text-[10px] uppercase font-bold text-[#6B778C] block">Last Working Day</span>
                  <span className="text-base font-bold text-[#172B4D]">
                    {new Date(settlement.lastWorkingDate).toLocaleDateString("en-IN")}
                  </span>
                  <p className="text-[10px] text-[#6B778C] mt-0.5">
                    Notice Shortfall: {settlement.noticeShortfallDays} Days
                  </p>
                </div>

                <div className="p-3 bg-[#F4F5F7] border border-[#DFE1E6] rounded">
                  <span className="text-[10px] uppercase font-bold text-[#6B778C] block">Leave Encashment</span>
                  <span className="text-base font-bold text-[#00875A]">
                    {formatCurrency(ern.leaveEncashmentAmount)}
                  </span>
                  <p className="text-[10px] text-[#6B778C] mt-0.5">
                    {ern.leaveEncashmentDays} Days Unavailed EL
                  </p>
                </div>

                <div className="p-3 bg-[#E3FCEF] border border-[#ABF5D1] rounded">
                  <span className="text-[10px] uppercase font-bold text-[#006644] block">Net Final Payable</span>
                  <span className="text-lg font-bold text-[#006644]">
                    {formatCurrency(settlement.netPayable)}
                  </span>
                  <p className="text-[10px] text-[#006644] mt-0.5">Approved Disbursement</p>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Earnings Table */}
                <div className="border border-[#DFE1E6] rounded-md p-4 bg-white">
                  <h4 className="font-bold text-xs uppercase text-[#00875A] border-b border-[#DFE1E6] pb-2 flex items-center justify-between">
                    <span>A. Settlement Earnings</span>
                    <span>{formatCurrency(ern.totalEarnings)}</span>
                  </h4>
                  <div className="divide-y divide-[#F4F5F7] pt-2 space-y-2">
                    <div className="flex justify-between pt-1">
                      <span className="text-[#6B778C]">Payable Days Prorated Basic:</span>
                      <span className="font-semibold text-[#172B4D]">{formatCurrency(ern.proratedBasicSalary)}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-[#6B778C]">Earned Leave Encashment ({ern.leaveEncashmentDays}d):</span>
                      <span className="font-semibold text-[#172B4D]">{formatCurrency(ern.leaveEncashmentAmount)}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-[#6B778C]">
                        Gratuity Amount {ern.gratuityEligible ? "(Eligible >= 5 yrs)" : "(Not eligible < 5 yrs)"}:
                      </span>
                      <span className="font-semibold text-[#172B4D]">{formatCurrency(ern.gratuityAmount)}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-[#6B778C]">Bonus / Performance Incentive:</span>
                      <span className="font-semibold text-[#172B4D]">{formatCurrency(ern.bonusOrIncentives)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions Table */}
                <div className="border border-[#DFE1E6] rounded-md p-4 bg-white">
                  <h4 className="font-bold text-xs uppercase text-[#DE350B] border-b border-[#DFE1E6] pb-2 flex items-center justify-between">
                    <span>B. Settlement Deductions</span>
                    <span>{formatCurrency(ded.totalDeductions)}</span>
                  </h4>
                  <div className="divide-y divide-[#F4F5F7] pt-2 space-y-2">
                    <div className="flex justify-between pt-1">
                      <span className="text-[#6B778C]">Notice Period Shortfall ({settlement.noticeShortfallDays}d):</span>
                      <span className="font-semibold text-[#DE350B]">{formatCurrency(ded.noticeShortfallDeduction)}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-[#6B778C]">Unreturned Assets Penalty:</span>
                      <span className="font-semibold text-[#172B4D]">{formatCurrency(ded.unreturnedAssetCost)}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-[#6B778C]">Pending Advances / Loans:</span>
                      <span className="font-semibold text-[#172B4D]">{formatCurrency(ded.pendingLoanOrAdvance)}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-[#6B778C]">TDS Income Tax Withholding:</span>
                      <span className="font-semibold text-[#172B4D]">{formatCurrency(ded.tdsDeduction)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLEARANCES */}
          {activeTab === "clearances" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-[#172B4D]">Departmental No-Objection Certificate (NOC) Board</h3>
                <p className="text-[#6B778C] mt-0.5">
                  All departments must issue clearance before final payout authorization.
                </p>
              </div>

              <div className="space-y-3">
                {/* IT Clearance */}
                <div className="p-3.5 border border-[#DFE1E6] rounded-md bg-[#FAFBFC] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white border border-[#DFE1E6] rounded text-[#0052CC]">
                      <Laptop size={18} />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#172B4D]">IT & Asset Management</span>
                      <p className="text-[11px] text-[#6B778C]">{cl.itDepartment?.remarks || "Equipment handover"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        cl.itDepartment?.status === "Cleared"
                          ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                          : "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]"
                      }`}
                    >
                      {cl.itDepartment?.status}
                    </span>
                    <button
                      onClick={() => handleClear("it", cl.itDepartment?.status === "Cleared" ? "Pending" : "Cleared")}
                      className="px-2 py-1 bg-white hover:bg-[#EBECF0] border border-[#DFE1E6] rounded text-xs font-semibold cursor-pointer"
                    >
                      Toggle Clear
                    </button>
                  </div>
                </div>

                {/* Finance Clearance */}
                <div className="p-3.5 border border-[#DFE1E6] rounded-md bg-[#FAFBFC] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white border border-[#DFE1E6] rounded text-[#00875A]">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#172B4D]">Finance & Payroll Verification</span>
                      <p className="text-[11px] text-[#6B778C]">{cl.financeDepartment?.remarks || "Dues and advances audit"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        cl.financeDepartment?.status === "Cleared"
                          ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                          : "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]"
                      }`}
                    >
                      {cl.financeDepartment?.status}
                    </span>
                    <button
                      onClick={() => handleClear("finance", cl.financeDepartment?.status === "Cleared" ? "Pending" : "Cleared")}
                      className="px-2 py-1 bg-white hover:bg-[#EBECF0] border border-[#DFE1E6] rounded text-xs font-semibold cursor-pointer"
                    >
                      Toggle Clear
                    </button>
                  </div>
                </div>

                {/* Admin Clearance */}
                <div className="p-3.5 border border-[#DFE1E6] rounded-md bg-[#FAFBFC] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white border border-[#DFE1E6] rounded text-[#403294]">
                      <Building size={18} />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#172B4D]">Facilities & Administration</span>
                      <p className="text-[11px] text-[#6B778C]">{cl.adminDepartment?.remarks || "ID badge and keycard recovery"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        cl.adminDepartment?.status === "Cleared"
                          ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                          : "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]"
                      }`}
                    >
                      {cl.adminDepartment?.status}
                    </span>
                    <button
                      onClick={() => handleClear("admin", cl.adminDepartment?.status === "Cleared" ? "Pending" : "Cleared")}
                      className="px-2 py-1 bg-white hover:bg-[#EBECF0] border border-[#DFE1E6] rounded text-xs font-semibold cursor-pointer"
                    >
                      Toggle Clear
                    </button>
                  </div>
                </div>

                {/* HR Clearance */}
                <div className="p-3.5 border border-[#DFE1E6] rounded-md bg-[#FAFBFC] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white border border-[#DFE1E6] rounded text-[#FF991F]">
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#172B4D]">Human Resources (Exit Survey)</span>
                      <p className="text-[11px] text-[#6B778C]">{cl.hrDepartment?.remarks || "Formal exit interview completed"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        cl.hrDepartment?.status === "Cleared"
                          ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                          : "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]"
                      }`}
                    >
                      {cl.hrDepartment?.status}
                    </span>
                    <button
                      onClick={() => handleClear("hr", cl.hrDepartment?.status === "Cleared" ? "Pending" : "Cleared")}
                      className="px-2 py-1 bg-white hover:bg-[#EBECF0] border border-[#DFE1E6] rounded text-xs font-semibold cursor-pointer"
                    >
                      Toggle Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STATEMENT */}
          {activeTab === "statement" && (
            <div className="border border-[#DFE1E6] rounded p-6 bg-white space-y-4 print:border-none">
              <div className="border-b border-[#DFE1E6] pb-3 text-center">
                <h3 className="font-bold text-base text-[#172B4D]">STAFFIFY TECHNOLOGIES PRIVATE LIMITED</h3>
                <p className="text-xs text-[#6B778C]">Formal Full and Final Settlement Statement</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Employee Name: <strong>{settlement.employeeName}</strong></div>
                <div>Employee ID: <strong>{settlement.employeeId}</strong></div>
                <div>Designation: <strong>{settlement.designation}</strong></div>
                <div>Department: <strong>{settlement.department}</strong></div>
                <div>Last Working Day: <strong>{new Date(settlement.lastWorkingDate).toLocaleDateString("en-IN")}</strong></div>
                <div>Settlement Status: <strong>{settlement.settlementStatus}</strong></div>
              </div>

              <div className="pt-2 border-t border-[#DFE1E6]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#F4F5F7] text-[#6B778C]">
                      <th className="p-2 text-left">Earnings Head</th>
                      <th className="p-2 text-right">Amount (₹)</th>
                      <th className="p-2 text-left">Deductions Head</th>
                      <th className="p-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2">Payable Days Basic ({ern.payableDaysInMonth}d)</td>
                      <td className="p-2 text-right">{formatCurrency(ern.proratedBasicSalary)}</td>
                      <td className="p-2">Notice Shortfall ({settlement.noticeShortfallDays}d)</td>
                      <td className="p-2 text-right text-[#DE350B]">{formatCurrency(ded.noticeShortfallDeduction)}</td>
                    </tr>
                    <tr>
                      <td className="p-2">Leave Encashment ({ern.leaveEncashmentDays}d EL)</td>
                      <td className="p-2 text-right">{formatCurrency(ern.leaveEncashmentAmount)}</td>
                      <td className="p-2">Unreturned Assets / Advances</td>
                      <td className="p-2 text-right">{formatCurrency(ded.unreturnedAssetCost + ded.pendingLoanOrAdvance)}</td>
                    </tr>
                    <tr>
                      <td className="p-2">Gratuity (Payment of Gratuity Act)</td>
                      <td className="p-2 text-right">{formatCurrency(ern.gratuityAmount)}</td>
                      <td className="p-2">TDS Withheld</td>
                      <td className="p-2 text-right">{formatCurrency(ded.tdsDeduction)}</td>
                    </tr>
                    <tr className="font-bold border-t border-[#DFE1E6]">
                      <td className="p-2">Total Earnings</td>
                      <td className="p-2 text-right text-[#00875A]">{formatCurrency(ern.totalEarnings)}</td>
                      <td className="p-2">Total Deductions</td>
                      <td className="p-2 text-right text-[#DE350B]">{formatCurrency(ded.totalDeductions)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-[#E3FCEF] border border-[#ABF5D1] rounded flex justify-between items-center text-sm font-bold">
                <span className="text-[#006644]">Net Payable Amount:</span>
                <span className="text-[#006644] text-base">{formatCurrency(settlement.netPayable)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#DFE1E6] bg-[#FAFBFC] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#6B778C]">
            Indian Payment of Gratuity Act 1972 & Earned Leave Policy Compliant
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-[#DFE1E6] hover:bg-[#EBECF0] rounded text-xs font-semibold text-[#172B4D] transition cursor-pointer"
            >
              Close
            </button>
            {settlement.settlementStatus !== "Paid" && (
              <button
                disabled={loading}
                onClick={handleFinalize}
                className="px-4 py-1.5 bg-[#00875A] hover:bg-[#006644] text-white rounded text-xs font-semibold transition cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 size={13} />
                <span>Finalize & Mark Paid</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettlementModal;
