const rateLimit = require("express-rate-limit");

/**
 * Staffify Security Tier: Rate Limiting Matrix
 * Protects against brute-force, credential stuffing, and DoS attacks.
 */

// Strict limiter for authentication & credentials endpoints
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // limit each IP to 25 auth requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    error: "Too many authentication attempts from this IP address. Please try again in 15 minutes.",
  },
});

// General API request limiter
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // generous ceiling for SPA and Polling
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: "API rate limit exceeded. Please throttle your requests.",
  },
});

// Sensitive operations limiter (e.g. payroll execution, bulk exports, wipe operations)
const sensitiveActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 45,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: "Operation rate limit exceeded for sensitive action. Please try again shortly.",
  },
});

module.exports = {
  authRateLimiter,
  apiRateLimiter,
  sensitiveActionLimiter,
};
