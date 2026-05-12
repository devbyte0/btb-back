const mongoose = require("mongoose");

const mediaItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["youtube", "facebook", "instagram", "twitter", "tiktok", "vimeo", "image", "video", "embed", "link"],
    required: true,
  },
  label: { type: String, default: "" },
  url: { type: String, required: true },
  embedUrl: { type: String, default: null },
  title: { type: String, trim: true, default: "" },
  thumbnail: { type: String, default: null },
  order: { type: Number, default: 0 },
});

const aboutUsSchema = new mongoose.Schema(
  {
    heroTitle: { type: String, default: "We craft confident coffee professionals." },
    heroSubtitle: { type: String, default: "" },
    story: { type: String, default: "" },
    mission: { type: String, default: "" },
    vision: { type: String, default: "" },
    stats: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
        icon: { type: String, default: "" },
      },
    ],
    mediaGallery: [mediaItemSchema],
    videoCollage: [mediaItemSchema],
    isActive: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AboutUs", aboutUsSchema);
