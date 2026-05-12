const express = require("express");
const { body } = require("express-validator");
const { login, me, registerByPrivilegedUser, registerStudent } = require("../controllers/authController");
const { requireAuth, allowRoles } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");
const { ADMIN_ROLES, ROLES } = require("../constants/roles");

const router = express.Router();

router.post(
  "/login",
  [body("username").isString().notEmpty(), body("password").isString().isLength({ min: 6 })],
  validateRequest,
  login
);

router.get("/me", requireAuth, me);

router.post(
  "/register-student",
  [
    body("name").isString().notEmpty(),
    body("username").isString().notEmpty(),
    body("password").isString().isLength({ min: 6 }),
    body("email").optional().isEmail(),
    body("phone").optional().isString(),
  ],
  validateRequest,
  registerStudent
);

router.post(
  "/register",
  requireAuth,
  allowRoles(...ADMIN_ROLES, ROLES.TRAINER),
  [
    body("name").isString().notEmpty(),
    body("username").isString().notEmpty(),
    body("password").isString().isLength({ min: 6 }),
    body("role").isIn(Object.values(ROLES)),
  ],
  validateRequest,
  registerByPrivilegedUser
);

module.exports = router;
