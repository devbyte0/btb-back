const { asyncHandler } = require("../utils/asyncHandler");
const Announcement = require("../models/Announcement");
const Notification = require("../models/Notification");
const User = require("../models/User");

const listAnnouncements = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "student") {
    filter.$or = [{ targetRoles: "student" }, { targetRoles: { $size: 0 } }];
  }
  if (req.user.role === "trainer") {
    filter.$or = [{ targetRoles: "trainer" }, { targetRoles: { $size: 0 } }];
  }
  const items = await Announcement.find(filter)
    .populate("createdBy", "name username")
    .sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: items });
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.create({ ...req.body, createdBy: req.user._id });

  if (announcement.targetRoles && announcement.targetRoles.length > 0) {
    const users = await User.find({ role: { $in: announcement.targetRoles }, isActive: true }).select("_id");
    const notifications = users.map((u) => ({
      type: "announcement",
      title: announcement.title,
      message: announcement.content.slice(0, 200),
      link: "/dashboard/student",
      recipient: u._id,
    }));
    if (notifications.length > 0) await Notification.insertMany(notifications);
  }

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
