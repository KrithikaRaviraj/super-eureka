import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

export default function TestimonialApproval() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const action = searchParams.get('action');
  
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token && action) {
      processApproval();
    } else {
      setError('Invalid approval link');
      setLoading(false);
    }
  }, [token, action]);

  const processApproval = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/testimonial/${token}?action=${action}`);
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to process testimonial approval');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-sans text-stone-600">Processing testimonial approval...</p>
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
          <h2 className="font-serif text-2xl font-medium text-stone-800 mb-4">Error</h2>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-stone-200/50 text-center max-w-lg">
        <div className={`w-20 h-20 ${action === 'approve' ? 'bg-emerald-100' : 'bg-orange-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
          {action === 'approve' ? (
            <svg className="w-10 h-10 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          ) : (
            <svg className="w-10 h-10 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          )}
        </div>
        
        <h2 className="font-serif text-2xl font-medium text-stone-800 mb-4">
          Testimonial {action === 'approve' ? 'Approved' : 'Rejected'}
        </h2>
        
        <p className="font-sans text-stone-600 mb-6">
          {result?.message}
        </p>
        
        {result?.feedback && (
          <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 mb-6 text-left">
            <h3 className="font-serif text-lg font-medium text-stone-800 mb-2">
              {result.feedback.userName}
            </h3>
            <p className="text-stone-600 text-sm mb-2">
              <strong>Service:</strong> {result.feedback.service}
            </p>
            <p className="text-stone-600 text-sm mb-3">
              <strong>Rating:</strong> {result.feedback.overallRating}/5 stars
            </p>
            <p className="text-stone-700 italic">
              "{result.feedback.comments}"
            </p>
          </div>
        )}
        
        <button 
          onClick={() => navigate('/')}
          className="bg-stone-600 hover:bg-stone-700 text-white px-6 py-3 rounded-xl font-sans font-medium"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
}