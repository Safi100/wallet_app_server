const nodemailer = require("nodemailer");

module.exports = async function sendEmail(
  email,
  subject,
  code,
  ip = "Unknown",
  location = "Unknown",
  time = new Date().toLocaleString()
) {
  return new Promise(async (resolve, reject) => {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.PASS_USER,
        },
      });

      const html = `
          <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #fefaf6; color: #3b2f2f; border-radius: 12px; max-width: 600px; border: 1px solid #e0d6cc;">
            <h2 style="display: flex; align-items: center; gap: 10px; color: #5e3c2d;">Wallet Verification</h2>
            <p style="margin-bottom: 16px;">Hello,</p>
            <p>Please use the following verification code:</p>
            
            <div style="font-size: 36px; font-weight: bold; margin: 20px 0; letter-spacing: 6px; color: #3b2f2f;">
              ${code}
            </div>
            <p style="color: #6b4c3b;">Do not share this code with anyone.</p>
            <hr style="margin: 28px 0; border: none; border-top: 1px solid #e0d6cc;">
            <p style="font-size: 13px; color: #7a5c48; line-height: 1.6;">
              📡 <b>IP:</b> ${ip}<br>
              📍 <b>Location:</b> ${location}<br>
              🕒 <b>Time:</b> ${time}<br><br>
              🕑 <b>This code is valid for 2 hours only.</b><br>
              After that, it will expire automatically.<br><br>
              If you didn’t request this, you can safely ignore this email.
            </p>
          </div>
        `;

      await transporter.sendMail({
        from: `"Wallet Verification" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html,
      });

      resolve(true);
    } catch (err) {
      console.error("❌ Email error:", err.message);
      reject(err);
    }
  });
};
