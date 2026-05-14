const { asyncHandler } = require("../utils/asyncHandler");
const Notification = require("../models/Notification");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const { sendEmail, buildEmailTemplate } = require("../utils/email");

const ADMIN_EMAIL = "baristatrainingbangladesh@gmail.com";

const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    $or: [{ recipient: req.user._id }, { isGlobal: true }],
  }).sort({ createdAt: -1 }).limit(50);
  return res.status(200).json({ success: true, data: notifications });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    $or: [{ recipient: req.user._id }, { isGlobal: true }], read: false,
  });
  return res.status(200).json({ success: true, data: { count } });
});

const markAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { $or: [{ recipient: req.user._id }, { isGlobal: true }], _id: { $in: req.body.notificationIds || [] } },
    { read: true }
  );
  return res.status(200).json({ success: true, message: "Marked as read" });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { $or: [{ recipient: req.user._id }, { isGlobal: true }], read: false }, { read: true }
  );
  return res.status(200).json({ success: true, message: "All marked as read" });
});

// ── Helpers ──
async function createNotif({ type, title, message, link, recipient, isGlobal = false }) {
  try { await Notification.create({ type, title, message, link, recipient, isGlobal }); }
  catch (err) { console.error("Failed to create notification:", err.message); }
}

async function emailUser(userId, subject, bodyLines) {
  try {
    const user = await User.findById(userId).select("email name");
    if (!user?.email) return;
    const html = buildEmailTemplate(subject, [`Dear ${user.name},`, ...bodyLines]);
    await sendEmail({ to: user.email, subject: `${subject} - Barista Training Bangladesh`, html });
  } catch (err) { console.error("Email notify failed:", err.message); }
}

async function emailAdmin(subject, bodyLines) {
  try {
    const html = buildEmailTemplate(subject, bodyLines);
    await sendEmail({ to: ADMIN_EMAIL, subject: `${subject} - Barista Training Bangladesh`, html });
  } catch (err) { console.error("Admin email notify failed:", err.message); }
}

// ── Enrollment ──
async function notifyNewEnrollment(enrollment) {
  const msg = `${enrollment.student?.name || "A student"} enrolled in ${enrollment.course?.title || "a course"}`;
  await createNotif({ type: "enrollment", title: "New Enrollment", message: msg, link: "/dashboard/admin/enrollments", isGlobal: true });
  await emailAdmin("New Enrollment", [msg, `Amount: Tk ${enrollment.paymentSummary?.paidAmount || 0}`]);
}

// ── Payment ──
async function notifyPaymentReceived(enrollment, amount) {
  const msg = `${enrollment.student?.name || "Student"} paid Tk ${amount} for ${enrollment.course?.title || "course"}`;
  await createNotif({ type: "payment", title: "Payment Received", message: msg, link: "/dashboard/admin/enrollments", isGlobal: true });
  await emailAdmin("Payment Received", [msg, `Due remaining: Tk ${enrollment.paymentSummary?.dueAmount || 0}`]);
}

async function notifyPendingPayment(enrollment) {
  const due = enrollment.paymentSummary?.dueAmount || 0;
  if (due <= 0) return;
  const studentId = enrollment.student?._id || enrollment.student;
  const msg = `You have Tk ${due} due for ${enrollment.course?.title || "course"}. Please complete your payment.`;
  await createNotif({ type: "payment", title: "Payment Due Reminder", message: msg, link: "/dashboard/student", recipient: studentId });
  await emailUser(studentId, "Payment Due Reminder", [msg, `Course: ${enrollment.course?.title || "N/A"}`, `Amount due: Tk ${due}`]);
}

// ── Attendance ──
async function notifyAttendanceMarked(attendance) {
  const batchName = attendance.batch?.name || "Batch";
  const date = attendance.sessionDate?.toISOString?.()?.split("T")[0] || "recent";
  for (const rec of attendance.records || []) {
    const status = rec.status || "marked";
    await createNotif({
      type: "attendance", title: `Attendance: ${status.toUpperCase()}`,
      message: `Your attendance for ${batchName} on ${date} was marked as ${status}.`,
      link: "/dashboard/student", recipient: rec.student,
    });
    await emailUser(rec.student, `Attendance: ${status.toUpperCase()}`, [
      `Your attendance for ${batchName} on ${date} was marked as "${status}".`,
    ]);
  }
}

// ── Announcement ──
async function notifyAnnouncement(announcement) {
  const roles = announcement.targetRoles || [];
  const filter = roles.length > 0 ? { role: { $in: roles }, isActive: true } : { isActive: true };
  const users = await User.find(filter).select("_id email name");
  for (const user of users) {
    await createNotif({
      type: "announcement", title: announcement.title,
      message: announcement.content?.slice(0, 200),
      link: "/dashboard", recipient: user._id,
    });
    if (user.email) {
      await emailUser(user._id, announcement.title, [announcement.content || ""]);
    }
  }
}

// ── Check all pending payments and notify ──
const checkPendingPayments = asyncHandler(async (_req, res) => {
  const enrollments = await Enrollment.find({ "paymentSummary.isSettled": false })
    .populate("student", "name username email phone")
    .populate("course", "title");
  let sent = 0;
  for (const en of enrollments) {
    const due = en.paymentSummary?.dueAmount || 0;
    if (due <= 0) continue;
    const studentId = en.student?._id;
    if (!studentId) continue;
    await createNotif({
      type: "payment", title: "Payment Reminder",
      message: `Tk ${due} due for ${en.course?.title || "course"}. Please pay to continue.`,
      link: "/dashboard/student", recipient: studentId,
    });
    await emailUser(studentId, "Payment Reminder", [
      `You have Tk ${due} due for ${en.course?.title || "a course"}.`,
      "Please complete your payment at your earliest convenience.",
    ]);
    sent++;
  }
  return res.status(200).json({ success: true, data: { checked: enrollments.length, notified: sent } });
});

module.exports = {
  listNotifications, getUnreadCount, markAsRead, markAllAsRead,
  notifyNewEnrollment, notifyPaymentReceived, notifyPendingPayment,
  notifyAttendanceMarked, notifyAnnouncement, checkPendingPayments,
};
