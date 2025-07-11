import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import mylogo from "./assets/mylogo.png";

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
    } catch (err) {
      alert("Failed to save.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* Logo and Salon Name */}
      <div className="flex flex-col items-center mb-6">
        <img src={mylogo} alt="Salon Logo" className="h-16 w-16 mb-2" />
        <span className="font-serif italic font-extrabold text-2xl text-pink-600 text-center tracking-wider drop-shadow">
          Lavish Ladies Beauty Salon & Spa
        </span>
      </div>

      {/* Greeting */}
      <h1 className="text-3xl font-bold mb-6 font-sans text-gray-800">
        Hello, {name || email || "User"}!
      </h1>

      {/* User Profile Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center w-full max-w-md mb-8">
        {/* Profile Photo */}
        <div
          className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden cursor-pointer relative"
          onMouseEnter={() => setShowPhotoPrompt(true)}
          onMouseLeave={() => setShowPhotoPrompt(false)}
          onClick={handlePhotoClick}
          title="Click to add/change profile photo"
        >
          {photo ? (
            <img src={photo} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <span className="text-4xl text-gray-400">👤</span>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handlePhotoChange}
          />
          {showPhotoPrompt && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xs rounded-full">
              Click to add/change photo
            </div>
          )}
        </div>
        <form className="flex flex-col items-center w-full" onSubmit={handleSave}>
          <label className="mb-1 font-semibold">Name:</label>
          <input
            className="mb-4 px-4 py-2 border rounded w-full bg-gray-100 cursor-not-allowed"
            value={name}
            readOnly
          />
          <label className="mb-1 font-semibold">Email:</label>
          <input
            className="mb-4 px-4 py-2 border rounded w-full bg-gray-100 cursor-not-allowed"
            value={email}
            readOnly
          />
          <label className="mb-1 font-semibold">Phone Number:</label>
          <input
            className="mb-4 px-4 py-2 border rounded w-full"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            type="tel"
            required
          />
          <button
        type="submit"
        className={`bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded-lg transition mb-2 ${saved ? "opacity-60 cursor-not-allowed" : ""}`}
        disabled={saved}
         >
           {saved ? "Saved" : "Save"}
            </button>
          {saved && <div className="text-green-600 text-sm mt-1">Profile updated!</div>}
        </form>
      </div>

      {/* Appointments Section - only after save */}
      {showAppointments && (
        <div className="w-full max-w-md bg-white rounded-xl shadow p-6 text-center">
          <h2 className="text-xl font-bold mb-2 text-pink-600">Your Appointments</h2>
          <div className="text-gray-500">No appointments yet.</div>
        </div>
      )}
    </div>
  );
}