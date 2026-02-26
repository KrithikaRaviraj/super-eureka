export const CONSENT_COOKIE_NAME = 'll_cookie_consent';
export const CONSENT_VERSION = 1;
export const COOKIE_MAX_AGE_SECONDS = 180 * 24 * 60 * 60; // 180 days

export const DEFAULT_CONSENT = {
  version: CONSENT_VERSION,
  essential: true,
  analytics: false,
  personalization: false,
  marketing: false,
  timestamp: null
};

const parseBoolean = (value) => value === true;

export const getCookie = (name) => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const setCookie = (name, value, maxAgeSeconds) => {
  const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secureFlag}`;
};

export const getSavedConsent = () => {
  try {
    const raw = getCookie(CONSENT_COOKIE_NAME);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== CONSENT_VERSION) return null;
    return {
      ...DEFAULT_CONSENT,
      ...parsed,
      essential: true,
      analytics: parseBoolean(parsed.analytics),
      personalization: parseBoolean(parsed.personalization),
      marketing: parseBoolean(parsed.marketing)
    };
  } catch {
    return null;
  }
};

const clearPersonalizationStorage = () => {
  try {
    const keysToDelete = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith('serviceFavorites_')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error('Failed clearing personalization storage:', error);
  }
};

let gaScriptLoaded = false;
let gaInitialized = false;

const ensureAnalyticsIntegration = (enabled) => {
  const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;
  if (!measurementId) return;

  window[`ga-disable-${measurementId}`] = !enabled;
  if (!enabled) return;
  if (gaScriptLoaded) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.onload = () => {
    if (!window.dataLayer) window.dataLayer = [];
    if (!window.gtag) {
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
    }
    if (!gaInitialized) {
      window.gtag('js', new Date());
      window.gtag('config', measurementId, { anonymize_ip: true });
      gaInitialized = true;
    }
  };
  document.head.appendChild(script);
  gaScriptLoaded = true;
};

export const applyConsentPolicy = (consent) => {
  const effective = {
    ...DEFAULT_CONSENT,
    ...consent,
    essential: true
  };

  ensureAnalyticsIntegration(Boolean(effective.analytics));

  if (!effective.personalization) {
    clearPersonalizationStorage();
  }
};

export const persistConsent = (consent) => {
  const payload = {
    ...DEFAULT_CONSENT,
    ...consent,
    essential: true,
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString()
  };

  setCookie(CONSENT_COOKIE_NAME, JSON.stringify(payload), COOKIE_MAX_AGE_SECONDS);
  applyConsentPolicy(payload);
  window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: payload }));
  return payload;
};

export const hasConsent = (category) => {
  const saved = getSavedConsent();
  if (!saved) return false;
  if (category === 'essential') return true;
  return Boolean(saved[category]);
};
