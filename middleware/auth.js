const crypto = require('crypto');
const Session = require('../models/Session');

const SESSION_COOKIE_NAME = 'll_sid';
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || 24 * 60 * 60 * 1000); // 24h
const SESSION_HASH_SALT = process.env.SESSION_HASH_SALT || 'default-session-salt';
const SESSION_COOKIE_SAMESITE = (process.env.SESSION_COOKIE_SAMESITE || 'Lax').trim();

function parseCookies(header) {
  if (!header) return {};
  return header.split(';').reduce((acc, part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return acc;
    const key = part.slice(0, idx).trim();
    const value = decodeURIComponent(part.slice(idx + 1).trim());
    acc[key] = value;
    return acc;
  }, {});
}

function hashSessionId(sid) {
  return crypto.createHash('sha256').update(`${sid}:${SESSION_HASH_SALT}`).digest('hex');
}

function createSessionCookieHeader(sid, maxAgeMs) {
  const sameSiteValue = SESSION_COOKIE_SAMESITE;
  const shouldSecure = process.env.NODE_ENV === 'production' || sameSiteValue.toLowerCase() === 'none';
  const secure = shouldSecure ? '; Secure' : '';
  const maxAgeSeconds = Math.floor(maxAgeMs / 1000);
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(sid)}; Path=/; HttpOnly; SameSite=${sameSiteValue}; Max-Age=${maxAgeSeconds}${secure}`;
}

function createClearSessionCookieHeader() {
  const sameSiteValue = SESSION_COOKIE_SAMESITE;
  const shouldSecure = process.env.NODE_ENV === 'production' || sameSiteValue.toLowerCase() === 'none';
  const secure = shouldSecure ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=${sameSiteValue}; Max-Age=0${secure}`;
}

async function getSessionFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const sid = cookies[SESSION_COOKIE_NAME];
  if (!sid) return null;

  const sidHash = hashSessionId(sid);
  const session = await Session.findOne({ sidHash, expiresAt: { $gt: new Date() } });
  if (!session) return null;

  req.sessionSid = sid;
  return session;
}

async function attachAuth(req, res, next) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      req.auth = null;
      return next();
    }

    req.auth = {
      uid: session.uid,
      email: session.email,
      name: session.name,
      role: session.role
    };

    // Sliding expiration
    const newExpiry = new Date(Date.now() + SESSION_TTL_MS);
    session.lastSeenAt = new Date();
    session.expiresAt = newExpiry;
    await session.save();

    res.setHeader('Set-Cookie', createSessionCookieHeader(req.sessionSid, SESSION_TTL_MS));
    return next();
  } catch (error) {
    console.error('attachAuth error:', error);
    req.auth = null;
    return next();
  }
}

async function createSession(req, res, user) {
  if (req.sessionSid) {
    const oldHash = hashSessionId(req.sessionSid);
    await Session.deleteOne({ sidHash: oldHash });
  }

  const sid = crypto.randomBytes(32).toString('hex');
  const sidHash = hashSessionId(sid);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await Session.create({
    sidHash,
    uid: String(user.uid || ''),
    email: String(user.email || '').toLowerCase(),
    name: String(user.name || ''),
    role: user.role === 'staff' ? 'staff' : 'customer',
    expiresAt
  });

  res.setHeader('Set-Cookie', createSessionCookieHeader(sid, SESSION_TTL_MS));
  req.sessionSid = sid;
  req.auth = {
    uid: String(user.uid || ''),
    email: String(user.email || '').toLowerCase(),
    name: String(user.name || ''),
    role: user.role === 'staff' ? 'staff' : 'customer'
  };
}

async function destroySession(req, res) {
  try {
    if (req.sessionSid) {
      await Session.deleteOne({ sidHash: hashSessionId(req.sessionSid) });
    } else {
      const cookies = parseCookies(req.headers.cookie || '');
      const sid = cookies[SESSION_COOKIE_NAME];
      if (sid) {
        await Session.deleteOne({ sidHash: hashSessionId(sid) });
      }
    }
  } catch (error) {
    console.error('destroySession error:', error);
  }
  res.setHeader('Set-Cookie', createClearSessionCookieHeader());
  req.auth = null;
  req.sessionSid = null;
}

function requireAuth(req, res, next) {
  if (!req.auth) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  return next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (req.auth.role !== role) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    return next();
  };
}

module.exports = {
  attachAuth,
  createSession,
  destroySession,
  requireAuth,
  requireRole
};
