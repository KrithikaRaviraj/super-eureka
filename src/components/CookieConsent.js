import React, { useState } from 'react';

const CookieConsent = ({ onPrivacyClick }) => {
  const [showConsent, setShowConsent] = useState(true);

  const acceptCookies = () => {
    setShowConsent(false);
  };

  const declineCookies = () => {
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-300 shadow-2xl z-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="font-serif text-xl font-semibold text-stone-900 mb-2">Cookie Policy</h3>
            <p className="font-sans text-sm text-stone-700 leading-relaxed max-w-2xl">
              We use cookies to enhance your experience on our website. These include essential cookies for site functionality and analytics cookies to help us understand how you use our site. By continuing to use this site, you agree to our use of cookies. For more information, please review our{' '}
              <button 
                onClick={onPrivacyClick} 
                className="text-rose-600 hover:text-rose-700 font-semibold transition-colors duration-200 cursor-pointer"
              >
                Privacy Policy
              </button>
              .
            </p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto flex-shrink-0">
            <button
              onClick={declineCookies}
              className="flex-1 md:flex-none px-6 py-2.5 border border-stone-400 text-stone-700 rounded hover:bg-stone-50 transition-colors duration-200 font-sans font-medium text-sm"
            >
              Decline
            </button>
            <button
              onClick={acceptCookies}
              className="flex-1 md:flex-none px-6 py-2.5 bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors duration-200 font-sans font-medium text-sm"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;