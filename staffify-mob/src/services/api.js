import axios from "axios";

// Default API Base URL: in browser dev uses localhost:5000, in APK can be configured
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // If running in browser/PWA
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return `http://${window.location.hostname}:5000`;
  }
  return "http://localhost:5000";
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("staffify_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto redirect on login page
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("staffify_token");
        localStorage.removeItem("staffify_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
