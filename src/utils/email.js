const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");

  if (!host || !user || !pass) {
    console.warn("SMTP not configured. Email sending disabled.");
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    requireTLS: true,
    tls: { rejectUnauthorized: false },
  });

  return transporter;
}

async function verifyConnection() {
  const t = getTransporter();
  if (!t) return false;
  try {
    await t.verify();
    console.log("SMTP connection verified successfully");
    return true;
  } catch (err) {
    console.error("SMTP verification failed:", err.message);
    transporter = null;
    return false;
  }
}

async function sendEmail({ to, subject, html, from }) {
  const t = getTransporter();
  if (!t) {
    console.log(`[EMAIL DISABLED] Would send to ${to}: ${subject}`);
    return { sent: false, reason: "SMTP not configured" };
  }

  try {
    const info = await t.sendMail({
      from: from || `"Barista Training Bangladesh" <${process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`Email send failed to ${to}:`, err.message);
    throw err;
  }
}

function buildEmailTemplate(title, bodyLines) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#faf8f5;padding:30px;border-radius:12px;">
      <div style="background:#d4803c;color:white;padding:20px;border-radius:10px 10px 0 0;text-align:center;">
        <h2 style="margin:0;">${title}</h2>
      </div>
      <div style="background:white;padding:25px;border-radius:0 0 10px 10px;border:1px solid #e8e0d8;">
        ${bodyLines.map((line) => `<p style="margin:8px 0;color:#333;font-size:14px;line-height:1.6;">${line}</p>`).join("")}
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
        <p style="color:#999;font-size:12px;margin:0;">Barista Training Bangladesh<br/>Mirpur, Dhaka</p>
      </div>
    </div>
  `;
}

module.exports = { sendEmail, buildEmailTemplate, getTransporter, verifyConnection };
