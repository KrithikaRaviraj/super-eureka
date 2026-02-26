const express = require('express');
const crypto = require('crypto');
const { createSession, destroySession, requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/me', (req, res) => {
  if (!req.auth) {
    return res.json({ success: true, authenticated: false, user: null });
  }
  return res.json({ success: true, authenticated: true, user: req.auth });
});

router.post('/login', async (req, res) => {
  try {
    const { uid, email, name } = req.body || {};
    const normalizedEmail = String(email || '').toLowerCase().trim();
    if (!uid || !normalizedEmail) {
      return res.status(400).json({ success: false, message: 'uid and email are required' });
    }

    await createSession(req, res, {
      uid: String(uid),
      email: normalizedEmail,
      name: String(name || ''),
      role: 'customer'
    });

    return res.json({ success: true, user: req.auth });
  } catch (error) {
    console.error('auth/login error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create session' });
  }
});

router.post('/logout', requireAuth, async (req, res) => {
  await destroySession(req, res);
  return res.json({ success: true, message: 'Logged out' });
});

router.post('/logout-any', async (req, res) => {
  await destroySession(req, res);
  return res.json({ success: true, message: 'Logged out' });
});

router.post('/renew', requireAuth, async (req, res) => {
  try {
    await createSession(req, res, req.auth);
    return res.json({ success: true, user: req.auth, nonce: crypto.randomBytes(8).toString('hex') });
  } catch (error) {
    console.error('auth/renew error:', error);
    return res.status(500).json({ success: false, message: 'Failed to renew session' });
  }
});

module.exports = router;
