const { asyncHandler } = require("../utils/asyncHandler");
const Announcement = require("../models/Announcement");
const { notifyAnnouncement } = require("./notificationController");

const listAnnouncements = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "student") filter.$or = [{ targetRoles: "student" }, { targetRoles: { $size: 0 } }];
  if (req.user.role === "trainer") filter.$or = [{ targetRoles: "trainer" }, { targetRoles: { $size: 0 } }];
  const items = await Announcement.find(filter).populate("createdBy", "name username").sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: items });
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.create({ ...req.body, createdBy: req.user._id });
  notifyAnnouncement(announcement).catch((err) => console.error("Announcement notification error:", err.message));
  return res.status(201).json({ success: true, data: announcement });
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const item = await Announcement.findByIdAndUpdate(req.params.announcementId, req.body, { new: true });
  if (!item) return res.status(404).json({ success: false, message: "Announcement not found" });
  return res.status(200).json({ success: true, data: item });
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  const item = await Announcement.findByIdAndDelete(req.params.announcementId);
  if (!item) return res.status(404).json({ success: false, message: "Announcement not found" });
  return res.status(200).json({ success: true, message: "Announcement deleted" });
});

module.exports = { listAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
