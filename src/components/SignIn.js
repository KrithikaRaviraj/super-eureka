import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import SalonHeader from './SalonHeader';

async function saveUserToBackend(user) {
  await fetch("http://localhost:5000/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
}

export default function SignIn({ onSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isStaffLogin, setIsStaffLogin] = useState(false);
  const [staffEmail, setStaffEmail] = useState('');
  const [staffOtp, setStaffOtp] = useState('');
  const [staffOtpSent, setStaffOtpSent] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      
      await saveUserToBackend({
        uid: result.user.uid,
        name: result.user.displayName || "",
        email: result.user.email || "",
        phone: null,
        photoURL: result.user.photoURL || "",
      });
      
      localStorage.setItem('userSession', JSON.stringify({
        uid: result.user.uid,
        name: result.user.displayName || "",
        email: result.user.email || "",
        loginTime: Date.now()
      }));
      
      setLoginSuccess(true);
      setTimeout(() => {
        setLoginSuccess(false);
        if (onSuccess) onSuccess();
        navigate("/welcome", {
          state: {
            name: result.user.displayName || "",
            email: result.user.email || "",
          },
        });
      }, 1500);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:5000/api/send-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOtpSent(true);
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (error) {
      setError("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    
    if (otp.length !== 4) {
      setError("Please enter a valid 4-digit OTP");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:5000/api/verify-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await saveUserToBackend({
          uid: data.user.uid,
          name: "Client",
          email: email,
          phone: null,
          photoURL: "",
        });
        
        localStorage.setItem('userSession', JSON.stringify({
          uid: data.user.uid,
          name: "Client",
          email: email,
          loginTime: Date.now()
        }));
        
        setLoginSuccess(true);
        setTimeout(() => {
          setLoginSuccess(false);
          if (onSuccess) onSuccess();
          navigate("/welcome", {
            state: {
              name: "Client",
              email: email,
            },
          });
        }, 1500);
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setError("Verification failed. Please try again.");
    }
  };

  const handleStaffSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    const allowedEmails = ['[redacted-email]', '[redacted-email]', '[redacted-email]'];
    
    if (!allowedEmails.includes(staffEmail)) {
      setError('Access denied. Only authorized staff emails are allowed.');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: staffEmail })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStaffOtpSent(true);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    }
  };
  
  const handleStaffVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (staffOtp.length !== 4) {
      setError('Please enter a valid 4-digit OTP');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: staffEmail, otp: staffOtp })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('staffSession', JSON.stringify({ email: staffEmail, loginTime: Date.now() }));
        setLoginSuccess(true);
        setTimeout(() => {
          setLoginSuccess(false);
          navigate('/staff-dashboard');
          onSuccess();
        }, 1500);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 w-full max-w-lg border border-stone-200/50">
        <SalonHeader />
        <div className="flex justify-center mb-6">
          <div className="bg-stone-100 rounded-xl p-1 flex">
            <button
              onClick={() => setIsStaffLogin(false)}
              className={`px-4 py-2 rounded-lg font-sans text-sm transition-all ${
                !isStaffLogin ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-600'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => setIsStaffLogin(true)}
              className={`px-4 py-2 rounded-lg font-sans text-sm transition-all ${
                isStaffLogin ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-600'
              }`}
            >
              Staff
            </button>
          </div>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-light mb-8 text-center text-stone-800">
          {isStaffLogin ? 'Staff Login' : 'Welcome Back'}
        </h2>
        {loginSuccess && (
          <div className="text-emerald-600 text-center mb-6 font-sans text-sm bg-emerald-50 py-3 px-4 rounded-xl border border-emerald-200">Login successful!</div>
        )}
        
        {isStaffLogin ? (
          !staffOtpSent ? (
            <form className="mb-6 w-full space-y-6" onSubmit={handleStaffSendOtp}>
              <div>
                <label className="block mb-2 font-sans text-xs font-semibold text-stone-700 uppercase tracking-wider">Staff Email Address</label>
                <input
                  type="email"
                  value={staffEmail}
                  onChange={e => setStaffEmail(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-200/30 transition-all duration-200 outline-none bg-white font-sans text-sm"
                  placeholder="Enter your authorized email"
                  required
                />
              </div>
              {error && <div className="text-red-600 font-sans text-sm bg-red-50 py-3 px-4 rounded-xl border border-red-200">{error}</div>}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Send OTP
              </button>
              <div className="text-center p-3 bg-stone-50 rounded-xl">
                <p className="font-sans text-xs text-stone-600">
                  <strong>Authorized emails:</strong> [redacted-email], [redacted-email], [redacted-email]
                </p>
              </div>
            </form>
          ) : (
            <form className="mb-6 w-full space-y-6" onSubmit={handleStaffVerifyOtp}>
              <div>
                <label className="block mb-2 font-sans text-xs font-semibold text-stone-700 uppercase tracking-wider">Enter OTP</label>
                <input
                  type="text"
                  value={staffOtp}
                  onChange={e => setStaffOtp(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-200/30 transition-all duration-200 outline-none bg-white font-sans text-sm text-center tracking-widest"
                  placeholder="0000"
                  maxLength="4"
                  required
                />
                <p className="text-xs text-stone-500 mt-2 text-center">OTP sent to {staffEmail}</p>
              </div>
              {error && <div className="text-red-600 font-sans text-sm bg-red-50 py-3 px-4 rounded-xl border border-red-200">{error}</div>}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Verify OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setStaffOtpSent(false);
                  setStaffOtp('');
                  setError('');
                }}
                className="w-full text-stone-600 hover:text-stone-800 font-sans text-sm transition-colors duration-200"
              >
                Change Email
              </button>
            </form>
          )
        ) : !otpSent ? (
          <form className="mb-6 w-full space-y-6" onSubmit={handleSendOtp}>
            <div>
              <label className="block mb-2 font-sans text-xs font-semibold text-stone-700 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-5 py-4 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-200/30 transition-all duration-200 outline-none bg-white font-sans text-sm"
                placeholder="Enter your email address"
                required
              />
            </div>
            {error && <div className="text-red-600 font-sans text-sm bg-red-50 py-3 px-4 rounded-xl border border-red-200">{error}</div>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Send OTP
            </button>
          </form>
        ) : (
          <form className="mb-6 w-full space-y-6" onSubmit={handleVerifyOtp}>
            <div>
              <label className="block mb-2 font-sans text-xs font-semibold text-stone-700 uppercase tracking-wider">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                className="w-full px-5 py-4 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-200/30 transition-all duration-200 outline-none bg-white font-sans text-sm text-center tracking-widest"
                placeholder="0000"
                maxLength="4"
                required
              />
              <p className="text-xs text-stone-500 mt-2 text-center">OTP sent to {email}</p>
            </div>
            {error && <div className="text-red-600 font-sans text-sm bg-red-50 py-3 px-4 rounded-xl border border-red-200">{error}</div>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Verify OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setError("");
              }}
              className="w-full text-stone-600 hover:text-stone-800 font-sans text-sm transition-colors duration-200"
            >
              Change Email
            </button>
          </form>
        )}
        <div className="flex items-center my-6 w-full">
          <div className="flex-grow h-px bg-stone-300" />
          <span className="mx-4 font-sans text-xs text-stone-500 uppercase tracking-wider">OR</span>
          <div className="flex-grow h-px bg-stone-300" />
        </div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full mb-6 flex items-center justify-center bg-white border-2 border-stone-200 hover:border-stone-300 text-stone-700 font-sans font-medium py-4 px-6 rounded-xl transition-all duration-200 text-sm shadow-sm hover:shadow-md"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5 mr-3" />
          Continue with Google
        </button>
      </div>
    </div>
  );
}