import api from "./api";

export const getAnalyticsCockpit = async () => {
  const res = await api.get("/api/analytics/cockpit");
  return res.data;
};
