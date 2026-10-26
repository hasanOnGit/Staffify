import api from "./api";

export const aiService = {
  /**
   * Send a query or follow-up to Staffify AI Copilot
   */
  async sendMessage(message, conversationId = null, currentRoute = "") {
    const res = await api.post("/ai/chat", {
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
    const res = await api.post("/ai/action/confirm", {
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
    const res = await api.get("/ai/conversations");
    return res.data?.data || [];
  },

  /**
   * Get specific conversation thread by ID
   */
  async getConversation(id) {
    const res = await api.get(`/ai/conversations/${id}`);
    return res.data?.data;
  },

  /**
   * Delete conversation thread
   */
  async deleteConversation(id) {
    const res = await api.delete(`/ai/conversations/${id}`);
    return res.data;
  },

  /**
   * Get role-tailored capabilities and suggested prompts
   */
  async getCapabilities() {
    const res = await api.get("/ai/capabilities");
    return res.data?.data || [];
  },

  /**
   * Export query results to CSV
   */
  async exportData(title = "staffify_export", records = [], columns = []) {
    const res = await api.post(
      "/ai/export",
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
};

export default aiService;
