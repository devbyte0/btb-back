const express = require("express");
const {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, listNotifications);
router.get("/unread-count", requireAuth, getUnreadCount);
router.patch("/mark-read", requireAuth, markAsRead);
router.patch("/mark-all-read", requireAuth, markAllAsRead);

module.exports = router;
