import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowConsent(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-stone-200 shadow-lg z-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-serif text-lg font-medium text-stone-800 mb-2">Cookie Consent</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  We use essential cookies to ensure our website functions properly and analytics cookies to understand how you interact with our site. 
                  By clicking "Accept All", you consent to our use of cookies as described in our{' '}
                  <button className="text-rose-600 hover:text-rose-700 underline font-medium">
                    Privacy Policy
                  </button>
                  . You can manage your preferences or decline non-essential cookies.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={declineCookies}
              className="px-4 py-2 border-2 border-stone-300 text-stone-700 rounded-lg hover:border-stone-400 hover:bg-stone-50 transition-all duration-200 font-medium text-sm"
            >
              Decline
            </button>
            <button
              onClick={acceptCookies}
              className="px-6 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-lg hover:from-rose-700 hover:to-pink-700 transition-all duration-200 font-medium text-sm shadow-md"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;