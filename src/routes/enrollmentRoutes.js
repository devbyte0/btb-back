const express = require("express");
const { body } = require("express-validator");
const {
  createEnrollment,
  listEnrollments,
  getEnrollmentById,
  updateEnrollment,
  deleteEnrollment,
} = require("../controllers/enrollmentController");
const { requireAuth, allowAction } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.get("/", requireAuth, listEnrollments);
router.get("/:enrollmentId", requireAuth, allowAction("enrollments", "read"), getEnrollmentById);

router.post(
  "/",
  requireAuth,
  allowAction("enrollments", "create"),
  [
    body("studentId").isMongoId(),
    body("courseId").isMongoId(),
    body("promoCode").optional().isString(),
  ],
  validateRequest,
  createEnrollment
);

router.patch(
  "/:enrollmentId",
  requireAuth,
  allowAction("enrollments", "update"),
  [body("status").optional().isIn(["active", "completed", "dropped"]), body("paidAmount").optional().isFloat({ min: 0 })],
  validateRequest,
  updateEnrollment
);

router.delete("/:enrollmentId", requireAuth, allowAction("enrollments", "delete"), deleteEnrollment);

module.exports = router;
