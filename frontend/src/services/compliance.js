import api from "./api";

export const getComplianceSummary = async (month, year) => {
  const res = await api.get(`/api/compliance/summary?month=${month}&year=${year}`);
  return res.data;
};

const getDownloadBase = () => {
  return import.meta.env.PROD ? "" : (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000");
};

export const downloadEpfoEcr = (month, year) => {
  window.open(`${getDownloadBase()}/api/compliance/epfo-ecr?month=${month}&year=${year}`, "_blank");
};

export const downloadEsicReturn = (month, year) => {
  window.open(`${getDownloadBase()}/api/compliance/esic-return?month=${month}&year=${year}`, "_blank");
};

export const downloadBankDisbursement = (month, year) => {
  window.open(`${getDownloadBase()}/api/compliance/bank-disbursement?month=${month}&year=${year}`, "_blank");
};
