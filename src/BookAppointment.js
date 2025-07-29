import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BookAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedService = location.state?.service;
  
  const [formData, setFormData] = useState({
    service: selectedService?.name || '',
    date: '',
    time: '',
    phone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [googleCalendarUrl, setGoogleCalendarUrl] = useState('');

  const services = [
    "Hair Styling & Cuts",
    "Facial Treatments", 
    "Spa & Massage",
    "Manicure & Pedicure",
    "Hair Coloring",
    "Bridal Packages",
    "Threading & Waxing",
    "Hair Treatments",
    "Makeup Services"
  ];

  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
    "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const userSession = localStorage.getItem('userSession');
    if (!userSession) {
      alert('Please login to book an appointment');
      navigate('/');
      return;
    }

    const user = JSON.parse(userSession);
    
    const appointmentData = {
      ...formData,
      userEmail: user.email,
      userName: user.name,
      userPhone: formData.phone,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    console.log('Booking appointment:', appointmentData);

    try {
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      const result = await response.json();
      console.log('Server response:', result);
      
      if (response.ok && result.success) {
        setSuccess(true);
        setGoogleCalendarUrl(result.googleCalendarUrl || '');
        setTimeout(() => {
          navigate('/welcome');
        }, 3000);
      } else {
        alert(result.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert(`Network error: ${error.message}. Please check if the server is running on port 5000.`);
    }
    
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 relative">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(219, 39, 119, 0.08) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(244, 63, 94, 0.08) 0%, transparent 50%)`
        }}></div>
      </div>

      <div className="relative z-10 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl sm:text-5xl font-light text-stone-800 mb-4">Book Appointment</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto mb-6"></div>
            <p className="font-sans text-lg text-stone-600">Schedule your beauty session with us</p>
          </div>

          {success ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-stone-200/50 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h2 className="font-serif text-2xl font-medium text-stone-800 mb-4">Appointment Booked!</h2>
              <p className="font-sans text-stone-600 mb-6">Your appointment has been successfully scheduled. We'll contact you soon to confirm.</p>
              
              {googleCalendarUrl && (
                <div className="mb-6">
                  <a 
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-sans font-semibold py-3 px-6 rounded-xl transition-all duration-300 mb-4"
                  >
                    Add to Google Calendar
                  </a>
                </div>
              )}
              
              <button 
                onClick={() => navigate('/welcome')}
                className="bg-gradient-to-r from-stone-800 to-stone-900 text-white font-sans font-semibold py-3 px-8 rounded-xl"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-stone-200/50">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-sans text-sm font-semibold text-stone-700 mb-3">Service</label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:outline-none"
                  >
                    <option value="">Select a service</option>
                    {services.map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-sans text-sm font-semibold text-stone-700 mb-3">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-sans text-sm font-semibold text-stone-700 mb-3">Time</label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:outline-none"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-sans text-sm font-semibold text-stone-700 mb-3">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:outline-none"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block font-sans text-sm font-semibold text-stone-700 mb-3">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Any special requests or notes..."
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-700 font-sans font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Booking...' : 'Book Appointment'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}