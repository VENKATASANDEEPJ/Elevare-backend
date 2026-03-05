const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/response");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return sendError(res, 401, "Authorization header is required");
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return sendError(res, 401, "Authorization header must be Bearer token");
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return sendError(res, 500, "Server auth configuration is invalid");
    }

    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;

    return next();
  } catch {
    return sendError(res, 401, "Invalid or expired token");
  }
};

module.exports = authMiddleware;
