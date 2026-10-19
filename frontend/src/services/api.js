import axios from "axios";

const getBaseURL = () => {
  // If explicitly configured in environment variables (e.g. Vercel dashboard), use it
  if (import.meta.env.VITE_API_BASE_URL !== undefined && import.meta.env.VITE_API_BASE_URL !== "") {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // In production (Vercel unified domain), use relative path so requests route through /api rewrites
  if (import.meta.env.PROD) {
    return "";
  }
  // Local development fallback
  return "http://localhost:5000";
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
