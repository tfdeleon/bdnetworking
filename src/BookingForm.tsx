import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import ReCAPTCHA from "react-google-recaptcha";

// Define types
interface FormData {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  message: string;
}

interface TimeSlot {
  value: string;
  label: string;
}

function BookingForm() {
  // Set initial state types
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);  // This is the key state
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null); // State to hold the reCAPTCHA response

  // Handle reCAPTCHA response
  const handleRecaptchaChange = (value: string | null) => {
    setRecaptchaValue(value);
    console.log("reCAPTCHA Token:", value);
  };

  // Fetch available and booked times when date changes
  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setFormData((prev) => ({ ...prev, date }));

    try {
      const res = await fetch(`http://localhost:3001/api/available-times?date=${date}`);
      const data = await res.json();

      console.log("Fetched Data:", data);

      // Predefined time slots (24-hour format)
      const timeSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
        "15:00", "15:30", "16:00", "16:30"
      ];

      if (data?.bookedTimes) {
        const bookedTimes = data.bookedTimes || [];

        // Filter out booked times from the predefined time slots
        const filteredAvailableTimes = timeSlots.filter(
          (slot) => !bookedTimes.includes(slot)
        );

        // Convert to 12-hour format for display
        const availableTimes12hr = filteredAvailableTimes.map((slot) => ({
          value: slot,
          label: formatTo12Hour(slot), // Convert to 12-hour format for display
        }));

        // Update availableTimes state
        setAvailableTimes(availableTimes12hr);
        setBookedTimes(bookedTimes);

        console.log("Available Times after State Change:", availableTimes12hr);
        console.log("Booked Times after State Change:", bookedTimes);
      }
    } catch (err) {
      console.error("Failed to load time slots:", err);
    }
  };

  // Function to format time in 12-hour format (e.g., "9:00 AM")
  function formatTo12Hour(time: string) {
    const [hours, minutes] = time.split(":");
    const formattedHours = (parseInt(hours, 10) % 12) || 12; // Convert 24-hour to 12-hour format
    const ampm = parseInt(hours, 10) < 12 ? "AM" : "PM";
    return `${formattedHours}:${minutes} ${ampm}`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!recaptchaValue) {
      toast.error("Please verify that you are not a robot!");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...formData,
          recaptchaResponse: recaptchaValue,
        }), // Send the recaptcha response token to the server
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "Unknown error");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to schedule consultation");
      }

      toast.success(
        "Consultation booked successfully! Check your email for confirmation.",
      );
      setFormData({
        name: "",
        phone: "",
        email: "",
        date: "",
        time: "",
        message: "",
      });
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to book consultation",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  // Log available and booked times when updated
  useEffect(() => {
    console.log("Available Times after State Change:", availableTimes);
    console.log("Booked Times after State Change:", bookedTimes);
  }, [availableTimes, bookedTimes]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="(123) 456-7890"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="john@example.com"
        />
      </div>
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Preferred Date
        </label>
        <input
          type="date"
          id="date"
          value={formData.date}
          onChange={handleDateChange}
          required
          min={new Date().toISOString().split("T")[0]}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div>
        <label
          htmlFor="time"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Preferred Time (9:00 AM - 5:00 PM)
        </label>
        <select
          id="time"
          value={formData.time}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">Select a time</option>
          {availableTimes.length > 0 ? (
            availableTimes.map(({ value, label }) => {
              const isBooked = bookedTimes.includes(value);

              return (
                <option key={value} value={value} disabled={isBooked}>
                  {label} {isBooked && "(Booked)"}
                </option>
              );
            })
          ) : (
            <option disabled>No available times</option>
          )}
        </select>
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Additional Notes
        </label>
        <textarea
          id="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Tell us about your security needs..."
        ></textarea>
      </div>

      <ReCAPTCHA
        sitekey="6LdnJTYrAAAAAApOIdmeBs9sefavj8xEDVLYxfYY"
        onChange={handleRecaptchaChange}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full bg-accent text-primary px-6 py-3 rounded-md transition-all duration-200 ${isSubmitting ? "bg-accent/70 cursor-not-allowed" : "hover:bg-accent-dark hover:scale-105"}`}
      >
        {isSubmitting ? "Scheduling..." : "Schedule Consultation"}
      </button>
    </form>
  );
}

export default BookingForm;
