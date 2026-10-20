import axios from "axios";

const getBaseURL = () => {
  // Deployed frontend requests must stay same-origin. A stale VITE_API_BASE_URL
  // such as http://localhost:5000 would point the user's browser at their own computer.
  if (import.meta.env.PROD) {
    return "/api";
  }
  // Use an explicit backend URL only during local development.
  if (import.meta.env.VITE_API_BASE_URL !== undefined && import.meta.env.VITE_API_BASE_URL !== "") {
    return import.meta.env.VITE_API_BASE_URL;
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
