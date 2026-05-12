const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    targetRoles: [{ type: String, enum: ["student", "trainer", "admin"] }],
    isActive: { type: Boolean, default: true },
    priority: { type: String, enum: ["low", "normal", "high", "urgent"], default: "normal" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
