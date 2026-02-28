import {
  CONSENT_COOKIE_NAME,
  CONSENT_VERSION,
  DEFAULT_CONSENT,
  getSavedConsent,
  hasConsent,
  persistConsent
} from './cookieConsent';

describe('cookieConsent utils', () => {
  beforeEach(() => {
    document.cookie = `${CONSENT_COOKIE_NAME}=; Max-Age=0; Path=/`;
    localStorage.clear();
  });

  test('returns null when no cookie is set', () => {
    expect(getSavedConsent()).toBeNull();
  });

  test('persists and reads consent payload', () => {
    const payload = persistConsent({
      analytics: true,
      personalization: false,
      marketing: true
    });

    const loaded = getSavedConsent();
    expect(loaded).not.toBeNull();
    expect(loaded.version).toBe(CONSENT_VERSION);
    expect(loaded.essential).toBe(true);
    expect(loaded.analytics).toBe(true);
    expect(loaded.personalization).toBe(false);
    expect(loaded.marketing).toBe(true);
    expect(payload.timestamp).toBeTruthy();
  });

  test('hasConsent respects category flags', () => {
    persistConsent({
      analytics: false,
      personalization: false,
      marketing: false
    });

    expect(hasConsent('essential')).toBe(true);
    expect(hasConsent('analytics')).toBe(false);
    expect(hasConsent('marketing')).toBe(false);
  });

  test('invalid version cookie returns null', () => {
    const invalid = {
      ...DEFAULT_CONSENT,
      version: CONSENT_VERSION + 1
    };
    document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(invalid))}; Path=/`;
    expect(getSavedConsent()).toBeNull();
  });
});
