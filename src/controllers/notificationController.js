const { asyncHandler } = require("../utils/asyncHandler");
const Notification = require("../models/Notification");
const Enrollment = require("../models/Enrollment");

const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    $or: [{ recipient: req.user._id }, { isGlobal: true }],
  })
    .sort({ createdAt: -1 })
    .limit(50);
  return res.status(200).json({ success: true, data: notifications });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    $or: [{ recipient: req.user._id }, { isGlobal: true }],
    read: false,
  });
  return res.status(200).json({ success: true, data: { count } });
});

const markAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      $or: [{ recipient: req.user._id }, { isGlobal: true }],
      _id: { $in: req.body.notificationIds || [] },
    },
    { read: true }
  );
  return res.status(200).json({ success: true, message: "Marked as read" });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { $or: [{ recipient: req.user._id }, { isGlobal: true }], read: false },
    { read: true }
  );
  return res.status(200).json({ success: true, message: "All marked as read" });
});

async function notifyNewEnrollment(enrollment) {
  try {
    await Notification.create({
      type: "enrollment",
      title: "New Enrollment",
      message: `${enrollment.student?.name || "A student"} enrolled in ${enrollment.course?.title || "a course"}`,
      link: "/dashboard/admin/enrollments",
      isGlobal: true,
    });
  } catch (err) {
    console.error("Failed to create enrollment notification:", err.message);
  }
}

module.exports = { listNotifications, getUnreadCount, markAsRead, markAllAsRead, notifyNewEnrollment };
