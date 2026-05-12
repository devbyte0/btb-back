const mongoose = require("mongoose");

const contactInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    message: { type: String, required: true },
    replied: { type: Boolean, default: false },
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    replyMessage: { type: String, default: "" },
    repliedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactInquiry", contactInquirySchema);
