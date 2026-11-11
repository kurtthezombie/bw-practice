const jwt = require("jsonwebtoken");

// require authentication middleware
function requireAuth(req, res, next) {
  const authorization = req.get("Authorization") ?? "";
  const match = /^Bearer\s+(\S+)$/i.exec(authorization);

  if (!match) {
    return res.status(401).json({ error: "Bearer token required" });
  }

  try {
    req.auth = jwt.verify(match[1], process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  next();
}

module.exports = requireAuth;