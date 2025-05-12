import { getAvailableTimeSlots, createCalendarEvent } from '../calendar.js';
import express from 'express';
import { sendConfirmationEmail } from '../mailer.js';
import axios from 'axios';

const router = express.Router();

// POST route for booking consultation
router.post('/book', async (req, res) => {
  const { name, phone, email, date, time, message, recaptchaResponse } = req.body;

  // Validate required fields
  if (!name || !email || !date || !time || !recaptchaResponse) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Verify reCAPTCHA
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY; // Your secret key from Google
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`;

    // Verify the reCAPTCHA response by sending a request to Google's API
    const response = await axios.post(verificationUrl);
    const { success } = response.data;

    // If reCAPTCHA verification failed
    if (!success) {
      return res.status(400).json({ error: 'reCAPTCHA verification failed' });
    }

    // Proceed with booking logic if reCAPTCHA is valid
    await createCalendarEvent({ name, phone, email, date, time, message });
    await sendConfirmationEmail({ name, email, date, time });

    return res.json({ success: true });
  } catch (err) {
    console.error('❌ Booking error:', err.message);

    // Handle specific errors
    if (err.available) {
      return res.status(409).json({
        error: 'That time slot is already booked.',
        availableTimes: err.available,
      });
    }

    // General server error
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

// GET route for available times
router.get('/available-times', async (req, res) => {
  const { date } = req.query;

  if (!date) return res.status(400).json({ error: 'Date is required' });

  try {
    const slots = await getAvailableTimeSlots(date);
    res.json(slots); // [{ value: '09:00', label: '9:00 AM' }, ...]
  } catch (err) {
    console.error('Error getting available times:', err);
    res.status(500).json({ error: 'Failed to fetch available times' });
  }
});

export default router;
