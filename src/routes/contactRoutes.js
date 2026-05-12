const express = require("express");
const { body } = require("express-validator");
const {
  createInquiry,
  listInquiries,
  markReplied,
  deleteInquiry,
} = require("../controllers/contactController");
const { requireAuth, allowAction } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.post(
  "/",
  [
    body("name").isString().notEmpty().withMessage("Name is required"),
    body("message").isString().notEmpty().withMessage("Message is required"),
  ],
  validateRequest,
  createInquiry
);

router.get("/", requireAuth, allowAction("courses", "read"), listInquiries);
router.patch("/:inquiryId/reply", requireAuth, allowAction("courses", "update"), markReplied);
router.delete("/:inquiryId", requireAuth, allowAction("courses", "delete"), deleteInquiry);

module.exports = router;
