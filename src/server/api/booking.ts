import { Router } from 'express';
import { createCalendarEvent } from '../calendar';

const router = Router();

router.post('/create-booking', async (req, res) => {
  try {
    const bookingData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'date', 'time'];
    const missingFields = requiredFields.filter(field => !bookingData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(bookingData.date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Please use YYYY-MM-DD'
      });
    }

    // Validate time slot
    const validTimeSlots = ['morning', 'afternoon', 'evening'];
    if (!validTimeSlots.includes(bookingData.time)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid time slot. Must be morning, afternoon, or evening'
      });
    }

    const event = await createCalendarEvent(bookingData);
    
    return res.status(200).json({ 
      success: true, 
      event,
      message: 'Consultation scheduled successfully'
    });
  } catch (error) {
    console.error('Booking error:', error);
    
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to schedule consultation'
    });
  }
});

export default router;