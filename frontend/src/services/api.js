import axios from "axios";
import toast from "react-hot-toast";

const API = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor for centralized error notifications
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.msg ||
      error.message ||
      "An unexpected error occurred.";
    console.error("[API Error]", message);
    return Promise.reject(error);
  }
);

export const vendorsApi = {
  getAll: (params) => API.get("/vendors", { params }),
  getById: (id) => API.get(`/vendors/${id}`),
  create: (data) => API.post("/vendors", data),
  update: (id, data) => API.put(`/vendors/${id}`, data),
  delete: (id) => API.delete(`/vendors/${id}`),
};

export const clientsApi = {
  getAll: (params) => API.get("/clients", { params }),
  getById: (id) => API.get(`/clients/${id}`),
  create: (data) => API.post("/clients", data),
  update: (id, data) => API.put(`/clients/${id}`, data),
  addSite: (id, siteData) => API.post(`/clients/${id}/sites`, siteData),
  delete: (id) => API.delete(`/clients/${id}`),
};

export const commercialsApi = {
  getContracts: (params) => API.get("/commercials/contracts", { params }),
  createContract: (data) => API.post("/commercials/contracts", data),
  getPurchaseOrders: (params) => API.get("/commercials/purchase-orders", { params }),
  createPurchaseOrder: (data) => API.post("/commercials/purchase-orders", data),
};

export const deploymentsApi = {
  getAll: (params) => API.get("/deployments", { params }),
  deployWorker: (data) => API.post("/deployments", data),
  updateStatus: (id, data) => API.patch(`/deployments/${id}/status`, data),
};

export const invoicesApi = {
  getAll: (params) => API.get("/vendor-invoices", { params }),
  getById: (id) => API.get(`/vendor-invoices/${id}`),
  generate: (data) => API.post("/vendor-invoices/generate", data),
  updateStatus: (id, data) => API.patch(`/vendor-invoices/${id}/status`, data),
};

export const seedApi = {
  seedDatabase: () => API.post("/seed"),
  getStatus: () => API.get("/seed/status"),
};

export default API;
