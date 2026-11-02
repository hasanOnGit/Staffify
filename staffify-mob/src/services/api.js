import axios from "axios";

// Default API Base URL: in browser dev uses localhost:5000 or dynamic LAN IP, in APK can be configured
export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // If running in browser/PWA on phone over Wi-Fi
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return `http://${window.location.hostname}:5000`;
  }
  return "http://localhost:5000";
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
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
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("staffify_token");
        localStorage.removeItem("staffify_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// High-level API service methods
export const mobileService = {
  // Swipes / Attendance
  async punchAttendance(data) {
    try {
      const res = await api.post("/api/punch", data);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  },

  async getTodayAttendance(employeeId) {
    try {
      const res = await api.get(`/api/today?employeeId=${employeeId}`);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Leaves
  async getMyBalances() {
    try {
      const res = await api.get("/api/leaves/my-balances");
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async applyLeave(payload) {
    try {
      const res = await api.post("/api/leaves/apply", payload);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  },

  // Comp-Off
  async claimCompOff(payload) {
    try {
      const res = await api.post("/api/comp-off/request", payload);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  },

  // Approvals
  async getPendingLeaves() {
    try {
      const res = await api.get("/api/leaves/pending");
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async approveLeave(id) {
    try {
      const res = await api.post(`/api/leaves/${id}/approve`);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async rejectLeave(id, reason) {
    try {
      const res = await api.post(`/api/leaves/${id}/reject`, { reason });
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Broadcast
  async createBroadcast(payload) {
    try {
      const res = await api.post("/api/broadcast/create", payload);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};

export default api;
