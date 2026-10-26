import api from "./api";

export const aiService = {
  /**
   * Send a query or follow-up to Staffify AI Copilot
   */
  async sendMessage(message, conversationId = null, currentRoute = "") {
    const res = await api.post("/api/ai/chat", {
      message,
      conversationId,
      currentRoute,
    });
    return res.data;
  },

  /**
   * Execute an authorized action draft
   */
  async confirmAction(actionType, params, conversationId = null) {
    const res = await api.post("/api/ai/action/confirm", {
      actionType,
      params,
      conversationId,
    });
    return res.data;
  },

  /**
   * List conversation history threads
   */
  async getConversations() {
    const res = await api.get("/api/ai/conversations");
    return res.data?.data || [];
  },

  /**
   * Get specific conversation thread by ID
   */
  async getConversation(id) {
    const res = await api.get(`/api/ai/conversations/${id}`);
    return res.data?.data;
  },

  /**
   * Delete conversation thread
   */
  async deleteConversation(id) {
    const res = await api.delete(`/api/ai/conversations/${id}`);
    return res.data;
  },

  /**
   * Get role-tailored capabilities and suggested prompts
   */
  async getCapabilities() {
    const res = await api.get("/api/ai/capabilities");
    return res.data?.data || [];
  },

  /**
   * Check AI model status, active engine, and Gemini availability flag
   */
  async getStatus() {
    const res = await api.get("/api/ai/status");
    return res.data;
  },

  /**
   * Export query results to CSV
   */
  async exportData(title = "staffify_export", records = [], columns = []) {
    const res = await api.post(
      "/api/ai/export",
      { title, records, columns },
      { responseType: "blob" }
    );
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Get query audit logs with pagination and search
   */
  async getLogs(params = {}) {
    const res = await api.get("/api/ai/logs", { params });
    return res.data;
  },

  /**
   * Submit helpfulness feedback on specific query log
   */
  async submitFeedback(logId, feedback) {
    const res = await api.post(`/api/ai/logs/${logId}/feedback`, { feedback });
    return res.data;
  },

  /**
   * Retrieve open-source HR knowledge base articles
   */
  async getKnowledgeBase(params = {}) {
    const res = await api.get("/api/ai/knowledge", { params });
    return res.data?.data || [];
  },

  /**
   * Download AI instruction-tuning training dataset (JSONL)
   */
  async downloadTrainingDataset() {
    const res = await api.get("/api/ai/training-dataset", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `staffify_ai_training_dataset_${Date.now()}.jsonl`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Retrieve Autonomous Workforce Watchdog Executive Morning Digest
   */
  async getWatchdogDigest() {
    const res = await api.get("/api/ai/watchdog/digest");
    return res.data?.digest;
  },

  /**
   * Retrieve active or filtered workforce anomaly alerts
   */
  async getWatchdogAlerts(params = {}) {
    const res = await api.get("/api/ai/watchdog/alerts", { params });
    return res.data?.data || [];
  },

  /**
   * Resolve an anomaly alert with audit notes
   */
  async resolveAnomalyAlert(id, resolutionNotes = "") {
    const res = await api.post(`/api/ai/watchdog/alerts/${id}/resolve`, { resolutionNotes });
    return res.data;
  },

  /**
   * Multimodal Resume Scanner & Candidate Match Analysis
   */
  async parseResume(fileBase64, mimeType = "application/pdf", jobId = null) {
    const res = await api.post("/api/ai/multimodal/parse-resume", {
      fileBase64,
      mimeType,
      jobId,
    });
    return res.data?.data;
  },

  /**
   * Multimodal Smart Expense Receipt OCR
   */
  async parseReceipt(fileBase64, mimeType = "image/jpeg") {
    const res = await api.post("/api/ai/multimodal/parse-receipt", {
      fileBase64,
      mimeType,
    });
    return res.data?.data;
  },

  /**
   * Get available corporate HR letter templates
   */
  async getDocumentTemplates() {
    const res = await api.get("/api/ai/documents/templates");
    return res.data?.templates || [];
  },

  /**
   * Synthesize legally grounded HR document
   */
  async generateDocument(payload) {
    const res = await api.post("/api/ai/documents/generate", payload);
    return res.data?.document;
  },

  /**
   * Get historical generated HR documents
   */
  async getGeneratedDocuments(params = {}) {
    const res = await api.get("/api/ai/documents", { params });
    return res.data?.data || [];
  },
};

export default aiService;
