const express = require("express");
const { body } = require("express-validator");
const {
  createCourse,
  listCourses,
  getCourseById,
  updateCourse,
  updateCourseDiscount,
  deleteCourse,
} = require("../controllers/courseController");
const { requireAuth, allowAction } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.get("/", listCourses);
router.get("/:courseId", requireAuth, getCourseById);

router.post(
  "/",
  requireAuth,
  allowAction("courses", "create"),
  [
    body("title").isString().notEmpty(),
    body("basePrice").isFloat({ min: 0 }),
    body("durationDays").optional().isInt({ min: 1 }),
  ],
  validateRequest,
  createCourse
);

router.patch(
  "/:courseId",
  requireAuth,
  allowAction("courses", "update"),
  [
    body("title").optional().isString().notEmpty(),
    body("description").optional().isString(),
    body("durationDays").optional().isInt({ min: 1 }),
    body("basePrice").optional().isFloat({ min: 0 }),
    body("isActive").optional().isBoolean(),
  ],
  validateRequest,
  updateCourse
);

router.patch(
  "/:courseId/discount",
  requireAuth,
  allowAction("courses", "update"),
  [
    body("adminDiscountType").isIn(["none", "flat", "percent"]),
    body("adminDiscountValue").isFloat({ min: 0 }),
  ],
  validateRequest,
  updateCourseDiscount
);

router.delete("/:courseId", requireAuth, allowAction("courses", "delete"), deleteCourse);

module.exports = router;
