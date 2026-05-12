const express = require("express");
const { body } = require("express-validator");
const { getActivePopup, listPopups, createPopup, updatePopup, deletePopup } = require("../controllers/popupController");
const { requireAuth, allowAction } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.get("/active", getActivePopup);
router.get("/", requireAuth, allowAction("courses", "read"), listPopups);

router.post(
  "/",
  requireAuth,
  allowAction("courses", "create"),
  [body("title").optional().isString()],
  validateRequest,
  createPopup
);

router.patch("/:popupId", requireAuth, allowAction("courses", "update"), updatePopup);
router.delete("/:popupId", requireAuth, allowAction("courses", "delete"), deletePopup);

module.exports = router;
