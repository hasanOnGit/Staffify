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
 * Update leave status (Approve / Reject) with optional remarks and proxy approver delegation
 */
export const updateLeave = async (leaveId, status, approvedBy, rejectionReason = "", proxyFor = "") => {
  const res = await api.post("/updateLeave", {
    leaveId,
    status,
    approvedBy,
    rejectionReason,
    proxyFor,
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

/**
 * Fetch leave policy & sandwich rule configuration
 */
export const getLeavePolicy = async () => {
  const res = await api.get("/api/leaves/policy");
  return res.data;
};

/**
 * Update leave policy & sandwich rule configuration
 */
export const updateLeavePolicy = async (policyData) => {
  const res = await api.put("/api/leaves/policy", policyData);
  return res.data;
};

/**
 * Execute annual leave rollover batch process
 */
export const executeLeaveRollover = async (rolloverData) => {
  const res = await api.post("/api/leaves/rollover", rolloverData);
  return res.data;
};

/**
 * Out-of-Office Approval Delegations
 */
export const getDelegations = async (params = {}) => {
  const res = await api.get("/delegations", { params });
  return res.data;
};

export const createDelegation = async (delegationData) => {
  const res = await api.post("/delegations", delegationData);
  return res.data;
};

export const revokeDelegation = async (delegationId) => {
  const res = await api.post("/revokeDelegation", { delegationId });
  return res.data;
};


