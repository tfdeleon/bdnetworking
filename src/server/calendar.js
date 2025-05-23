import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

let oauth2Client;
let initialized = false;

// Initialize and authenticate the OAuth2 client
async function initOAuth() {
  if (initialized) return;

  oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    const tokens = JSON.parse(process.env.GOOGLE_TOKENS);
    oauth2Client.setCredentials(tokens);
    initialized = true;
    console.log("✅ Loaded Google tokens from environment variable.");
  } catch (err) {
    console.error("❌ Failed to load Google tokens:", err.message);
    throw new Error("Missing or invalid GOOGLE_TOKENS environment variable.");
  }
}

// Format time as 12-hour string
function formatTo12Hour(time) {
  const [hours, minutes] = time.split(":");
  const formattedHours = hours % 12 || 12;
  const ampm = hours < 12 ? "AM" : "PM";
  return `${formattedHours}:${minutes} ${ampm}`;
}

// Get available time slots for a given date
export async function getAvailableTimeSlots(date) {
  await initOAuth();
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const startOfDay = new Date(`${date}T09:00:00`);
  const endOfDay = new Date(`${date}T17:00:00`);

  let events;
  try {
    events = await calendar.events.list({
      calendarId: "primary",
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });
  } catch (err) {
    console.error("❌ Google Calendar API error:", err);
    throw err;
  }

  const bookedTimes = events.data.items.map((event) => {
    const startTime = new Date(event.start.dateTime);
    return startTime.toISOString().slice(11, 16);
  });

  const allSlots = [];
  const current = new Date(startOfDay);

  while (current < endOfDay) {
    const hours = current.getHours().toString().padStart(2, "0");
    const minutes = current.getMinutes().toString().padStart(2, "0");
    const value = `${hours}:${minutes}`;
    allSlots.push({ value, label: formatTo12Hour(value) });
    current.setMinutes(current.getMinutes() + 30);
  }

  return { availableTimes: allSlots, bookedTimes };
}

// Create a new calendar event
export async function createCalendarEvent({
  name,
  email,
  date,
  time,
  message,
  phone,
}) {
  await initOAuth();
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  if (time < "09:00" || time >= "17:00") {
    throw new Error("Selected time is outside of working hours (9AM–5PM).");
  }

  const startTime = `${date}T${time}:00`;
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + 1);

  const events = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date(startTime).toISOString(),
    timeMax: endTime.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  if (events.data.items.length > 0) {
    const available = await getAvailableTimeSlots(date);
    const error = new Error("Time slot already booked");
    error.available = available;
    throw error;
  }

  const event = {
    summary: `Consultation with ${name}`,
    description: `Email: ${email}\nPhone: ${phone}\nMessage: ${message}`,
    start: {
      dateTime: startTime,
      timeZone: "America/New_York",
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: "America/New_York",
    },
    colorId: "11",
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 10 },
        { method: "popup", minutes: 10 },
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
  });

  return response;
}
