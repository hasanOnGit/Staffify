const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./app/config/db");

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration supporting local dev and frontend ports
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

app.use(express.json());

// Basic health check routes
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "StaffifyGo Vendor & Staffing Management API",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "StaffifyGo Vendor & Staffing Management API",
    timestamp: new Date().toISOString(),
  });
});

// Initialize database and routes
connectDB();
require("./app/routes")(app);

// Start server
app.listen(PORT, () => {
  console.log(`[StaffifyGo API] Server running on port ${PORT}`);
});

module.exports = app;
