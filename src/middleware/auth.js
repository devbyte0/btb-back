const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");
const { ROLES, hasPermission } = require("../constants/roles");

const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET/JWT_SECRET is missing");
  }

  const payload = jwt.verify(token, secret);
  const user = await User.findById(payload.sub).select("-password");
  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: "Invalid token user" });
  }

  req.user = user;
  return next();
});

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    return next();
  };
}

function allowAction(moduleName, action) {
  return (req, res, next) => {
    if (!req.user || !hasPermission(req.user.role, moduleName, action)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    return next();
  };
}

module.exports = { requireAuth, allowRoles, allowAction };
