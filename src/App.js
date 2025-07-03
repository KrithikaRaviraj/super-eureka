import React, { useState } from "react";
import logo from "./logo.svg";
import { auth, provider, db } from "./firebase";
import { signInWithPopup } from "firebase/auth";
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
  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      // Save user to Firestore 
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


  return (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm mx-auto mt-12">
      <SalonHeader />
      <h2 className="text-2xl font-bold mb-6 text-center text-pink-600 font-serif">Sign In</h2>
      <form className="mb-4">
        <label className="block mb-2 font-medium">Phone or Email</label>
        <input
          type="text"
          className="w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
          placeholder="Enter phone or email"
        />
        <label className="block mb-2 font-medium">Password</label>
        <input
          type="password"
          className="w-full mb-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
          placeholder="Enter password"
        />
        <div className="flex justify-between items-center mb-4">
          <button type="button" className="text-sm text-pink-500 hover:underline">
            Forgot password?
          </button>
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
        No account?{" "}
        <button className="text-pink-500 hover:underline" type="button" onClick={onSwitch}>
          Sign Up
        </button>
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState("main"); // main, signin, signup

  return (
    <div className="min-h-screen bg-white text-gray-900">
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

      {/* Render the correct page */}
      {page === "signin" && (
        <SignIn
          onSwitch={() => setPage("signup")}
          onSuccess={() => setPage("main")}
        />
      )}
      
    </div>
  );
}

export default App;