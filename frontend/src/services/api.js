import axios from "axios";

const getBaseURL = () => {
  // Keep production requests same-origin so they always use the deployed backend.
  // Only local development may opt into a separate backend URL.
  if (!import.meta.env.PROD && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return "/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
