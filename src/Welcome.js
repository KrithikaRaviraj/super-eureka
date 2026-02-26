import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import SalonLogo from "./components/SalonLogo";

const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

// Add custom styles
const style = document.createElement('style');
style.textContent = `
  .font-serif { font-family: 'Cormorant Garamond', serif; }
  .font-sans { font-family: 'Inter', sans-serif; }
  body { font-family: 'Inter', sans-serif; }
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.5s ease-out;
  }
`;
document.head.appendChild(style);

export default function Welcome() {
  const location = useLocation();
  const [name, setName] = useState(location.state?.name || "");
  const [email, setEmail] = useState(location.state?.email || "");
  const [userPhone] = useState(location.state?.phone || "");
  const [uid, setUid] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [showAppointments] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [originalEmail, setOriginalEmail] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('upcoming');

  const fetchAppointments = useCallback(async () => {
    // Get email from multiple sources
    let currentEmail = email || location.state?.email;
    
    // If no email, try to get from localStorage
    if (!currentEmail) {
      const userSession = localStorage.getItem('userSession');
      if (userSession) {
        const session = JSON.parse(userSession);
        currentEmail = session.email;
      }
    }
    
    if (currentEmail) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/appointments/user/${encodeURIComponent(currentEmail)}`);
        if (response.ok) {
          const data = await response.json();
          setAppointments(data.appointments || []);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    }
  }, [email, location.state]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  
  // Fetch user data on mount
  useEffect(() => {
    // First, try to get name from localStorage session
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      const session = JSON.parse(userSession);
      if (session.name && session.name !== 'Client') {
        setName(session.name);
      }
      if (session.email) {
        setEmail(session.email);
      }
    }
    
    async function fetchUser() {
      try {
        let queryParam = '';
        if (email) {
          queryParam = `email=${encodeURIComponent(email)}`;
        } else if (userPhone) {
          queryParam = `phone=${encodeURIComponent(userPhone)}`;
        }
        
        if (queryParam) {
          const res = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/users?${queryParam}`);
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setName(data.user.name || name);
              setEmail(data.user.email || email);
              setOriginalEmail(data.user.email || email);
              setPhone(data.user.phone || userPhone || "");
              setUid(data.user.uid || "");
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    }
    fetchUser();
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Refresh appointments when component becomes visible (user returns from booking)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAppointments();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [email, fetchAppointments]);
  

  // Save profile data to backend
  const handleSave = async (e) => {
    e.preventDefault();
    setSaved(false);
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          uid, 
          name, 
          email: email || null, 
          phone: phone || null, 
          photoURL: "" 
        }),
      });
      
      // Send email confirmation if email was changed
      if (email && email !== originalEmail) {
        await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/users/send-profile-update-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name }),
        });
      }
      
      // Update localStorage session
      const userSession = localStorage.getItem('userSession');
      if (userSession) {
        const session = JSON.parse(userSession);
        session.name = name;
        session.email = email;
        localStorage.setItem('userSession', JSON.stringify(session));
        
        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: session }));
      }
      
      setOriginalEmail(email);
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      alert("Failed to save.");
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (response.ok) {
        fetchAppointments(); // Refresh the list
      } else {
        alert("Failed to cancel appointment. Please contact support.");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Network error. Please try again later.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(219, 39, 119, 0.08) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(244, 63, 94, 0.08) 0%, transparent 50%)`
        }}></div>
      </div>

      <div className="relative z-10 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <div className="relative inline-block mb-8">
            <div className="h-20 w-20 sm:h-24 sm:w-24 mx-auto">
              <SalonLogo />
            </div>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-stone-800 mb-4 tracking-wide leading-tight">
            Lavish Ladies Beauty Salon
          </h1>
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent"></div>
            <div className="mx-4 w-2 h-2 bg-rose-400 rounded-full"></div>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent"></div>
          </div>
        </div>

        {/* Welcome Message & Quick Actions */}
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-stone-800 mb-6">
            Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 17 ? 'Afternoon' : 'Evening'}, {name?.split(' ')[0] || 'Valued Client'}
          </h2>
          <button
            onClick={handleLogout}
            className="text-stone-500 hover:text-rose-600 font-sans text-sm font-medium transition-colors border-b border-transparent hover:border-rose-600"
          >
            Sign Out
          </button>

        </div>

        {/* Profile Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-stone-200/50 hover:shadow-3xl transition-all duration-500 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-stone-50 to-rose-50 px-6 sm:px-10 py-8 border-b border-stone-200">
              <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
                {/* Profile Icon */}
                <div className="relative flex-shrink-0 group">
                  <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center border-4 border-white shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                    <svg className="h-14 w-14 sm:h-16 sm:w-16 text-stone-500 group-hover:text-rose-600 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                {/* Profile Info */}
                <div className="text-center sm:text-left flex-1">
                  <h3 className="font-serif text-2xl sm:text-3xl font-light text-stone-800 mb-2">
                    {name || 'Client Profile'}
                  </h3>
                  <p className="font-sans text-stone-600 text-sm sm:text-base mb-1">{email || userPhone}</p>
                </div>
              </div>
            </div>
            
            {/* Form Section */}
            <div className="px-6 sm:px-10 py-8">
              <form className="space-y-8" onSubmit={handleSave}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <label className="block font-sans text-xs font-semibold text-stone-700 mb-3 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      className={`w-full px-5 py-4 border-2 rounded-xl font-sans text-sm transition-all duration-200 ${
                        isEditing 
                          ? 'border-stone-200 bg-white text-stone-700 focus:border-rose-400 focus:ring-4 focus:ring-rose-200/30 focus:outline-none' 
                          : 'border-stone-200 bg-stone-50/50 text-stone-700 focus:outline-none'
                      }`}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      readOnly={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <label className="block font-sans text-xs font-semibold text-stone-700 mb-3 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      className={`w-full px-5 py-4 border-2 rounded-xl font-sans text-sm transition-all duration-200 ${
                        isEditing 
                          ? 'border-stone-200 bg-white text-stone-700 focus:border-rose-400 focus:ring-4 focus:ring-rose-200/30 focus:outline-none' 
                          : 'border-stone-200 bg-stone-50/50 text-stone-700 focus:outline-none'
                      }`}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      readOnly={!isEditing}
                      type="email"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block font-sans text-xs font-semibold text-stone-700 mb-3 uppercase tracking-wider">
                    Contact Number
                  </label>
                  <input
                    className={`w-full px-5 py-4 border-2 rounded-xl font-sans text-sm transition-all duration-200 ${
                      isEditing 
                        ? 'border-stone-200 bg-white text-stone-700 focus:border-rose-400 focus:ring-4 focus:ring-rose-200/30 focus:outline-none' 
                        : 'border-stone-200 bg-stone-50/50 text-stone-700 focus:outline-none'
                    }`}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Enter your contact number"
                    type="tel"
                    readOnly={!isEditing}
                  />
                </div>
                
                <div className="pt-6 space-y-4">
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-sans font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          // Reset to original values if needed
                        }}
                        className="flex-1 bg-gradient-to-r from-stone-400 to-stone-500 hover:from-stone-500 hover:to-stone-600 text-white font-sans font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  

                  
                  {saved && (
                    <div className="text-center font-sans text-sm text-emerald-700 bg-emerald-50 py-4 px-6 rounded-xl border-2 border-emerald-200 animate-fade-in">
                      ✓ Profile has been updated successfully
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Appointments Section */}
        {showAppointments && (
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-stone-50 to-rose-50 px-6 sm:px-10 py-6 border-b border-stone-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-xl sm:text-2xl font-light text-stone-800">
                    Appointment Schedule
                  </h3>
                  <div className="flex space-x-2 bg-white/50 p-1 rounded-lg">
                    <button
                      onClick={() => setActiveTab('upcoming')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'upcoming' 
                          ? 'bg-white text-rose-600 shadow-sm' 
                          : 'text-stone-500 hover:text-stone-700'
                      }`}
                    >
                      Upcoming
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'history' 
                          ? 'bg-white text-rose-600 shadow-sm' 
                          : 'text-stone-500 hover:text-stone-700'
                      }`}
                    >
                      History
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-10">
                {appointments.length === 0 ? (
                  <div className="text-center text-stone-600 bg-gradient-to-br from-stone-50 to-rose-50 rounded-2xl p-8 sm:p-12 border border-stone-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-100/20 to-pink-100/20 animate-pulse"></div>
                    <div className="relative z-10">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="font-sans text-stone-700 mb-2 text-base sm:text-lg font-semibold">No {activeTab} appointments</p>
                      {activeTab === 'upcoming' && (
                        <>
                          <p className="font-sans text-xs sm:text-sm text-stone-500 mb-8 uppercase tracking-wider">Schedule your next visit with us</p>
                      <button 
                        onClick={() => {
                          window.location.href = '/services';
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-sans font-semibold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Book Appointment
                      </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.filter(app => {
                      const appDate = new Date(app.date);
                      const today = new Date();
                      today.setHours(0,0,0,0);
                      return activeTab === 'upcoming' ? appDate >= today : appDate < today;
                    }).map((appointment, index) => (
                      <div 
                        key={appointment._id} 
                        className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-stone-200/50 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-serif text-base font-medium text-stone-800 group-hover:text-gray-600 transition-colors duration-300">{appointment.service}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                            appointment.status === 'confirmed' ? 'bg-gray-100 text-gray-800' :
                            appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.status.toUpperCase()}
                          </span>
                          {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                            <button
                              onClick={() => handleCancelAppointment(appointment._id)}
                              className="ml-2 text-xs text-red-500 hover:text-red-700 underline transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm text-stone-600">
                          <p><span className="font-semibold">Date:</span> {new Date(appointment.date).toLocaleDateString()}</p>
                          <p><span className="font-semibold">Time:</span> {appointment.time}</p>
                        </div>
                        {appointment.notes && (
                          <p className="mt-2 text-sm text-stone-600 bg-stone-50 p-2 rounded-lg group-hover:bg-gray-50 transition-colors duration-300">
                            <span className="font-semibold">Notes:</span> {appointment.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
