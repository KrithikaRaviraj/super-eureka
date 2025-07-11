import React, { useState } from "react";
import mylogo from "./assets/mylogo.png"; 
import { auth, provider } from "./firebase";
import {
  signInWithPopup,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

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
    <div className="flex flex-col items-center mb-2">
      <img src={mylogo} alt="Salon Logo" className="h-12 w-12 mb-1" />
      <span className="font-serif italic font-bold text-xl text-pink-600 text-center tracking-wide">
        Lavish Ladies Beauty Salon & Spa
      </span>
    </div>
  );
}

function SignIn({ onSwitch, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetSent, setResetSent] = useState(false);
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
        photoURL: result.user.photoURL || "",
      });
      setLoginSuccess(true);
      setTimeout(() => {
        setLoginSuccess(false);
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (error) {
      setError(error.message);
    }
  };

  // Email/Password Sign-In Handler
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await saveUserToBackend({
        uid: result.user.uid,
        name: result.user.displayName || "",
        email: result.user.email || "",
        photoURL: result.user.photoURL || "",
      });
      setLoginSuccess(true);
      setTimeout(() => {
        setLoginSuccess(false);
        if (onSuccess) onSuccess();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl p-12 w-full max-w-xl flex flex-col items-center">
        <SalonHeader />
        <h2 className="text-2xl font-bold mb-6 text-center text-pink-600 font-serif">Sign In</h2>
        {loginSuccess && (
          <div className="text-green-600 text-center mb-4 font-bold">Login successful!</div>
        )}
        <form className="mb-4 w-full" onSubmit={handleSignIn}>
          <label className="block mb-2 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-lg"
            placeholder="Enter email"
            required
          />
          <label className="block mb-2 font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full mb-2 px-4 py-3 border border-gray-300 rounded-lg"
            placeholder="Enter password"
            required
          />
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              className="text-sm text-pink-500 hover:underline"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
            {resetSent && <span className="text-xs text-green-600 ml-2">Reset email sent!</span>}
          </div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg transition text-lg"
          >
            Sign In
          </button>
        </form>
        <div className="flex items-center my-4 w-full">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-4 text-gray-400">OR</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full mb-4 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition text-lg"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-6 w-6 mr-3" />
          Sign in with Google
        </button>
        <div className="text-center mt-4 text-lg">
          Don't have an account?{" "}
          <button className="text-pink-500 hover:underline" type="button" onClick={onSwitch}>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl p-12 w-full max-w-xl flex flex-col items-center">
        <SalonHeader />
        <h2 className="text-2xl font-bold mb-6 text-center text-pink-600 font-serif">Sign Up</h2>
        <form className="mb-4 w-full" onSubmit={handleEmailSignUp}>
          <label className="block mb-2 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-lg"
            placeholder="Enter email"
            required
          />
          <label className="block mb-2 font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full mb-2 px-4 py-3 border border-gray-300 rounded-lg"
            placeholder="Create a password"
            required
          />
          <label className="block mb-2 font-medium">Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-lg"
            placeholder="Confirm your password"
            required
          />
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg transition text-lg"
          >
            Sign Up
          </button>
        </form>
        <div className="text-center mt-4 text-lg">
          Already have an account?{" "}
          <button className="text-pink-500 hover:underline" type="button" onClick={onSwitch}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [modal, setModal] = useState(null); // null, "signin", or "signup"
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 relative">
      {/* Header */}
      <header className="px-8 py-3 shadow bg-white flex items-center justify-between">
        <SalonHeader />
        <button
          className="px-5 py-2 rounded-lg bg-pink-500 text-white text-base font-semibold shadow hover:bg-pink-600 transition"
          onClick={() => setModal("signin")}
        >
          Login
        </button>
      </header>
<nav className="flex items-center px-8 py-4 bg-gray-100 shadow text-lg font-semibold">
  {/* Hamburger Icon */}
  <button
    className="mr-6 focus:outline-none"
    onClick={() => setSidebarOpen(true)}
    aria-label="Open sidebar"
  >
    <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>
  <div className="flex-1 flex justify-between max-w-3xl mx-auto w-full">
    <a href="#" className="hover:text-pink-500 transition">Home</a>
    <a href="#" className="hover:text-pink-500 transition">Services</a>
    <a href="#" className="hover:text-pink-500 transition">Gallery</a>
    <a href="#" className="hover:text-pink-500 transition">About</a>
    <a href="#" className="hover:text-pink-500 transition">Contact Us</a>
  </div>
</nav>
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar */}
          <nav className="relative z-50 w-64 bg-gray-100 shadow h-full flex flex-col pt-20 text-lg font-semibold">
            <button
              className="absolute top-4 right-4 text-2xl text-pink-600"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              &times;
            </button>
            <button className="text-left hover:text-pink-500 transition px-6 py-3 bg-transparent border-0">Home</button>
            <button className="text-left hover:text-pink-500 transition px-6 py-3 bg-transparent border-0">Services</button>
            <button className="text-left hover:text-pink-500 transition px-6 py-3 bg-transparent border-0">Gallery</button>
            <button className="text-left hover:text-pink-500 transition px-6 py-3 bg-transparent border-0">About</button>
            <button className="text-left hover:text-pink-500 transition px-6 py-3 bg-transparent border-0">Contact Us</button>
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
  );
}

export default App;