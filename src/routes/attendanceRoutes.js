const express = require("express");
const { body } = require("express-validator");
const {
  markAttendance,
  listAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
} = require("../controllers/attendanceController");
const { requireAuth, allowAction } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.get("/", requireAuth, allowAction("attendance", "read"), listAttendance);
router.get("/:attendanceId", requireAuth, allowAction("attendance", "read"), getAttendanceById);

router.post(
  "/",
  requireAuth,
  allowAction("attendance", "create"),
  [
    body("batchId").isMongoId().withMessage("Valid batchId is required"),
    body("sessionDate").isISO8601().withMessage("Valid sessionDate is required"),
    body("records")
      .isArray({ min: 1 })
      .withMessage("Records array with at least one student is required"),
    body("records.*.studentId").isMongoId().withMessage("Valid studentId is required in records"),
    body("records.*.status")
      .isIn(["present", "absent", "late"])
      .withMessage("Status must be present, absent or late"),
    body("records.*.notes").optional().isString(),
  ],
  validateRequest,
  markAttendance
);

router.patch(
  "/:attendanceId",
  requireAuth,
  allowAction("attendance", "update"),
  [
    body("records")
      .optional()
      .isArray({ min: 1 })
      .withMessage("Records must be an array"),
    body("records.*.studentId").optional().isMongoId(),
    body("records.*.status")
      .optional()
      .isIn(["present", "absent", "late"]),
    body("records.*.notes").optional().isString(),
  ],
  validateRequest,
  updateAttendance
);

router.delete("/:attendanceId", requireAuth, allowAction("attendance", "delete"), deleteAttendance);

module.exports = router;