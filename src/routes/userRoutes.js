const express = require("express");
const { body } = require("express-validator");
const {
  createStudentByTrainer,
  getUserById,
  updateUser,
  listUsers,
  updateUserRole,
  deleteUser,
  updateProfile,
  deleteStudentFull,
  getStudentFullData,
} = require("../controllers/userController");
const { requireAuth, allowAction } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.get("/", requireAuth, allowAction("users", "read"), listUsers);
router.get("/:userId", requireAuth, allowAction("users", "read"), getUserById);

router.post(
  "/students",
  requireAuth,
  allowAction("users", "create"),
  [
    body("name").isString().notEmpty(),
    body("username").isString().notEmpty(),
    body("password").isString().isLength({ min: 6 }),
    body("phone").optional().isString(),
    body("email").optional().isEmail(),
  ],
  validateRequest,
  createStudentByTrainer
);

router.patch(
  "/profile/update",
  requireAuth,
  [
    body("name").optional().isString(),
    body("username").optional().isString(),
    body("phone").optional().isString(),
    body("email").optional().isEmail(),
    body("profilePic").optional().isString(),
    body("currentPassword").optional().isString(),
    body("newPassword").optional().isString().isLength({ min: 6 }),
  ],
  validateRequest,
  updateProfile
);

router.patch(
  "/:userId",
  requireAuth,
  allowAction("users", "update"),
  [
    body("name").optional().isString().notEmpty(),
    body("phone").optional().isString(),
    body("email").optional().isEmail(),
    body("isActive").optional().isBoolean(),
  ],
  validateRequest,
  updateUser
);

router.patch(
  "/:userId/role",
  requireAuth,
  allowAction("users", "roleUpdate"),
  [body("role").isString().notEmpty()],
  validateRequest,
  updateUserRole
);

router.get("/students/:studentId/full-data", requireAuth, allowAction("users", "read"), getStudentFullData);
router.delete("/students/:studentId", requireAuth, allowAction("users", "delete"), deleteStudentFull);
router.delete("/:userId", requireAuth, allowAction("users", "delete"), deleteUser);

module.exports = router;
