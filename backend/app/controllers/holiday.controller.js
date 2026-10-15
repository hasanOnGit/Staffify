const express = require("express");
const apiRoutes = express.Router();
const Holiday = require("../models/holiday.model");

// Default initial holidays list
const defaultHolidays = [
  { name: "New Year's Day", date: "2026-01-01", day: "Thursday", type: "Company", description: "First day of the new year" },
  { name: "Republic Day", date: "2026-01-26", day: "Monday", type: "National", description: "Celebration of the Constitution of India" },
  { name: "Maha Shivratri", date: "2026-02-15", day: "Sunday", type: "Gazetted", description: "Hindu festival celebrated annually in honour of Lord Shiva" },
  { name: "Holi", date: "2026-03-04", day: "Wednesday", type: "Gazetted", description: "Festival of colors and spring celebration" },
  { name: "Eid-ul-Fitr", date: "2026-03-21", day: "Saturday", type: "Gazetted", description: "Islamic festival marking the end of Ramadan" },
  { name: "Good Friday", date: "2026-04-03", day: "Friday", type: "Gazetted", description: "Christian holiday commemorating the crucifixion of Jesus" },
  { name: "Labor Day / May Day", date: "2026-05-01", day: "Friday", type: "Company", description: "International Workers' Day" },
  { name: "Bakrid / Eid al-Adha", date: "2026-05-27", day: "Wednesday", type: "Gazetted", description: "Feast of the Sacrifice" },
  { name: "Independence Day", date: "2026-08-15", day: "Saturday", type: "National", description: "Commemorates the nation's independence" },
  { name: "Raksha Bandhan", date: "2026-08-28", day: "Friday", type: "Restricted", description: "Celebration of sibling bonds" },
  { name: "Janmashtami", date: "2026-09-04", day: "Friday", type: "Gazetted", description: "Celebration of the birth of Lord Krishna" },
  { name: "Gandhi Jayanti", date: "2026-10-02", day: "Friday", type: "National", description: "Birthday of Mahatma Gandhi" },
  { name: "Dussehra (Vijayadashami)", date: "2026-10-20", day: "Tuesday", type: "Gazetted", description: "Triumph of good over evil" },
  { name: "Diwali (Deepavali)", date: "2026-11-08", day: "Sunday", type: "Gazetted", description: "Festival of lights" },
  { name: "Guru Nanak Jayanti", date: "2026-11-24", day: "Tuesday", type: "Gazetted", description: "Celebration of the birth of Guru Nanak" },
  { name: "Christmas Day", date: "2026-12-25", day: "Friday", type: "Gazetted", description: "Celebration of the birth of Jesus Christ" },
];

module.exports = function (app) {
  /* ==========================================================
     GET ALL HOLIDAYS (AUTO-SEEDS IF EMPTY)
     ========================================================== */
  apiRoutes.get("/", async (req, res) => {
    try {
      let holidays = await Holiday.find({}).sort({ date: 1 });

      if (holidays.length === 0) {
        // Auto-seed defaults
        await Holiday.insertMany(defaultHolidays);
        holidays = await Holiday.find({}).sort({ date: 1 });
      }

      return res.status(200).json({
        message: "Holidays fetched successfully",
        data: holidays,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     CREATE NEW HOLIDAY (ADMIN)
     ========================================================== */
  apiRoutes.post("/", async (req, res) => {
    try {
      const { name, date, day, type, description } = req.body;
      if (!name || !date) {
        return res.status(400).json({ error: "Name and date are required." });
      }

      const existing = await Holiday.findOne({ date });
      if (existing) {
        return res.status(400).json({ error: "A holiday already exists on this date." });
      }

      const holiday = await Holiday.create({
        name,
        date,
        day,
        type: type || "Gazetted",
        description,
      });

      return res.status(201).json({
        message: "Holiday created successfully",
        data: holiday,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.use("/api/holidays", apiRoutes);
};
