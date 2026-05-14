const { asyncHandler } = require("../utils/asyncHandler");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const PromoCode = require("../models/PromoCode");
const User = require("../models/User");
const { getAdminDiscountAmount, getPromoDiscountAmount } = require("../utils/pricing");
const { ROLES } = require("../constants/roles");
const { notifyNewEnrollment } = require("./notificationController");
const { sendEnrollmentReceipt } = require("./emailController");

function isPromoValidForCourse(promo, courseId) {
  if (!promo.isActive) return false;
  if (promo.expiresAt && promo.expiresAt < new Date()) return false;
  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) return false;
  if (!promo.applicableCourses || promo.applicableCourses.length === 0) return true;
  return promo.applicableCourses.some((id) => id.toString() === courseId.toString());
}

const createEnrollment = asyncHandler(async (req, res) => {
  let { studentId, courseId, promoCode, paidAmount = 0, method, reference, phone } = req.body;

  // Student must pay minimum 500 Taka via bKash/Nagad
  if (req.user.role === ROLES.STUDENT) {
    studentId = req.user._id.toString();
    if (paidAmount < 500) {
      return res.status(400).json({
        success: false,
        message: "Students must pay minimum 500 Taka at the time of enrollment (bKash / Nagad)",
      });
    }
    if (!method || !["bkash", "nagad"].includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Students must pay via bKash or Nagad",
      });
    }
  }

  const student = await User.findById(studentId);
  if (!student || student.role !== ROLES.STUDENT) {
    return res.status(400).json({ success: false, message: "Invalid student" });
  }

  const course = await Course.findById(courseId);
  if (!course || !course.isActive) {
    return res.status(404).json({ success: false, message: "Course not found or inactive" });
  }

  let promo = null;
  if (promoCode) {
    promo = await PromoCode.findOne({ code: promoCode.toUpperCase() });
    if (!promo || !isPromoValidForCourse(promo, course._id)) {
      return res.status(400).json({ success: false, message: "Invalid or expired promo code" });
    }
  }

  const adminDiscountAmount = getAdminDiscountAmount(
    course.basePrice,
    course.adminDiscountType,
    course.adminDiscountValue
  );
  const priceAfterAdmin = course.basePrice - adminDiscountAmount;
  const promoDiscountAmount = getPromoDiscountAmount(priceAfterAdmin, promo);
  const finalPrice = priceAfterAdmin - promoDiscountAmount;

  const actualPaid = Number(paidAmount) || 0;

  const enrollment = await Enrollment.create({
    student: student._id,
    course: course._id,
    enrolledBy: req.user._id,
    promoCode: promo ? promo._id : null,
    pricing: {
      basePrice: course.basePrice,
      adminDiscountAmount,
      promoDiscountAmount,
      finalPrice,
    },
    paymentSummary: {
      paidAmount: actualPaid,
      dueAmount: Math.max(0, finalPrice - actualPaid),
      isSettled: finalPrice - actualPaid <= 0,
    },
    // Store payment details
    paymentMethod: method || null,
    trxId: reference || "",
    paymentPhone: phone || "",
    initialPaymentAmount: actualPaid,
  });

  if (promo) {
    promo.usedCount += 1;
    await promo.save();
  }

  notifyNewEnrollment(enrollment);
  sendEnrollmentReceipt(enrollment).catch((err) => console.error("Enrollment receipt email failed:", err.message));

  return res.status(201).json({ success: true, data: enrollment });
});

const listEnrollments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === ROLES.STUDENT) {
    filter.student = req.user._id;
  } else if (req.query.studentId) {
    filter.student = req.query.studentId;
  }
  if (req.query.courseId) {
    filter.course = req.query.courseId;
  }

  const enrollments = await Enrollment.find(filter)
    .populate("student", "name username role")
    .populate("course", "title basePrice adminDiscountType adminDiscountValue")
    .sort({ createdAt: -1 });

  return res.status(200).json({ success: true, data: enrollments });
});

const getEnrollmentById = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.enrollmentId)
    .populate("student", "name username role")
    .populate("course", "title basePrice")
    .populate("promoCode", "code discountType discountValue");
  if (!enrollment) {
    return res.status(404).json({ success: false, message: "Enrollment not found" });
  }
  if (req.user.role === ROLES.STUDENT && enrollment.student?._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  return res.status(200).json({ success: true, data: enrollment });
});

const updateEnrollment = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.status) updates.status = req.body.status;
  if (req.body.paidAmount !== undefined) {
    updates["paymentSummary.paidAmount"] = Number(req.body.paidAmount);
  }
  const enrollment = await Enrollment.findById(req.params.enrollmentId);
  if (!enrollment) {
    return res.status(404).json({ success: false, message: "Enrollment not found" });
  }
  if (updates["paymentSummary.paidAmount"] !== undefined) {
    const finalPrice = enrollment.pricing.finalPrice;
    const paidAmount = Math.max(0, updates["paymentSummary.paidAmount"]);
    updates["paymentSummary.dueAmount"] = Math.max(0, finalPrice - paidAmount);
    updates["paymentSummary.isSettled"] = updates["paymentSummary.dueAmount"] === 0;
  }
  const updated = await Enrollment.findByIdAndUpdate(req.params.enrollmentId, updates, { new: true });
  return res.status(200).json({ success: true, data: updated });
});

const deleteEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.enrollmentId);
  if (!enrollment) {
    return res.status(404).json({ success: false, message: "Enrollment not found" });
  }
  await Enrollment.findByIdAndDelete(req.params.enrollmentId);
  return res.status(200).json({ success: true, message: "Enrollment deleted" });
});

module.exports = {
  createEnrollment,
  listEnrollments,
  getEnrollmentById,
  updateEnrollment,
  deleteEnrollment,
};