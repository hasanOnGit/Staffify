import api from "./api";

/**
 * Generate a secure 7-day self-onboarding link for an offered candidate
 */
export const generateOnboardingLink = async (candidateId) => {
  const res = await api.post("/api/onboarding/generate-link", { candidateId });
  return res.data;
};

/**
 * Verify candidate onboarding token and load initial pre-fill info
 */
export const verifyOnboardingToken = async (token) => {
  const res = await api.get(`/api/onboarding/verify/${token}`);
  return res.data;
};

/**
 * Candidate submits digital self-onboarding profile and document vault
 */
export const submitCandidateOnboarding = async (token, payload) => {
  const res = await api.post(`/api/onboarding/submit/${token}`, payload);
  return res.data;
};

/**
 * Fetch candidates in the onboarding queue for HR review
 */
export const getOnboardingQueue = async () => {
  const res = await api.get("/api/onboarding/queue");
  return res.data;
};

/**
 * HR admits candidate into active workforce, creating Employee and User accounts
 */
export const admitCandidateToWorkforce = async (candidateId, payload = {}) => {
  const res = await api.post("/api/onboarding/admit", { candidateId, ...payload });
  return res.data;
};
