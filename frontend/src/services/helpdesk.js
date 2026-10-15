import api from "./api";

/**
 * Get tickets with optional filters (employeeId, status, category, priority)
 */
export async function getTickets(params = {}) {
  const res = await api.get("/api/helpdesk/tickets", { params });
  return res.data;
}

/**
 * Create a new support ticket
 */
export async function createTicket(ticketData) {
  const res = await api.post("/api/helpdesk/tickets", ticketData);
  return res.data;
}

/**
 * Update ticket status, assignment, or resolution notes
 */
export async function updateTicket(ticketId, updates) {
  const res = await api.patch(`/api/helpdesk/tickets/${ticketId}`, updates);
  return res.data;
}

/**
 * Add a comment to a ticket
 */
export async function addTicketComment(ticketId, commentData) {
  const res = await api.post(`/api/helpdesk/tickets/${ticketId}/comments`, commentData);
  return res.data;
}

/**
 * Get internal assets with optional filters (allocatedToId, status, category)
 */
export async function getAssets(params = {}) {
  const res = await api.get("/api/helpdesk/assets", { params });
  return res.data;
}

/**
 * Add a new asset to inventory
 */
export async function createAsset(assetData) {
  const res = await api.post("/api/helpdesk/assets", assetData);
  return res.data;
}

/**
 * Allocate asset to an employee
 */
export async function allocateAsset(payload) {
  const res = await api.post("/api/helpdesk/assets/allocate", payload);
  return res.data;
}

/**
 * Return asset to inventory
 */
export async function returnAsset(payload) {
  const res = await api.post("/api/helpdesk/assets/return", payload);
  return res.data;
}
