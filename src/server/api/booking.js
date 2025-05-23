import express from "express";
import axios from "axios";
import { createCalendarEvent, getAvailableTimeSlots } from "../calendar.js";
import { sendConfirmationEmail } from "../mailer.js";

const router = express.Router();

// ✅ CORS middleware (required if frontend is hosted on another domain, like GitHub Pages)
router.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://www.bdlvsolutions.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Preflight request
  }

  next();
});

// ✅ POST /book - Handles booking
router.post("/book", async (req, res) => {
  const { name, phone, email, date, time, message, recaptchaResponse } = req.body;

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

    // ✅ Proceed to book and send confirmation
    await createCalendarEvent({ name, phone, email, date, time, message });
    await sendConfirmationEmail({ name, email, date, time });

    return res.json({ success: true });
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
});

// ✅ GET /available-times - Fetches slots for a given date
router.get("/available-times", async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Date is required" });
  }

  try {
    const { availableTimes, bookedTimes } = await getAvailableTimeSlots(date);
    res.json({ availableTimes, bookedTimes });
  } catch (err) {
    console.error("Error getting available times:", err);
    res.status(500).json({ error: "Failed to fetch available times" });
  }
});

export default router;
