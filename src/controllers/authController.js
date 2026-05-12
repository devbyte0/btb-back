const { asyncHandler } = require("../utils/asyncHandler");
const User = require("../models/User");
const { signAccessToken } = require("../utils/jwt");
const { ROLES } = require("../constants/roles");

const registerByPrivilegedUser = asyncHandler(async (req, res) => {
  const creator = req.user;
  const { name, username, password, role, email, phone } = req.body;
  if (creator.role === "trainer" && role !== "student") {
    return res.status(403).json({ success: false, message: "Trainer can only create students" });
  }
  if (creator.role === "admin" && role === "super_admin") {
    return res.status(403).json({ success: false, message: "Only super admin can create super admin" });
  }

  const existing = await User.findOne({ username: username.toLowerCase() });
  if (existing) {
    return res.status(409).json({ success: false, message: "Username already exists" });
  }

  const user = await User.create({
    name,
    username,
    password,
    role,
    email,
    phone,
    createdBy: creator._id,
  });

  return res.status(201).json({
    success: true,
    data: { id: user._id, username: user.username, role: user.role, name: user.name },
  });
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username: username.toLowerCase() }).select("+password");
  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const token = signAccessToken(user);

  return res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    },
  });
});

const me = asyncHandler(async (req, res) => {
  return res.status(200).json({ success: true, data: req.user });
});

const registerStudent = asyncHandler(async (req, res) => {
  const { name, username, password, email, phone } = req.body;
  const existing = await User.findOne({ username: username.toLowerCase() });
  if (existing) {
    return res.status(409).json({ success: false, message: "Username already exists" });
  }

  const student = await User.create({
    name,
    username,
    password,
    email,
    phone,
    role: ROLES.STUDENT,
  });

  return res.status(201).json({
    success: true,
    data: { id: student._id, name: student.name, username: student.username, role: student.role },
  });
});

module.exports = { login, me, registerByPrivilegedUser, registerStudent };
