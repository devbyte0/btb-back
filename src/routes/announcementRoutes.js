const express = require("express");
const { body } = require("express-validator");
const {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");
const { requireAuth, allowAction } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.get("/", requireAuth, listAnnouncements);

router.post(
  "/",
  requireAuth,
  allowAction("courses", "create"),
  [
    body("title").isString().notEmpty().withMessage("Title is required"),
    body("content").isString().notEmpty().withMessage("Content is required"),
  ],
  validateRequest,
  createAnnouncement
);

router.patch("/:announcementId", requireAuth, allowAction("courses", "update"), updateAnnouncement);
router.delete("/:announcementId", requireAuth, allowAction("courses", "delete"), deleteAnnouncement);

module.exports = router;
