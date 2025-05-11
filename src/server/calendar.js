import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Load saved credentials from disk
const tokenPath = path.resolve('./tokens.json');
try {
  const tokenJSON = await fs.readFile(tokenPath, 'utf-8');
  const tokens = JSON.parse(tokenJSON);
  oauth2Client.setCredentials(tokens);
  console.log('✅ Loaded saved Google tokens');
} catch {
  console.warn('⚠️ No saved tokens. Visit /auth/google to authenticate.');
}

function formatTo12Hour(time24) {
  const [hourStr, min] = time24.split(':');
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${min} ${period}`;
}

export async function getAvailableTimeSlots(date) {
  console.log('📅 Fetching available slots for:', date);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const startOfDay = new Date(`${date}T09:00:00`);
  const endOfDay = new Date(`${date}T17:00:00`);

  let events;
  try {
    events = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
  } catch (err) {
    console.error('❌ Google Calendar API error:', err);
    throw err;
  }

  const taken = new Set(
    events.data.items.map(event =>
      new Date(event.start.dateTime).toISOString().slice(11, 16)
    )
  );

  const allSlots = [];
  const current = new Date(startOfDay);

  while (current < endOfDay) {
    const hours = current.getHours().toString().padStart(2, '0');
    const minutes = current.getMinutes().toString().padStart(2, '0');
    const value = `${hours}:${minutes}`;

    if (!taken.has(value)) {
      allSlots.push({ value, label: formatTo12Hour(value) });
    }

    current.setMinutes(current.getMinutes() + 30);
  }

  return allSlots;
}

export async function createCalendarEvent({ name, email, date, time, message, phone }) {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  if (time < '09:00' || time >= '17:00') {
    throw new Error('Selected time is outside of working hours (9AM–5PM).');
  }

  const startTime = `${date}T${time}:00`;
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + 1);

  const endTimeISO = endTime.toISOString();

  const events = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date(startTime).toISOString(),
    timeMax: endTimeISO,
    singleEvents: true,
    orderBy: 'startTime',
  });

  if (events.data.items.length > 0) {
    const available = await getAvailableTimeSlots(date);
    const error = new Error('Time slot already booked');
    error.available = available;
    throw error;
  }

  const event = {
    summary: `Consultation with ${name}`,
    description: `Email: ${email}\nPhone: ${phone}\nMessage: ${message}`,
    start: {
      dateTime: startTime,
      timeZone: 'America/New_York',
    },
    end: {
      dateTime: endTimeISO,
      timeZone: 'America/New_York',
    },
    colorId: "11",
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 10 },
        { method: 'popup', minutes: 10 }
      ]
    }
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });

  return response;
}
