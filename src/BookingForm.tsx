import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import ReCAPTCHA from 'react-google-recaptcha'; 


function BookingForm() {
  const [availableTimes, setAvailableTimes] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState(null); // State to hold the reCAPTCHA response

  // Handle reCAPTCHA response
  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!recaptchaValue) {
      toast.error('Please verify that you are not a robot!');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ ...formData, recaptchaResponse: recaptchaValue }) // Send the recaptcha response token to the server
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || 'Unknown error');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to schedule consultation');
      }

      toast.success('Consultation booked successfully! Check your email for confirmation.');
      setFormData({
        name: '',
        phone: '',
        email: '',
        date: '',
        time: '',
        message: ''
      });
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to book consultation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setFormData(prev => ({ ...prev, date }));

    try {
      const res = await fetch(`http://localhost:3001/api/available-times?date=${date}`);
      const data = await res.json();
      setAvailableTimes(data); // expects [{ value, label }]
    } catch (err) {
      console.error('Failed to load time slots:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
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
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Date
        </label>
        <input
          type="date"
          id="date"
          value={formData.date}
          onChange={handleDateChange}
          required
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div>
        <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
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
          {availableTimes.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
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

      <div className="g-recaptcha" data-sitekey="6LdnJTYrAAAAAOxi_CfXS6jJ8nx7nalXRBrRY8Ms" />
      <ReCAPTCHA
        sitekey="6LdnJTYrAAAAAApOIdmeBs9sefavj8xEDVLYxfYY" 
        onChange={handleRecaptchaChange} // Set the response value
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full bg-accent text-primary px-6 py-3 rounded-md transition-all duration-200 ${isSubmitting ? 'bg-accent/70 cursor-not-allowed' : 'hover:bg-accent-dark hover:scale-105'}`}
      >
        {isSubmitting ? 'Scheduling...' : 'Schedule Consultation'}
      </button>
    </form>
  );
}

export default BookingForm;