import api from "./api";

export const getAuditLogs = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.category) query.append("category", params.category);
  if (params.action) query.append("action", params.action);
  if (params.search) query.append("search", params.search);
  if (params.limit) query.append("limit", params.limit);

  const qs = query.toString();
  const url = qs ? `/api/audit-logs?${qs}` : "/api/audit-logs";
  const res = await api.get(url);
  return res.data?.data || [];
};

export const createAuditLog = async (data) => {
  const res = await api.post("/api/audit-logs", data);
  return res.data;
};
