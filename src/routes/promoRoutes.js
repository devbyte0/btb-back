const express = require("express");
const { body } = require("express-validator");
const { createPromo, listPromos, getPromoById, updatePromo, deletePromo } = require("../controllers/promoController");
const { requireAuth, allowAction } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.get("/", requireAuth, allowAction("promos", "read"), listPromos);
router.get("/:promoId", requireAuth, allowAction("promos", "read"), getPromoById);

router.post(
  "/",
  requireAuth,
  allowAction("promos", "create"),
  [
    body("code").isString().notEmpty(),
    body("discountType").isIn(["flat", "percent"]),
    body("discountValue").isFloat({ min: 0 }),
    body("usageLimit").optional().isInt({ min: 1 }),
  ],
  validateRequest,
  createPromo
);

router.patch(
  "/:promoId",
  requireAuth,
  allowAction("promos", "update"),
  [
    body("code").optional().isString(),
    body("discountType").optional().isIn(["flat", "percent"]),
    body("discountValue").optional().isFloat({ min: 0 }),
    body("usageLimit").optional().isInt({ min: 1 }),
    body("isActive").optional().isBoolean(),
  ],
  validateRequest,
  updatePromo
);

router.delete("/:promoId", requireAuth, allowAction("promos", "delete"), deletePromo);

module.exports = router;
