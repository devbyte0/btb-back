const mongoose = require("mongoose");

const carouselSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    subtitle: { type: String, trim: true, default: "" },
    imageUrl: { type: String, required: true },
    linkUrl: { type: String, default: "" },
    linkLabel: { type: String, default: "Learn More" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Carousel", carouselSchema);
