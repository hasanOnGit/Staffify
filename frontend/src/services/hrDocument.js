import api from "./api";

export const getDocuments = async (params = {}) => {
  const res = await api.get("/api/documents", { params });
  return res.data;
};

export const getDocumentTemplates = async () => {
  const res = await api.get("/api/documents/templates");
  return res.data;
};

export const getDocumentById = async (id) => {
  const res = await api.get(`/api/documents/${id}`);
  return res.data;
};

export const generateDocument = async (data) => {
  const res = await api.post("/api/documents/generate", data);
  return res.data;
};
