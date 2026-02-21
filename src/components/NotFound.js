import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* 404 Text */}
        <div className="mb-8">
          <h1 className="font-serif text-9xl md:text-[150px] font-bold text-rose-400 mb-4">404</h1>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-stone-800 mb-4">
            Page Not Found
          </h2>
          <p className="font-sans text-lg text-stone-600 mb-8">
            Sorry, the page you're looking for doesn't exist or has been moved. Let's get you back on track!
          </p>
        </div>

        {/* Decorative Element */}
        <div className="mb-12 relative h-32 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <svg className="w-32 h-32 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors duration-200 font-sans font-semibold"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate('/services')}
            className="px-8 py-3 border-2 border-rose-600 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors duration-200 font-sans font-semibold"
          >
            View Services
          </button>
        </div>

        {/* Additional Help Text */}
        <div className="mt-12 pt-8 border-t border-stone-300">
          <p className="font-sans text-sm text-stone-600 mb-4">
            Quick Links:
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="text-rose-600 hover:text-rose-700 font-medium transition-colors"
            >
              Home
            </button>
            <span className="text-stone-300">•</span>
            <button
              onClick={() => navigate('/services')}
              className="text-rose-600 hover:text-rose-700 font-medium transition-colors"
            >
              Services
            </button>
            <span className="text-stone-300">•</span>
            <button
              onClick={() => navigate('/book-appointment')}
              className="text-rose-600 hover:text-rose-700 font-medium transition-colors"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
