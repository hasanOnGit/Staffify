import api from "./api";

/**
 * Get all active shifts
 */
export async function getShifts() {
  const res = await api.get("/api/roster/shifts");
  return res.data;
}

/**
 * Get weekly roster matrix
 */
export async function getRosterMatrix(params = {}) {
  const res = await api.get("/api/roster/matrix", { params });
  return res.data;
}

/**
 * Assign shift to a single cell (employee on a given date)
 */
export async function assignShift(payload) {
  const res = await api.post("/api/roster/assign", payload);
  return res.data;
}

/**
 * Bulk assign shifts to multiple employees or department
 */
export async function bulkAssignShift(payload) {
  const res = await api.post("/api/roster/bulk-assign", payload);
  return res.data;
}

/**
 * Get shift swap requests
 */
export async function getShiftSwaps(params = {}) {
  const res = await api.get("/api/roster/swaps", { params });
  return res.data;
}

/**
 * Submit peer shift swap request
 */
export async function submitShiftSwap(payload) {
  const res = await api.post("/api/roster/swaps", payload);
  return res.data;
}

/**
 * Review shift swap request (Approve / Reject)
 */
export async function reviewShiftSwap(swapId, payload) {
  const res = await api.patch(`/api/roster/swaps/${swapId}`, payload);
  return res.data;
}
