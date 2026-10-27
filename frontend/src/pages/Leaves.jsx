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
import LeaveTable from "../components/LeaveTable";
import LeaveBalanceCards from "../components/LeaveBalanceCards";
import HolidayCalendar from "../components/HolidayCalendar";
import TeamOnLeave from "../components/TeamOnLeave";
import ApplyLeaveModal from "../components/ApplyLeaveModal";
import LeavePolicyModal from "../components/LeavePolicyModal";
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
} from "lucide-react";
import { exportToCsv } from "../utils/csvExporter";
import toast from "react-hot-toast";

function Leaves() {
  const { user, isManager } = useAuth();
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
  const [statusFilter, setStatusFilter] = useState("All");

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

  const handleExportCsv = () => {
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
      data: leaves,
    });
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#172B4D]">Leave Management</h1>
            <span className="text-[11px] bg-[#DEEBFF] text-[#0747A6] font-semibold px-2 py-0.5 rounded border border-[#B3D4FF]">
              Staffify ESS
            </span>
          </div>
          <p className="text-xs text-[#6B778C] mt-0.5">
            Leave quotas, multi-type applications, manager approvals & company holidays
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchData}
            className="p-1.5 border border-[#DFE1E6] bg-white hover:bg-[#F4F5F7] rounded text-[#6B778C] transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleExportCsv}
            disabled={leaves.length === 0}
            className="flex items-center gap-1.5 bg-white border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#172B4D] text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer disabled:opacity-50"
            title="Export leave records to CSV"
          >
            <Download size={13} className="text-[#0052CC]" />
            <span>Export CSV</span>
          </button>

          {(isManager || user?.role === "Admin") && (
            <button
              onClick={() => setShowPolicyModal(true)}
              className="flex items-center gap-1.5 bg-white border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#172B4D] text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer"
              title="Configure Sandwich Leave Policy & Annual Carry-Forward Rollover"
            >
              <Sliders size={13} className="text-[#0052CC]" />
              <span>Leave Policy & Rules</span>
            </button>
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
          />
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

      {/* Leave Policy & Sandwich Rule Modal */}
      {showPolicyModal && (
        <LeavePolicyModal
          isOpen={showPolicyModal}
          onClose={() => setShowPolicyModal(false)}
          onPolicyUpdated={fetchData}
        />
      )}
    </DashboardLayout>
  );
}

export default Leaves;
