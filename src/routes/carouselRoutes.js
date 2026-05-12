const express = require("express");
const { body } = require("express-validator");
const {
  listCarousels,
  listAllCarousels,
  createCarousel,
  updateCarousel,
  deleteCarousel,
} = require("../controllers/carouselController");
const { requireAuth, allowAction } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.get("/", listCarousels);
router.get("/all", requireAuth, allowAction("courses", "read"), listAllCarousels);

router.post(
  "/",
  requireAuth,
  allowAction("courses", "create"),
  [body("imageUrl").isString().withMessage("imageUrl is required")],
  validateRequest,
  createCarousel
);

router.patch("/:carouselId", requireAuth, allowAction("courses", "update"), updateCarousel);
router.delete("/:carouselId", requireAuth, allowAction("courses", "delete"), deleteCarousel);

module.exports = router;
