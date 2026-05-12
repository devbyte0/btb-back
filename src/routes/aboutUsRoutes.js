const express = require("express");
const { body } = require("express-validator");
const {
  getAboutUs, updateAboutUs,
  addMediaItem, updateMediaItem, removeMediaItem, reorderMedia,
  addVideoItem, updateVideoItem, removeVideoItem,
} = require("../controllers/aboutUsController");
const { requireAuth, allowAction } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.get("/", getAboutUs);

router.patch("/", requireAuth, allowAction("courses", "update"),
  [body("heroTitle").optional().isString(), body("story").optional().isString(), body("mission").optional().isString(), body("vision").optional().isString()],
  validateRequest, updateAboutUs);

router.post("/media", requireAuth, allowAction("courses", "update"),
  [body("url").isString().withMessage("URL is required")], validateRequest, addMediaItem);

router.patch("/media/:mediaId", requireAuth, allowAction("courses", "update"),
  [body("url").optional().isString(), body("title").optional().isString()], validateRequest, updateMediaItem);

router.delete("/media/:mediaId", requireAuth, allowAction("courses", "update"), removeMediaItem);

router.patch("/media/reorder", requireAuth, allowAction("courses", "update"),
  [body("mediaIds").isArray({ min: 1 })], validateRequest, reorderMedia);

router.post("/video", requireAuth, allowAction("courses", "update"),
  [body("url").isString().withMessage("URL is required")], validateRequest, addVideoItem);

router.patch("/video/:videoId", requireAuth, allowAction("courses", "update"),
  [body("url").optional().isString(), body("title").optional().isString()], validateRequest, updateVideoItem);

router.delete("/video/:videoId", requireAuth, allowAction("courses", "update"), removeVideoItem);

module.exports = router;
