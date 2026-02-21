import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/send-staff-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setOtpSent(true);
      } else {
        const data = await response.json().catch(() => ({})); // handle non-json responses
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

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/verify-staff-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      if (response.ok) {
        localStorage.setItem('staffSession', JSON.stringify({
          email,
          loginTime: Date.now()
        }));
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 relative flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(219, 39, 119, 0.08) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(244, 63, 94, 0.08) 0%, transparent 50%)`
        }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-stone-200/50">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>
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
                {loading ? `${"Send OTP"}...` : "Send OTP"}
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
                  maxLength={6}
                  className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:outline-none font-sans text-center text-lg tracking-widest"
                  placeholder="000000"
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
                  {loading ? `${"Verify OTP"}...` : "Verify OTP"}
                </button>
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-sans font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Back to Home
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="font-sans text-sm text-stone-600 hover:text-stone-800 transition-colors"
            >
              ← Back to Home
            </button>
          </div>


        </div>
      </div>
    </div>
  );
}