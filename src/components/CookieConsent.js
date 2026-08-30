import React, { useEffect, useState } from 'react';
import {
  DEFAULT_CONSENT,
  applyConsentPolicy,
  getSavedConsent,
  persistConsent
} from '../utils/cookieConsent';
import { API_URL } from '../config';

const CookieConsent = ({ onPrivacyClick }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [draftConsent, setDraftConsent] = useState(DEFAULT_CONSENT);

  useEffect(() => {
    const storedConsent = getSavedConsent();
    if (storedConsent) {
      setDraftConsent(storedConsent);
      applyConsentPolicy(storedConsent);
      setShowBanner(false);
      return;
    }
    setShowBanner(true);
  }, []);

  const auditConsent = async (payload, action) => {
    try {
      await fetch(`${API_URL}/api/security/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: payload.version,
          analytics: payload.analytics,
          personalization: payload.personalization,
          marketing: payload.marketing,
          action
        })
      });
    } catch (error) {
      console.error('Consent audit log failed:', error);
    }
  };

  const applyAndPersistConsent = (consent, action) => {
    const payload = persistConsent(consent);
    setDraftConsent(payload);
    setShowBanner(false);
    setShowPreferences(false);
    auditConsent(payload, action);
  };

  const acceptAll = () => {
    applyAndPersistConsent({
      analytics: true,
      personalization: true,
      marketing: true
    }, 'accept_all');
  };

  const rejectNonEssential = () => {
    applyAndPersistConsent({
      analytics: false,
      personalization: false,
      marketing: false
    }, 'reject_non_essential');
  };

  const saveCustomPreferences = () => {
    applyAndPersistConsent(draftConsent, 'save_custom');
  };

  return (
    <>
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-300 shadow-2xl z-50 p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="font-serif text-xl font-semibold text-stone-900 mb-2">Your Privacy Choices</h3>
                <p className="font-sans text-sm text-stone-700 leading-relaxed max-w-3xl">
                  We use essential cookies to keep the site secure and functional. With your permission, we also use analytics, personalization, and marketing cookies. You can accept all, reject non-essential cookies, or customize your preferences. Read more in our{' '}
                  <button
                    onClick={onPrivacyClick}
                    className="text-rose-600 hover:text-rose-700 font-semibold transition-colors duration-200 cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                  .
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto lg:min-w-[520px]">
                <button
                  onClick={() => setShowPreferences(true)}
                  className="px-5 py-2.5 border border-stone-400 text-stone-700 rounded hover:bg-stone-50 transition-colors duration-200 font-sans font-medium text-sm"
                >
                  Customize
                </button>
                <button
                  onClick={rejectNonEssential}
                  className="px-5 py-2.5 border border-stone-400 text-stone-700 rounded hover:bg-stone-50 transition-colors duration-200 font-sans font-medium text-sm"
                >
                  Reject Non-Essential
                </button>
                <button
                  onClick={acceptAll}
                  className="px-5 py-2.5 bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors duration-200 font-sans font-medium text-sm"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPreferences && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200">
            <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-serif text-2xl text-stone-900">Cookie Preferences</h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-stone-500 hover:text-stone-800 text-sm"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-5">
              <p className="font-sans text-sm text-stone-700">
                Manage cookie categories. Essential cookies are always enabled for authentication, fraud prevention, and core site security.
              </p>

              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 p-4 border border-stone-200 rounded-xl bg-stone-50">
                  <div>
                    <p className="font-semibold text-stone-900">Essential Cookies</p>
                    <p className="text-sm text-stone-600">Required for login, security, and core functionality.</p>
                  </div>
                  <span className="text-xs font-semibold bg-stone-200 text-stone-700 px-3 py-1 rounded-full">Always On</span>
                </div>

                {[
                  { key: 'analytics', title: 'Analytics Cookies', description: 'Help us measure site performance and improve reliability.' },
                  { key: 'personalization', title: 'Personalization Cookies', description: 'Remember preferences for a more tailored experience.' },
                  { key: 'marketing', title: 'Marketing Cookies', description: 'Support relevant campaigns and ad measurement.' }
                ].map((category) => (
                  <div key={category.key} className="flex items-start justify-between gap-4 p-4 border border-stone-200 rounded-xl">
                    <div>
                      <p className="font-semibold text-stone-900">{category.title}</p>
                      <p className="text-sm text-stone-600">{category.description}</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={Boolean(draftConsent[category.key])}
                        onChange={(e) => setDraftConsent((prev) => ({ ...prev, [category.key]: e.target.checked }))}
                      />
                      <span className="w-11 h-6 bg-stone-300 peer-checked:bg-rose-600 rounded-full relative transition-colors">
                        <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-stone-200 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={rejectNonEssential}
                className="px-5 py-2.5 border border-stone-400 text-stone-700 rounded hover:bg-stone-50 transition-colors duration-200 font-sans font-medium text-sm"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={saveCustomPreferences}
                className="px-5 py-2.5 bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors duration-200 font-sans font-medium text-sm"
              >
                Save Preferences
              </button>
              <button
                onClick={acceptAll}
                className="px-5 py-2.5 bg-stone-800 text-white rounded hover:bg-black transition-colors duration-200 font-sans font-medium text-sm"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;
