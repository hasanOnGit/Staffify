/**
 * Staffify NoSQL Injection Sanitization Middleware
 * Recursively strips keys starting with '$' or containing '.' from request body, query, and params.
 * Prevents MongoDB operator injection attacks such as { "$ne": null } or { "$gt": "" }.
 */

function cleanObject(target) {
  if (!target || typeof target !== "object") {
    return target;
  }

  if (Array.isArray(target)) {
    return target.map((item) => cleanObject(item));
  }

  const clean = {};
  for (const [key, value] of Object.entries(target)) {
    // Drop keys starting with '$' or containing '.'
    if (key.startsWith("$") || key.includes(".")) {
      continue;
    }
    clean[key] = cleanObject(value);
  }
  return clean;
}

const sanitizeMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = cleanObject(req.body);
  }
  if (req.query && typeof req.query === "object") {
    req.query = cleanObject(req.query);
  }
  if (req.params && typeof req.params === "object") {
    req.params = cleanObject(req.params);
  }
  next();
};

module.exports = sanitizeMiddleware;
