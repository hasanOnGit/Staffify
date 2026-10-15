const API_BASE_URL = "http://localhost:5000/api";

export async function getAttendanceByDate(date) {
  const response = await fetch(
    `${API_BASE_URL}/attendance?date=${date}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch attendance");
  }
  return response.json();
}
