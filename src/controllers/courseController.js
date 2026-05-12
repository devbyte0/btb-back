const { asyncHandler } = require("../utils/asyncHandler");
const Course = require("../models/Course");
const { ADMIN_ROLES } = require("../constants/roles");

const createCourse = asyncHandler(async (req, res) => {
  const payload = { ...req.body, createdBy: req.user._id };
  const course = await Course.create(payload);
  return res.status(201).json({ success: true, data: course });
});

const listCourses = asyncHandler(async (_req, res) => {
  const courses = await Course.find({ isActive: true }).sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: courses });
});

const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    return res.status(404).json({ success: false, message: "Course not found" });
  }
  return res.status(200).json({ success: true, data: course });
});

const updateCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const updates = {};
  ["title", "description", "durationDays", "basePrice", "thumbnailUrl", "isActive"].forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });
  const course = await Course.findByIdAndUpdate(courseId, updates, { new: true });
  if (!course) {
    return res.status(404).json({ success: false, message: "Course not found" });
  }
  return res.status(200).json({ success: true, data: course });
});

const updateCourseDiscount = asyncHandler(async (req, res) => {
  if (!ADMIN_ROLES.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Only admins can apply discounts" });
  }
  const { courseId } = req.params;
  const { adminDiscountType, adminDiscountValue } = req.body;
  const course = await Course.findByIdAndUpdate(
    courseId,
    { adminDiscountType, adminDiscountValue },
    { new: true }
  );
  if (!course) {
    return res.status(404).json({ success: false, message: "Course not found" });
  }
  return res.status(200).json({ success: true, data: course });
});

const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    return res.status(404).json({ success: false, message: "Course not found" });
  }
  await Course.findByIdAndDelete(req.params.courseId);
  return res.status(200).json({ success: true, message: "Course deleted" });
});

module.exports = {
  createCourse,
  listCourses,
  getCourseById,
  updateCourse,
  updateCourseDiscount,
  deleteCourse,
};
