import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function FeedbackForm() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [error, setError] = useState('');
  
  const [feedback, setFeedback] = useState({
    serviceQuality: 0,
    staffFriendliness: 0,
    salonCleanliness: 0,
    recommendation: 0,
    comments: '',
    isAnonymous: false
  });
  const [hoveredRating, setHoveredRating] = useState({});

  useEffect(() => {
    fetchAppointment();
  }, [token]);

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/appointments/feedback/${token}`);
      const data = await response.json();
      
      if (data.success) {
        setAppointment(data.appointment);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to load feedback form');
    }
    setLoading(false);
  };

  const handleRatingClick = (category, rating) => {
    setFeedback({ ...feedback, [category]: rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.serviceQuality || !feedback.staffFriendliness || !feedback.salonCleanliness || !feedback.recommendation) {
      setError('Please rate all categories');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/appointments/feedback/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubmitted(true);
        // Start countdown timer
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              navigate('/');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        // Cleanup timer on component unmount
        return () => clearInterval(timer);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to submit feedback');
    }
    
    setSubmitting(false);
  };

  const StarRating = ({ category, rating, onRate }) => {
    const currentRating = hoveredRating[category] || rating;
    
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate(category, star)}
            onMouseEnter={() => setHoveredRating({...hoveredRating, [category]: star})}
            onMouseLeave={() => setHoveredRating({...hoveredRating, [category]: 0})}
            className={`text-3xl transition-all duration-200 hover:scale-110 cursor-pointer ${
              star <= currentRating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-sans text-stone-600">Loading feedback form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-stone-200/50 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-medium text-stone-800 mb-4">Feedback Unavailable</h2>
          <p className="font-sans text-stone-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-stone-600 hover:bg-stone-700 text-white px-6 py-3 rounded-xl font-sans font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-stone-200/50 text-center max-w-md">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-medium text-stone-800 mb-4">Thank You</h2>
          <p className="font-sans text-stone-600 mb-6">
            Your feedback has been submitted successfully. We appreciate your time and valuable input.
          </p>
          
          <div className="space-y-4">
            <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
              <p className="font-sans text-stone-700 mb-4 text-center">
                Would you like to leave a Google Review?
              </p>
              <div className="flex space-x-3">
                <a 
                  href={process.env.REACT_APP_GOOGLE_REVIEWS_URL || 'https://g.page/r/CX75qAudJSuXEAI/review'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-sans font-medium transition-all duration-300"
                >
                  Leave Review
                </a>
                <button 
                  onClick={() => navigate('/')}
                  className="flex-1 bg-stone-600 hover:bg-stone-700 text-white px-4 py-3 rounded-xl font-sans font-medium transition-all duration-300"
                >
                  Go Home
                </button>
              </div>
            </div>
            
            <p className="font-sans text-xs text-stone-500 text-center">
              Redirecting to homepage in {countdown} seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-stone-50 to-rose-50 px-8 py-6 border-b border-stone-200">
            <h1 className="font-serif text-3xl font-light text-stone-800 text-center">Share Your Experience</h1>
            <p className="font-sans text-stone-600 text-center mt-2">Lavish Ladies Beauty Salon & Spa</p>
          </div>
          
          <div className="p-8">
            <div className="mb-6">
              <h2 className="font-serif text-xl font-medium text-stone-800 mb-2">
                How was your {appointment?.service} appointment?
              </h2>
              <p className="font-sans text-stone-600 text-sm">
                Date: {new Date(appointment?.date).toLocaleDateString()} at {appointment?.time}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block font-sans text-sm font-semibold text-stone-700 mb-3">
                  Service Quality
                </label>
                <StarRating 
                  category="serviceQuality" 
                  rating={feedback.serviceQuality} 
                  onRate={handleRatingClick} 
                />
              </div>

              <div>
                <label className="block font-sans text-sm font-semibold text-stone-700 mb-3">
                  Staff Friendliness
                </label>
                <StarRating 
                  category="staffFriendliness" 
                  rating={feedback.staffFriendliness} 
                  onRate={handleRatingClick} 
                />
              </div>

              <div>
                <label className="block font-sans text-sm font-semibold text-stone-700 mb-3">
                  Salon Cleanliness
                </label>
                <StarRating 
                  category="salonCleanliness" 
                  rating={feedback.salonCleanliness} 
                  onRate={handleRatingClick} 
                />
              </div>

              <div>
                <label className="block font-sans text-sm font-semibold text-stone-700 mb-3">
                  How likely are you to recommend us to friends/family?
                </label>
                <StarRating 
                  category="recommendation" 
                  rating={feedback.recommendation} 
                  onRate={handleRatingClick} 
                />
              </div>

              <div>
                <label className="block font-sans text-sm font-semibold text-stone-700 mb-3">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={feedback.comments}
                  onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-rose-400 focus:outline-none resize-none"
                  placeholder="Share your thoughts about your visit..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={feedback.isAnonymous}
                  onChange={(e) => setFeedback({ ...feedback, isAnonymous: e.target.checked })}
                  className="w-4 h-4 text-rose-600 border-2 border-stone-300 rounded focus:ring-rose-500"
                />
                <label htmlFor="anonymous" className="font-sans text-sm text-stone-700">
                  Post anonymously (your name will not be displayed)
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl font-sans text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-semibold py-4 px-8 rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}