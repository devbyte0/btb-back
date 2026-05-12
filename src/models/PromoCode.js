const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["flat", "percent"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscountAmount: { type: Number, default: null, min: 0 },
    usageLimit: { type: Number, default: null, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    applicableCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PromoCode", promoCodeSchema);
