import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  getLeaves,
  createLeave,
  updateLeave,
  cancelLeave,
  getLeaveBalance,
} from "../services/leave";
import {
  getAllCompOffGrants,
  approveCompOffGrant,
  rejectCompOffGrant,
} from "../services/compOff";
import LeaveTable from "../components/LeaveTable";
import LeaveBalanceCards from "../components/LeaveBalanceCards";
import HolidayCalendar from "../components/HolidayCalendar";
import TeamOnLeave from "../components/TeamOnLeave";
import ApplyLeaveModal from "../components/ApplyLeaveModal";
import LeavePolicyModal from "../components/LeavePolicyModal";
import CompOffModal from "../components/CompOffModal";
import LeaveYearEndModal from "../components/LeaveYearEndModal";
import {
  Calendar,
  CheckCircle2,
  CalendarDays,
  Users,
  PlusCircle,
  RefreshCw,
  Clock,
  Sliders,
  Download,
  XCircle,
  RotateCcw,
  Award,
  AlertCircle,
  Loader2,
} from "lucide-react";
import BulkActionBar from "../components/BulkActionBar";
import { exportToCsv } from "../utils/csvExporter";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

function Leaves() {
  const location = useLocation();
  const { user, isManager, isAdmin } = useAuth();
  const currentUserId = user?.userId;
  const currentUserName = user?.name || "Employee";

  // Active Tab: "my_leaves" | "approvals" | "holidays" | "team"
  const [activeTab, setActiveTab] = useState("my_leaves");

  // State
  const [allLeaves, setAllLeaves] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showCompOffModal, setShowCompOffModal] = useState(false);
  const [showYearEndModal, setShowYearEndModal] = useState(false);
  const [compOffGrants, setCompOffGrants] = useState([]);
  const [compOffLoading, setCompOffLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  // Handle deep link action triggers (e.g., from AI Copilot /leaves?apply=true)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("apply") === "true") {
      setShowApplyModal(true);
    }
  }, [location.search]);

  /* =============================
     FETCH LEAVES & BALANCES
  ============================= */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch leaves
      const leavesData = await getLeaves();
      setAllLeaves(Array.isArray(leavesData) ? leavesData : []);

      // Fetch user balances
      if (currentUserId) {
        const balanceRes = await getLeaveBalance(currentUserId);
        if (balanceRes?.data) {
          setBalances(balanceRes.data);
        }
      }
    } catch (err) {
      console.error("Fetch leaves error:", err);
      toast.error("Failed to load leave records");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* =============================
     FILTERED LEAVES
  ============================= */
  // Leaves applied by the current user
  const myLeaves = allLeaves.filter(
    (l) => l.employeeId === currentUserId || !currentUserId
  );

  // Filtered by status
  const filteredMyLeaves = myLeaves.filter((l) => {
    if (statusFilter === "All") return true;
    return l.status === statusFilter;
  });

  // Pending leaves for managers to approve
  const pendingApprovals = allLeaves.filter((l) => l.status === "Pending");

  /* =============================
     ACTIONS
  ============================= */
  const handleApplyLeave = async (payload) => {
    setActionLoading(true);
    try {
      await createLeave(payload);
      toast.success("Leave application submitted successfully!");
      setShowApplyModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to apply leave");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (leave) => {
    setActionLoading(true);
    try {
      await updateLeave(leave.leaveId, "Approved", currentUserName);
      toast.success(`Leave approved for ${leave.employeeName}`);
      fetchData();
    } catch {
      toast.error("Failed to approve leave");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (leave) => {
    const remark = window.prompt("Reason for rejection (optional):", "Business operational requirements");
    if (remark === null) return; // User cancelled prompt

    setActionLoading(true);
    try {
      await updateLeave(leave.leaveId, "Rejected", currentUserName, remark);
      toast.success(`Leave rejected for ${leave.employeeName}`);
      fetchData();
    } catch {
      toast.error("Failed to reject leave");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (leaveId) => {
    if (!window.confirm("Are you sure you want to withdraw this leave application?")) return;

    setActionLoading(true);
    try {
      await cancelLeave(leaveId, currentUserId);
      toast.success("Leave application withdrawn successfully");
      fetchData();
    } catch {
      toast.error("Failed to cancel leave application");
    } finally {
      setActionLoading(false);
    }
  };

  const loadCompOffGrants = useCallback(async () => {
    try {
      setCompOffLoading(true);
      const res = await getAllCompOffGrants();
      if (res?.success) {
        setCompOffGrants(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load comp-off grants:", err);
    } finally {
      setCompOffLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "comp_off") {
      loadCompOffGrants();
    }
  }, [activeTab, loadCompOffGrants]);

  const handleApproveCompOff = async (grantId) => {
    try {
      setActionLoading(true);
      const res = await approveCompOffGrant(grantId, "Approved by Manager");
      if (res?.success) {
        toast.success(res.message || "Comp-off grant approved and credited to leave balance");
        loadCompOffGrants();
        fetchData();
      } else {
        toast.error(res?.error || "Failed to approve comp-off");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Approval error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCompOff = async (grantId) => {
    const reason = window.prompt("Reason for rejection:", "Does not meet overtime/holiday work criteria");
    if (reason === null) return;

    try {
      setActionLoading(true);
      const res = await rejectCompOffGrant(grantId, reason);
      if (res?.success) {
        toast.success(res.message || "Comp-off grant rejected");
        loadCompOffGrants();
      } else {
        toast.error(res?.error || "Failed to reject comp-off");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Rejection error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCsv = () => {
    const recordsToExport = isManager || user?.role === "Admin" ? allLeaves : myLeaves;
    exportToCsv({
      filename: `Staffify_Leave_Register_${new Date().toISOString().split("T")[0]}.csv`,
      headers: [
        { key: "leaveId", label: "Leave Ref ID" },
        { key: "employeeId", label: "Employee ID" },
        { key: "employeeName", label: "Employee Name" },
        { key: "leaveType", label: "Leave Type" },
        { key: "startDate", label: "Start Date" },
        { key: "endDate", label: "End Date" },
        { key: "daysCount", label: "Duration (Days)" },
        { key: "reason", label: "Reason for Time-Off" },
        { key: "status", label: "Approval Status" },
        { key: "approvedBy", label: "Reviewer / Manager" },
      ],
      data: recordsToExport,
    });
  };

  const [selectedLeaveIds, setSelectedLeaveIds] = useState([]);

  const handleToggleSelectLeave = (id) => {
    setSelectedLeaveIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllLeaves = () => {
    const currentList = activeTab === "approvals" ? pendingApprovals : filteredMyLeaves;
    const currentIds = currentList.map((l) => l.leaveId || l._id);
    const allSelected = currentIds.length > 0 && currentIds.every((id) => selectedLeaveIds.includes(id));
    if (allSelected) {
      setSelectedLeaveIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedLeaveIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedLeaveIds.length === 0) return;
    setActionLoading(true);
    let successCount = 0;
    try {
      for (const id of selectedLeaveIds) {
        try {
          await updateLeave(id, "Approved", currentUserName);
          successCount++;
        } catch (e) {
          console.error(`Failed to approve leave ${id}`, e);
        }
      }
      toast.success(`Successfully approved ${successCount} leave requests`);
      setSelectedLeaveIds([]);
      fetchData();
    } catch {
      toast.error("Failed to complete bulk approval");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedLeaveIds.length === 0) return;
    const remark = window.prompt("Reason for bulk rejection:", "Operational exigencies");
    if (remark === null) return;
    setActionLoading(true);
    let successCount = 0;
    try {
      for (const id of selectedLeaveIds) {
        try {
          await updateLeave(id, "Rejected", currentUserName, remark);
          successCount++;
        } catch (e) {
          console.error(`Failed to reject leave ${id}`, e);
        }
      }
      toast.success(`Rejected ${successCount} leave requests`);
      setSelectedLeaveIds([]);
      fetchData();
    } catch {
      toast.error("Failed to complete bulk rejection");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkExport = () => {
    const selectedData = allLeaves.filter((l) =>
      selectedLeaveIds.includes(l.leaveId || l._id)
    );
    exportToCsv({
      filename: `Staffify_Selected_Leaves_${new Date().toISOString().split("T")[0]}.csv`,
      headers: [
        { key: "leaveId", label: "Leave Ref ID" },
        { key: "employeeId", label: "Employee ID" },
        { key: "employeeName", label: "Employee Name" },
        { key: "leaveType", label: "Leave Type" },
        { key: "startDate", label: "Start Date" },
        { key: "endDate", label: "End Date" },
        { key: "daysCount", label: "Duration (Days)" },
        { key: "reason", label: "Reason for Time-Off" },
        { key: "status", label: "Approval Status" },
      ],
      data: selectedData,
    });
  };

  const recordsCount = (isManager || user?.role === "Admin" ? allLeaves : myLeaves).length;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#172B4D] dark:text-[#F1F5F9]">Leave Management</h1>
            <span className="text-[11px] bg-[#DEEBFF] dark:bg-[#0747A6]/30 text-[#0747A6] dark:text-[#93C5FD] font-semibold px-2 py-0.5 rounded border border-[#B3D4FF] dark:border-[#1E3A8A]">
              Staffify ESS
            </span>
          </div>
          <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
            Leave quotas, multi-type applications, manager approvals & company holidays
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchData}
            className="p-1.5 border border-[#DFE1E6] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:bg-[#F4F5F7] dark:hover:bg-[#334155] rounded text-[#6B778C] dark:text-[#94A3B8] transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleExportCsv}
            disabled={recordsCount === 0}
            className="flex items-center gap-1.5 bg-white dark:bg-[#1E293B] border border-[#DFE1E6] dark:border-[#334155] hover:bg-[#F4F5F7] dark:hover:bg-[#334155] text-[#172B4D] dark:text-[#F1F5F9] text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer disabled:opacity-50"
            title="Export leave records to CSV"
          >
            <Download size={13} className="text-[#0052CC] dark:text-[#38BDF8]" />
            <span>Export CSV</span>
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => setShowYearEndModal(true)}
                className="flex items-center gap-1.5 bg-[#DEEBFF] dark:bg-[#0052CC]/20 border border-[#B3D4FF] dark:border-[#0052CC]/40 hover:bg-[#B3D4FF]/40 text-[#0747A6] dark:text-[#579DFF] text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer"
                title="Leave Carry-Forward, Lapsing & Encashment Engine"
              >
                <RotateCcw size={13} />
                <span>Year-End Rollover</span>
              </button>

              <button
                onClick={() => setShowPolicyModal(true)}
                className="flex items-center gap-1.5 bg-white dark:bg-[#1E293B] border border-[#DFE1E6] dark:border-[#334155] hover:bg-[#F4F5F7] dark:hover:bg-[#334155] text-[#172B4D] dark:text-[#F1F5F9] text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer"
                title="Configure Sandwich Leave Policy & Annual Carry-Forward Rollover"
              >
                <Sliders size={13} className="text-[#0052CC]" />
                <span>Leave Policy & Rules</span>
              </button>
            </>
          )}

          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-medium px-3.5 py-1.5 rounded transition cursor-pointer shadow-xs"
          >
            <PlusCircle size={13} />
            <span>Apply Leave</span>
          </button>
        </div>
      </div>

      {/* Staffify Navigation Tabs */}
      <div className="flex border-b border-[#DFE1E6] mb-5 gap-1 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab("my_leaves")}
          className={`flex items-center gap-1.5 px-3.5 py-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "my_leaves"
              ? "border-[#0052CC] text-[#0052CC] bg-[#DEEBFF]/30"
              : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
          }`}
        >
          <Calendar size={13} />
          <span>My Leaves & Quotas</span>
        </button>

        {isManager && (
          <button
            onClick={() => setActiveTab("approvals")}
            className={`flex items-center gap-1.5 px-3.5 py-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === "approvals"
                ? "border-[#0052CC] text-[#0052CC] bg-[#DEEBFF]/30"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <CheckCircle2 size={13} />
            <span>Manager Approvals</span>
            {pendingApprovals.length > 0 && (
              <span className="bg-[#FFF0B3] text-[#172B4D] text-[10px] font-bold px-1.5 py-0.2 rounded border border-[#FFE380]">
                {pendingApprovals.length}
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => setActiveTab("comp_off")}
          className={`flex items-center gap-1.5 px-3.5 py-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "comp_off"
              ? "border-[#0052CC] text-[#0052CC] bg-[#DEEBFF]/30"
              : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
          }`}
        >
          <Award size={13} />
          <span>Comp-Off Tray</span>
          {compOffGrants.filter((g) => g.status === "Pending").length > 0 && isManager && (
            <span className="bg-[#FFF0B3] text-[#172B4D] text-[10px] font-bold px-1.5 py-0.2 rounded border border-[#FFE380]">
              {compOffGrants.filter((g) => g.status === "Pending").length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("holidays")}
          className={`flex items-center gap-1.5 px-3.5 py-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "holidays"
              ? "border-[#0052CC] text-[#0052CC] bg-[#DEEBFF]/30"
              : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
          }`}
        >
          <CalendarDays size={13} />
          <span>Holiday Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab("team")}
          className={`flex items-center gap-1.5 px-3.5 py-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "team"
              ? "border-[#0052CC] text-[#0052CC] bg-[#DEEBFF]/30"
              : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
          }`}
        >
          <Users size={13} />
          <span>Team on Leave</span>
        </button>
      </div>

      {/* =========================================================
         TAB 1: MY LEAVES & QUOTAS
         ========================================================= */}
      {activeTab === "my_leaves" && (
        <div className="space-y-6">
          {/* Visual Balance Quotas */}
          <LeaveBalanceCards balances={balances} />

          {/* Table Header & Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-500" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                My Applications History ({filteredMyLeaves.length})
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Filter by:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-700 focus:outline-purple-600 shadow-2xs"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <LeaveTable
            leaves={filteredMyLeaves}
            isManager={false}
            currentUserId={currentUserId}
            onCancel={handleCancel}
            actionLoading={actionLoading}
            selectable={true}
            selectedIds={selectedLeaveIds}
            onToggleSelect={handleToggleSelectLeave}
            onToggleSelectAll={handleToggleSelectAllLeaves}
          />
        </div>
      )}

      {/* =========================================================
         TAB 2: MANAGER APPROVALS (MSS)
         ========================================================= */}
      {activeTab === "approvals" && (
        <div className="space-y-4">
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-xs text-amber-900">
            <div>
              <p className="font-bold">Manager Review Tray</p>
              <p className="text-amber-700 mt-0.5">
                Review and approve leave requests from your reporting team. Approved leaves automatically deduct from the employee quota.
              </p>
            </div>
            <span className="font-bold text-base bg-amber-200/60 px-3 py-1 rounded-lg">
              {pendingApprovals.length} Pending
            </span>
          </div>

          <LeaveTable
            leaves={pendingApprovals}
            isManager={true}
            currentUserId={currentUserId}
            onApprove={handleApprove}
            onReject={handleReject}
            actionLoading={actionLoading}
            selectable={true}
            selectedIds={selectedLeaveIds}
            onToggleSelect={handleToggleSelectLeave}
            onToggleSelectAll={handleToggleSelectAllLeaves}
          />
        </div>
      )}

      {/* =========================================================
         TAB: COMP-OFF TRAY
         ========================================================= */}
      {activeTab === "comp_off" && (
        <div className="bg-white dark:bg-[#1E293B] border border-[#DFE1E6] dark:border-[#334155] rounded-md p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-[#172B4D] dark:text-[#F1F5F9] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Award size={14} className="text-[#0052CC] dark:text-[#38BDF8]" />
                Compensatory Off (Comp-Off) Grant Registry
              </h3>
              <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
                Grants awarded for authorized weekend, holiday, or on-call emergency overtime. Valid for 90 days.
              </p>
            </div>

            <button
              onClick={() => setShowCompOffModal(true)}
              className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer self-start sm:self-auto"
            >
              <PlusCircle size={13} />
              <span>Claim Comp-Off Grant</span>
            </button>
          </div>

          {compOffLoading ? (
            <div className="py-10 text-center text-xs text-[#6B778C]">
              <Loader2 size={16} className="animate-spin mx-auto mb-2" />
              Loading comp-off records...
            </div>
          ) : compOffGrants.length === 0 ? (
            <div className="text-center py-10 bg-[#FAFBFC] dark:bg-[#0F172A] rounded border border-dashed border-[#DFE1E6] dark:border-[#334155]">
              <Award size={24} className="text-[#6B778C] mx-auto mb-2 opacity-60" />
              <p className="text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9]">No Comp-Off Grants Logged</p>
              <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-1">
                Employees can claim grants by clicking "Claim Comp-Off Grant" above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#DFE1E6] dark:border-[#334155] rounded">
              <table className="min-w-full text-xs divide-y divide-[#DFE1E6] dark:divide-[#334155]">
                <thead className="bg-[#F4F5F7] dark:bg-[#0F172A] text-[#6B778C] dark:text-[#94A3B8] font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2 text-left">Employee</th>
                    <th className="px-3 py-2 text-left">Date Worked</th>
                    <th className="px-3 py-2 text-center">Credit</th>
                    <th className="px-3 py-2 text-left">Reason / Deliverables</th>
                    <th className="px-3 py-2 text-left">Validity Window</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    {isManager && <th className="px-3 py-2 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1E6] dark:divide-[#334155] bg-white dark:bg-[#1E293B]">
                  {compOffGrants.map((grant) => (
                    <tr key={grant._id || grant.grantId} className="hover:bg-[#FAFBFC] dark:hover:bg-[#0F172A]">
                      <td className="px-3 py-2.5 font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                        {grant.employeeName}
                        <span className="text-[10px] text-[#6B778C] dark:text-[#94A3B8] block font-mono">{grant.employeeId}</span>
                      </td>
                      <td className="px-3 py-2.5 text-[#172B4D] dark:text-[#F1F5F9]">
                        {new Date(grant.workDate).toLocaleDateString("en-IN", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DEEBFF] dark:bg-[#0052CC]/20 text-[#0052CC] dark:text-[#38BDF8]">
                          {grant.daysGranted} Day{grant.daysGranted > 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 max-w-xs truncate text-[#42526E] dark:text-[#94A3B8]" title={grant.reason}>
                        {grant.reason}
                      </td>
                      <td className="px-3 py-2.5 text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
                        Expires {new Date(grant.expiresAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            grant.status === "Approved"
                              ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                              : grant.status === "Rejected"
                              ? "bg-[#FFEBE6] text-[#BF2600] border-[#FFBDAD]"
                              : grant.status === "Lapsed"
                              ? "bg-[#F4F5F7] text-[#6B778C] border-[#DFE1E6]"
                              : "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]"
                          }`}
                        >
                          {grant.status}
                        </span>
                      </td>
                      {isManager && (
                        <td className="px-3 py-2.5 text-right">
                          {grant.status === "Pending" ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleApproveCompOff(grant._id || grant.grantId)}
                                disabled={actionLoading}
                                className="px-2 py-1 bg-[#00875A] hover:bg-[#006644] text-white rounded text-xs font-semibold cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectCompOff(grant._id || grant.grantId)}
                                disabled={actionLoading}
                                className="px-2 py-1 bg-white hover:bg-[#FFEBE6] border border-[#DFE1E6] text-[#BF2600] rounded text-xs font-semibold cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">Decided</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
         TAB 3: HOLIDAY CALENDAR
         ========================================================= */}
      {activeTab === "holidays" && <HolidayCalendar />}

      {/* =========================================================
         TAB 4: TEAM ON LEAVE
         ========================================================= */}
      {activeTab === "team" && <TeamOnLeave />}

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onSubmit={handleApplyLeave}
        employeeName={currentUserName}
        employeeId={currentUserId || "USR-DEFAULT"}
        balances={balances}
        loading={actionLoading}
      />

      {/* Comp-Off Request Modal */}
      <CompOffModal
        isOpen={showCompOffModal}
        onClose={() => setShowCompOffModal(false)}
        employeeId={currentUserId}
        onGrantRequested={() => {
          loadCompOffGrants();
          fetchData();
        }}
      />

      {/* Leave Year-End Processing & Encashment Engine Modal */}
      <LeaveYearEndModal
        isOpen={showYearEndModal}
        onClose={() => setShowYearEndModal(false)}
        onRolloverSuccess={() => {
          fetchData();
        }}
      />

      {/* Leave Policy & Sandwich Rule Modal */}
      {showPolicyModal && (
        <LeavePolicyModal
          isOpen={showPolicyModal}
          onClose={() => setShowPolicyModal(false)}
          onPolicyUpdated={fetchData}
        />
      )}

      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedLeaveIds.length}
        onClear={() => setSelectedLeaveIds([])}
        itemLabel="leaves"
        actions={[
          ...(isManager && activeTab === "approvals"
            ? [
                {
                  label: `Approve (${selectedLeaveIds.length})`,
                  icon: CheckCircle2,
                  variant: "success",
                  onClick: handleBulkApprove,
                  loading: actionLoading,
                },
                {
                  label: "Reject Selected",
                  icon: XCircle,
                  variant: "danger",
                  onClick: handleBulkReject,
                  loading: actionLoading,
                },
              ]
            : []),
          {
            label: "Export Selected CSV",
            icon: Download,
            onClick: handleBulkExport,
          },
        ]}
      />
    </DashboardLayout>
  );
}

export default Leaves;
