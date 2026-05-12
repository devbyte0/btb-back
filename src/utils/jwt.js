const jwt = require("jsonwebtoken");

function signAccessToken(user) {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || "7d";
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET/JWT_SECRET is missing");
  }
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      username: user.username,
    },
    secret,
    { expiresIn }
  );
}

module.exports = { signAccessToken };
