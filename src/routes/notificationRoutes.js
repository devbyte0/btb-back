const express = require("express");
const {
  listNotifications, getUnreadCount, markAsRead, markAllAsRead,
  checkPendingPayments,
} = require("../controllers/notificationController");
const { requireAuth, allowAction } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, listNotifications);
router.get("/unread-count", requireAuth, getUnreadCount);
router.patch("/mark-read", requireAuth, markAsRead);
router.patch("/mark-all-read", requireAuth, markAllAsRead);
router.post("/check-pending", requireAuth, allowAction("courses", "read"), checkPendingPayments);

module.exports = router;
