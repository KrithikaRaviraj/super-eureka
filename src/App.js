import React, { useState } from "react";
import logo from "./logo.svg";
import { auth, provider, db } from "./firebase";
import { signInWithPopup, sendPasswordResetEmail, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function SalonHeader() {
  return (
    <div className="flex flex-col items-center mb-6">
      <img src={logo} alt="Salon Logo" className="h-14 w-14 mb-2" />
      <span className="font-serif italic font-bold text-2xl text-pink-600 text-center tracking-wide">
        Lavish Ladies Beauty Salon & Spa
      </span>
    </div>
  );
}

function SignIn({ onSwitch, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      await setDoc(doc(db, "users", result.user.uid), {
        name: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      }, { merge: true });
      alert("Signed in as " + result.user.displayName);
      if (onSuccess) onSuccess();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (onSuccess) onSuccess();
    } catch (error) {
      alert(error.message);
    }
  };
  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 mt-8 bg-white rounded-lg shadow-lg p-8 w-full max-w-sm z-50">
      <SalonHeader />
      <h2 className="text-2xl font-bold mb-6 text-center text-pink-600 font-serif">Sign In</h2>
      <form className="mb-4" onSubmit={handleSignIn}>
        <label className="block mb-2 font-medium">Phone or Email</label>
        <input
          type="text"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
          placeholder="Enter phone or email"
        />
        <label className="block mb-2 font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
          placeholder="Enter password"
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
        <button
          type="submit"
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 rounded transition"
        >
          Sign In
        </button>
      </form>
      <div className="flex items-center my-4">
        <div className="flex-grow h-px bg-gray-300" />
        <span className="mx-2 text-gray-400">OR</span>
        <div className="flex-grow h-px bg-gray-300" />
      </div>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full mb-4 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5 mr-2" />
        Sign in with Google
      </button>
      <div className="text-center mt-4 text-sm">
        Don't have an account?{" "}
        <button className="text-pink-500 hover:underline" type="button" onClick={onSwitch}>
          Sign Up
        </button>
      </div>
    </div>
  );
}

function SignUp({ onSwitch, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", result.user.uid), {
        email: result.user.email,
      }, { merge: true });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 mt-8 bg-white rounded-lg shadow-lg p-8 w-full max-w-sm z-50">
      <SalonHeader />
      <h2 className="text-2xl font-bold mb-6 text-center text-pink-600 font-serif">Sign Up</h2>
      <form className="mb-4" onSubmit={handleSignUp}>
        <label className="block mb-2 font-medium">Phone or Email</label>
        <input
          type="text"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
          placeholder="Enter phone or email"
        />
        <label className="block mb-2 font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
          placeholder="Create a password"
        />
        <label className="block mb-2 font-medium">Confirm Password</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          className="w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
          placeholder="Confirm your password"
        />
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <button
          type="submit"
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 rounded transition"
        >
          Sign Up
        </button>
      </form>
      <div className="text-center mt-4 text-sm">
        Already have an account?{" "}
        <button className="text-pink-500 hover:underline" type="button" onClick={onSwitch}>
          Sign In
        </button>
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState("main"); // main, signin, signup

  return (
    <div className="min-h-screen bg-white text-gray-900 relative">
      <header className="px-8 py-3 shadow bg-white flex items-center justify-between">
        <div className="flex flex-col items-start">
          <div className="flex flex-col items-center">
            <img src={logo} alt="Salon Logo" className="h-12 w-12 mb-1" />
            <span className="font-serif italic font-bold text-xl text-pink-600 text-center tracking-wide">
              Lavish Ladies Beauty Salon & Spa
            </span>
          </div>
        </div>
        <button
          className="px-5 py-2 rounded-lg bg-pink-500 text-white text-base font-semibold shadow hover:bg-pink-600 transition"
          onClick={() => setPage("signin")}
        >
          Login
        </button>
      </header>

      <nav className="flex items-center px-8 py-5 bg-gray-100 shadow text-lg font-semibold">
        <button
          className="mr-8 p-2 rounded hover:bg-gray-200 transition"
          onClick={() => setPage("main")}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex-1 flex justify-between max-w-3xl mx-auto space-x-12">
          <a href="/" className="hover:text-pink-500 transition">Home</a>
          <a href="/" className="hover:text-pink-500 transition">Services</a>
          <a href="/" className="hover:text-pink-500 transition">Gallery</a>
          <a href="/" className="hover:text-pink-500 transition">About</a>
          <a href="/" className="hover:text-pink-500 transition">Contact Us</a>
        </div>
        <div className="w-16" />
      </nav>

      {page === "signin" && (
        <SignIn
          onSwitch={() => setPage("signup")}
          onSuccess={() => setPage("main")}
        />
      )}
      {page === "signup" && (
        <SignUp
          onSwitch={() => setPage("signin")}
          onSuccess={() => setPage("main")}
        />
      )}
    </div>
  );
}

export default App;