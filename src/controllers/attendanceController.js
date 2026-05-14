const { asyncHandler } = require("../utils/asyncHandler");
const Attendance = require("../models/Attendance");
const Batch = require("../models/Batch");
const { CREATOR_ROLES, ROLES } = require("../constants/roles");
const { notifyAttendanceMarked } = require("./notificationController");

const markAttendance = asyncHandler(async (req, res) => {
  if (!CREATOR_ROLES.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  const { batchId, sessionDate, records } = req.body;

  if (!records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ success: false, message: "Records array is required" });
  }

  const batch = await Batch.findById(batchId);
  if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });

  // Validate students belong to batch
  const batchStudentIds = batch.students.map((id) => id.toString());
  for (const r of records) {
    if (!batchStudentIds.includes(r.studentId?.toString())) {
      return res.status(400).json({ success: false, message: `Student ${r.studentId} not in batch` });
    }
  }

  const attendance = await Attendance.findOneAndUpdate(
    { batch: batchId, sessionDate: new Date(sessionDate) },
    {
      batch: batchId,
      sessionDate: new Date(sessionDate),
      markedBy: req.user._id,
      records: records.map((r) => ({
        student: r.studentId,
        status: r.status,
        notes: r.notes || "",
      })),
    },
    { upsert: true, new: true, runValidators: true }
  );

  notifyAttendanceMarked(attendance).catch(() => {});
  return res.status(200).json({ success: true, data: attendance });
});

const listAttendance = asyncHandler(async (req, res) => {
  const { batchId } = req.query;
  const filter = batchId ? { batch: batchId } : {};

  const records = await Attendance.find(filter)
    .populate("batch", "name code")
    .populate("records.student", "name username")
    .sort({ sessionDate: -1 });

  return res.status(200).json({ success: true, data: records });
});

const getAttendanceById = asyncHandler(async (req, res) => {
  const record = await Attendance.findById(req.params.attendanceId)
    .populate("batch", "name code")
    .populate("records.student", "name username");
  if (!record) return res.status(404).json({ success: false, message: "Attendance not found" });
  return res.status(200).json({ success: true, data: record });
});

const updateAttendance = asyncHandler(async (req, res) => {
  const { records } = req.body;
  const attendance = await Attendance.findByIdAndUpdate(
    req.params.attendanceId,
    {
      records: records.map((r) => ({
        student: r.studentId,
        status: r.status,
        notes: r.notes || "",
      })),
      markedBy: req.user._id,
    },
    { new: true, runValidators: true }
  );
  if (!attendance) return res.status(404).json({ success: false, message: "Attendance not found" });
  return res.status(200).json({ success: true, data: attendance });
});

const deleteAttendance = asyncHandler(async (req, res) => {
  const record = await Attendance.findByIdAndDelete(req.params.attendanceId);
  if (!record) return res.status(404).json({ success: false, message: "Attendance not found" });
  return res.status(200).json({ success: true, message: "Attendance deleted" });
});

module.exports = {
  markAttendance,
  listAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
};