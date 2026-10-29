import React, { useState, useEffect } from "react";
import {
  LogOut,
  Plus,
  Search,
  RefreshCw,
  User,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  FileText,
  DollarSign,
  ChevronRight,
  X,
  ShieldCheck,
  Check,
  Building2,
  MapPin,
  Calendar,
} from "lucide-react";
import KpiMetricCard from "../components/KpiMetricCard";
import StatusLozenge from "../components/StatusLozenge";
import { settlementsApi, workersApi, loansApi } from "../services/api";
import { useWorkspace } from "../context/WorkspaceContext";
import toast from "react-hot-toast";

export default function Settlements() {
  const { isAgencyWorkspace, activeVendorId } = useWorkspace();
  const [settlements, setSettlements] = useState([]);
  const [stats, setStats] = useState({
    pendingClearances: 0,
    readyForPayment: 0,
    settledCount: 0,
    totalPaidOut: 0,
    pendingAmount: 0,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Workers for dropdown
  const [workers, setWorkers] = useState([]);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [clearanceModalOpen, setClearanceModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [statementModalOpen, setStatementModalOpen] = useState(false);
  const [activeSettlement, setActiveSettlement] = useState(null);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    workerId: "",
    lastWorkingDate: new Date().toISOString().slice(0, 10),
    exitReason: "Tour Completed",
    daysWorkedInExitMonth: 15,
    leaveEncashmentPay: 0,
    bonusOrIncentive: 0,
    unreturnedAssetDeduction: 0,
    otherDeductions: 0,
    notes: "",
  });
  const [selectedWorkerData, setSelectedWorkerData] = useState(null);
  const [workerActiveLoans, setWorkerActiveLoans] = useState([]);

  // Clearance Form State
  const [clearanceForm, setClearanceForm] = useState({
    idCardReturned: false,
    uniformReturned: false,
    toolsEquipmentReturned: false,
    siteSupervisorApproved: false,
    remarks: "",
  });

  // Payment Form State
  const [payForm, setPayForm] = useState({
    paymentMode: "Direct Bank Transfer",
    transactionRef: "",
    notes: "",
  });

  useEffect(() => {
    loadSettlements();
    loadWorkers();
  }, [statusFilter, activeVendorId]);

  const loadSettlements = async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
      };
      const res = await settlementsApi.getAll(params);
      setSettlements(res.data?.data || []);
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      toast.error("Failed to load settlements: " + (err.response?.data?.message || err.message));
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
    loadSettlements();
  };

  // Handle worker selection in Create modal to auto-calculate rate and fetch active advances
  const handleWorkerChange = async (workerId) => {
    const worker = workers.find((w) => w.workerId === workerId);
    setSelectedWorkerData(worker || null);
    setCreateForm((prev) => ({ ...prev, workerId }));

    if (workerId) {
      try {
        const resLoans = await loansApi.getAll({ workerId });
        const active = (resLoans.data?.data || []).filter((l) => l.status === "Active");
        setWorkerActiveLoans(active);
      } catch (err) {
        setWorkerActiveLoans([]);
      }
    } else {
      setWorkerActiveLoans([]);
    }
  };

  // Create Modal Live Calculations
  const calculatedDailyRate = selectedWorkerData
    ? selectedWorkerData.billingUnit === "Daily"
      ? selectedWorkerData.wagePerDayOrMonth || 650
      : Math.round((selectedWorkerData.wagePerDayOrMonth || 16000) / 26)
    : 650;

  const earnedWagesPreview = Math.round(
    (Number(createForm.daysWorkedInExitMonth) || 0) * calculatedDailyRate
  );

  const outstandingAdvanceSum = workerActiveLoans.reduce(
    (sum, l) => sum + (l.remainingBalance || 0),
    0
  );

  const totalEarningsPreview =
    earnedWagesPreview +
    (Number(createForm.leaveEncashmentPay) || 0) +
    (Number(createForm.bonusOrIncentive) || 0);

  const totalDeductionsPreview =
    outstandingAdvanceSum +
    (Number(createForm.unreturnedAssetDeduction) || 0) +
    (Number(createForm.otherDeductions) || 0);

  const netPayoutPreview = Math.max(0, totalEarningsPreview - totalDeductionsPreview);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.workerId) {
      toast.error("Please select a worker to record exit");
      return;
    }

    try {
      const payload = {
        workerId: createForm.workerId,
        lastWorkingDate: createForm.lastWorkingDate,
        exitReason: createForm.exitReason,
        daysWorkedInExitMonth: Number(createForm.daysWorkedInExitMonth) || 0,
        leaveEncashmentPay: Number(createForm.leaveEncashmentPay) || 0,
        bonusOrIncentive: Number(createForm.bonusOrIncentive) || 0,
        unreturnedAssetDeduction: Number(createForm.unreturnedAssetDeduction) || 0,
        otherDeductions: Number(createForm.otherDeductions) || 0,
        notes: createForm.notes,
      };

      const res = await settlementsApi.create(payload);
      toast.success(res.data?.message || "Worker exit recorded successfully");
      setCreateModalOpen(false);
      resetCreateForm();
      loadSettlements();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create exit record");
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      workerId: "",
      lastWorkingDate: new Date().toISOString().slice(0, 10),
      exitReason: "Tour Completed",
      daysWorkedInExitMonth: 15,
      leaveEncashmentPay: 0,
      bonusOrIncentive: 0,
      unreturnedAssetDeduction: 0,
      otherDeductions: 0,
      notes: "",
    });
    setSelectedWorkerData(null);
    setWorkerActiveLoans([]);
  };

  // Open Clearance Modal
  const openClearanceModal = (item) => {
    setActiveSettlement(item);
    setClearanceForm({
      idCardReturned: item.clearances?.idCardReturned || false,
      uniformReturned: item.clearances?.uniformReturned || false,
      toolsEquipmentReturned: item.clearances?.toolsEquipmentReturned || false,
      siteSupervisorApproved: item.clearances?.siteSupervisorApproved || false,
      remarks: item.clearances?.remarks || "",
    });
    setClearanceModalOpen(true);
  };

  const handleClearanceSubmit = async (e) => {
    e.preventDefault();
    if (!activeSettlement) return;

    try {
      const res = await settlementsApi.updateClearance(
        activeSettlement.settlementId,
        clearanceForm
      );
      toast.success(res.data?.message || "Clearance checklist updated");
      setClearanceModalOpen(false);
      loadSettlements();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update clearances");
    }
  };

  // Open Pay Modal
  const openPayModal = (item) => {
    setActiveSettlement(item);
    setPayForm({
      paymentMode: "Direct Bank Transfer",
      transactionRef: `NEFT-${Date.now().toString().slice(-8)}`,
      notes: "Final payout disbursed to worker account.",
    });
    setPayModalOpen(true);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!activeSettlement) return;

    try {
      const res = await settlementsApi.disbursePayment(
        activeSettlement.settlementId,
        payForm
      );
      toast.success(res.data?.message || "Final payout recorded and disbursed");
      setPayModalOpen(false);
      loadSettlements();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to disburse payout");
    }
  };

  // Open Statement Voucher Modal
  const openStatementModal = async (item) => {
    try {
      const res = await settlementsApi.getById(item.settlementId);
      setActiveSettlement(res.data?.data || item);
      setStatementModalOpen(true);
    } catch (err) {
      setActiveSettlement(item);
      setStatementModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#172B4D] dark:text-[#F1F5F9] tracking-tight">
              Worker Exits & Final Payouts
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#DEEBFF] text-[#0052CC] dark:bg-[#1C2331] dark:text-[#579DFF]">
              Module 13
            </span>
          </div>
          <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-1">
            Track site returns, auto-deduct outstanding advances, and disburse final take-home pay.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadSettlements}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-[#DFE1E6] dark:border-[#263042] text-[#42526E] dark:text-[#94A3B8] bg-white dark:bg-[#151B26] hover:bg-[#F4F5F7] dark:hover:bg-[#1C2331] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded text-white bg-[#0052CC] hover:bg-[#0747A6] shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record Worker Exit</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiMetricCard
          title="Pending Clearances"
          value={stats.pendingClearances}
          subtitle="Awaiting equipment & site sign-off"
          icon={Clock}
          color="amber"
        />
        <KpiMetricCard
          title="Ready for Payment"
          value={stats.readyForPayment}
          subtitle={`₹${stats.pendingAmount.toLocaleString()} pending disbursal`}
          icon={CheckCircle2}
          color="blue"
        />
        <KpiMetricCard
          title="Final Payouts Disbursed"
          value={`₹${stats.totalPaidOut.toLocaleString()}`}
          subtitle={`${stats.settledCount} exits fully settled`}
          icon={DollarSign}
          color="emerald"
        />
        <KpiMetricCard
          title="Total Exit Records"
          value={stats.totalCount}
          subtitle="Clearance & settlement registry"
          icon={LogOut}
          color="indigo"
        />
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#0F131C] p-3 rounded-lg border border-[#DFE1E6] dark:border-[#263042]">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-medium text-[#6B778C] dark:text-[#94A3B8] mr-1">
            Status:
          </span>
          {["All", "Clearance In Progress", "Ready for Payment", "Settled & Paid"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? "bg-[#0052CC] text-white"
                  : "bg-[#F4F5F7] dark:bg-[#151B26] text-[#42526E] dark:text-[#94A3B8] hover:bg-[#EBECF0] dark:hover:bg-[#1C2331]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 md:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B778C] dark:text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search ID, worker, client or site..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-[#172B4D] dark:text-[#F1F5F9] focus:outline-none focus:border-[#0052CC]"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-medium rounded bg-[#0052CC] text-white hover:bg-[#0747A6] transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Exits Registry Table */}
      <div className="bg-white dark:bg-[#0F131C] rounded-lg border border-[#DFE1E6] dark:border-[#263042] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-[#6B778C] dark:text-[#94A3B8] font-semibold">
                <th className="py-3 px-3.5">Exit ID & Worker</th>
                <th className="py-3 px-3.5">Client & Work Site</th>
                <th className="py-3 px-3.5">Exit Date & Reason</th>
                <th className="py-3 px-3.5">Site Clearances (4 Items)</th>
                <th className="py-3 px-3.5">Earnings & Advance Deductions</th>
                <th className="py-3 px-3.5 text-right">Take-Home Payout</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE1E6] dark:divide-[#263042] text-[#172B4D] dark:text-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#6B778C] dark:text-[#94A3B8]">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#0052CC]" />
                      <span>Loading worker exits & final settlements...</span>
                    </div>
                  </td>
                </tr>
              ) : settlements.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#6B778C] dark:text-[#94A3B8]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <LogOut className="w-8 h-8 text-[#94A3B8] opacity-50" />
                      <p className="font-medium">No worker exit records found.</p>
                      <button
                        onClick={() => setCreateModalOpen(true)}
                        className="mt-1 text-xs text-[#0052CC] dark:text-[#579DFF] hover:underline"
                      >
                        Record a worker exit now
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                settlements.map((item) => {
                  const clearancesCount = [
                    item.clearances?.idCardReturned,
                    item.clearances?.uniformReturned,
                    item.clearances?.toolsEquipmentReturned,
                    item.clearances?.siteSupervisorApproved,
                  ].filter(Boolean).length;

                  return (
                    <tr
                      key={item.settlementId}
                      className="hover:bg-[#FAFBFC] dark:hover:bg-[#151B26]/60 transition-colors"
                    >
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-[#0052CC] dark:text-[#579DFF]">
                          {item.settlementId}
                        </div>
                        <div className="font-medium text-[#172B4D] dark:text-[#F1F5F9] mt-0.5">
                          {item.workerName}
                        </div>
                        <div className="text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
                          ID: {item.workerId}
                        </div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-medium text-[#172B4D] dark:text-[#F1F5F9]">
                          {item.clientName || "Direct / Bench"}
                        </div>
                        <div className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#6B778C]" />
                          <span>{item.siteName || "Headquarters"}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="text-[11px] text-[#172B4D] dark:text-[#F1F5F9] font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#6B778C]" />
                          <span>
                            {item.lastWorkingDate
                              ? new Date(item.lastWorkingDate).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </span>
                        </div>
                        <div className="text-[10px] px-1.5 py-0.5 rounded bg-[#F4F5F7] dark:bg-[#1C2331] text-[#42526E] dark:text-[#94A3B8] inline-block mt-1 font-medium">
                          {item.exitReason}
                        </div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                clearancesCount === 4
                                  ? "bg-[#E3FCEF] text-[#00875A]"
                                  : "bg-[#FFF0B3] text-[#B9770E]"
                              }`}
                            >
                              {clearancesCount} of 4 Cleared
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
                            <span
                              title="ID Card"
                              className={`w-2 h-2 rounded-full ${
                                item.clearances?.idCardReturned ? "bg-[#00875A]" : "bg-[#DFE1E6]"
                              }`}
                            />
                            <span
                              title="Uniform"
                              className={`w-2 h-2 rounded-full ${
                                item.clearances?.uniformReturned ? "bg-[#00875A]" : "bg-[#DFE1E6]"
                              }`}
                            />
                            <span
                              title="Tools / Equipment"
                              className={`w-2 h-2 rounded-full ${
                                item.clearances?.toolsEquipmentReturned
                                  ? "bg-[#00875A]"
                                  : "bg-[#DFE1E6]"
                              }`}
                            />
                            <span
                              title="Supervisor Sign-off"
                              className={`w-2 h-2 rounded-full ${
                                item.clearances?.siteSupervisorApproved
                                  ? "bg-[#00875A]"
                                  : "bg-[#DFE1E6]"
                              }`}
                            />
                            <span className="text-[10px] ml-1">
                              {clearancesCount === 4 ? "All Signed Off" : "Incomplete"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="text-[11px] text-[#172B4D] dark:text-[#F1F5F9]">
                          <span className="font-semibold text-[#00875A]">
                            +₹{(item.earnings?.totalEarnings || 0).toLocaleString()}
                          </span>{" "}
                          <span className="text-[#6B778C]">
                            ({item.earnings?.daysWorkedInExitMonth || 0}d worked)
                          </span>
                        </div>
                        {item.deductions?.outstandingAdvanceDeducted > 0 && (
                          <div className="text-[10px] text-[#DE350B] font-medium mt-0.5">
                            -₹{item.deductions.outstandingAdvanceDeducted.toLocaleString()} (Advance recovered)
                          </div>
                        )}
                        {item.deductions?.unreturnedAssetDeduction > 0 && (
                          <div className="text-[10px] text-[#DE350B] mt-0.5">
                            -₹{item.deductions.unreturnedAssetDeduction.toLocaleString()} (Asset recovery)
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3.5 text-right">
                        <div className="font-bold text-sm text-[#172B4D] dark:text-[#F1F5F9]">
                          ₹{(item.netFinalPayout || 0).toLocaleString()}
                        </div>
                        {item.status === "Settled & Paid" && item.paymentDetails?.transactionRef && (
                          <div className="text-[10px] text-[#00875A] font-mono mt-0.5">
                            {item.paymentDetails.transactionRef}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3.5">
                        <StatusLozenge status={item.status} size="xs" />
                      </td>

                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status !== "Settled & Paid" && (
                            <button
                              onClick={() => openClearanceModal(item)}
                              title="Update site clearances"
                              className="px-2 py-1 text-[11px] font-medium rounded border border-[#DFE1E6] dark:border-[#263042] text-[#0052CC] dark:text-[#579DFF] bg-white dark:bg-[#151B26] hover:bg-[#F4F5F7] dark:hover:bg-[#1C2331] transition-colors"
                            >
                              Clearances
                            </button>
                          )}

                          {item.status === "Ready for Payment" && (
                            <button
                              onClick={() => openPayModal(item)}
                              className="px-2.5 py-1 text-[11px] font-semibold rounded text-white bg-[#00875A] hover:bg-[#006644] transition-colors shadow-sm"
                            >
                              Pay Now
                            </button>
                          )}

                          <button
                            onClick={() => openStatementModal(item)}
                            title="View / Print Final Statement Voucher"
                            className="p-1 rounded text-[#6B778C] dark:text-[#94A3B8] hover:text-[#0052CC] dark:hover:text-[#579DFF] hover:bg-[#F4F5F7] dark:hover:bg-[#1C2331] transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Record Worker Exit */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F131C] rounded-lg shadow-xl border border-[#DFE1E6] dark:border-[#263042] w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#DFE1E6] dark:border-[#263042]">
              <div>
                <h3 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                  Record Worker Exit & Final Payout
                </h3>
                <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                  Calculate wages, encashments, and auto-deduct outstanding advances.
                </p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-[#6B778C] hover:text-[#172B4D] dark:hover:text-[#F1F5F9] rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-4 space-y-4 text-xs">
              {/* Worker Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Select Worker <span className="text-[#DE350B]">*</span>
                </label>
                <select
                  value={createForm.workerId}
                  onChange={(e) => handleWorkerChange(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-[#172B4D] dark:text-[#F1F5F9] focus:outline-none focus:border-[#0052CC]"
                >
                  <option value="">-- Choose a worker --</option>
                  {workers.map((w) => (
                    <option key={w.workerId} value={w.workerId}>
                      {w.fullName} ({w.workerId}) — {w.tradeCategory} (
                      {w.currentDeployment?.siteName || "Direct / Bench"})
                    </option>
                  ))}
                </select>
              </div>

              {selectedWorkerData && (
                <div className="p-3 rounded-lg bg-[#FAFBFC] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#6B778C]">Client & Site:</span>
                    <span className="font-medium text-[#172B4D] dark:text-[#F1F5F9]">
                      {selectedWorkerData.currentDeployment?.clientName || "Direct / Bench"} -{" "}
                      {selectedWorkerData.currentDeployment?.siteName || "Headquarters"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B778C]">Base Wage:</span>
                    <span className="font-medium text-[#172B4D] dark:text-[#F1F5F9]">
                      ₹{selectedWorkerData.wagePerDayOrMonth?.toLocaleString() || 0} /{" "}
                      {selectedWorkerData.billingUnit || "Monthly"} (Est. ₹{calculatedDailyRate}/day)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B778C]">Active Advance Balance:</span>
                    <span
                      className={`font-semibold ${
                        outstandingAdvanceSum > 0 ? "text-[#DE350B]" : "text-[#00875A]"
                      }`}
                    >
                      {outstandingAdvanceSum > 0
                        ? `₹${outstandingAdvanceSum.toLocaleString()} (Will be auto-deducted)`
                        : "₹0 (No active advances)"}
                    </span>
                  </div>
                </div>
              )}

              {/* Exit Date & Reason */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                    Last Working Date
                  </label>
                  <input
                    type="date"
                    value={createForm.lastWorkingDate}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, lastWorkingDate: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-[#172B4D] dark:text-[#F1F5F9] focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                    Exit Reason
                  </label>
                  <select
                    value={createForm.exitReason}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, exitReason: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-[#172B4D] dark:text-[#F1F5F9] focus:outline-none focus:border-[#0052CC]"
                  >
                    <option value="Tour Completed">Tour Completed</option>
                    <option value="Contract End">Contract End</option>
                    <option value="Resignation">Resignation</option>
                    <option value="Site Relocation">Site Relocation</option>
                    <option value="Personal / Health">Personal / Health</option>
                  </select>
                </div>
              </div>

              {/* Days Worked & Earnings */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                    Days Worked in Month
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="31"
                    value={createForm.daysWorkedInExitMonth}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        daysWorkedInExitMonth: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1.5 rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-[#172B4D] dark:text-[#F1F5F9] focus:outline-none focus:border-[#0052CC]"
                  />
                  <div className="text-[10px] text-[#6B778C] mt-0.5">
                    = ₹{earnedWagesPreview.toLocaleString()} earned
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                    Leave Encashment (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createForm.leaveEncashmentPay}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        leaveEncashmentPay: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1.5 rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-[#172B4D] dark:text-[#F1F5F9] focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                    Bonus / Incentive (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createForm.bonusOrIncentive}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        bonusOrIncentive: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1.5 rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-[#172B4D] dark:text-[#F1F5F9] focus:outline-none focus:border-[#0052CC]"
                  />
                </div>
              </div>

              {/* Deductions: Unreturned Assets & Other */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                    Unreturned Asset Recovery (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createForm.unreturnedAssetDeduction}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        unreturnedAssetDeduction: e.target.value,
                      })
                    }
                    placeholder="E.g. lost helmet, uniform"
                    className="w-full px-3 py-1.5 rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-[#172B4D] dark:text-[#F1F5F9] focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                    Other Deductions (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createForm.otherDeductions}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        otherDeductions: e.target.value,
                      })
                    }
                    placeholder="E.g. damage, canteen"
                    className="w-full px-3 py-1.5 rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-[#172B4D] dark:text-[#F1F5F9] focus:outline-none focus:border-[#0052CC]"
                  />
                </div>
              </div>

              {/* Live Payout Calculation Preview Box */}
              <div className="p-3 rounded-lg bg-[#E3FCEF] dark:bg-emerald-950/30 border border-[#ABF5D1] dark:border-emerald-800 text-xs space-y-1">
                <div className="flex justify-between text-[#00875A] font-semibold">
                  <span>Gross Exit Earnings:</span>
                  <span>+₹{totalEarningsPreview.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#DE350B]">
                  <span>Total Deductions (Inc. Advance):</span>
                  <span>-₹{totalDeductionsPreview.toLocaleString()}</span>
                </div>
                <div className="border-t border-[#ABF5D1] dark:border-emerald-800 pt-1 mt-1 flex justify-between font-bold text-sm text-[#00875A]">
                  <span>Net Final Take-Home Payout:</span>
                  <span>₹{netPayoutPreview.toLocaleString()}</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Notes & Remarks
                </label>
                <textarea
                  rows="2"
                  value={createForm.notes}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, notes: e.target.value })
                  }
                  placeholder="Reason for exit, handover remarks, or clearance instructions..."
                  className="w-full px-3 py-1.5 rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-[#172B4D] dark:text-[#F1F5F9] focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DFE1E6] dark:border-[#263042]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#DFE1E6] dark:border-[#263042] text-[#42526E] dark:text-[#94A3B8] hover:bg-[#F4F5F7] dark:hover:bg-[#1C2331]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#0052CC] text-white font-semibold hover:bg-[#0747A6]"
                >
                  Initiate Exit Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Site Return & Clearances Checklist */}
      {clearanceModalOpen && activeSettlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F131C] rounded-lg shadow-xl border border-[#DFE1E6] dark:border-[#263042] w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-[#DFE1E6] dark:border-[#263042]">
              <div>
                <h3 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                  Site Clearances Checklist
                </h3>
                <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                  Worker: {activeSettlement.workerName} ({activeSettlement.workerId})
                </p>
              </div>
              <button
                onClick={() => setClearanceModalOpen(false)}
                className="p-1 text-[#6B778C] hover:text-[#172B4D] dark:hover:text-[#F1F5F9] rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleClearanceSubmit} className="p-4 space-y-3.5 text-xs">
              <p className="text-[#6B778C] dark:text-[#94A3B8] text-[11px]">
                Verify all 4 items to automatically transition this exit record to{" "}
                <span className="font-semibold text-[#0052CC]">Ready for Payment</span>.
              </p>

              {/* Checklist Items */}
              <div className="space-y-2.5">
                <label className="flex items-start gap-2.5 p-2.5 rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] cursor-pointer hover:bg-white dark:hover:bg-[#1C2331]">
                  <input
                    type="checkbox"
                    checked={clearanceForm.idCardReturned}
                    onChange={(e) =>
                      setClearanceForm({
                        ...clearanceForm,
                        idCardReturned: e.target.checked,
                      })
                    }
                    className="mt-0.5 text-[#0052CC] rounded focus:ring-0"
                  />
                  <div>
                    <div className="font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                      1. ID Card & Gate Pass Returned
                    </div>
                    <div className="text-[11px] text-[#6B778C]">
                      Site entry badge surrendered to security desk.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] cursor-pointer hover:bg-white dark:hover:bg-[#1C2331]">
                  <input
                    type="checkbox"
                    checked={clearanceForm.uniformReturned}
                    onChange={(e) =>
                      setClearanceForm({
                        ...clearanceForm,
                        uniformReturned: e.target.checked,
                      })
                    }
                    className="mt-0.5 text-[#0052CC] rounded focus:ring-0"
                  />
                  <div>
                    <div className="font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                      2. Uniform & High-Vis Jacket Returned
                    </div>
                    <div className="text-[11px] text-[#6B778C]">
                      Company apparel returned or accounted for.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] cursor-pointer hover:bg-white dark:hover:bg-[#1C2331]">
                  <input
                    type="checkbox"
                    checked={clearanceForm.toolsEquipmentReturned}
                    onChange={(e) =>
                      setClearanceForm({
                        ...clearanceForm,
                        toolsEquipmentReturned: e.target.checked,
                      })
                    }
                    className="mt-0.5 text-[#0052CC] rounded focus:ring-0"
                  />
                  <div>
                    <div className="font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                      3. Tools & Safety Equipment Returned
                    </div>
                    <div className="text-[11px] text-[#6B778C]">
                      Helmet, safety harness, hand tools returned to storekeeper.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] cursor-pointer hover:bg-white dark:hover:bg-[#1C2331]">
                  <input
                    type="checkbox"
                    checked={clearanceForm.siteSupervisorApproved}
                    onChange={(e) =>
                      setClearanceForm({
                        ...clearanceForm,
                        siteSupervisorApproved: e.target.checked,
                      })
                    }
                    className="mt-0.5 text-[#0052CC] rounded focus:ring-0"
                  />
                  <div>
                    <div className="font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                      4. Site Supervisor Handover Sign-Off
                    </div>
                    <div className="text-[11px] text-[#6B778C]">
                      Work handover verified by client site in-charge.
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Clearance Remarks
                </label>
                <input
                  type="text"
                  value={clearanceForm.remarks}
                  onChange={(e) =>
                    setClearanceForm({ ...clearanceForm, remarks: e.target.value })
                  }
                  placeholder="Gate pass number, storekeeper notes..."
                  className="w-full px-3 py-1.5 rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-[#172B4D] dark:text-[#F1F5F9] focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DFE1E6] dark:border-[#263042]">
                <button
                  type="button"
                  onClick={() => setClearanceModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#DFE1E6] dark:border-[#263042] text-[#42526E] dark:text-[#94A3B8] hover:bg-[#F4F5F7] dark:hover:bg-[#1C2331]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#0052CC] text-white font-semibold hover:bg-[#0747A6]"
                >
                  Save Clearance Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Disburse Final Payout */}
      {payModalOpen && activeSettlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F131C] rounded-lg shadow-xl border border-[#DFE1E6] dark:border-[#263042] w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-[#DFE1E6] dark:border-[#263042]">
              <div>
                <h3 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                  Disburse Final Take-Home Payout
                </h3>
                <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                  Record payment reference and mark exit as Settled & Paid.
                </p>
              </div>
              <button
                onClick={() => setPayModalOpen(false)}
                className="p-1 text-[#6B778C] hover:text-[#172B4D] dark:hover:text-[#F1F5F9] rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePaySubmit} className="p-4 space-y-3.5 text-xs">
              <div className="p-3 rounded-lg bg-[#E3FCEF] dark:bg-emerald-950/30 border border-[#ABF5D1] dark:border-emerald-800 text-center">
                <div className="text-[11px] text-[#00875A] font-medium">Final Payable Amount</div>
                <div className="text-2xl font-bold text-[#00875A] mt-0.5">
                  ₹{activeSettlement.netFinalPayout.toLocaleString()}
                </div>
                <div className="text-[10px] text-[#00875A]/80 mt-1">
                  Worker: {activeSettlement.workerName} ({activeSettlement.workerId})
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Payment Mode
                </label>
                <select
                  value={payForm.paymentMode}
                  onChange={(e) => setPayForm({ ...payForm, paymentMode: e.target.value })}
                  className="w-full px-3 py-1.5 rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-[#172B4D] dark:text-[#F1F5F9] focus:outline-none focus:border-[#0052CC]"
                >
                  <option value="Direct Bank Transfer">Direct Bank Transfer (NEFT / IMPS / UPI)</option>
                  <option value="Cash Deposit">Cash Handover</option>
                  <option value="Cheque">Bank Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Transaction / UTR Reference
                </label>
                <input
                  type="text"
                  required
                  value={payForm.transactionRef}
                  onChange={(e) =>
                    setPayForm({ ...payForm, transactionRef: e.target.value })
                  }
                  placeholder="E.g. NEFT12345678 or Cheque 998822"
                  className="w-full px-3 py-1.5 rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-[#172B4D] dark:text-[#F1F5F9] focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Disbursal Remarks
                </label>
                <input
                  type="text"
                  value={payForm.notes}
                  onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
                  placeholder="Processed via HDFC salary account..."
                  className="w-full px-3 py-1.5 rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-[#172B4D] dark:text-[#F1F5F9] focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DFE1E6] dark:border-[#263042]">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#DFE1E6] dark:border-[#263042] text-[#42526E] dark:text-[#94A3B8] hover:bg-[#F4F5F7] dark:hover:bg-[#1C2331]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#00875A] text-white font-semibold hover:bg-[#006644]"
                >
                  Confirm & Disburse Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Printable Payout Statement Voucher */}
      {statementModalOpen && activeSettlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F131C] rounded-lg shadow-2xl border border-[#DFE1E6] dark:border-[#263042] w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#DFE1E6] dark:border-[#263042] print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0052CC]" />
                <h3 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                  Final Settlement Payout Voucher
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-[#0052CC] text-white hover:bg-[#0747A6] transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Voucher</span>
                </button>
                <button
                  onClick={() => setStatementModalOpen(false)}
                  className="p-1 text-[#6B778C] hover:text-[#172B4D] dark:hover:text-[#F1F5F9] rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Voucher Paper */}
            <div className="p-6 text-xs text-[#172B4D] dark:text-[#F1F5F9] space-y-5 bg-white dark:bg-[#0F131C]">
              {/* Header */}
              <div className="border-b border-[#DFE1E6] dark:border-[#263042] pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-base font-bold text-[#0052CC] uppercase tracking-wide">
                    {activeSettlement.vendorName || "Infiniti TechStaffing Services LLP"}
                  </h2>
                  <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
                    Licensed Manpower Contractor & Industrial Staffing Agency
                  </p>
                  <p className="text-[10px] text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                    GSTIN: 27AABCA1234F1Z5 | PAN: AABCA1234F
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                    EXIT SETTLEMENT VOUCHER
                  </div>
                  <div className="font-mono text-xs text-[#0052CC] font-semibold mt-0.5">
                    {activeSettlement.settlementId}
                  </div>
                  <div className="text-[10px] text-[#6B778C] mt-0.5">
                    Date: {new Date(activeSettlement.createdAt || Date.now()).toLocaleDateString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Worker & Deployment Grid */}
              <div className="grid grid-cols-2 gap-4 p-3 rounded bg-[#FAFBFC] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] text-[11px]">
                <div>
                  <div className="text-[#6B778C]">Worker Full Name:</div>
                  <div className="font-semibold text-xs text-[#172B4D] dark:text-[#F1F5F9]">
                    {activeSettlement.workerName}
                  </div>
                  <div className="text-[#6B778C] mt-1">Worker ID:</div>
                  <div className="font-mono">{activeSettlement.workerId}</div>
                  <div className="text-[#6B778C] mt-1">Phone:</div>
                  <div>{activeSettlement.workerDetails?.phone || "Registered"}</div>
                </div>

                <div>
                  <div className="text-[#6B778C]">Client Company:</div>
                  <div className="font-semibold">{activeSettlement.clientName || "Direct / Bench"}</div>
                  <div className="text-[#6B778C] mt-1">Assigned Work Site:</div>
                  <div>{activeSettlement.siteName || "Headquarters"}</div>
                  <div className="text-[#6B778C] mt-1">Last Working Date & Reason:</div>
                  <div className="font-medium">
                    {new Date(activeSettlement.lastWorkingDate).toLocaleDateString("en-IN")} ({activeSettlement.exitReason})
                  </div>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown Tables */}
              <div className="grid grid-cols-2 gap-4">
                {/* Earnings Column */}
                <div className="border border-[#DFE1E6] dark:border-[#263042] rounded-lg overflow-hidden">
                  <div className="bg-[#E3FCEF] dark:bg-emerald-950/40 p-2 font-bold text-xs text-[#00875A] border-b border-[#DFE1E6] dark:border-[#263042]">
                    FINAL EARNINGS
                  </div>
                  <div className="p-3 space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-[#6B778C]">
                        Wages for {activeSettlement.earnings?.daysWorkedInExitMonth || 0} days @ ₹
                        {activeSettlement.earnings?.dailyRate || 0}/day:
                      </span>
                      <span className="font-semibold">
                        ₹{(activeSettlement.earnings?.earnedWages || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B778C]">Leave Encashment:</span>
                      <span className="font-semibold">
                        ₹{(activeSettlement.earnings?.leaveEncashmentPay || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B778C]">Bonus / Performance Incentive:</span>
                      <span className="font-semibold">
                        ₹{(activeSettlement.earnings?.bonusOrIncentive || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t border-[#DFE1E6] dark:border-[#263042] pt-1.5 flex justify-between font-bold text-[#00875A]">
                      <span>Total Earnings (A):</span>
                      <span>
                        ₹{(activeSettlement.earnings?.totalEarnings || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions Column */}
                <div className="border border-[#DFE1E6] dark:border-[#263042] rounded-lg overflow-hidden">
                  <div className="bg-[#FFEBE6] dark:bg-rose-950/40 p-2 font-bold text-xs text-[#DE350B] border-b border-[#DFE1E6] dark:border-[#263042]">
                    DEDUCTIONS & RECOVERIES
                  </div>
                  <div className="p-3 space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-[#6B778C]">Outstanding Advance Recovered:</span>
                      <span className="font-semibold text-[#DE350B]">
                        ₹{(activeSettlement.deductions?.outstandingAdvanceDeducted || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B778C]">Unreturned Asset Deduction:</span>
                      <span className="font-semibold text-[#DE350B]">
                        ₹{(activeSettlement.deductions?.unreturnedAssetDeduction || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B778C]">Other Site Deductions:</span>
                      <span className="font-semibold text-[#DE350B]">
                        ₹{(activeSettlement.deductions?.otherDeductions || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t border-[#DFE1E6] dark:border-[#263042] pt-1.5 flex justify-between font-bold text-[#DE350B]">
                      <span>Total Deductions (B):</span>
                      <span>
                        ₹{(activeSettlement.deductions?.totalDeductions || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Payout Banner */}
              <div className="p-3.5 rounded-lg bg-[#DEEBFF] dark:bg-[#1C2331] border border-[#B3D4FF] dark:border-[#263042] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#0052CC] dark:text-[#579DFF]">
                    NET FINAL TAKE-HOME DISBURSEMENT (A - B)
                  </div>
                  <div className="text-[10px] text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                    Status: {activeSettlement.status}
                    {activeSettlement.paymentDetails?.transactionRef && (
                      <span> | Ref: {activeSettlement.paymentDetails.transactionRef}</span>
                    )}
                  </div>
                </div>
                <div className="text-xl font-bold text-[#0052CC] dark:text-[#579DFF]">
                  ₹{(activeSettlement.netFinalPayout || 0).toLocaleString()}
                </div>
              </div>

              {/* Clearances Sign-Off Summary */}
              <div className="p-3 rounded bg-[#FAFBFC] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] text-[11px] space-y-1">
                <div className="font-semibold text-[#172B4D] dark:text-[#F1F5F9] mb-1">
                  Site Return & Clearances Status:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activeSettlement.clearances?.idCardReturned
                          ? "bg-[#00875A]"
                          : "bg-[#DE350B]"
                      }`}
                    />
                    <span>
                      ID Card Returned:{" "}
                      {activeSettlement.clearances?.idCardReturned ? "Yes (Cleared)" : "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activeSettlement.clearances?.uniformReturned
                          ? "bg-[#00875A]"
                          : "bg-[#DE350B]"
                      }`}
                    />
                    <span>
                      Uniform Returned:{" "}
                      {activeSettlement.clearances?.uniformReturned ? "Yes (Cleared)" : "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activeSettlement.clearances?.toolsEquipmentReturned
                          ? "bg-[#00875A]"
                          : "bg-[#DE350B]"
                      }`}
                    />
                    <span>
                      Tools Returned:{" "}
                      {activeSettlement.clearances?.toolsEquipmentReturned
                        ? "Yes (Cleared)"
                        : "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activeSettlement.clearances?.siteSupervisorApproved
                          ? "bg-[#00875A]"
                          : "bg-[#DE350B]"
                      }`}
                    />
                    <span>
                      Supervisor Approval:{" "}
                      {activeSettlement.clearances?.siteSupervisorApproved
                        ? "Yes (Approved)"
                        : "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-2 gap-12 text-center text-xs">
                <div className="border-t border-dashed border-[#DFE1E6] dark:border-[#263042] pt-2">
                  <div className="font-medium text-[#172B4D] dark:text-[#F1F5F9]">
                    {activeSettlement.workerName}
                  </div>
                  <div className="text-[10px] text-[#6B778C]">Worker Signature / Acceptance</div>
                </div>

                <div className="border-t border-dashed border-[#DFE1E6] dark:border-[#263042] pt-2">
                  <div className="font-medium text-[#172B4D] dark:text-[#F1F5F9]">
                    For {activeSettlement.vendorName || "Infiniti TechStaffing Services LLP"}
                  </div>
                  <div className="text-[10px] text-[#6B778C]">
                    Authorized HR & Finance Signatory
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
