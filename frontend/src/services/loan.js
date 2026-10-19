import api from "./api";

export const getLoans = async (params = {}) => {
  const res = await api.get("/api/loans", { params });
  return res.data;
};

export const getLoanSummary = async (params = {}) => {
  const res = await api.get("/api/loans/summary", { params });
  return res.data;
};

export const applyLoan = async (data) => {
  const res = await api.post("/api/loans/apply", data);
  return res.data;
};

export const approveLoan = async (id, data) => {
  const res = await api.put(`/api/loans/${id}/approve`, data);
  return res.data;
};

export const recordLoanRepayment = async (id, data) => {
  const res = await api.post(`/api/loans/${id}/repay`, data);
  return res.data;
};
