import api from "./api";

export const getOffboardingCases = async () => {
  const res = await api.get("/api/offboarding");
  return res.data;
};

export const getOffboardingAnalytics = async () => {
  const res = await api.get("/api/offboarding/analytics");
  return res.data;
};

export const updateAssetClearance = async (id, data) => {
  const res = await api.put(`/api/offboarding/${id}/asset-clearance`, data);
  return res.data;
};

export const updateAccountRevocation = async (id, data) => {
  const res = await api.put(`/api/offboarding/${id}/account-revocation`, data);
  return res.data;
};

export const submitExitInterview = async (id, data) => {
  const res = await api.post(`/api/offboarding/${id}/exit-interview`, data);
  return res.data;
};

export const finalizeOffboarding = async (id) => {
  const res = await api.put(`/api/offboarding/${id}/finalize`);
  return res.data;
};
