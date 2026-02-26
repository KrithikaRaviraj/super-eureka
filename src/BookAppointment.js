import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
  "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM"
];

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
  const [currentStep, setCurrentStep] = useState(1);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

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

  const steps = [
    { id: 1, title: "Service", icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z' },
    { id: 2, title: "Date & Time", icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 3, title: "Details", icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 4, title: "Confirm", icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];
  
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDate) return;
      
      try {
        // Fetch booked slots for the selected date
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/appointments/booked-slots?date=${selectedDate}`);
        if (response.ok) {
          const data = await response.json();
          const bookedSlots = data.bookedSlots || []; // Expecting array of time strings ["9:00 AM", "10:00 AM"]
          const available = timeSlots.filter(slot => !bookedSlots.includes(slot));
          setAvailableSlots(available);
        } else {
          // Fallback: show all slots if API fails, or handle error appropriately
          setAvailableSlots(timeSlots);
        }
      } catch (error) {
        console.error("Failed to fetch availability:", error);
        setAvailableSlots(timeSlots);
      }
    };

    fetchAvailability();
  }, [selectedDate]);
  
  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };
  
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };
  
  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.service;
      case 2: return formData.date && formData.time;
      case 3: return formData.phone;
      default: return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const userSession = localStorage.getItem('userSession');
    if (!userSession) {
      sessionStorage.setItem('postLoginReturnPath', `${location.pathname}${location.search}${location.hash}`);
      sessionStorage.setItem('postLoginScrollY', String(window.scrollY));
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

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      const result = await response.json();
      
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
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
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
            <p className="font-sans text-lg text-stone-600 mb-8">Schedule your beauty session with us</p>
            
            {/* Progress Steps */}
            <div className="flex justify-center items-center space-x-4 mb-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStep >= step.id 
                      ? 'bg-rose-600 text-white shadow-lg scale-110' 
                      : 'bg-stone-200 text-stone-500'
                  }`}>
                    <svg className="w-6 h-6" fill={currentStep >= step.id ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                    </svg>
                  </div>
                  <span className={`ml-2 font-sans text-sm font-medium ${
                    currentStep >= step.id ? 'text-rose-600' : 'text-stone-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 transition-colors duration-300 ${
                      currentStep > step.id ? 'bg-rose-600' : 'bg-stone-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
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
                {/* Step 1: Service Selection */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="font-serif text-2xl font-medium text-stone-800 text-center mb-6">Choose Your Service</h3>
                    <div className="grid gap-4">
                      {services.map(service => (
                        <button
                          key={service}
                          type="button"
                          onClick={() => setFormData({...formData, service})}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 text-left hover:scale-105 ${
                            formData.service === service
                              ? 'border-rose-400 bg-rose-50 text-rose-700'
                              : 'border-stone-200 hover:border-rose-200 text-stone-700'
                          }`}
                        >
                          <span className="font-sans font-medium">{service}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Step 2: Date & Time */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="font-serif text-2xl font-medium text-stone-800 text-center mb-6">Select Date & Time</h3>
                    <div>
                      <label className="block font-sans text-sm font-semibold text-stone-700 mb-3">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={(e) => {
                          handleChange(e);
                          setSelectedDate(e.target.value);
                        }}
                        min={new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:outline-none transition-all duration-300"
                      />
                    </div>
                    
                    {formData.date && (
                      <div>
                        <label className="block font-sans text-sm font-semibold text-stone-700 mb-3">Available Times</label>
                        <div className="grid grid-cols-3 gap-3">
                          {availableSlots.map(time => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setFormData({...formData, time})}
                              className={`p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                                formData.time === time
                                  ? 'border-rose-400 bg-rose-50 text-rose-700'
                                  : 'border-stone-200 hover:border-rose-200 text-stone-700'
                              }`}
                            >
                              <span className="font-sans text-sm font-medium">{time}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Step 3: Contact Details */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="font-serif text-2xl font-medium text-stone-800 text-center mb-6">Contact Information</h3>
                    <div>
                      <label className="block font-sans text-sm font-semibold text-stone-700 mb-3">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:outline-none transition-all duration-300"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div>
                      <label className="block font-sans text-sm font-semibold text-stone-700 mb-3">Notes (Optional)</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Any special requests or notes..."
                        className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:outline-none resize-none transition-all duration-300"
                      />
                    </div>
                  </div>
                )}
                
                {/* Step 4: Confirmation */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="font-serif text-2xl font-medium text-stone-800 text-center mb-6">Confirm Your Appointment</h3>
                    <div className="bg-stone-50 rounded-xl p-6 space-y-4">
                      <div className="flex justify-between">
                        <span className="font-sans font-semibold text-stone-700">Service:</span>
                        <span className="font-sans text-stone-600">{formData.service}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-sans font-semibold text-stone-700">Date:</span>
                        <span className="font-sans text-stone-600">{new Date(formData.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-sans font-semibold text-stone-700">Time:</span>
                        <span className="font-sans text-stone-600">{formData.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-sans font-semibold text-stone-700">Phone:</span>
                        <span className="font-sans text-stone-600">{formData.phone}</span>
                      </div>
                      {formData.notes && (
                        <div>
                          <span className="font-sans font-semibold text-stone-700 block mb-2">Notes:</span>
                          <span className="font-sans text-stone-600">{formData.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Navigation Buttons */}
                <div className="flex space-x-4 pt-6">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-700 font-sans font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Previous
                    </button>
                  )}
                  
                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!canProceed()}
                      className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-sans font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-sans font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 transform hover:scale-105 relative overflow-hidden group"
                    >
                      <span className="relative z-10">{isSubmitting ? 'Booking...' : 'Confirm Booking'}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
