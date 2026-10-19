require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// CORS configuration supporting local dev, custom CLIENT_URL, and Vercel domains
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
    service: "Staffify Backend API",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "Staffify Backend API",
    timestamp: new Date().toISOString(),
  });
});

// Initialize database and routes
require("./app/config/db")(app);
require("./app/routes")(app);

// Export for serverless / Vercel deployment
module.exports = app;

// Start server if run directly (local development or standalone node process)
if (require.main === module || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
  });
}
