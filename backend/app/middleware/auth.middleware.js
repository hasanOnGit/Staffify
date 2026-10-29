const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "No token provided. Authorization denied.",
      msg: "No token provided. Authorization denied.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "staffify_super_secret_jwt_key_2026_dev"
    );
    
    // Normalize user identity across tokens
    req.user = {
      ...decoded,
      userId: decoded.userId || decoded.id,
      employeeId: decoded.employeeId || decoded.userId || decoded.id,
      role: decoded.role || "Employee",
    };
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired token.",
      msg: "Invalid or expired token.",
    });
  }
};

module.exports = authMiddleware;
