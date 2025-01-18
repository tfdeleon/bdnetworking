// Update the error handling in createCalendarEvent function
export async function createCalendarEvent(bookingData: {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  message?: string;
}) {
  try {
    // Check if credentials file exists
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      throw new Error('Google Calendar credentials file not found. Please ensure credentials.json is properly configured.');
    }

    // Read and parse credentials
    let credentials: ServiceAccountCredentials;
    try {
      const rawData = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
      credentials = JSON.parse(rawData.replace(/^\uFEFF/, ''));
    } catch (error) {
      throw new Error('Failed to parse credentials.json. Please check the file format and contents.');
    }

    // Validate credentials
    const requiredFields = ['client_email', 'private_key', 'project_id'];
    const missingFields = requiredFields.filter(field => !credentials[field as keyof ServiceAccountCredentials]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required credentials: ${missingFields.join(', ')}. Please check your credentials.json file.`);
    }

    // Create auth client
    const client = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: SCOPES
    });

    // Initialize calendar API
    const calendar = google.calendar({ version: 'v3', auth: client });

    // Map time slots
    const timeSlots = {
      morning: { start: '09:00', end: '12:00' },
      afternoon: { start: '12:00', end: '16:00' },
      evening: { start: '16:00', end: '19:00' }
    };

    const selectedTime = timeSlots[bookingData.time as keyof typeof timeSlots];
    if (!selectedTime) {
      throw new Error('Invalid time slot selected. Please choose morning, afternoon, or evening.');
    }

    // Format description with proper line breaks
    const description = `
Security Consultation Details:
---------------------------
Name: ${bookingData.name}
Email: ${bookingData.email}
Phone: ${bookingData.phone}
${bookingData.message ? `\nAdditional Notes:\n${bookingData.message}` : ''}
    `.trim();

    // Create event
    const event = {
      summary: `Security Consultation with ${bookingData.name}`,
      description,
      start: {
        dateTime: `${bookingData.date}T${selectedTime.start}:00-05:00`,
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: `${bookingData.date}T${selectedTime.end}:00-05:00`,
        timeZone: 'America/New_York'
      },
      attendees: [{ email: bookingData.email }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 }
        ]
      }
    };

    // Insert event
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all'
    });

    return response.data;
  } catch (error: any) {
    console.error('Calendar API Error:', error);
    // Provide more specific error messages
    if (error.message.includes('credentials.json')) {
      throw new Error(error.message);
    } else if (error.code === 401) {
      throw new Error('Authentication failed. Please check your Google Calendar API credentials.');
    } else if (error.code === 403) {
      throw new Error('Permission denied. Please ensure the service account has access to the calendar.');
    } else {
      throw new Error(error.message || 'Failed to schedule consultation. Please try again later.');
    }
  }
}