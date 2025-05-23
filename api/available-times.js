import { getAvailableTimeSlots } from "../src/server/calendar.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.bdlvsolutions.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Date is required" });
  }

  try {
    const { availableTimes, bookedTimes } = await getAvailableTimeSlots(date);
    return res.status(200).json({ availableTimes, bookedTimes });
  } catch (err) {
    console.error("Error getting available times:", err);
    return res.status(500).json({ error: "Failed to fetch available times" });
  }
}
