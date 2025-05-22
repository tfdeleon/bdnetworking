import { google } from "googleapis";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

// Load saved credentials from disk
const tokenPath = path.resolve("./tokens.json");
try {
  const tokenJSON = await fs.readFile(tokenPath, "utf-8");
  const tokens = JSON.parse(tokenJSON);
  oauth2Client.setCredentials(tokens);
  console.log("✅ Loaded saved Google tokens");
} catch {
  console.warn("⚠️ No saved tokens. Visit /auth/google to authenticate.");
}

// Function to get available time slots
export async function getAvailableTimeSlots(date) {
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

  // Create a set of booked times
  const bookedTimes = events.data.items.map((event) => {
    const startTime = new Date(event.start.dateTime);
    return startTime.toISOString().slice(11, 16); // Return the time in HH:mm format
  });

  const allSlots = [];
  const current = new Date(startOfDay);

  // Loop to create slots in 30-minute intervals
  while (current < endOfDay) {
    const hours = current.getHours().toString().padStart(2, "0");
    const minutes = current.getMinutes().toString().padStart(2, "0");
    const value = `${hours}:${minutes}`;

    allSlots.push({ value, label: formatTo12Hour(value) });

    current.setMinutes(current.getMinutes() + 30); // Move to next time slot
  }

  return { availableTimes: allSlots, bookedTimes };
}

// Helper function to format time in 12-hour format (e.g., "9:00 AM")
function formatTo12Hour(time) {
  const [hours, minutes] = time.split(":");
  const formattedHours = hours % 12 || 12; // Convert 24-hour to 12-hour format
  const ampm = hours < 12 ? "AM" : "PM";
  return `${formattedHours}:${minutes} ${ampm}`;
}

// Create calendar event function
export async function createCalendarEvent({
  name,
  email,
  date,
  time,
  message,
  phone,
}) {
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  // Ensure time is within working hours (9 AM – 5 PM)
  if (time < "09:00" || time >= "17:00") {
    throw new Error("Selected time is outside of working hours (9AM–5PM).");
  }

  const startTime = `${date}T${time}:00`;
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + 1);

  const endTimeISO = endTime.toISOString();

  const events = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date(startTime).toISOString(),
    timeMax: endTimeISO,
    singleEvents: true,
    orderBy: "startTime",
  });

  // Check if the time slot is already booked
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
      dateTime: endTimeISO,
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
