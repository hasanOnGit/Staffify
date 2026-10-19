import api from "./api";

export const getBiometricMachines = async () => {
  const res = await api.get("/api/biometric/machines");
  return res.data;
};

export const registerBiometricMachine = async (data) => {
  const res = await api.post("/api/biometric/machines", data);
  return res.data;
};

export const simulateBiometricPunch = async (data) => {
  const res = await api.post("/api/biometric/simulate-punch", data);
  return res.data;
};

export const syncBiometricLogs = async () => {
  const res = await api.post("/api/biometric/sync");
  return res.data;
};
