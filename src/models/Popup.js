const mongoose = require("mongoose");

const popupSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    content: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    linkUrl: { type: String, default: "" },
    linkLabel: { type: String, default: "Learn More" },
    isActive: { type: Boolean, default: true },
    showOnMobile: { type: Boolean, default: true },
    showOnDesktop: { type: Boolean, default: true },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

popupSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model("Popup", popupSchema);
