import api from "./api";

/**
 * Get all active geofence zones
 */
export async function getGeofenceZones() {
  const res = await api.get("/api/geofence");
  return res.data;
}

/**
 * Create a new geofence perimeter
 */
export async function createGeofenceZone(zoneData) {
  const res = await api.post("/api/geofence", zoneData);
  return res.data;
}

/**
 * Update an existing geofence zone
 */
export async function updateGeofenceZone(zoneId, updates) {
  const res = await api.patch(`/api/geofence/${zoneId}`, updates);
  return res.data;
}

/**
 * Delete a geofence zone
 */
export async function deleteGeofenceZone(zoneId) {
  const res = await api.delete(`/api/geofence/${zoneId}`);
  return res.data;
}

/**
 * Verify employee's live GPS coordinates against assigned geofence
 */
export async function verifyEmployeeGeofence(payload) {
  const res = await api.post("/api/geofence/verify", payload);
  return res.data;
}
