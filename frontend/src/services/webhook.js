import api from "./api";

export const getWebhookConfigs = async () => {
  const res = await api.get("/api/webhooks/configs");
  return res.data;
};

export const createWebhookConfig = async (data) => {
  const res = await api.post("/api/webhooks/configs", data);
  return res.data;
};

export const updateWebhookConfig = async (id, data) => {
  const res = await api.put(`/api/webhooks/configs/${id}`, data);
  return res.data;
};

export const deleteWebhookConfig = async (id) => {
  const res = await api.delete(`/api/webhooks/configs/${id}`);
  return res.data;
};

export const testDispatchWebhook = async (data) => {
  const res = await api.post("/api/webhooks/test-dispatch", data);
  return res.data;
};

export const getWebhookLogs = async (params = {}) => {
  const res = await api.get("/api/webhooks/logs", { params });
  return res.data;
};

export const submitInteractiveAction = async (data) => {
  const res = await api.post("/api/webhooks/interactive-action", data);
  return res.data;
};

export const triggerMissedPunchNudge = async () => {
  const res = await api.post("/api/webhooks/trigger-missed-punch");
  return res.data;
};

export const getWebhookMetrics = async () => {
  const res = await api.get("/api/webhooks/metrics");
  return res.data;
};
