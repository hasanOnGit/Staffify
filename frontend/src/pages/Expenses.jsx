import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  getExpenses,
  getExpenseSummary,
  approveExpenseManager,
  approveExpenseFinance,
  rejectExpense,
} from "../services/expense";
import ExpenseModal from "../components/ExpenseModal";
import ReceiptLightboxModal from "../components/ReceiptLightboxModal";
import toast from "react-hot-toast";
import {
  Receipt,
  Plus,
  CheckCircle2,
  Clock,
  Check,
  X,
  CreditCard,
  Building2,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Tag,
  Calendar,
  User,
  ShieldCheck,
  Search,
  Filter,
  Eye,
} from "lucide-react";

const POLICY_LIMITS = [
  {
    category: "Internet & Mobile",
    annualLimit: 24000,
    monthlyLimit: 2000,
    taxExempt: "100% Tax Exempt",
    description: "Broadband fiber connection & official mobile postpaid bill reimbursement for remote / hybrid work.",
  },
  {
    category: "Travel & Fuel",
    annualLimit: 60000,
    monthlyLimit: 5000,
    taxExempt: "Tax Exempt on Actuals",
    description: "Official client visits, local transport, conveyance, and inter-city business travel expenses.",
  },
  {
    category: "Training & Certifications",
    annualLimit: 50000,
    monthlyLimit: null,
    taxExempt: "Corporate Skill Development",
    description: "Professional IT certifications (AWS, Azure, GCP, PMP, Scrums) & approved industry masterclasses.",
  },
  {
    category: "Books & Periodicals",
    annualLimit: 12000,
    monthlyLimit: 1000,
    taxExempt: "Section 10(14) Exempt",
    description: "Technical literature, industry publications, research subscriptions, and domain books.",
  },
  {
    category: "Medical & Health",
    annualLimit: 15000,
    monthlyLimit: null,
    taxExempt: "Exempt up to ₹15,000",
    description: "Outpatient consultations, routine diagnostic tests, and prescribed pharmaceutical expenses.",
  },
  {
    category: "Food & Dining",
    annualLimit: 36000,
    monthlyLimit: 3000,
    taxExempt: "Meal Allowance Rules",
    description: "Team working lunches, overtime dinners, and project celebration allowances.",
  },
];

function Expenses() {
  const { user, isAdmin, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState("my_claims"); // "my_claims", "approvals", "policies"
  const [claims, setClaims] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [rejectingClaim, setRejectingClaim] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [viewingReceiptClaim, setViewingReceiptClaim] = useState(null);

  const formatCurrency = (val = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [claimsRes, summaryRes] = await Promise.all([
        getExpenses(),
        getExpenseSummary(),
      ]);
      if (claimsRes.success) setClaims(claimsRes.data || []);
      if (summaryRes.success) setSummary(summaryRes.data || null);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManagerApprove = async (claimId) => {
    try {
      setActionLoading(true);
      const res = await approveExpenseManager(claimId, {
        approvedBy: user?.name || "Manager User",
        remarks: "Approved after verifying receipt details.",
      });
      if (res.success) {
        toast.success("Claim approved by Manager");
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Approval failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinanceApprove = async (claimId) => {
    try {
      setActionLoading(true);
      const res = await approveExpenseFinance(claimId, {
        approvedBy: user?.name || "Finance Admin",
        remarks: "Approved for upcoming payroll credit.",
        paymentMode: "Payroll Credit",
        paymentRef: `PAYROLL-${new Date().toLocaleString("en-US", { month: "short" }).toUpperCase()}-${new Date().getFullYear()}`,
      });
      if (res.success) {
        toast.success("Claim verified & approved for Payroll Payout");
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Finance approval failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error("Please state rejection reason");
      return;
    }
    try {
      setActionLoading(true);
      const res = await rejectExpense(rejectingClaim._id || rejectingClaim.claimId, {
        rejectionReason: rejectionReason.trim(),
      });
      if (res.success) {
        toast.success("Expense claim marked as Rejected");
        setRejectingClaim(null);
        setRejectionReason("");
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Rejection failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered views
  const myClaims = useMemo(() => {
    const empId = user?.employeeId || user?.userId;
    return claims.filter((c) => {
      const matchEmp = isAdmin ? true : c.employeeId === empId;
      const matchCat = categoryFilter === "All" || c.expenseCategory === categoryFilter;
      const matchSearch =
        !searchQuery ||
        c.claimId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.merchantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchEmp && matchCat && matchSearch;
    });
  }, [claims, user, isAdmin, categoryFilter, searchQuery]);

  const pendingApprovals = useMemo(() => {
    return claims.filter((c) => {
      if (isManager && !isAdmin) {
        return c.status === "Submitted";
      }
      return c.status === "Submitted" || c.status === "Manager_Approved";
    });
  }, [claims, isManager, isAdmin]);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]">
                <Receipt size={18} />
              </span>
              <h1 className="text-xl font-bold text-[#172B4D]">
                Reimbursements & Expense Claims (FBP)
              </h1>
            </div>
            <p className="text-xs text-[#6B778C] mt-1">
              Multi-tier approval workflow, digital receipt verification, and automated payroll credit integration.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <Plus size={14} />
            <span>New Expense Claim</span>
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider block">
              Total Claims Submitted
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold text-[#172B4D]">
                {formatCurrency(summary?.totalAmount || 0)}
              </span>
              <span className="text-xs font-semibold text-[#0052CC] bg-[#DEEBFF] px-2 py-0.5 rounded-full border border-[#B3D4FF]">
                {summary?.totalClaims || 0} Claims
              </span>
            </div>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider block">
              Approved for Payout
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold text-[#006644]">
                {formatCurrency(summary?.approvedAmount || 0)}
              </span>
              <span className="text-xs font-semibold text-[#006644] bg-[#E3FCEF] px-2 py-0.5 rounded-full border border-[#ABF5D1]">
                {summary?.statusCounts?.Finance_Approved || 0} Settled
              </span>
            </div>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider block">
              Pending Review
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold text-[#FF991F]">
                {formatCurrency(summary?.pendingAmount || 0)}
              </span>
              <span className="text-xs font-semibold text-[#172B4D] bg-[#FFF0B3] px-2 py-0.5 rounded-full border border-[#FFE380]">
                {pendingApprovals.length} In Queue
              </span>
            </div>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider block">
              Payout Route
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-[#0052CC]">
              <CreditCard size={14} />
              <span>Payroll Credit / Bank NEFT</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#DFE1E6] pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("my_claims")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "my_claims"
                ? "border-[#0052CC] text-[#0052CC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <Receipt size={14} />
            <span>{isAdmin ? "All Employee Claims" : "My Claims"}</span>
            <span className="text-[10px] bg-[#F4F5F7] text-[#42526E] px-1.5 py-0.2 rounded-full font-mono">
              {myClaims.length}
            </span>
          </button>

          {(isAdmin || isManager) && (
            <button
              type="button"
              onClick={() => setActiveTab("approvals")}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                activeTab === "approvals"
                  ? "border-[#0052CC] text-[#0052CC]"
                  : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
              }`}
            >
              <CheckCircle2 size={14} />
              <span>Approvals Tray</span>
              {pendingApprovals.length > 0 && (
                <span className="text-[10px] bg-[#FFEBE6] text-[#DE350B] border border-[#FFBDAD] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {pendingApprovals.length}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("policies")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "policies"
                ? "border-[#0052CC] text-[#0052CC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <FileText size={14} />
            <span>Category Limits & Policies</span>
          </button>
        </div>

        {/* TAB 1: MY CLAIMS */}
        {activeTab === "my_claims" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white border border-[#DFE1E6] rounded-xl p-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B778C]" />
                <input
                  type="text"
                  placeholder="Search merchant, claim ID, remarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-[#DFE1E6] rounded-lg focus:outline-none focus:border-[#0052CC] bg-[#FAFBFC]"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#6B778C] font-medium">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-[#DFE1E6] rounded-lg focus:outline-none focus:border-[#0052CC] bg-[#FAFBFC]"
                >
                  <option value="All">All Categories</option>
                  <option value="Internet & Mobile">Internet & Mobile</option>
                  <option value="Travel & Fuel">Travel & Fuel</option>
                  <option value="Training & Certifications">Training & Certifications</option>
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Books & Periodicals">Books & Periodicals</option>
                  <option value="Medical & Health">Medical & Health</option>
                </select>
              </div>
            </div>

            {/* Claims Table */}
            <div className="bg-white border border-[#DFE1E6] rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F5F7] text-[#42526E] uppercase text-[10px] font-bold border-b border-[#DFE1E6]">
                  <tr>
                    <th className="px-4 py-3">Claim ID / Date</th>
                    {isAdmin && <th className="px-4 py-3">Claimant</th>}
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Merchant / Receipt</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Approval History</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1E6]">
                  {myClaims.length > 0 ? (
                    myClaims.map((claim) => (
                      <tr key={claim._id || claim.claimId} className="hover:bg-[#FAFBFC] transition">
                        <td className="px-4 py-3">
                          <p className="font-bold text-[#172B4D] font-mono">{claim.claimId}</p>
                          <p className="text-[10px] text-[#6B778C] mt-0.5">
                            {new Date(claim.claimDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </td>

                        {isAdmin && (
                          <td className="px-4 py-3">
                            <p className="font-semibold text-[#172B4D]">{claim.employeeName}</p>
                            <p className="text-[10px] text-[#6B778C]">{claim.employeeId}</p>
                          </td>
                        )}

                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]">
                            {claim.expenseCategory}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-medium text-[#172B4D]">{claim.merchantName}</p>
                          <button
                            type="button"
                            onClick={() => setViewingReceiptClaim(claim)}
                            title="Click to view digital receipt in lightbox"
                            className="text-[10px] text-[#0052CC] hover:underline flex items-center gap-1 mt-0.5 font-medium cursor-pointer"
                          >
                            <Eye size={11} className="text-[#0052CC]" />
                            <span>{claim.receiptNumber || claim.attachmentName || "View Receipt"}</span>
                          </button>
                        </td>

                        <td className="px-4 py-3 text-right font-bold text-[#172B4D]">
                          {formatCurrency(claim.amount)}
                        </td>

                        <td className="px-4 py-3">
                          {claim.status === "Finance_Approved" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]">
                              <CheckCircle2 size={11} />
                              <span>Finance Settled</span>
                            </span>
                          ) : claim.status === "Manager_Approved" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]">
                              <Clock size={11} />
                              <span>Manager Approved</span>
                            </span>
                          ) : claim.status === "Rejected" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFEBE6] text-[#DE350B] border border-[#FFBDAD]">
                              <X size={11} />
                              <span>Rejected</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFF0B3] text-[#172B4D] border border-[#FFE380]">
                              <Clock size={11} />
                              <span>Submitted</span>
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-[11px] text-[#6B778C]">
                          {claim.financeApproval?.approvedBy ? (
                            <div>
                              <span className="font-semibold text-[#006644]">Payroll Credit</span>
                              <span className="block text-[10px]">by {claim.financeApproval.approvedBy}</span>
                            </div>
                          ) : claim.managerApproval?.approvedBy ? (
                            <div>
                              <span className="font-semibold text-[#0052CC]">Manager Verified</span>
                              <span className="block text-[10px]">by {claim.managerApproval.approvedBy}</span>
                            </div>
                          ) : claim.rejectionReason ? (
                            <span className="text-[#DE350B] italic text-[10px]">
                              Reason: {claim.rejectionReason}
                            </span>
                          ) : (
                            <span className="text-[#6B778C]">Awaiting manager signoff</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isAdmin ? 7 : 6} className="py-12 text-center text-xs text-[#6B778C]">
                        No reimbursement claims found. Click "+ New Expense Claim" to submit your receipts.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: APPROVALS TRAY */}
        {activeTab === "approvals" && (
          <div className="space-y-4">
            <div className="bg-[#DEEBFF]/30 border border-[#B3D4FF] rounded-xl p-4 flex items-center justify-between text-xs text-[#0747A6]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#0052CC]" />
                <span className="font-medium">
                  Review submitted bills, invoices, and approve for next stage or direct payroll settlement.
                </span>
              </div>
              <span className="font-bold bg-white px-2.5 py-1 rounded-md border border-[#B3D4FF]">
                {pendingApprovals.length} Pending Actions
              </span>
            </div>

            <div className="bg-white border border-[#DFE1E6] rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F5F7] text-[#42526E] uppercase text-[10px] font-bold border-b border-[#DFE1E6]">
                  <tr>
                    <th className="px-4 py-3">Claim ID</th>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Merchant & Purpose</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Current State</th>
                    <th className="px-4 py-3 text-right">Decisions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1E6]">
                  {pendingApprovals.length > 0 ? (
                    pendingApprovals.map((claim) => (
                      <tr key={claim._id || claim.claimId} className="hover:bg-[#FAFBFC] transition">
                        <td className="px-4 py-3 font-mono font-bold text-[#172B4D]">
                          {claim.claimId}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#172B4D]">{claim.employeeName}</p>
                          <p className="text-[10px] text-[#6B778C]">{claim.department} • {claim.employeeId}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]">
                            {claim.expenseCategory}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <p className="font-medium text-[#172B4D]">{claim.merchantName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <button
                              type="button"
                              onClick={() => setViewingReceiptClaim(claim)}
                              title="Click to view digital receipt in lightbox"
                              className="text-[10px] text-[#0052CC] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                            >
                              <Eye size={11} className="text-[#0052CC]" />
                              <span>{claim.receiptNumber || claim.attachmentName || "View Receipt"}</span>
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-sm text-[#172B4D]">
                          {formatCurrency(claim.amount)}
                        </td>
                        <td className="px-4 py-3">
                          {claim.status === "Submitted" ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFF0B3] text-[#172B4D] border border-[#FFE380]">
                              Manager Signoff Pending
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]">
                              Finance Disbursement Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {claim.status === "Submitted" && (
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleManagerApprove(claim._id || claim.claimId)}
                                className="px-2.5 py-1 bg-[#0052CC] hover:bg-[#0747A6] text-white text-[11px] font-semibold rounded-md transition cursor-pointer flex items-center gap-1"
                              >
                                <Check size={12} />
                                <span>Approve (Mgr)</span>
                              </button>
                            )}

                            {isAdmin && (
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleFinanceApprove(claim._id || claim.claimId)}
                                className="px-2.5 py-1 bg-[#00875A] hover:bg-[#006644] text-white text-[11px] font-semibold rounded-md transition cursor-pointer flex items-center gap-1"
                              >
                                <CreditCard size={12} />
                                <span>Disburse (Payroll)</span>
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => {
                                setRejectingClaim(claim);
                                setRejectionReason("");
                              }}
                              className="px-2 py-1 text-[#DE350B] hover:bg-[#FFEBE6] border border-[#FFBDAD] text-[11px] font-semibold rounded-md transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-[#6B778C]">
                        All employee expense claims have been processed. The approval tray is clear.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORY LIMITS & POLICIES */}
        {activeTab === "policies" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {POLICY_LIMITS.map((policy) => (
              <div
                key={policy.category}
                className="bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-[#172B4D]">{policy.category}</h3>
                    <span className="text-[10px] font-semibold text-[#006644] bg-[#E3FCEF] px-2 py-0.5 rounded border border-[#ABF5D1] inline-block mt-1">
                      {policy.taxExempt}
                    </span>
                  </div>
                  <Tag size={16} className="text-[#0052CC]" />
                </div>

                <p className="text-xs text-[#6B778C] leading-relaxed">{policy.description}</p>

                <div className="pt-2 border-t border-[#F4F5F7] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#6B778C] block uppercase font-bold">Annual Limit</span>
                    <span className="font-bold text-[#172B4D]">{formatCurrency(policy.annualLimit)}</span>
                  </div>
                  {policy.monthlyLimit && (
                    <div className="text-right">
                      <span className="text-[10px] text-[#6B778C] block uppercase font-bold">Monthly Cap</span>
                      <span className="font-bold text-[#0052CC]">{formatCurrency(policy.monthlyLimit)}/mo</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        <ExpenseModal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          onSuccess={loadData}
        />

        {/* Rejection Modal */}
        {rejectingClaim && (
          <div className="fixed inset-0 z-50 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-[#DFE1E6] max-w-sm w-full p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#172B4D]">Reject Expense Claim</h3>
                <button
                  type="button"
                  onClick={() => setRejectingClaim(null)}
                  className="text-[#6B778C] hover:text-[#172B4D]"
                >
                  <X size={15} />
                </button>
              </div>

              <p className="text-xs text-[#6B778C]">
                Provide an audit justification for rejecting Claim #{rejectingClaim.claimId} ({formatCurrency(rejectingClaim.amount)}).
              </p>

              <form onSubmit={handleRejectConfirm} className="space-y-3">
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Ineligible merchant receipt, missing tax breakdown, exceeds monthly cap..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full text-xs p-2.5 border border-[#DFE1E6] rounded-lg focus:outline-none focus:border-[#DE350B]"
                />

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setRejectingClaim(null)}
                    className="px-3 py-1.5 border border-[#DFE1E6] rounded-lg text-xs font-semibold text-[#42526E]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-1.5 bg-[#DE350B] hover:bg-[#BF2600] text-white text-xs font-semibold rounded-lg transition"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Digital Receipt Lightbox Modal */}
        <ReceiptLightboxModal
          isOpen={!!viewingReceiptClaim}
          claim={viewingReceiptClaim}
          onClose={() => setViewingReceiptClaim(null)}
        />
      </div>
    </DashboardLayout>
  );
}

export default Expenses;
