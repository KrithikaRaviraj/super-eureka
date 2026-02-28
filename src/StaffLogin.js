import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SalonHeader from './components/SalonHeader';

const DEFAULT_ALLOWED_STAFF_EMAILS = [
  '[redacted-email]',
  '[redacted-email]',
  '[redacted-email]'
];

const ALLOWED_STAFF_EMAILS = (
  process.env.REACT_APP_AUTHORIZED_STAFF_EMAILS ||
  DEFAULT_ALLOWED_STAFF_EMAILS.join(',')
)
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

export default function StaffLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!ALLOWED_STAFF_EMAILS.includes(normalizedEmail)) {
      setError('Access denied. This email is not authorized for staff login.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: normalizedEmail })
      });

      if (response.ok) {
        setOtpSent(true);
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.error || 'Failed to send OTP. Please check the email and try again.');
      }
    } catch {
      setError('Network error. Could not connect to the server.');
    }

    setLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!ALLOWED_STAFF_EMAILS.includes(normalizedEmail)) {
      setError('Access denied. This email is not authorized for staff login.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/verify-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: normalizedEmail, otp, asStaff: true })
      });

      if (response.ok) {
        navigate('/staff-dashboard');
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.error || 'Invalid OTP.');
      }
    } catch {
      setError('Network error. Could not connect to the server.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 relative">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(219, 39, 119, 0.08) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(244, 63, 94, 0.08) 0%, transparent 50%)`
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 sm:py-14">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <div className="hidden lg:block rounded-3xl overflow-hidden shadow-2xl border border-stone-200/60 min-h-[640px]">
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Lavish Ladies staff and salon ambiance"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-10 border border-stone-200/50 min-h-[640px] flex flex-col justify-center">
            <div className="mb-6">
              <SalonHeader />
            </div>

            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl font-light text-stone-800 mb-2">Staff Login</h1>
              <p className="font-sans text-stone-600">Access the staff dashboard</p>
            </div>

            {!otpSent ? (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <label className="block font-sans text-sm font-semibold text-stone-700 mb-3">Staff Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:outline-none font-sans"
                    placeholder="Enter your staff email"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl font-sans text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Send OTP...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <label className="block font-sans text-sm font-semibold text-stone-700 mb-3">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={4}
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:outline-none font-sans text-center text-lg tracking-widest"
                    placeholder="0000"
                  />
                  <p className="text-sm text-stone-600 mt-2">An OTP has been sent to your email {email}</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl font-sans text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Verify OTP...' : 'Verify OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                      setError('');
                    }}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-sans font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                  >
                    Change Email
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/')}
                className="font-sans text-sm text-stone-600 hover:text-stone-800 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
