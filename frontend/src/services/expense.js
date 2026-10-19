import api from "./api";

export const getExpenses = async (params = {}) => {
  const res = await api.get("/api/expenses", { params });
  return res.data;
};

export const getExpenseSummary = async (params = {}) => {
  const res = await api.get("/api/expenses/summary", { params });
  return res.data;
};

export const submitExpense = async (data) => {
  const res = await api.post("/api/expenses/submit", data);
  return res.data;
};

export const approveExpenseManager = async (id, data) => {
  const res = await api.put(`/api/expenses/${id}/approve-manager`, data);
  return res.data;
};

export const approveExpenseFinance = async (id, data) => {
  const res = await api.put(`/api/expenses/${id}/approve-finance`, data);
  return res.data;
};

export const rejectExpense = async (id, data) => {
  const res = await api.put(`/api/expenses/${id}/reject`, data);
  return res.data;
};
