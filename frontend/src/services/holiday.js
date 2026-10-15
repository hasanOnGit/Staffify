import api from "./api";

/**
 * Fetch all company and gazetted holidays
 */
export const getHolidays = async () => {
  const res = await api.get("/api/holidays");
  return res.data.data;
};

/**
 * Add a new holiday (Admin action)
 */
export const createHoliday = async (holidayData) => {
  const res = await api.post("/api/holidays", holidayData);
  return res.data.data;
};
