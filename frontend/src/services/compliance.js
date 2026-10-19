import api from "./api";

export const getComplianceSummary = async (month, year) => {
  const res = await api.get(`/api/compliance/summary?month=${month}&year=${year}`);
  return res.data;
};

export const downloadEpfoEcr = (month, year) => {
  window.open(`http://localhost:5000/api/compliance/epfo-ecr?month=${month}&year=${year}`, "_blank");
};

export const downloadEsicReturn = (month, year) => {
  window.open(`http://localhost:5000/api/compliance/esic-return?month=${month}&year=${year}`, "_blank");
};

export const downloadBankDisbursement = (month, year) => {
  window.open(`http://localhost:5000/api/compliance/bank-disbursement?month=${month}&year=${year}`, "_blank");
};
