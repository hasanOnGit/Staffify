import api from "./api";

export const getBroadcasts = async (params = {}) => {
  const res = await api.get("/api/pulse/broadcasts", { params });
  return res.data;
};

export const createBroadcast = async (data) => {
  const res = await api.post("/api/pulse/broadcasts", data);
  return res.data;
};

export const acknowledgeBroadcast = async (id, data) => {
  const res = await api.post(`/api/pulse/broadcasts/${id}/acknowledge`, data);
  return res.data;
};

export const getKudos = async (params = {}) => {
  const res = await api.get("/api/pulse/kudos", { params });
  return res.data;
};

export const giveKudos = async (data) => {
  const res = await api.post("/api/pulse/kudos", data);
  return res.data;
};

export const likeKudos = async (id, data) => {
  const res = await api.post(`/api/pulse/kudos/${id}/like`, data);
  return res.data;
};

export const getMilestones = async () => {
  const res = await api.get("/api/pulse/milestones");
  return res.data;
};
