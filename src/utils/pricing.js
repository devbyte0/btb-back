function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function getAdminDiscountAmount(basePrice, discountType, discountValue) {
  if (discountType === "flat") return clamp(discountValue, 0, basePrice);
  if (discountType === "percent") return clamp((basePrice * discountValue) / 100, 0, basePrice);
  return 0;
}

function getPromoDiscountAmount(priceAfterAdmin, promo) {
  if (!promo) return 0;

  let amount = 0;
  if (promo.discountType === "flat") {
    amount = promo.discountValue;
  } else if (promo.discountType === "percent") {
    amount = (priceAfterAdmin * promo.discountValue) / 100;
  }

  if (promo.maxDiscountAmount) {
    amount = Math.min(amount, promo.maxDiscountAmount);
  }

  return clamp(amount, 0, priceAfterAdmin);
}

module.exports = { getAdminDiscountAmount, getPromoDiscountAmount };
