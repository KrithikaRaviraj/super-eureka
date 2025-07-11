import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import mylogo from "./assets/mylogo.png";

// Add luxury fonts
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
  const [name] = useState(location.state?.name || "");
  const [email] = useState(location.state?.email || "");
  const [uid, setUid] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState(""); // base64 or URL
  const [saved, setSaved] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);
  const [showPhotoPrompt, setShowPhotoPrompt] = useState(false);
  const fileInputRef = useRef();

  // Fetch user data (phone, photo) on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`http://localhost:5000/api/users?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setPhone(data.user.phone || "");
            setPhoto(data.user.photoURL || "");
            setUid(data.user.uid || "");
          }
        }
      } catch {}
    }
    if (email) fetchUser();
  }, [email]);

  // Handle photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  // Custom overlay for photo change
  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  // Save phone and photo to backend
  const handleSave = async (e) => {
    e.preventDefault();
    setSaved(false);
    try {
      await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, name, email, phone, photoURL: photo }),
      });
      setSaved(true);
      setShowAppointments(true);
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      alert("Failed to save.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 relative">
      {/* Elegant Background Pattern */}
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
            <img src={mylogo} alt="Salon Logo" className="h-20 w-20 sm:h-24 sm:w-24 mx-auto drop-shadow-xl" />
            <div className="absolute -inset-6 bg-gradient-to-r from-rose-200/20 to-pink-200/20 rounded-full blur-2xl"></div>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-stone-800 mb-4 tracking-wide leading-tight">
            Lavish Ladies Beauty Salon & Spa
          </h1>
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent"></div>
            <div className="mx-4 w-2 h-2 bg-rose-400 rounded-full"></div>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent"></div>
          </div>
          <p className="font-sans text-stone-600 font-light tracking-widest text-xs sm:text-sm uppercase">Luxury • Elegance • Excellence</p>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-stone-800 mb-3">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {name?.split(' ')[0] || 'Valued Client'}
          </h2>
          <p className="font-sans text-stone-600 font-light tracking-wide text-sm sm:text-base">Your personal beauty sanctuary awaits</p>
        </div>

        {/* Profile Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-stone-200/50 hover:shadow-3xl transition-all duration-500 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-stone-50 to-rose-50 px-6 sm:px-10 py-8 border-b border-stone-200">
              <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
                {/* Profile Photo */}
                <div className="relative flex-shrink-0">
                  <div
                    className="h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-stone-100 flex items-center justify-center overflow-hidden cursor-pointer relative border-4 border-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                    onMouseEnter={() => setShowPhotoPrompt(true)}
                    onMouseLeave={() => setShowPhotoPrompt(false)}
                    onClick={handlePhotoClick}
                    title="Click to upload profile photo"
                  >
                    {photo ? (
                      <img src={photo} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <svg className="h-14 w-14 sm:h-16 sm:w-16 text-stone-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handlePhotoChange}
                    />
                    {showPhotoPrompt && (
                      <div className="absolute inset-0 bg-stone-800/80 flex items-center justify-center text-white text-xs rounded-full backdrop-blur-sm font-sans uppercase tracking-wider">
                        Upload
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-10 sm:h-10 bg-stone-700 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                
                {/* Profile Info */}
                <div className="text-center sm:text-left flex-1">
                  <h3 className="font-serif text-2xl sm:text-3xl font-light text-stone-800 mb-2">
                    {name || 'Client Profile'}
                  </h3>
                  <p className="font-sans text-stone-600 text-sm sm:text-base mb-1">{email}</p>
                  <p className="font-sans text-xs text-stone-500 uppercase tracking-wider">Premium Member</p>
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
                      className="w-full px-5 py-4 border-2 border-stone-200 rounded-xl bg-stone-50/50 text-stone-700 focus:outline-none font-sans text-sm transition-all duration-200"
                      value={name}
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block font-sans text-xs font-semibold text-stone-700 mb-3 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      className="w-full px-5 py-4 border-2 border-stone-200 rounded-xl bg-stone-50/50 text-stone-700 focus:outline-none font-sans text-sm transition-all duration-200"
                      value={email}
                      readOnly
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block font-sans text-xs font-semibold text-stone-700 mb-3 uppercase tracking-wider">
                    Contact Number
                  </label>
                  <input
                    className="w-full px-5 py-4 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-200/30 transition-all duration-200 outline-none bg-white font-sans text-sm"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Enter your contact number"
                    type="tel"
                    required
                  />
                </div>
                
                <div className="pt-6">
                  <button
                    type="submit"
                    className={`w-full bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${saved ? "opacity-60 cursor-not-allowed" : ""}`}
                    disabled={saved}
                  >
                    {saved ? "✓ Profile Saved" : "Update Profile"}
                  </button>
                  
                  {saved && (
                    <div className="text-center font-sans text-sm text-emerald-700 bg-emerald-50 py-4 px-6 rounded-xl border-2 border-emerald-200 mt-6 animate-fade-in">
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
                <h3 className="font-serif text-xl sm:text-2xl font-light text-stone-800 text-center">
                  Appointment Schedule
                </h3>
              </div>
              <div className="p-6 sm:p-10">
                <div className="text-center text-stone-600 bg-stone-50 rounded-2xl p-8 sm:p-12 border border-stone-200">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="font-sans text-stone-700 mb-2 text-base sm:text-lg">No upcoming appointments</p>
                  <p className="font-sans text-xs sm:text-sm text-stone-500 mb-8 uppercase tracking-wider">Schedule your next visit with us</p>
                  <button className="bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white px-8 py-4 rounded-xl font-sans font-semibold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}