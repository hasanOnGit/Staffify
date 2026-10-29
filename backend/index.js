const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const crypto = require("crypto");
const sanitizeMiddleware = require("./app/middleware/sanitize.middleware");
const { apiRateLimiter } = require("./app/middleware/rateLimiter.middleware");

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// 1. Security HTTP Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hidePoweredBy: true,
  })
);

// 2. Correlation ID for Request Tracing
app.use((req, res, next) => {
  const correlationId = req.headers["x-request-id"] || crypto.randomUUID();
  req.id = correlationId;
  res.setHeader("X-Request-Id", correlationId);
  next();
});

// 3. CORS configuration supporting local dev, custom CLIENT_URL, and Vercel domains
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    exposedHeaders: ["X-Request-Id", "RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"],
  })
);

// 4. Request Body Size Limits & Parsing (Prevent memory exhaustion DoS)
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// 5. NoSQL Injection Prevention & Operator Sanitization
app.use(sanitizeMiddleware);

// 6. Global API Rate Limiter
app.use("/api", apiRateLimiter);

// 7. Basic health check routes
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "Staffify Enterprise Backend API",
    requestId: req.id,
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "Staffify Enterprise Backend API",
    requestId: req.id,
    timestamp: new Date().toISOString(),
  });
});

// 8. Initialize database and routes
require("./app/config/db")(app);
require("./app/routes")(app);

// 9. Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  console.error(`[ERROR] [${req.id || "REQ-UNKNOWN"}] ${req.method} ${req.url}:`, err);
  
  res.status(status).json({
    status,
    requestId: req.id,
    error: status === 500 && process.env.NODE_ENV === "production"
      ? "An unexpected internal server error occurred."
      : err.message || "An unexpected error occurred",
  });
});

// Export for serverless / Vercel deployment
module.exports = app;

// Start server if run directly (local development or standalone node process)
if (require.main === module || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Staffify backend running securely on port ${PORT}`);
  });
}
