import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Welcome from "./Welcome";
import React, { useState } from "react";
import mylogo from "./assets/mylogo.png"; 
import { auth, provider } from "./firebase";
import {
  signInWithPopup,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

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

function SalonHeader() {
  return (
    <div className="flex flex-col items-center mb-4">
      <div className="relative mb-3">
        <img src={mylogo} alt="Salon Logo" className="h-14 w-14 sm:h-16 sm:w-16 drop-shadow-lg" />
        <div className="absolute -inset-2 bg-gradient-to-r from-rose-200/20 to-pink-200/20 rounded-full blur-lg"></div>
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

function SignIn({ onSwitch, onSuccess }) {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
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

  // Sign-In Handler
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
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

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 w-full max-w-lg border border-stone-200/50">
        <SalonHeader />
        <h2 className="font-serif text-2xl sm:text-3xl font-light mb-8 text-center text-stone-800">Client Sign In</h2>
        {loginSuccess && (
          <div className="text-emerald-600 text-center mb-6 font-sans text-sm bg-emerald-50 py-3 px-4 rounded-xl border border-emerald-200">Login successful!</div>
        )}
        <form className="mb-6 w-full space-y-6" onSubmit={handleSignIn}>
          <div>
            <label className="block mb-2 font-sans text-xs font-semibold text-stone-700 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-5 py-4 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-200/30 transition-all duration-200 outline-none bg-white font-sans text-sm"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-sans text-xs font-semibold text-stone-700 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-5 py-4 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-200/30 transition-all duration-200 outline-none bg-white font-sans text-sm"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="flex justify-between items-center">
            <button
              type="button"
              className="font-sans text-xs text-stone-600 hover:text-rose-600 transition-colors duration-200 uppercase tracking-wider"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
            {resetSent && <span className="font-sans text-xs text-emerald-600">Reset email sent!</span>}
          </div>
          {error && <div className="text-red-600 font-sans text-sm bg-red-50 py-3 px-4 rounded-xl border border-red-200">{error}</div>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            Sign In
          </button>
        </form>
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
        <div className="text-center font-sans text-sm text-stone-600">
          Don't have an account?{" "}
          <button className="text-rose-600 hover:text-rose-700 font-medium transition-colors duration-200" type="button" onClick={onSwitch}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

function SignUp({ onSwitch, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  // Email sign up
  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await saveUserToBackend({
        uid: result.user.uid,
        name: result.user.displayName || "",
        email: result.user.email || "",
        photoURL: result.user.photoURL || "",
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 w-full max-w-lg border border-stone-200/50">
        <SalonHeader />
        <h2 className="font-serif text-2xl sm:text-3xl font-light mb-8 text-center text-stone-800">Create Account</h2>
        <form className="mb-6 w-full space-y-6" onSubmit={handleEmailSignUp}>
          <div>
            <label className="block mb-2 font-sans text-xs font-semibold text-stone-700 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-5 py-4 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-200/30 transition-all duration-200 outline-none bg-white font-sans text-sm"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-sans text-xs font-semibold text-stone-700 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-5 py-4 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-200/30 transition-all duration-200 outline-none bg-white font-sans text-sm"
              placeholder="Create a password"
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-sans text-xs font-semibold text-stone-700 uppercase tracking-wider">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full px-5 py-4 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-200/30 transition-all duration-200 outline-none bg-white font-sans text-sm"
              placeholder="Confirm your password"
              required
            />
          </div>
          {error && <div className="text-red-600 font-sans text-sm bg-red-50 py-3 px-4 rounded-xl border border-red-200">{error}</div>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            Create Account
          </button>
        </form>
        <div className="text-center font-sans text-sm text-stone-600">
          Already have an account?{" "}
          <button className="text-rose-600 hover:text-rose-700 font-medium transition-colors duration-200" type="button" onClick={onSwitch}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [modal, setModal] = useState(null); // 
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Main page route */}
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
          Client Login
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

      {/* Main Content Area */}
      <main className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-stone-800 mb-6 leading-tight">
            Welcome to Your Beauty Sanctuary
          </h1>
          <p className="font-sans text-lg sm:text-xl text-stone-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience luxury and elegance at our premier beauty salon and spa. 
            Book your appointment today and discover the difference.
          </p>
          <button
            onClick={() => setModal("signin")}
            className="bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </main>
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar */}
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

      {/* Modal for SignIn/SignUp */}
      {modal === "signin" && (
        <SignIn
          onSwitch={() => setModal("signup")}
          onSuccess={() => setModal(null)}
        />
      )}
      {modal === "signup" && (
        <SignUp
          onSwitch={() => setModal("signin")}
          onSuccess={() => setModal(null)}
        />
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
