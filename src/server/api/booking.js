import { getAvailableTimeSlots, createCalendarEvent } from '../calendar.js';
import express from 'express'

const router = express.Router();

router.post('/book', async (req, res) => {
  const { name, phone, email, date, time, message } = req.body;

  if (!name || !email || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await createCalendarEvent({ name, phone, email, date, time, message });
    return res.json({ success: true });
  } catch (err) {
    console.error('❌ Booking error:', err.message);

    if (err.available) {
      return res.status(409).json({
        error: 'That time slot is already booked.',
        availableTimes: err.available,
      });
    }

    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

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
