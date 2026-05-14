const { asyncHandler } = require("../utils/asyncHandler");
const { sendEmail, buildEmailTemplate } = require("../utils/email");
const User = require("../models/User");

const ADMIN_EMAIL = "baristatrainingbangladesh@gmail.com";

async function sendContactInquiryEmail(inquiry) {
  const html = buildEmailTemplate("New Contact Inquiry", [
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email || "\u2014"}`,
    `Phone: ${inquiry.phone || "\u2014"}`,
    `Message: ${inquiry.message}`,
  ]);
  await sendEmail({ to: ADMIN_EMAIL, subject: `New inquiry from ${inquiry.name}`, html });
}

async function sendEnrollmentReceipt(enrollment) {
  const student = enrollment.student?.name || "Student";
  const course = enrollment.course?.title || "Course";
  const basePrice = enrollment.pricing?.basePrice || 0;
  const discount = (enrollment.pricing?.adminDiscountAmount || 0) + (enrollment.pricing?.promoDiscountAmount || 0);
  const finalPrice = enrollment.pricing?.finalPrice || 0;
  const paid = enrollment.paymentSummary?.paidAmount || 0;
  const due = enrollment.paymentSummary?.dueAmount || 0;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#faf8f5;padding:30px;border-radius:12px;">
      <div style="background:#d4803c;color:white;padding:20px;border-radius:10px 10px 0 0;text-align:center;">
        <h2 style="margin:0;">Enrollment Receipt</h2>
        <p style="margin:5px 0 0;opacity:0.9;">Barista Training Bangladesh</p>
      </div>
      <div style="background:white;padding:25px;border-radius:0 0 10px 10px;border:1px solid #e8e0d8;">
        <p style="margin:0 0 5px;color:#333;font-size:14px;"><strong>Student:</strong> ${student}</p>
        <p style="margin:0 0 5px;color:#333;font-size:14px;"><strong>Course:</strong> ${course}</p>
        <p style="margin:0 0 5px;color:#333;font-size:14px;"><strong>Transaction ID:</strong> ${enrollment.trxId || "\u2014"}</p>
        <p style="margin:0 0 5px;color:#333;font-size:14px;"><strong>Payment Method:</strong> ${(enrollment.paymentMethod || "N/A").toUpperCase()}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#666;">Base Price</td><td style="padding:8px 0;text-align:right;color:#333;">Tk ${basePrice}</td></tr>
          ${discount ? `<tr><td style="padding:8px 0;color:#666;">Discount</td><td style="padding:8px 0;text-align:right;color:#e11d48;">- Tk ${discount}</td></tr>` : ""}
          <tr><td style="padding:8px 0;border-top:1px solid #eee;font-weight:700;color:#333;">Final Price</td><td style="padding:8px 0;border-top:1px solid #eee;text-align:right;font-weight:700;color:#333;">Tk ${finalPrice}</td></tr>
          <tr><td style="padding:8px 0;color:#15803d;font-weight:600;">Paid</td><td style="padding:8px 0;text-align:right;color:#15803d;font-weight:600;">Tk ${paid}</td></tr>
          ${due ? `<tr><td style="padding:8px 0;color:#b45309;">Due</td><td style="padding:8px 0;text-align:right;color:#b45309;">Tk ${due}</td></tr>` : ""}
        </table>
        ${due === 0 ? '<p style="text-align:center;margin:20px 0 0;padding:10px;background:#dcfce7;border-radius:8px;color:#15803d;font-weight:600;">Fully Paid</p>' : '<p style="text-align:center;margin:20px 0 0;padding:10px;background:#fef3c7;border-radius:8px;color:#b45309;font-weight:600;">Payment Pending</p>'}
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
        <p style="color:#999;font-size:12px;margin:0;text-align:center;">Barista Training Bangladesh<br/>Mirpur, Dhaka</p>
      </div>
    </div>
  `;

  await sendEmail({ to: ADMIN_EMAIL, subject: `Enrollment Receipt: ${student} - ${course}`, html });

  // Send a copy to the student if they have an email
  const studentUser = typeof enrollment.student === "object" ? enrollment.student : await User.findById(enrollment.student).select("email");
  const studentEmail = studentUser?.email;
  if (studentEmail) {
    await sendEmail({ to: studentEmail, subject: `Your Enrollment Receipt - Barista Training Bangladesh`, html });
  }
}

async function sendReplyEmail(inquiry) {
  if (!inquiry.email) return;
  const html = buildEmailTemplate("Your inquiry has been replied", [
    `Dear ${inquiry.name},`,
    `Your inquiry has received a response from our team:`,
    `"${inquiry.replyMessage}"`,
    `Thank you for reaching out.`,
  ]);
  await sendEmail({ to: inquiry.email, subject: "Re: Your inquiry - Barista Training Bangladesh", html });
}

const sendTestEmail = asyncHandler(async (req, res) => {
  const { to, subject, message } = req.body;
  const html = buildEmailTemplate(subject || "Test Email", [message || "Test email from Barista Training Bangladesh."]);
  const result = await sendEmail({ to: to || ADMIN_EMAIL, subject: subject || "Test Email", html });
  return res.status(200).json({ success: true, data: result });
});

module.exports = { sendContactInquiryEmail, sendEnrollmentReceipt, sendReplyEmail, sendTestEmail };
