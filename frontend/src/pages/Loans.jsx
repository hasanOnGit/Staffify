import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Plus,
  Search,
  RefreshCw,
  User,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowDownRight,
  TrendingDown,
  Layers,
  ChevronRight,
  ChevronDown,
  X,
  History,
  Coins,
} from "lucide-react";
import KpiMetricCard from "../components/KpiMetricCard";
import StatusLozenge from "../components/StatusLozenge";
import { loansApi, workersApi } from "../services/api";
import { useWorkspace } from "../context/WorkspaceContext";
import toast from "react-hot-toast";

export default function Loans() {
  const { isAgencyWorkspace, activeVendorId } = useWorkspace();
  const [loans, setLoans] = useState([]);
  const [stats, setStats] = useState({
    totalDisbursed: 0,
    totalOutstanding: 0,
    totalRecovered: 0,
    activeLoansCount: 0,
    fullyRepaidCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals state
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [repayModalOpen, setRepayModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [expandedLoanId, setExpandedLoanId] = useState(null);

  // Workers for dropdown
  const [workers, setWorkers] = useState([]);

  // Form states
  const [issueFormData, setIssueFormData] = useState({
    workerId: "",
    loanType: "Salary Advance",
    principalAmount: 10000,
    tenureMonths: 2,
    reason: "",
    repaymentStartMonth: "April",
    repaymentStartYear: 2026,
  });

  const [repayFormData, setRepayFormData] = useState({
    amount: "",
    paymentMethod: "Payroll Deduction",
    remarks: "",
  });

  useEffect(() => {
    loadLoans();
    loadWorkers();
  }, [statusFilter, activeVendorId]);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
      };
      const res = await loansApi.getAll(params);
      setLoans(res.data?.data || []);
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      toast.error("Failed to load advances: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadWorkers = async () => {
    try {
      const res = await workersApi.getAll();
      setWorkers(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load workers:", err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadLoans();
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueFormData.workerId) {
      toast.error("Please select a worker");
      return;
    }
    if (!issueFormData.principalAmount || issueFormData.principalAmount <= 0) {
      toast.error("Please enter a valid principal advance amount");
      return;
    }

    try {
      const selectedWorkerObj = workers.find((w) => w.workerId === issueFormData.workerId);
      const payload = {
        ...issueFormData,
        workerName: selectedWorkerObj
          ? selectedWorkerObj.fullName || `${selectedWorkerObj.firstName || ""} ${selectedWorkerObj.lastName || ""}`.trim()
          : issueFormData.workerId,
      };

      await loansApi.create(payload);
      toast.success("Salary advance issued successfully");
      setIssueModalOpen(false);
      setIssueFormData({
        workerId: "",
        loanType: "Salary Advance",
        principalAmount: 10000,
        tenureMonths: 2,
        reason: "",
        repaymentStartMonth: "April",
        repaymentStartYear: 2026,
      });
      loadLoans();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to issue advance");
    }
  };

  const handleOpenRepay = (loan) => {
    setSelectedLoan(loan);
    setRepayFormData({
      amount: loan.monthlyEmi || Math.min(loan.remainingBalance, 5000),
      paymentMethod: "Payroll Deduction",
      remarks: `Monthly EMI deduction for ${loan.workerName}`,
    });
    setRepayModalOpen(true);
  };

  const handleRepaySubmit = async (e) => {
    e.preventDefault();
    if (!repayFormData.amount || repayFormData.amount <= 0) {
      toast.error("Please enter a valid repayment amount");
      return;
    }

    try {
      await loansApi.recordRepayment(selectedLoan.loanId || selectedLoan._id, repayFormData);
      toast.success("Repayment installment recorded successfully");
      setRepayModalOpen(false);
      loadLoans();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record repayment");
    }
  };

  const getLoanTypeBadge = (type) => {
    switch (type) {
      case "Festival Advance":
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#FFF0B3] text-[#B9770E] dark:bg-[#B9770E]/20">
            Festival Advance
          </span>
        );
      case "Emergency Medical Advance":
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#FFEBE6] text-[#DE350B] dark:bg-[#DE350B]/20">
            Medical Emergency
          </span>
        );
      case "Equipment / Tool Advance":
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#EAE6FF] text-[#403294] dark:bg-[#403294]/20">
            Tool / Kit
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#DEEBFF] text-[#0052CC] dark:bg-[#DEEBFF]/20">
            Salary Advance
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#172B4D] dark:text-[#F1F5F9] tracking-tight flex items-center gap-2">
            <span>Worker Advances & Loans</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]">
              Salary Deductions
            </span>
          </h2>
          <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
            Issue salary advances to contractors, track monthly EMI installments, and reconcile payroll deductions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadLoans}
            className="bg-white dark:bg-[#151B26] hover:bg-[#EBECF0] dark:hover:bg-[#1E293B] text-[#172B4D] dark:text-[#F1F5F9] border border-[#DFE1E6] dark:border-[#263042] text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5"
            title="Refresh list"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIssueModalOpen(true)}
            className="bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={14} />
            <span>Issue Salary Advance</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiMetricCard
          title="Total Disbursed"
          value={`Rs ${Number(stats.totalDisbursed || 0).toLocaleString()}`}
          subtitle="Cumulative advances granted"
          icon={CreditCard}
        />
        <KpiMetricCard
          title="Active Outstanding"
          value={`Rs ${Number(stats.totalOutstanding || 0).toLocaleString()}`}
          subtitle="Pending recovery from payroll"
          icon={Clock}
        />
        <KpiMetricCard
          title="Total Recovered"
          value={`Rs ${Number(stats.totalRecovered || 0).toLocaleString()}`}
          subtitle={
            stats.totalDisbursed > 0
              ? `${Math.round((stats.totalRecovered / stats.totalDisbursed) * 100)}% recovery rate`
              : "0% recovery"
          }
          icon={CheckCircle2}
        />
        <KpiMetricCard
          title="Active Advances"
          value={stats.activeLoansCount || 0}
          subtitle={`${stats.fullyRepaidCount || 0} fully settled`}
          icon={Coins}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B778C] dark:text-[#94A3B8]"
          />
          <input
            type="text"
            placeholder="Search by worker name, worker ID, or ADV code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F4F5F7] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
          />
        </form>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#6B778C] dark:text-[#94A3B8]">
            Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-[#F4F5F7] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Fully Repaid">Fully Repaid</option>
            <option value="Pending Approval">Pending Approval</option>
          </select>
        </div>
      </div>

      {/* Advances Table */}
      <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F4F5F7] dark:bg-[#151B26] border-b border-[#DFE1E6] dark:border-[#263042] text-[#6B778C] dark:text-[#94A3B8] font-semibold">
                <th className="py-2.5 px-3">Advance ID & Date</th>
                <th className="py-2.5 px-3">Worker Details</th>
                <th className="py-2.5 px-3">Type & Reason</th>
                <th className="py-2.5 px-3 text-right">Principal</th>
                <th className="py-2.5 px-3 text-right">Monthly EMI</th>
                <th className="py-2.5 px-3">Recovery Progress</th>
                <th className="py-2.5 px-3 text-right font-bold text-[#DE350B]">Remaining Balance</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBECF0] dark:divide-[#263042]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-[#6B778C] dark:text-[#94A3B8]">
                    Loading worker advances ledger...
                  </td>
                </tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <Coins size={32} className="mx-auto text-[#6B778C] dark:text-[#94A3B8] opacity-50 mb-2" />
                    <p className="text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                      No advances or loans recorded
                    </p>
                    <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                      Click "+ Issue Salary Advance" to grant an advance to a contractor.
                    </p>
                  </td>
                </tr>
              ) : (
                loans.map((loan) => {
                  const principal = loan.principalAmount || 1;
                  const repaid = loan.totalRepaid || 0;
                  const percent = Math.min(100, Math.round((repaid / principal) * 100));
                  const isSettled = loan.remainingBalance <= 0 || loan.status === "Fully Repaid";
                  const isExpanded = expandedLoanId === loan.loanId;

                  return (
                    <React.Fragment key={loan.loanId || loan._id}>
                      <tr className="hover:bg-[#F4F5F7]/60 dark:hover:bg-[#151B26]/60 transition">
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-[#0052CC] dark:text-[#579DFF]">
                            {loan.loanId}
                          </div>
                          <div className="text-[10px] text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                            {new Date(loan.disbursedDate || loan.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                            {loan.workerName}
                          </div>
                          <div className="text-[10px] font-mono text-[#6B778C] dark:text-[#94A3B8]">
                            {loan.workerId}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div>{getLoanTypeBadge(loan.loanType)}</div>
                          {loan.reason && (
                            <div className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-1 max-w-xs truncate" title={loan.reason}>
                              {loan.reason}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                          Rs {Number(loan.principalAmount).toLocaleString()}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                            Rs {Number(loan.monthlyEmi).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-[#6B778C]">
                            {loan.tenureMonths} mo
                          </div>
                        </td>

                        <td className="py-3 px-3 min-w-[130px]">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-medium text-[#172B4D] dark:text-[#F1F5F9]">
                              Rs {Number(repaid).toLocaleString()}
                            </span>
                            <span className="text-[#6B778C]">{percent}%</span>
                          </div>
                          <div className="w-full bg-[#EBECF0] dark:bg-[#263042] h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isSettled ? "bg-[#00875A]" : "bg-[#0052CC]"
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          {loan.repaymentHistory?.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setExpandedLoanId(isExpanded ? null : loan.loanId)}
                              className="text-[10px] font-semibold text-[#0052CC] dark:text-[#579DFF] hover:underline flex items-center gap-0.5 mt-1 cursor-pointer"
                            >
                              <span>{loan.repaymentHistory.length} payment(s)</span>
                              <ChevronRight size={10} className={`transform transition ${isExpanded ? "rotate-90" : ""}`} />
                            </button>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right font-bold text-xs">
                          {isSettled ? (
                            <span className="text-[#00875A]">Rs 0 (Settled)</span>
                          ) : (
                            <span className="text-[#DE350B]">
                              Rs {Number(loan.remainingBalance).toLocaleString()}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <StatusLozenge status={loan.status} />
                        </td>

                        <td className="py-3 px-3 text-right">
                          {!isSettled && (
                            <button
                              type="button"
                              onClick={() => handleOpenRepay(loan)}
                              className="bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-[11px] font-semibold px-2.5 py-1 rounded transition cursor-pointer flex items-center gap-1 ml-auto shadow-xs"
                            >
                              <Plus size={11} />
                              <span>Record EMI</span>
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Repayment History Dropdown Row */}
                      {isExpanded && loan.repaymentHistory?.length > 0 && (
                        <tr className="bg-[#FAFBFC] dark:bg-[#151B26]/40 border-b border-[#EBECF0] dark:border-[#263042]">
                          <td colSpan={9} className="py-2.5 px-6">
                            <div className="text-[11px] font-bold text-[#6B778C] dark:text-[#94A3B8] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                              <History size={12} />
                              <span>Repayment Installments Log:</span>
                            </div>
                            <div className="space-y-1">
                              {loan.repaymentHistory.map((rep, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-xs py-1 px-2.5 rounded bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042]"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] text-[#6B778C]">
                                      {new Date(rep.date).toLocaleDateString()}
                                    </span>
                                    <span className="font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                                      Rs {Number(rep.amount).toLocaleString()}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EBECF0] text-[#42526E]">
                                      {rep.paymentMethod}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
                                    {rep.remarks || "Installment"}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Issue Salary Advance */}
      {issueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#F4F5F7] dark:bg-[#151B26]">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-[#0052CC] dark:text-[#579DFF]" />
                <h3 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                  Issue Worker Salary Advance
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIssueModalOpen(false)}
                className="text-[#6B778C] hover:text-[#172B4D] p-1 rounded cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Contractor / Worker *
                </label>
                <select
                  value={issueFormData.workerId}
                  onChange={(e) => setIssueFormData({ ...issueFormData, workerId: e.target.value })}
                  required
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                >
                  <option value="">Select contractor</option>
                  {workers.map((w) => (
                    <option key={w.workerId} value={w.workerId}>
                      {w.fullName || `${w.firstName || ""} ${w.lastName || ""}`.trim()} ({w.workerId}) — Base: Rs {Number(w.monthlyBasePay || w.wagePerDayOrMonth || 20000).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                    Advance Type
                  </label>
                  <select
                    value={issueFormData.loanType}
                    onChange={(e) => setIssueFormData({ ...issueFormData, loanType: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                  >
                    <option value="Salary Advance">Salary Advance (Standard)</option>
                    <option value="Festival Advance">Festival Advance</option>
                    <option value="Emergency Medical Advance">Medical Emergency Advance</option>
                    <option value="Equipment / Tool Advance">Tool / Safety Kit Advance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                    Advance Amount (INR) *
                  </label>
                  <input
                    type="number"
                    min="500"
                    max="100000"
                    step="500"
                    required
                    value={issueFormData.principalAmount}
                    onChange={(e) => setIssueFormData({ ...issueFormData, principalAmount: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                    Tenure (Monthly Installments)
                  </label>
                  <select
                    value={issueFormData.tenureMonths}
                    onChange={(e) => setIssueFormData({ ...issueFormData, tenureMonths: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                  >
                    <option value="1">1 Month (Lump sum recovery)</option>
                    <option value="2">2 Months (50% each)</option>
                    <option value="3">3 Months</option>
                    <option value="4">4 Months</option>
                    <option value="6">6 Months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                    Calculated Monthly EMI
                  </label>
                  <div className="w-full text-xs px-2.5 py-1.5 bg-[#F4F5F7] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#0052CC] dark:text-[#579DFF] font-bold">
                    Rs {Math.round(Number(issueFormData.principalAmount || 0) / Math.max(1, Number(issueFormData.tenureMonths || 1))).toLocaleString()} / month
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Reason / Purpose
                </label>
                <input
                  type="text"
                  value={issueFormData.reason}
                  onChange={(e) => setIssueFormData({ ...issueFormData, reason: e.target.value })}
                  placeholder="e.g. Medical emergency, family support, house repair"
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                />
              </div>

              <div className="pt-2 border-t border-[#DFE1E6] dark:border-[#263042] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIssueModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9] hover:bg-[#EBECF0] rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold px-4 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Disburse Advance</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Repayment Installment */}
      {repayModalOpen && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#F4F5F7] dark:bg-[#151B26]">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-[#00875A]" />
                <div>
                  <h3 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                    Record Advance Repayment
                  </h3>
                  <p className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
                    {selectedLoan.workerName} &bull; {selectedLoan.loanId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRepayModalOpen(false)}
                className="text-[#6B778C] hover:text-[#172B4D] p-1 rounded cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRepaySubmit} className="p-5 space-y-3.5">
              <div className="p-3 rounded bg-[#DEEBFF]/30 dark:bg-[#1C2331] border border-[#B3D4FF] dark:border-[#263042] flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-[#6B778C]">Outstanding Balance:</div>
                  <div className="font-bold text-[#DE350B] text-sm">
                    Rs {Number(selectedLoan.remainingBalance).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#6B778C]">Monthly EMI:</div>
                  <div className="font-bold text-[#0052CC] dark:text-[#579DFF]">
                    Rs {Number(selectedLoan.monthlyEmi).toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Repayment Amount (INR) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedLoan.remainingBalance}
                  required
                  value={repayFormData.amount}
                  onChange={(e) => setRepayFormData({ ...repayFormData, amount: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Payment Method
                </label>
                <select
                  value={repayFormData.paymentMethod}
                  onChange={(e) => setRepayFormData({ ...repayFormData, paymentMethod: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                >
                  <option value="Payroll Deduction">Payroll Monthly Deduction</option>
                  <option value="Bank Transfer">Direct Bank Transfer / UPI</option>
                  <option value="Cash">Cash Deposit</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Remarks / Voucher Note
                </label>
                <input
                  type="text"
                  value={repayFormData.remarks}
                  onChange={(e) => setRepayFormData({ ...repayFormData, remarks: e.target.value })}
                  placeholder="e.g. Monthly salary deduction or cash installment"
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
                />
              </div>

              <div className="pt-2 border-t border-[#DFE1E6] dark:border-[#263042] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRepayModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9] hover:bg-[#EBECF0] rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00875A] hover:bg-[#006644] text-white text-xs font-semibold px-4 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>Confirm Repayment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
