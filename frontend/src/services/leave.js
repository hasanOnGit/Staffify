import api from "./api";

/**
 * Fetch all leaves with optional employeeId and status filters
 */
export const getLeaves = async (params = {}) => {
  const res = await api.get("/getLeaves", { params });
  return res.data.data;
};

/**
 * Submit a new leave application
 */
export const createLeave = async (leaveData) => {
  const res = await api.post("/applyLeave", leaveData);
  return res.data;
};

/**
 * Update leave status (Approve / Reject) with optional remarks
 */
export const updateLeave = async (leaveId, status, approvedBy, rejectionReason = "") => {
  const res = await api.post("/updateLeave", {
    leaveId,
    status,
    approvedBy,
    rejectionReason,
  });
  return res.data;
};

/**
 * Cancel / Withdraw a leave application (refunds balance if previously approved)
 */
export const cancelLeave = async (leaveId, employeeId) => {
  const res = await api.post("/cancelLeave", {
    leaveId,
    employeeId,
  });
  return res.data;
};

/**
 * Fetch detailed leave balance and quotas for an employee
 */
export const getLeaveBalance = async (employeeId, year) => {
  const res = await api.get("/getLeaveBalance", {
    params: { employeeId, year },
  });
  return res.data;
};

/**
 * Fetch colleagues currently on approved leave
 */
export const getTeamOnLeave = async () => {
  const res = await api.get("/team-on-leave");
  return res.data.data;
};
