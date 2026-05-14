const express = require("express");
const { body } = require("express-validator");
const { sendTestEmail } = require("../controllers/emailController");
const { requireAuth, allowAction } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.post(
  "/test",
  requireAuth,
  allowAction("courses", "update"),
  [
    body("to").optional().isEmail(),
    body("subject").optional().isString(),
    body("message").optional().isString(),
  ],
  validateRequest,
  sendTestEmail
);

module.exports = router;
