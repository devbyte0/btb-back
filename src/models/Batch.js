const mongoose = require("mongoose");

const scheduleItemSchema = new mongoose.Schema({
  day: { type: String, enum: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  topic: { type: String, default: "" },
  room: { type: String, default: "" },
});

const batchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true, unique: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    trainers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    schedule: [scheduleItemSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Batch", batchSchema);
