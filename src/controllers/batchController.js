const { asyncHandler } = require("../utils/asyncHandler");
const Batch = require("../models/Batch");
const User = require("../models/User");
const Course = require("../models/Course");
const { ROLES } = require("../constants/roles");
const { sendBatchAssignedEmail } = require("./emailController");

const normalizeCourseIds = (courseId, courseIds = []) => {
  const set = new Set();
  if (courseId) set.add(courseId.toString());
  courseIds.forEach((id) => set.add(id.toString()));
  return Array.from(set);
};

const createBatch = asyncHandler(async (req, res) => {
  const { name, code, courseId, courseIds = [] } = req.body;
  const resolvedCourseIds = normalizeCourseIds(courseId, courseIds);
  if (resolvedCourseIds.length === 0) {
    return res.status(400).json({ success: false, message: "At least one course is required" });
  }

  const courses = await Course.find({ _id: { $in: resolvedCourseIds } }).select("_id");
  if (courses.length !== resolvedCourseIds.length) {
    return res.status(404).json({ success: false, message: "One or more courses not found" });
  }

  const existing = await Batch.findOne({ code: code.toUpperCase() });
  if (existing) {
    return res.status(409).json({ success: false, message: "Batch code already exists" });
  }

  const batch = await Batch.create({
    name,
    code: code.toUpperCase(),
    course: resolvedCourseIds[0],
    courses: resolvedCourseIds,
    createdBy: req.user._id,
  });

  return res.status(201).json({ success: true, data: batch });
});

const listBatches = asyncHandler(async (_req, res) => {
  const batches = await Batch.find({ isActive: true })
    .populate("course", "title")
    .populate("courses", "title")
    .populate("students", "name username role email phone")
    .populate("trainers", "name username role email phone")
    .sort({ createdAt: -1 });

  return res.status(200).json({ success: true, data: batches });
});

const getBatchById = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.batchId)
    .populate("course", "title")
    .populate("courses", "title")
    .populate("students", "name username role email phone")
    .populate("trainers", "name username role email phone");
  if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });
  return res.status(200).json({ success: true, data: batch });
});

const updateBatch = asyncHandler(async (req, res) => {
  const updates = {};
  ["name", "code", "course", "isActive"].forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });
  if (updates.code) updates.code = updates.code.toUpperCase();

  if (req.body.courseId || req.body.courseIds) {
    const resolvedCourseIds = normalizeCourseIds(req.body.courseId, req.body.courseIds || []);
    if (resolvedCourseIds.length === 0) {
      return res.status(400).json({ success: false, message: "At least one course is required" });
    }
    const courses = await Course.find({ _id: { $in: resolvedCourseIds } }).select("_id");
    if (courses.length !== resolvedCourseIds.length) {
      return res.status(404).json({ success: false, message: "One or more courses not found" });
    }
    updates.courses = resolvedCourseIds;
    updates.course = resolvedCourseIds[0];
  }

  const batch = await Batch.findByIdAndUpdate(req.params.batchId, updates, { new: true })
    .populate("course", "title")
    .populate("courses", "title")
    .populate("students", "name username role email phone")
    .populate("trainers", "name username role email phone");

  if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });
  return res.status(200).json({ success: true, data: batch });
});

// FIXED: Now replaces students array (required for Remove & Transfer)
const assignStudentsToBatch = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  let { studentIds = [] } = req.body;

  if (!Array.isArray(studentIds)) studentIds = [];

  const validStudents = await User.find({
    _id: { $in: studentIds },
    role: ROLES.STUDENT,
  }).select("_id");

  if (studentIds.length > 0 && validStudents.length !== studentIds.length) {
    return res.status(400).json({ success: false, message: "One or more student IDs are invalid" });
  }

  const batch = await Batch.findByIdAndUpdate(
    batchId,
    { students: studentIds },          // ← Direct replacement (this fixes remove/transfer)
    { new: true }
  )
    .populate("course", "title")
    .populate("courses", "title")
    .populate("students", "name username role email phone")
    .populate("trainers", "name username role email phone");

  if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });

  for (const sid of studentIds) {
    sendBatchAssignedEmail(sid, batch).catch(() => {});
  }

  return res.status(200).json({ success: true, data: batch });
});

const assignTrainersToBatch = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  const { trainerIds = [] } = req.body;

  if (!Array.isArray(trainerIds) || trainerIds.length === 0) {
    return res.status(400).json({ success: false, message: "trainerIds array is required" });
  }

  const validTrainers = await User.find({
    _id: { $in: trainerIds },
    role: ROLES.TRAINER,
  }).select("_id");

  if (validTrainers.length !== trainerIds.length) {
    return res.status(400).json({ success: false, message: "One or more trainer IDs are invalid" });
  }

  const batch = await Batch.findByIdAndUpdate(
    batchId,
    { trainers: trainerIds },
    { new: true }
  )
    .populate("course", "title")
    .populate("courses", "title")
    .populate("students", "name username role email phone")
    .populate("trainers", "name username role email phone");

  if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });

  return res.status(200).json({ success: true, data: batch });
});

const deleteBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.batchId);
  if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });
  await Batch.findByIdAndDelete(req.params.batchId);
  return res.status(200).json({ success: true, message: "Batch deleted" });
});

const addScheduleItem = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.batchId);
  if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });
  batch.schedule.push(req.body);
  await batch.save();
  return res.status(201).json({ success: true, data: batch });
});

const updateScheduleItem = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.batchId);
  if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });
  const item = batch.schedule.id(req.params.scheduleId);
  if (!item) return res.status(404).json({ success: false, message: "Schedule item not found" });
  Object.assign(item, req.body);
  await batch.save();
  return res.status(200).json({ success: true, data: batch });
});

const removeScheduleItem = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.batchId);
  if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });
  batch.schedule.pull({ _id: req.params.scheduleId });
  await batch.save();
  return res.status(200).json({ success: true, data: batch });
});

const getStudentBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findOne({ students: req.user._id, isActive: true })
    .populate("course", "title")
    .populate("courses", "title")
    .populate("students", "name username role email phone")
    .populate("trainers", "name username role email phone");
  return res.status(200).json({ success: true, data: batch || null });
});

module.exports = {
  createBatch, listBatches, getBatchById, updateBatch,
  assignStudentsToBatch, assignTrainersToBatch, deleteBatch,
  addScheduleItem, updateScheduleItem, removeScheduleItem,
  getStudentBatch,
};