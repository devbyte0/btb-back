const { asyncHandler } = require("../utils/asyncHandler");
const PromoCode = require("../models/PromoCode");
const { ADMIN_ROLES } = require("../constants/roles");

const createPromo = asyncHandler(async (req, res) => {
  if (!ADMIN_ROLES.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Only admins can create promo codes" });
  }
  const promo = await PromoCode.create({ ...req.body, createdBy: req.user._id });
  return res.status(201).json({ success: true, data: promo });
});

const listPromos = asyncHandler(async (_req, res) => {
  const promos = await PromoCode.find().sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: promos });
});

const getPromoById = asyncHandler(async (req, res) => {
  const promo = await PromoCode.findById(req.params.promoId);
  if (!promo) {
    return res.status(404).json({ success: false, message: "Promo not found" });
  }
  return res.status(200).json({ success: true, data: promo });
});

const updatePromo = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  if (updates.code) updates.code = updates.code.toUpperCase();
  const promo = await PromoCode.findByIdAndUpdate(req.params.promoId, updates, { new: true });
  if (!promo) {
    return res.status(404).json({ success: false, message: "Promo not found" });
  }
  return res.status(200).json({ success: true, data: promo });
});

const deletePromo = asyncHandler(async (req, res) => {
  const promo = await PromoCode.findById(req.params.promoId);
  if (!promo) {
    return res.status(404).json({ success: false, message: "Promo not found" });
  }
  await PromoCode.findByIdAndDelete(req.params.promoId);
  return res.status(200).json({ success: true, message: "Promo deleted" });
});

module.exports = { createPromo, listPromos, getPromoById, updatePromo, deletePromo };
