const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    enrolledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    promoCode: { type: mongoose.Schema.Types.ObjectId, ref: "PromoCode", default: null },

    pricing: {
      basePrice: { type: Number, required: true, min: 0 },
      adminDiscountAmount: { type: Number, required: true, min: 0, default: 0 },
      promoDiscountAmount: { type: Number, required: true, min: 0, default: 0 },
      finalPrice: { type: Number, required: true, min: 0 },
    },

    paymentSummary: {
      paidAmount: { type: Number, required: true, default: 0, min: 0 },
      dueAmount: { type: Number, required: true, min: 0 },
      isSettled: { type: Boolean, required: true, default: false },
    },

    status: { type: String, enum: ["active", "completed", "dropped"], default: "active" },

    // NEW FIELDS: Store bKash / Nagad details
    paymentMethod: { type: String, enum: ["bkash", "nagad", "cash_adjustment", null], default: null },
    trxId: { type: String, trim: true, default: "" },
    paymentPhone: { type: String, trim: true, default: "" },
    initialPaymentAmount: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);