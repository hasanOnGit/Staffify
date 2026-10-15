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
import {
  Calendar,
  CheckCircle2,
  CalendarDays,
  Users,
  PlusCircle,
  RefreshCw,
  Clock,
} from "lucide-react";
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

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
            <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
              greytHR ESS
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Leave quotas, multi-type applications, manager approvals & company holidays
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="p-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg text-gray-600 transition shadow-2xs"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-xs"
          >
            <PlusCircle size={15} />
            <span>Apply Leave</span>
          </button>
        </div>
      </div>

      {/* greytHR Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab("my_leaves")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === "my_leaves"
              ? "border-purple-600 text-purple-700 bg-purple-50/50"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Calendar size={15} />
          <span>My Leaves & Quotas</span>
        </button>

        {isManager && (
          <button
            onClick={() => setActiveTab("approvals")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === "approvals"
                ? "border-purple-600 text-purple-700 bg-purple-50/50"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <CheckCircle2 size={15} />
            <span>Manager Approvals</span>
            {pendingApprovals.length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {pendingApprovals.length}
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => setActiveTab("holidays")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === "holidays"
              ? "border-purple-600 text-purple-700 bg-purple-50/50"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <CalendarDays size={15} />
          <span>Holiday Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab("team")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === "team"
              ? "border-purple-600 text-purple-700 bg-purple-50/50"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Users size={15} />
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
    </DashboardLayout>
  );
}

export default Leaves;
