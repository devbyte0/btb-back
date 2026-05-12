const express = require("express");
const { body } = require("express-validator");
const { createPayment, listPayments } = require("../controllers/paymentController");
const { requireAuth, allowRoles } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");
const { CREATOR_ROLES, ROLES } = require("../constants/roles");

const router = express.Router();

router.get("/", requireAuth, listPayments);

router.post(
  "/",
  requireAuth,
  allowRoles(...CREATOR_ROLES, ROLES.STUDENT),
  [
    body("enrollmentId").isMongoId(),
    body("amount").isFloat({ min: 0.01 }),
    body("method").isIn(["bkash", "nagad", "cash_adjustment"]),
    body("reference").optional().isString(),
    body("note").optional().isString(),
  ],
  validateRequest,
  createPayment
);

module.exports = router;
