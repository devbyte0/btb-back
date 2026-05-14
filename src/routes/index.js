const express = require("express");

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const courseRoutes = require("./courseRoutes");
const promoRoutes = require("./promoRoutes");
const enrollmentRoutes = require("./enrollmentRoutes");
const paymentRoutes = require("./paymentRoutes");
const attendanceRoutes = require("./attendanceRoutes");
const uploadRoutes = require("./uploadRoutes");
const batchRoutes = require("./batchRoutes");
const aboutUsRoutes = require("./aboutUsRoutes");
const carouselRoutes = require("./carouselRoutes");
const announcementRoutes = require("./announcementRoutes");
const contactRoutes = require("./contactRoutes");
const notificationRoutes = require("./notificationRoutes");
const popupRoutes = require("./popupRoutes");
const emailRoutes = require("./emailRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/courses", courseRoutes);
router.use("/promos", promoRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/payments", paymentRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/uploads", uploadRoutes);
router.use("/batches", batchRoutes);
router.use("/about-us", aboutUsRoutes);
router.use("/carousels", carouselRoutes);
router.use("/announcements", announcementRoutes);
router.use("/contacts", contactRoutes);
router.use("/notifications", notificationRoutes);
router.use("/popups", popupRoutes);
router.use("/emails", emailRoutes);

module.exports = router;
