const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    enrollment: { type: mongoose.Schema.Types.ObjectId, ref: "Enrollment", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    amount: { type: Number, required: true, min: 0.01 },
    method: { type: String, enum: ["bkash", "nagad", "cash_adjustment"], required: true },
    reference: { type: String, trim: true, default: "" },
    note: { type: String, trim: true, default: "" },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
