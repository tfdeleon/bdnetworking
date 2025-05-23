import axios from "axios";
import {
  createCalendarEvent,
  getAvailableTimeSlots,
} from "../src/server/calendar.js";
import { sendConfirmationEmail } from "../src/server/mailer.js";

export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://www.bdlvsolutions.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Only allow POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { name, phone, email, date, time, message, recaptchaResponse } =
    req.body;

  if (!name || !email || !date || !time || !recaptchaResponse) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // ✅ Verify reCAPTCHA
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`;
    const response = await axios.post(verificationUrl);
    const { success } = response.data;

    if (!success) {
      return res.status(400).json({ error: "reCAPTCHA verification failed" });
    }

    // ✅ Create calendar event and send confirmation
    await createCalendarEvent({ name, phone, email, date, time, message });
    await sendConfirmationEmail({ name, email, date, time });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Booking error:", err.message);

    if (err.available) {
      return res.status(409).json({
        error: "That time slot is already booked.",
        availableTimes: err.available,
      });
    }

    return res.status(500).json({ error: err.message || "Server error" });
  }
}
