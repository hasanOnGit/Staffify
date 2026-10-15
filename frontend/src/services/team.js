import api from "./api";

/**
 * Get all active teams
 */
export async function getTeams() {
  const res = await api.get("/api/teams");
  return res.data;
}

/**
 * Get single team details by ID
 */
export async function getTeamById(teamId) {
  const res = await api.get(`/api/teams/${teamId}`);
  return res.data;
}

/**
 * Create new team
 */
export async function createTeam(payload) {
  const res = await api.post("/api/teams", payload);
  return res.data;
}

/**
 * Update team details
 */
export async function updateTeam(teamId, payload) {
  const res = await api.put(`/api/teams/${teamId}`, payload);
  return res.data;
}

/**
 * Delete a team
 */
export async function deleteTeam(teamId) {
  const res = await api.delete(`/api/teams/${teamId}`);
  return res.data;
}

/**
 * Assign manager to team
 */
export async function addTeamManager(teamId, employeeId) {
  const res = await api.post(`/api/teams/${teamId}/managers`, { employeeId });
  return res.data;
}

/**
 * Remove manager from team
 */
export async function removeTeamManager(teamId, employeeId) {
  const res = await api.delete(`/api/teams/${teamId}/managers/${employeeId}`);
  return res.data;
}

/**
 * Add member to team
 */
export async function addTeamMember(teamId, payload) {
  const res = await api.post(`/api/teams/${teamId}/members`, payload);
  return res.data;
}

/**
 * Remove member from team
 */
export async function removeTeamMember(teamId, employeeId) {
  const res = await api.delete(`/api/teams/${teamId}/members/${employeeId}`);
  return res.data;
}
