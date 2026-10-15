import api from "./api";

/* =============================
   GET PROFILE
============================= */
export const getProfile = async (userId) => {
  const res = await api.get(`/getProfile/${userId}`);
  return res.data.data;
};

/* =============================
   UPDATE PROFILE
============================= */
export const updateProfile = async (userId, payload) => {
  const res = await api.post(`/updateProfile/${userId}`, payload);
  return res.data;
};
