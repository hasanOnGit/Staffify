import axios from "axios";

const api = axios.create({
  baseURL: "https://staffify-backend-1.onrender.com", // ✅ MUST be 5000
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
