import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Welcome from "./Welcome";
import React, { useState } from "react";
import mylogo from "./assets/mylogo.png"; 
import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";

// Add fonts and styles
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

const style = document.createElement('style');
style.textContent = `
  .font-serif { font-family: 'Cormorant Garamond', serif; }
  .font-sans { font-family: 'Inter', sans-serif; }
  body { font-family: 'Inter', sans-serif; }
`;
document.head.appendChild(style);

// Utility to save user to backend
async function saveUserToBackend(user) {
  await fetch("http://localhost:5000/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
}

// Custom Salon Logo Component
function SalonLogo() {
  return (
    <div className="relative h-14 w-14 sm:h-16 sm:w-16">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
        <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" stroke="#fff" strokeWidth="2"/>
        <path d="M35 25c0-8 6-12 15-12s15 4 15 12c0 6-4 10-8 12l2 8c2 1 4 2 4 4v3c0 2-1 3-3 3h-20c-2 0-3-1-3-3v-3c0-2 2-3 4-4l2-8c-4-2-8-6-8-12z" fill="#fff" opacity="0.9"/>
        <path d="M32 20c2-6 8-10 18-10s16 4 18 10c2 4 0 8-2 10-1-2-3-4-6-4s-5 2-6 4h-8c-1-2-3-4-6-4s-5 2-6 4c-2-2-4-6-2-10z" fill="#8B4513" opacity="0.8"/>
        <g transform="translate(65,65) rotate(45)">
          <ellipse cx="0" cy="-8" rx="3" ry="8" fill="#C0C0C0"/>
          <ellipse cx="0" cy="8" rx="3" ry="8" fill="#C0C0C0"/>
          <circle cx="0" cy="0" r="2" fill="#666"/>
          <line x1="0" y1="-12" x2="0" y2="12" stroke="#333" strokeWidth="1"/>
        </g>
        <circle cx="20" cy="75" r="2" fill="#FFB6C1" opacity="0.6"/>
        <circle cx="80" cy="30" r="1.5" fill="#FFB6C1" opacity="0.6"/>
        <circle cx="25" cy="35" r="1" fill="#DDA0DD" opacity="0.6"/>
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB6C1"/>
            <stop offset="50%" stopColor="#DDA0DD"/>
            <stop offset="100%" stopColor="#F8BBD9"/>
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute -inset-2 bg-gradient-to-r from-rose-200/20 to-pink-200/20 rounded-full blur-lg"></div>
    </div>
  );
}

function SalonHeader() {
  return (
    <div className="flex flex-col items-center mb-4">
      <div className="relative mb-3">
        <SalonLogo />
      </div>
      <span className="font-serif text-xl sm:text-2xl font-light text-stone-800 text-center tracking-wide">
        Lavish Ladies Beauty Salon & Spa
      </span>
      <div className="flex items-center justify-center mt-2">
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent"></div>
        <div className="mx-2 w-1 h-1 bg-rose-400 rounded-full"></div>
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent"></div>
      </div>
    </div>
  );
}

function SignIn({ onSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Google Sign-In Handler
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

  // Send OTP Handler
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
      console.error('Error sending OTP:', error);
      setError("Failed to send OTP. Please try again.");
    }
  };

  // Verify OTP Handler
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
      console.error('Error verifying OTP:', error);
      setError("Verification failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 w-full max-w-lg border border-stone-200/50">
        <SalonHeader />
        <h2 className="font-serif text-2xl sm:text-3xl font-light mb-8 text-center text-stone-800">Welcome Back</h2>
        {loginSuccess && (
          <div className="text-emerald-600 text-center mb-6 font-sans text-sm bg-emerald-50 py-3 px-4 rounded-xl border border-emerald-200">Login successful!</div>
        )}
        
        {!otpSent ? (
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

function App() {
  const [modal, setModal] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 relative">
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-0 left-0 w-full h-full" style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, rgba(219, 39, 119, 0.08) 0%, transparent 50%), 
                                   radial-gradient(circle at 75% 75%, rgba(244, 63, 94, 0.08) 0%, transparent 50%)`
                }}></div>
              </div>
              
              <header className="relative z-10 px-4 sm:px-8 py-4 sm:py-6 bg-white/80 backdrop-blur-sm border-b border-stone-200/50 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <SalonHeader />
                <button
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-sm uppercase tracking-wider transform hover:scale-105"
                  onClick={() => setModal("signin")}
                >
                  Login
                </button>
              </header>

              <nav className="relative z-10 flex items-center px-4 sm:px-8 py-4 bg-white/60 backdrop-blur-sm border-b border-stone-200/30 font-sans">
                <button
                  className="mr-6 focus:outline-none lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <svg className="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="hidden lg:flex flex-1 justify-center space-x-12 max-w-4xl mx-auto">
                  <a href="#" className="text-stone-700 hover:text-rose-600 transition-colors duration-200 font-medium text-sm uppercase tracking-wider">Home</a>
                  <a href="#" className="text-stone-700 hover:text-rose-600 transition-colors duration-200 font-medium text-sm uppercase tracking-wider">Services</a>
                  <a href="#" className="text-stone-700 hover:text-rose-600 transition-colors duration-200 font-medium text-sm uppercase tracking-wider">Gallery</a>
                  <a href="#" className="text-stone-700 hover:text-rose-600 transition-colors duration-200 font-medium text-sm uppercase tracking-wider">About</a>
                  <a href="#" className="text-stone-700 hover:text-rose-600 transition-colors duration-200 font-medium text-sm uppercase tracking-wider">Contact</a>
                </div>
              </nav>

              <main className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-stone-800 mb-6 leading-tight">
                    Welcome to Your Beauty Sanctuary
                  </h1>
                  <button
                    onClick={() => setModal("signin")}
                    className="bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Get Started
                  </button>
                </div>
              </main>

              {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                  <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                  />
                  <nav className="relative z-50 w-80 bg-white/95 backdrop-blur-sm shadow-2xl h-full flex flex-col pt-20 border-r border-stone-200">
                    <button
                      className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-800 transition-colors duration-200"
                      onClick={() => setSidebarOpen(false)}
                      aria-label="Close sidebar"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="px-8 py-6 border-b border-stone-200">
                      <h3 className="font-serif text-xl font-light text-stone-800">Navigation</h3>
                    </div>
                    <div className="flex-1 py-6">
                      <button className="w-full text-left hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 px-8 py-4 font-sans text-sm font-medium uppercase tracking-wider text-stone-700">Home</button>
                      <button className="w-full text-left hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 px-8 py-4 font-sans text-sm font-medium uppercase tracking-wider text-stone-700">Services</button>
                      <button className="w-full text-left hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 px-8 py-4 font-sans text-sm font-medium uppercase tracking-wider text-stone-700">Gallery</button>
                      <button className="w-full text-left hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 px-8 py-4 font-sans text-sm font-medium uppercase tracking-wider text-stone-700">About</button>
                      <button className="w-full text-left hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 px-8 py-4 font-sans text-sm font-medium uppercase tracking-wider text-stone-700">Contact</button>
                    </div>
                  </nav>
                </div>
              )}

              {modal === "signin" && (
                <SignIn onSuccess={() => setModal(null)} />
              )}
            </div>
          }
        />
        <Route path="/welcome" element={<Welcome />} />
      </Routes>
    </Router>
  );
}

export default App;