import api from "./api";

export const getTimesheets = async (params = {}) => {
  const res = await api.get("/api/timesheets", { params });
  return res.data;
};

export const getTimesheetSummary = async () => {
  const res = await api.get("/api/timesheets/summary");
  return res.data;
};

export const saveTimesheet = async (data) => {
  const res = await api.post("/api/timesheets/save", data);
  return res.data;
};

export const approveTimesheet = async (id, data) => {
  const res = await api.put(`/api/timesheets/${id}/approve`, data);
  return res.data;
};

export const rejectTimesheet = async (id, data) => {
  const res = await api.put(`/api/timesheets/${id}/reject`, data);
  return res.data;
};
