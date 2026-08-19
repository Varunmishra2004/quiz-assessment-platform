const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  try {
    if (!JWT_SECRET) {
      console.error("❌ JWT_SECRET is not configured");
      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured"
      });
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Canonical payload is { id, role }. userId is retained for compatibility.
    req.user = {
      ...decoded,
      id: decoded.id ?? decoded.userId,
      userId: decoded.id ?? decoded.userId
    };

    if (!req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

module.exports = { verifyToken };
