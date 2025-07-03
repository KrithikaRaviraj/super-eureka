import React, { useState } from "react";
import logo from "./logo.svg";
import { auth, provider } from "./firebase";
import {
  signInWithPopup,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";

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

// Utility to save user to backend
async function saveUserToBackend(user) {
  await fetch("http://localhost:5000/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
}

function SignIn({ onSwitch, onSuccess }) {
  const [mode, setMode] = useState("email"); // "email" or "phone"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
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
        phone: result.user.phoneNumber || "",
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
        phone: result.user.phoneNumber || "",
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

  // Phone Sign-In (send OTP)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
      const confirmation = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setVerificationId(confirmation.verificationId);
      alert("OTP sent to your phone.");
    } catch (err) {
      setError(err.message);
    }
  };

  // Phone Sign-In (verify OTP)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const credential = window.firebase.auth.PhoneAuthProvider.credential(verificationId, otp);
      const result = await auth.signInWithCredential(credential);
      await saveUserToBackend({
        uid: result.user.uid,
        name: result.user.displayName || "",
        email: result.user.email || "",
        phone: result.user.phoneNumber || "",
        photoURL: result.user.photoURL || "",
      });
      setLoginSuccess(true);
      setTimeout(() => {
        setLoginSuccess(false);
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.message);
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
        <div className="mb-4 flex space-x-4">
          <button
            className={`px-4 py-2 rounded ${mode === "email" ? "bg-pink-500 text-white" : "bg-gray-200"}`}
            onClick={() => setMode("email")}
          >
            Email
          </button>
          <button
            className={`px-4 py-2 rounded ${mode === "phone" ? "bg-pink-500 text-white" : "bg-gray-200"}`}
            onClick={() => setMode("phone")}
          >
            Phone
          </button>
        </div>
        {loginSuccess && (
          <div className="text-green-600 text-center mb-4 font-bold">Login successful!</div>
        )}
        {mode === "email" ? (
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
        ) : (
          <form className="mb-4 w-full" onSubmit={verificationId ? handleVerifyOtp : handleSendOtp}>
            <label className="block mb-2 font-medium">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="+911234567890"
              required
            />
            {verificationId && (
              <>
                <label className="block mb-2 font-medium">OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Enter OTP"
                  required
                />
              </>
            )}
            <div id="recaptcha-container"></div>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <button
              type="submit"
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg transition text-lg"
            >
              {verificationId ? "Verify OTP" : "Send OTP"}
            </button>
          </form>
        )}
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
  const [mode, setMode] = useState("email"); // "email" or "phone"
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
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
        phone: result.user.phoneNumber || "",
        photoURL: result.user.photoURL || "",
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  // Phone sign up (send OTP)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container-signup", { size: "invisible" });
      const confirmation = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setVerificationId(confirmation.verificationId);
      alert("OTP sent to your phone.");
    } catch (err) {
      setError(err.message);
    }
  };

  // Phone sign up (verify OTP)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const credential = window.firebase.auth.PhoneAuthProvider.credential(verificationId, otp);
      const result = await auth.signInWithCredential(credential);
      await saveUserToBackend({
        uid: result.user.uid,
        name: result.user.displayName || "",
        email: result.user.email || "",
        phone: result.user.phoneNumber,
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
        <div className="mb-4 flex space-x-4">
          <button
            className={`px-4 py-2 rounded ${mode === "email" ? "bg-pink-500 text-white" : "bg-gray-200"}`}
            onClick={() => setMode("email")}
          >
            Email
          </button>
          <button
            className={`px-4 py-2 rounded ${mode === "phone" ? "bg-pink-500 text-white" : "bg-gray-200"}`}
            onClick={() => setMode("phone")}
          >
            Phone
          </button>
        </div>
        {mode === "email" ? (
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
        ) : (
          <form className="mb-4 w-full" onSubmit={verificationId ? handleVerifyOtp : handleSendOtp}>
            <label className="block mb-2 font-medium">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="+911234567890"
              required
            />
            {verificationId && (
              <>
                <label className="block mb-2 font-medium">OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Enter OTP"
                  required
                />
              </>
            )}
            <div id="recaptcha-container-signup"></div>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <button
              type="submit"
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg transition text-lg"
            >
              {verificationId ? "Verify OTP" : "Send OTP"}
            </button>
          </form>
        )}
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
  const [page, setPage] = useState("main");

  return (
    <div className="min-h-screen bg-white text-gray-900 relative">
      {/* ...header and nav as before... */}
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