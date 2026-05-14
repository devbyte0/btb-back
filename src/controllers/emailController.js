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

async function sendEnrollmentAcceptedEmail(enrollment, plainPassword) {
  const studentObj = typeof enrollment.student === "object" ? enrollment.student : await User.findById(enrollment.student).select("name username email");
  const studentName = studentObj?.name || "Student";
  const studentUsername = studentObj?.username || "";
  const studentEmail = studentObj?.email || "";
  const courseTitle = enrollment.course?.title || "Course";

  if (!studentEmail) return;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#faf8f5;padding:30px;border-radius:12px;">
      <div style="background:#d4803c;color:white;padding:30px;border-radius:10px 10px 0 0;text-align:center;">
        <h2 style="margin:0;font-size:24px;">Welcome to Barista Training Bangladesh!</h2>
      </div>
      <div style="background:white;padding:30px;border-radius:0 0 10px 10px;border:1px solid #e8e0d8;">
        <p style="color:#333;font-size:16px;margin:0 0 5px;">Dear ${studentName},</p>
        <p style="color:#333;font-size:14px;line-height:1.6;">Congratulations! Your enrollment for <strong>${courseTitle}</strong> has been accepted.</p>
        <p style="color:#333;font-size:14px;line-height:1.6;">You can now log in to your dashboard to track your progress, view class schedules, and manage your training.</p>
        ${plainPassword ? `
        <div style="background:#fef3c7;padding:15px;border-radius:8px;margin:20px 0;">
          <p style="margin:0 0 5px;color:#92400e;font-size:14px;"><strong>Your Login Credentials</strong></p>
          <p style="margin:0;color:#92400e;font-size:14px;">Username: <strong>${studentUsername}</strong></p>
          <p style="margin:0;color:#92400e;font-size:14px;">Password: <strong>${plainPassword}</strong></p>
        </div>
        <p style="color:#999;font-size:12px;">Please save your credentials. You can change your password from the profile page.</p>
        ` : ""}
        <hr style="border:none;border-top:1px solid #eee;margin:25px 0;" />
        <p style="color:#999;font-size:12px;text-align:center;">Barista Training Bangladesh<br/>Mirpur, Dhaka</p>
      </div>
    </div>
  `;

  await sendEmail({ to: studentEmail, subject: `Welcome to ${courseTitle} - Barista Training Bangladesh`, html });
}

async function sendEnrollmentReceipt(enrollment, plainPassword) {
  const studentObj = typeof enrollment.student === "object" ? enrollment.student : await User.findById(enrollment.student).select("name username email");
  const studentName = studentObj?.name || enrollment.student?.name || "Student";
  const studentUsername = studentObj?.username || enrollment.student?.username || "";
  const studentEmail = studentObj?.email || enrollment.student?.email || "";
  const studentId = enrollment.student?._id || enrollment.student || "";
  const courseTitle = enrollment.course?.title || "Course";
  const basePrice = enrollment.pricing?.basePrice || 0;
  const discount = (enrollment.pricing?.adminDiscountAmount || 0) + (enrollment.pricing?.promoDiscountAmount || 0);
  const finalPrice = enrollment.pricing?.finalPrice || 0;
  const paid = enrollment.paymentSummary?.paidAmount || 0;
  const due = enrollment.paymentSummary?.dueAmount || 0;
  const trxId = enrollment.trxId || "\u2014";
  const payMethod = (enrollment.paymentMethod || "N/A").toUpperCase();

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#faf8f5;padding:30px;border-radius:12px;">
      <div style="background:#d4803c;color:white;padding:20px;border-radius:10px 10px 0 0;text-align:center;">
        <h2 style="margin:0;">Enrollment Receipt</h2>
        <p style="margin:5px 0 0;opacity:0.9;">Barista Training Bangladesh</p>
      </div>
      <div style="background:white;padding:25px;border-radius:0 0 10px 10px;border:1px solid #e8e0d8;">
        <h3 style="margin:0 0 15px;color:#333;font-size:16px;">Account &amp; Course Details</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#666;">User ID</td><td style="padding:6px 0;text-align:right;color:#333;font-family:monospace;">${studentId}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Name</td><td style="padding:6px 0;text-align:right;color:#333;">${studentName}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Username</td><td style="padding:6px 0;text-align:right;color:#333;">${studentUsername}</td></tr>
          ${plainPassword ? `<tr><td style="padding:6px 0;color:#666;">Password</td><td style="padding:6px 0;text-align:right;color:#b45309;font-family:monospace;">${plainPassword}</td></tr>` : ""}
          <tr><td style="padding:6px 0;color:#666;">Course</td><td style="padding:6px 0;text-align:right;color:#333;">${courseTitle}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Transaction ID</td><td style="padding:6px 0;text-align:right;color:#333;">${trxId}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Payment Method</td><td style="padding:6px 0;text-align:right;color:#333;">${payMethod}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
        <h3 style="margin:0 0 15px;color:#333;font-size:16px;">Payment Summary</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#666;">Base Price</td><td style="padding:8px 0;text-align:right;color:#333;">Tk ${basePrice}</td></tr>
          ${discount ? `<tr><td style="padding:8px 0;color:#666;">Discount</td><td style="padding:8px 0;text-align:right;color:#e11d48;">- Tk ${discount}</td></tr>` : ""}
          <tr style="font-weight:700;"><td style="padding:8px 0;border-top:1px solid #eee;color:#333;">Final Price</td><td style="padding:8px 0;border-top:1px solid #eee;text-align:right;color:#333;">Tk ${finalPrice}</td></tr>
          <tr><td style="padding:8px 0;color:#15803d;">Paid</td><td style="padding:8px 0;text-align:right;color:#15803d;">Tk ${paid}</td></tr>
          ${due ? `<tr><td style="padding:8px 0;color:#b45309;">Due</td><td style="padding:8px 0;text-align:right;color:#b45309;">Tk ${due}</td></tr>` : ""}
        </table>
        ${due === 0
          ? '<p style="text-align:center;margin:20px 0 0;padding:10px;background:#dcfce7;border-radius:8px;color:#15803d;font-weight:600;">Fully Paid</p>'
          : '<p style="text-align:center;margin:20px 0 0;padding:10px;background:#fef3c7;border-radius:8px;color:#b45309;font-weight:600;">Payment Pending</p>'}
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
        ${plainPassword ? '<p style="color:#e11d48;font-size:12px;margin:0 0 10px;">Please save your login credentials. You can change your password from the profile page.</p>' : ""}
        <p style="color:#999;font-size:12px;margin:0;text-align:center;">Barista Training Bangladesh<br/>Mirpur, Dhaka</p>
      </div>
    </div>
  `;

  await sendEmail({ to: ADMIN_EMAIL, subject: `Enrollment Receipt: ${studentName} - ${courseTitle}`, html });
  if (studentEmail) {
    await sendEmail({ to: studentEmail, subject: "Your Enrollment Receipt - Barista Training Bangladesh", html });
  }
}

async function sendBatchAssignedEmail(studentId, batch) {
  const user = await User.findById(studentId).select("name email");
  if (!user || !user.email) return;
  const html = buildEmailTemplate("Batch Assigned", [
    `Dear ${user.name},`,
    `You have been assigned to batch <strong>${batch.name} (${batch.code})</strong>.`,
    `Location: 1/1, 1/2, Road-2, Block-G, Shah Ali, Mirpur-1`,
    `(Take-Out Restaurant Building), Dhaka-1216`,
    `Please check your dashboard for the schedule and class details.`,
  ]);
  await sendEmail({ to: user.email, subject: `Assigned to Batch ${batch.name}`, html });
  await sendEmail({ to: ADMIN_EMAIL, subject: `Batch Assigned: ${user.name} - ${batch.name}`, html });
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

module.exports = { sendContactInquiryEmail, sendEnrollmentAcceptedEmail, sendEnrollmentReceipt, sendBatchAssignedEmail, sendReplyEmail, sendTestEmail };
