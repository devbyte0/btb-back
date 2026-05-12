const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["present", "absent", "late"], required: true },
  notes: { type: String, trim: true, default: "" },
});

const attendanceSchema = new mongoose.Schema(
  {
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    sessionDate: { type: Date, required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    records: [attendanceRecordSchema],
  },
  { timestamps: true }
);

attendanceSchema.index({ batch: 1, sessionDate: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

const KNOWN_STALE_INDEXES = [
  "course_1_student_1_date_1",
  "enrollment_1_sessionDate_1",
  "course_1_student_1_1",
  "student_1_course_1",
];

async function dropStaleIndexes() {
  try {
    const indexes = await Attendance.collection.indexes();
    for (const idx of indexes) {
      if (idx.name === "_id_" || idx.name === "batch_1_sessionDate_1") continue;
      await Attendance.collection.dropIndex(idx.name).catch(() => {});
      console.log(`Dropped stale attendance index: ${idx.name}`);
    }
  } catch (err) {
    console.error("Error cleaning up attendance indexes:", err.message);
  }
}

async function clearAttendance() {
  try {
    const result = await Attendance.deleteMany({});
    console.log(`Cleared ${result.deletedCount} previous attendance records`);
  } catch (err) {
    console.error("Error clearing attendance records:", err.message);
  }
}

(async () => {
  await dropStaleIndexes();
  await clearAttendance();
})();

module.exports = Attendance;
