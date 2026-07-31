import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import SalonHeader from './SalonHeader';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

async function fetchPublicIp() {
  const endpoints = [
    'https://api64.ipify.org?format=json',
    'https://api.ipify.org?format=json'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) continue;
      const data = await response.json().catch(() => ({}));
      const ip = String(data.ip || '').trim();
      if (ip) return ip;
    } catch {
      // try the next endpoint
    }
  }

  return '';
}

async function collectLoginContext() {
  const [clientIp] = await Promise.all([
    fetchPublicIp()
  ]);

  return {
    clientIp,
    clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'
  };
}

export default function SignIn({ onSuccess, onClose }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [customerStep, setCustomerStep] = useState('email');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isStaffLogin, setIsStaffLogin] = useState(false);
  const [staffEmail, setStaffEmail] = useState('');
  const [staffOtp, setStaffOtp] = useState('');
  const [staffOtpSent, setStaffOtpSent] = useState(false);

  const restoreUserLocation = () => {
    const returnPath = sessionStorage.getItem('postLoginReturnPath') || '/';
    const savedScrollY = Number(sessionStorage.getItem('postLoginScrollY') || '0');
    sessionStorage.removeItem('postLoginReturnPath');
    sessionStorage.removeItem('postLoginScrollY');

    navigate(returnPath, { replace: true });
    window.setTimeout(() => {
      window.scrollTo(0, Number.isFinite(savedScrollY) ? savedScrollY : 0);
    }, 0);
  };

  const completeCustomerLogin = () => {
    setLoginSuccess(true);
    setTimeout(() => {
      setLoginSuccess(false);
      if (onSuccess) onSuccess();
      restoreUserLocation();
    }, 1500);
  };

  const resetCustomerFlow = () => {
    setCustomerStep('email');
    setOtp('');
    setError('');
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const loginContext = await collectLoginContext();

      const sessionResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          uid: result.user.uid,
          name: result.user.displayName || '',
          email: result.user.email || '',
          clientIp: loginContext.clientIp,
          clientTimezone: loginContext.clientTimezone,
          loginMethod: 'Google Sign-In',
          authProvider: 'Google'
        })
      });
      if (!sessionResponse.ok) {
        const sessionData = await sessionResponse.json().catch(() => ({}));
        throw new Error(sessionData?.message || 'Unable to create login session. Please try again.');
      }

      completeCustomerLogin();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCustomerEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to send OTP');
        setLoading(false);
        return;
      }

      setEmail(normalizedEmail);
      setOtp('');
      setCustomerStep('otp');
    } catch {
      setError('Unable to send OTP. Please try again.');
    }

    setLoading(false);
  };

  const handleCustomerVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (otp.length !== 4) {
      setError('Please enter the 4-digit OTP sent to your email');
      setLoading(false);
      return;
    }

    try {
      const loginContext = await collectLoginContext();
      const response = await fetch(`${API_BASE_URL}/api/verify-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp,
          clientIp: loginContext.clientIp,
          clientTimezone: loginContext.clientTimezone,
          loginMethod: 'Email OTP',
          authProvider: 'Email OTP'
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to verify OTP');
        setLoading(false);
        return;
      }

      completeCustomerLogin();
    } catch {
      setError('Verification failed. Please try again.');
    }

    setLoading(false);
  };

  const handleStaffSendOtp = async (e) => {
    e.preventDefault();
    setError('');

    const allowedEmails = (
      process.env.REACT_APP_AUTHORIZED_STAFF_EMAILS ||
      '[redacted-email],[redacted-email],[redacted-email]'
    ).split(',').map((value) => value.trim().toLowerCase());

    if (!allowedEmails.includes(staffEmail.toLowerCase())) {
      setError('Access denied. Only authorized staff emails are allowed.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/send-email-otp`, {
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
    } catch {
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
      const loginContext = await collectLoginContext();
      const response = await fetch(`${API_BASE_URL}/api/verify-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: staffEmail,
          otp: staffOtp,
          asStaff: true,
          clientIp: loginContext.clientIp,
          clientTimezone: loginContext.clientTimezone,
          loginMethod: 'Email OTP',
          authProvider: 'Email OTP'
        })
      });

      const data = await response.json();

      if (data.success) {
        setLoginSuccess(true);
        setTimeout(() => {
          setLoginSuccess(false);
          navigate('/staff-dashboard');
          onSuccess();
        }, 1500);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch {
      setError('Verification failed. Please try again.');
    }
  };

  const renderCustomerForm = () => {
    if (customerStep === 'email') {
      return (
        <form className="mb-6 w-full space-y-6" onSubmit={handleCustomerEmailSubmit}>
          <div>
            <label className="block mb-2 font-sans text-xs font-semibold text-stone-700 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-200/30 transition-all duration-200 outline-none bg-white font-sans text-sm"
              placeholder="Enter your email address"
              autoComplete="email"
              required
            />
          </div>
          {error && <div className="text-red-600 font-sans text-sm bg-red-50 py-3 px-4 rounded-xl border border-red-200">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-70 disabled:transform-none"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      );
    }

    return (
      <form className="mb-6 w-full space-y-6" onSubmit={handleCustomerVerifyOtp}>
        <div>
          <label className="block mb-2 font-sans text-xs font-semibold text-stone-700 uppercase tracking-wider">Email Address</label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full px-5 py-4 border-2 border-stone-200 rounded-xl bg-stone-50 font-sans text-sm text-stone-600"
          />
        </div>
        <div>
          <label className="block mb-2 font-sans text-xs font-semibold text-stone-700 uppercase tracking-wider">OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="w-full px-5 py-4 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-200/30 transition-all duration-200 outline-none bg-white font-sans text-sm text-center tracking-widest"
            placeholder="0000"
            maxLength="4"
            inputMode="numeric"
            required
          />
          <p className="text-xs text-stone-500 mt-2">We sent a verification OTP to {email}</p>
        </div>
        {error && <div className="text-red-600 font-sans text-sm bg-red-50 py-3 px-4 rounded-xl border border-red-200">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-70 disabled:transform-none"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
        <button
          type="button"
          onClick={resetCustomerFlow}
          className="w-full text-stone-600 hover:text-stone-800 font-sans text-sm transition-colors duration-200"
        >
          Change Email
        </button>
      </form>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 py-6 sm:py-10 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-10 w-full max-w-lg border border-stone-200/50 my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close login"
          className="absolute top-4 right-4 h-10 w-10 rounded-full border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:border-stone-300 transition-colors"
        >
          <svg className="mx-auto h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <SalonHeader />
        <div className="flex justify-center mb-6">
          <div className="bg-stone-100 rounded-xl p-1 flex">
            <button
              onClick={() => {
                setIsStaffLogin(false);
                setError('');
              }}
              className={`px-4 py-2 rounded-lg font-sans text-sm transition-all ${
                !isStaffLogin ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-600'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => {
                setIsStaffLogin(true);
                setError('');
              }}
              className={`px-4 py-2 rounded-lg font-sans text-sm transition-all ${
                isStaffLogin ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-600'
              }`}
            >
              Staff
            </button>
          </div>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-light mb-8 text-center text-stone-800">
          {isStaffLogin ? 'Staff Login' : customerStep === 'otp' ? 'Enter OTP' : 'Welcome Back'}
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
                  onChange={(e) => setStaffEmail(e.target.value)}
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
            </form>
          ) : (
            <form className="mb-6 w-full space-y-6" onSubmit={handleStaffVerifyOtp}>
              <div>
                <label className="block mb-2 font-sans text-xs font-semibold text-stone-700 uppercase tracking-wider">Enter OTP</label>
                <input
                  type="text"
                  value={staffOtp}
                  onChange={(e) => setStaffOtp(e.target.value)}
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
        ) : (
          <>
            {renderCustomerForm()}
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
          </>
        )}
      </div>
    </div>
  );
}
