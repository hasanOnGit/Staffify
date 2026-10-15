import api from "./api";

/**
 * Get goals with optional filters (employeeId, cycle, status)
 */
export async function getGoals(params = {}) {
  const res = await api.get("/api/performance/goals", { params });
  return res.data;
}

/**
 * Create a new goal
 */
export async function createGoal(goalData) {
  const res = await api.post("/api/performance/goals", goalData);
  return res.data;
}

/**
 * Update goal progress, status, or feedback
 */
export async function updateGoal(goalId, updates) {
  const res = await api.patch(`/api/performance/goals/${goalId}`, updates);
  return res.data;
}

/**
 * Delete a goal
 */
export async function deleteGoal(goalId) {
  const res = await api.delete(`/api/performance/goals/${goalId}`);
  return res.data;
}

/**
 * Get appraisals list
 */
export async function getAppraisals(params = {}) {
  const res = await api.get("/api/performance/appraisals", { params });
  return res.data;
}

/**
 * Submit employee self-appraisal
 */
export async function submitSelfAppraisal(payload) {
  const res = await api.post("/api/performance/appraisals/self-submit", payload);
  return res.data;
}

/**
 * Submit manager appraisal review
 */
export async function submitManagerReview(payload) {
  const res = await api.post("/api/performance/appraisals/manager-submit", payload);
  return res.data;
}

/**
 * Get 1-on-1 check-ins
 */
export async function getOneOnOne(params = {}) {
  const res = await api.get("/api/performance/one-on-one", { params });
  return res.data;
}

/**
 * Create a 1-on-1 meeting note
 */
export async function createOneOnOne(meetingData) {
  const res = await api.post("/api/performance/one-on-one", meetingData);
  return res.data;
}

/**
 * Get performance analytics overview
 */
export async function getPerformanceAnalytics(params = {}) {
  const res = await api.get("/api/performance/analytics", { params });
  return res.data;
}
