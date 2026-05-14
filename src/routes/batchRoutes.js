const express = require("express");
const { body } = require("express-validator");
const {
  createBatch, listBatches, getBatchById, updateBatch,
  assignStudentsToBatch, assignTrainersToBatch, deleteBatch,
  addScheduleItem, updateScheduleItem, removeScheduleItem,
  getStudentBatch,
} = require("../controllers/batchController");
const { requireAuth, allowAction } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.get("/", requireAuth, allowAction("batches", "read"), listBatches);
router.get("/my-batch", requireAuth, getStudentBatch);
router.get("/:batchId", requireAuth, allowAction("batches", "read"), getBatchById);

router.post("/", requireAuth, allowAction("batches", "create"),
  [body("name").isString().notEmpty(), body("code").isString().notEmpty(), body("courseId").optional().isMongoId(), body("courseIds").optional().isArray({ min: 1 })],
  validateRequest, createBatch);

router.patch("/:batchId", requireAuth, allowAction("batches", "update"),
  [body("name").optional().isString().notEmpty(), body("code").optional().isString().notEmpty(), body("courseId").optional().isMongoId(), body("courseIds").optional().isArray({ min: 1 }), body("isActive").optional().isBoolean()],
  validateRequest, updateBatch);

router.patch("/:batchId/students", requireAuth, allowAction("batches", "update"), [body("studentIds").isArray({ min: 1 })], validateRequest, assignStudentsToBatch);
router.patch("/:batchId/trainers", requireAuth, allowAction("batches", "update"), [body("trainerIds").isArray({ min: 1 })], validateRequest, assignTrainersToBatch);
router.delete("/:batchId", requireAuth, allowAction("batches", "delete"), deleteBatch);

router.post("/:batchId/schedule", requireAuth, allowAction("batches", "update"),
  [body("day").isString().notEmpty(), body("startTime").isString().notEmpty(), body("endTime").isString().notEmpty()],
  validateRequest, addScheduleItem);

router.patch("/:batchId/schedule/:scheduleId", requireAuth, allowAction("batches", "update"), updateScheduleItem);
router.delete("/:batchId/schedule/:scheduleId", requireAuth, allowAction("batches", "update"), removeScheduleItem);

module.exports = router;
