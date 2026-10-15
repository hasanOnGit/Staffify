import api from "./api";

/**
 * Get all job openings with applicant counts
 */
export async function getJobs(params = {}) {
  const res = await api.get("/api/recruitment/jobs", { params });
  return res.data;
}

/**
 * Create a new job opening requisition
 */
export async function createJob(jobData) {
  const res = await api.post("/api/recruitment/jobs", jobData);
  return res.data;
}

/**
 * Update a job opening
 */
export async function updateJob(jobId, updates) {
  const res = await api.patch(`/api/recruitment/jobs/${jobId}`, updates);
  return res.data;
}

/**
 * Get candidates filterable by jobId or stage
 */
export async function getCandidates(params = {}) {
  const res = await api.get("/api/recruitment/candidates", { params });
  return res.data;
}

/**
 * Create candidate application
 */
export async function createCandidate(candidateData) {
  const res = await api.post("/api/recruitment/candidates", candidateData);
  return res.data;
}

/**
 * Move candidate pipeline stage
 */
export async function updateCandidateStage(candidateId, stageData) {
  const res = await api.patch(`/api/recruitment/candidates/${candidateId}/stage`, stageData);
  return res.data;
}

/**
 * Add interview feedback evaluation
 */
export async function addInterviewFeedback(candidateId, feedbackData) {
  const res = await api.post(`/api/recruitment/candidates/${candidateId}/feedback`, feedbackData);
  return res.data;
}

/**
 * 1-Click Convert Candidate to Employee (Onboarding)
 */
export async function convertCandidateToEmployee(candidateId, payload) {
  const res = await api.post(`/api/recruitment/candidates/${candidateId}/convert-to-employee`, payload);
  return res.data;
}
