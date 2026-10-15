const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: "Unauthorized." });
    }

    const userRole = (req.user.role || "Employee").toLowerCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        msg: `Access denied. Requires one of: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
