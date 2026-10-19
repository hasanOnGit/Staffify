import api from "./api";

export const getTaxDeclaration = async (employeeId, financialYear = "2024-2025") => {
  const res = await api.get(`/api/tax/declaration/${employeeId}?financialYear=${financialYear}`);
  return res.data;
};

export const saveTaxDeclaration = async (data) => {
  const res = await api.post("/api/tax/declaration", data);
  return res.data;
};

export const submitTaxDeclaration = async (employeeId, financialYear = "2024-2025") => {
  const res = await api.post("/api/tax/declaration/submit", { employeeId, financialYear });
  return res.data;
};

export const getAllTaxDeclarations = async (financialYear = "2024-2025") => {
  const res = await api.get(`/api/tax/all-declarations?financialYear=${financialYear}`);
  return res.data;
};

export const verifyTaxDeclaration = async (data) => {
  const res = await api.put("/api/tax/declaration/verify", data);
  return res.data;
};
