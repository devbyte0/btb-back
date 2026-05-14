const { asyncHandler } = require("../utils/asyncHandler");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const Batch = require("../models/Batch");
const Attendance = require("../models/Attendance");
const { ROLES, ADMIN_ROLES } = require("../constants/roles");

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select("-password");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  return res.status(200).json({ success: true, data: user });
});

const createStudentByTrainer = asyncHandler(async (req, res) => {
  const { name, username, password, phone, email } = req.body;
  const existing = await User.findOne({ username: username.toLowerCase() });
  if (existing) {
    return res.status(409).json({ success: false, message: "Username already exists" });
  }

  const user = await User.create({
    name,
    username,
    password,
    phone,
    email,
    role: ROLES.STUDENT,
    createdBy: req.user._id,
  });

  return res.status(201).json({
    success: true,
    data: { id: user._id, name: user.name, username: user.username, role: user.role },
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (req.user.role === ROLES.TRAINER && user.role !== ROLES.STUDENT) {
    return res.status(403).json({ success: false, message: "Trainer can only update students" });
  }

  const updates = {};
  ["name", "phone", "email", "isActive"].forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const updated = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
  return res.status(200).json({ success: true, data: updated });
});

const listUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role } : {};
  const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: users });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  if (!Object.values(ROLES).includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  if (role === ROLES.SUPER_ADMIN && req.user.role !== ROLES.SUPER_ADMIN) {
    return res.status(403).json({ success: false, message: "Only super admin can assign this role" });
  }

  if (!ADMIN_ROLES.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Not allowed" });
  }

  const updated = await User.findByIdAndUpdate(userId, { role }, { new: true }).select("-password");
  if (!updated) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  return res.status(200).json({ success: true, data: updated });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  if (user.role === ROLES.SUPER_ADMIN) {
    return res.status(403).json({ success: false, message: "Super admin cannot be deleted" });
  }
  await User.findByIdAndDelete(userId);
  return res.status(200).json({ success: true, message: "User deleted" });
});

const updateProfile = asyncHandler(async (req, res) => {
  const updates = {};
  ["name", "phone", "email", "profilePic"].forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  // Handle username separately with uniqueness check
  if (req.body.username !== undefined) {
    const existing = await User.findOne({ username: req.body.username.toLowerCase(), _id: { $ne: req.user._id } });
    if (existing) return res.status(409).json({ success: false, message: "Username already taken" });
    updates.username = req.body.username.toLowerCase();
  }

  // Handle password change
  if (req.body.newPassword) {
    if (!req.body.currentPassword) {
      return res.status(400).json({ success: false, message: "Current password is required to set a new password" });
    }
    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: "Current password is incorrect" });

    const bcrypt = require("bcryptjs");
    updates.password = await bcrypt.hash(req.body.newPassword, 12);
  }

  const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
  return res.status(200).json({ success: true, data: updated });
});

const deleteStudentFull = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const student = await User.findById(studentId);
  if (!student) return res.status(404).json({ success: false, message: "Student not found" });
  if (student.role !== ROLES.STUDENT) return res.status(400).json({ success: false, message: "User is not a student" });

  // Delete all enrollments
  await Enrollment.deleteMany({ student: studentId });

  // Remove from all batches
  await Batch.updateMany(
    { students: studentId },
    { $pull: { students: studentId } }
  );

  // Delete the user
  await User.findByIdAndDelete(studentId);

  return res.status(200).json({
    success: true,
    message: `Student "${student.name}" deleted along with enrollments and batch memberships`,
  });
});

const getStudentFullData = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const student = await User.findById(studentId).select("-password");
  if (!student || student.role !== ROLES.STUDENT) return res.status(404).json({ success: false, message: "Student not found" });

  const [enrollments, batches, attendanceRecords] = await Promise.all([
    Enrollment.find({ student: studentId }).populate("course", "title basePrice durationDays").sort({ createdAt: -1 }),
    Batch.find({ students: studentId, isActive: true }).populate("courses", "title").populate("trainers", "name username email phone"),
    Attendance.find({ batch: { $in: (await Batch.find({ students: studentId }).select("_id")).map((b) => b._id) } }).populate("batch", "name code").populate("records.student", "name username").sort({ sessionDate: -1 }),
  ]);

  return res.status(200).json({ success: true, data: { student, enrollments, batches, attendanceRecords } });
});

module.exports = {
  createStudentByTrainer, getUserById, updateUser, listUsers, updateUserRole,
  deleteUser, updateProfile, deleteStudentFull, getStudentFullData,
};
