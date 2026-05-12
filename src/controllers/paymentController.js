const { asyncHandler } = require("../utils/asyncHandler");
const Enrollment = require("../models/Enrollment");
const Payment = require("../models/Payment");
const { ADMIN_ROLES, ROLES } = require("../constants/roles");

const createPayment = asyncHandler(async (req, res) => {
  const { enrollmentId, amount, method, reference, note } = req.body;
  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) {
    return res.status(404).json({ success: false, message: "Enrollment not found" });
  }

  if (req.user.role === ROLES.STUDENT) {
    if (method === "cash_adjustment") {
      return res.status(403).json({ success: false, message: "Students cannot post cash adjustments" });
    }
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Students can only pay own enrollments" });
    }
  }

  if (method === "cash_adjustment" && ![ROLES.TRAINER, ...ADMIN_ROLES].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Only trainer/admin can add cash adjustment" });
  }

  if (amount > enrollment.paymentSummary.dueAmount) {
    return res.status(400).json({ success: false, message: "Amount exceeds due amount" });
  }

  const payment = await Payment.create({
    enrollment: enrollment._id,
    student: enrollment.student,
    course: enrollment.course,
    amount,
    method,
    reference,
    note,
    collectedBy: req.user._id,
  });

  enrollment.paymentSummary.paidAmount += amount;
  enrollment.paymentSummary.dueAmount = Math.max(
    0,
    enrollment.pricing.finalPrice - enrollment.paymentSummary.paidAmount
  );
  enrollment.paymentSummary.isSettled = enrollment.paymentSummary.dueAmount === 0;
  await enrollment.save();

  return res.status(201).json({ success: true, data: { payment, paymentSummary: enrollment.paymentSummary } });
});

const listPayments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.enrollmentId) filter.enrollment = req.query.enrollmentId;
  if (req.query.studentId) filter.student = req.query.studentId;
  if (req.query.courseId) filter.course = req.query.courseId;

  if (req.user.role === ROLES.STUDENT) {
    filter.student = req.user._id;
  }

  const payments = await Payment.find(filter).sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: payments });
});

module.exports = { createPayment, listPayments };
