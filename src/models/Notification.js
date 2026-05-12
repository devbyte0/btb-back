const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["enrollment", "announcement", "payment", "attendance", "general"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, default: "" },
    link: { type: String, default: "" },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    isGlobal: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ isGlobal: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
