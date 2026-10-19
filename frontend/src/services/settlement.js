import api from "./api";

export const getSettlements = async () => {
  const res = await api.get("/api/settlements");
  return res.data;
};

export const getSettlementByEmployee = async (employeeId) => {
  const res = await api.get(`/api/settlements/${employeeId}`);
  return res.data;
};

export const initiateSettlement = async (data) => {
  const res = await api.post("/api/settlements/initiate", data);
  return res.data;
};

export const updateClearance = async (id, data) => {
  const res = await api.put(`/api/settlements/${id}/clearance`, data);
  return res.data;
};

export const finalizeSettlement = async (id, data) => {
  const res = await api.put(`/api/settlements/${id}/finalize`, data);
  return res.data;
};
