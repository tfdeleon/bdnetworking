import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export async function sendConfirmationEmail({ name, email, date, time }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.CONFIRMATION_EMAIL,
      pass: process.env.CONFIRMATION_EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Bdlvsolutions" <${process.env.CONFIRMATION_EMAIL}>`,
    to: email,
    subject: "Your Consultation is Confirmed",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://i.ibb.co/hBSZWcj/bdnetworkinglogo.jpg" alt="Bdlvsolutions Logo" style="max-width: 200px;" />
        </div>

        <h2 style="color: #2d3748;">Hi ${name},</h2>
        <p>Your consultation has been successfully scheduled.</p>
        <p><strong>Date:</strong> ${date}<br><strong>Time:</strong> ${time}</p>
        <p>We look forward to speaking with you!</p>

        <br />

        <p style="font-size: 14px; color: #555;">
          — The Bdlvsolutions Team<br />
          📞 <a href="tel:7186692234" style="color: #3182ce;">718-669-2234</a><br />
          🌐 <a href="https://bdlvsolutions.com" style="color: #3182ce;">bdlvsolutions.com</a><br />
          📸 <a href="https://instagram.com/bdnetworking/" style="color: #3182ce;">@bdnetworking</a>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />

        <p style="font-size: 12px; color: #999; text-align: center;">
          You received this email because you booked a consultation with Bdlvsolutions.<br />
          If you did not make this booking, please contact us at <a href="mailto:${process.env.CONFIRMATION_EMAIL}" style="color: #999;">${process.env.CONFIRMATION_EMAIL}</a>.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(
      "📧 Confirmation email sent to:",
      email,
      "| Message ID:",
      info.messageId,
    );
  } catch (error) {
    console.error("❌ Failed to send confirmation email:", error.message);
  }
}
