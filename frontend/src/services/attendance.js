import api from "./api";

/**
 * Get attendance records for a specific date (Manager/HR table view)
 */
export async function getAttendanceByDate(date, employeeId) {
  const params = { date };
  if (employeeId) params.employeeId = employeeId;
  const res = await api.get("/api/attendance", { params });
  return res.data;
}

/**
 * Register Clock-In or Clock-Out punch
 */
export async function punchAttendance(punchData) {
  const res = await api.post("/api/attendance/punch", punchData);
  return res.data;
}

/**
 * Get today's punch state and hours for an employee
 */
export async function getTodayAttendance(employeeId) {
  const res = await api.get("/api/attendance/today", {
    params: { employeeId },
  });
  return res.data;
}

/**
 * Get monthly attendance history for calendar view
 */
export async function getAttendanceHistory(employeeId, month) {
  const res = await api.get("/api/attendance/history", {
    params: { employeeId, month },
  });
  return res.data;
}

/**
 * Submit Attendance Regularization request
 */
export async function requestRegularization(payload) {
  const res = await api.post("/api/attendance/regularize", payload);
  return res.data;
}

/**
 * Approve or Reject Regularization (Manager/Admin)
 */
export async function reviewRegularization(payload) {
  const res = await api.post("/api/attendance/approve-regularization", payload);
  return res.data;
}
