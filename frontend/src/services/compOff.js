import api from "./api";

/**
 * Request a Compensatory Off grant for working on weekend/holiday/overtime
 */
export const requestCompOff = async (payload) => {
  const res = await api.post("/api/comp-off/request", payload);
  return res.data;
};

/**
 * Get logged-in employee's comp-off grant requests
 */
export const getMyCompOffGrants = async () => {
  const res = await api.get("/api/comp-off/my-grants");
  return res.data;
};

/**
 * Get all comp-off grant requests (for HR Admin & Managers)
 */
export const getAllCompOffGrants = async (params = {}) => {
  const res = await api.get("/api/comp-off/all", { params });
  return res.data;
};

/**
 * Approve a comp-off grant request
 */
export const approveCompOffGrant = async (grantId, remarks = "") => {
  const res = await api.post(`/api/comp-off/approve/${grantId}`, { remarks });
  return res.data;
};

/**
 * Reject a comp-off grant request
 */
export const rejectCompOffGrant = async (grantId, rejectionReason = "") => {
  const res = await api.post(`/api/comp-off/reject/${grantId}`, { rejectionReason });
  return res.data;
};
