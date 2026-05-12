const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    durationDays: { type: Number, min: 1, default: 1 },
    basePrice: { type: Number, required: true, min: 0 },
    adminDiscountType: { type: String, enum: ["none", "flat", "percent"], default: "none" },
    adminDiscountValue: { type: Number, min: 0, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
    thumbnailUrl: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
