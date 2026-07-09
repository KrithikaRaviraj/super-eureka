const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { createSession, destroySession, requireAuth } = require('../middleware/auth');
const { PASSWORD_RULES, validatePassword, hashPassword, verifyPassword } = require('../utils/passwordAuth');

const router = express.Router();

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

function createDisplayName(email) {
  const localPart = normalizeEmail(email).split('@')[0] || 'client';
  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

router.get('/me', (req, res) => {
  if (!req.auth) {
    return res.json({ success: true, authenticated: false, user: null });
  }
  return res.json({ success: true, authenticated: true, user: req.auth });
});

router.post('/login', async (req, res) => {
  try {
    const { uid, email, name, rememberDevice } = req.body || {};
    const normalizedEmail = normalizeEmail(email);
    if (!uid || !normalizedEmail) {
      return res.status(400).json({ success: false, message: 'uid and email are required' });
    }

    await createSession(req, res, {
      uid: String(uid),
      email: normalizedEmail,
      name: String(name || ''),
      role: 'customer'
    }, { rememberDevice: rememberDevice === true });

    return res.json({ success: true, user: req.auth });
  } catch (error) {
    console.error('auth/login error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create session' });
  }
});

router.get('/password-rules', (req, res) => {
  return res.json({ success: true, rules: PASSWORD_RULES });
});

router.post('/customer-status', async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);
    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Valid email address required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    return res.json({
      success: true,
      exists: Boolean(user),
      hasPassword: Boolean(user?.passwordHash),
      requiresOtpSetup: !user || !user.passwordHash
    });
  } catch (error) {
    console.error('auth/customer-status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to check account status' });
  }
});

router.post('/customer-register', async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || '').trim();
    const password = String(req.body?.password || '');
    const confirmPassword = String(req.body?.confirmPassword || '');
    const rememberDevice = req.body?.rememberDevice === true;
    const name = String(req.body?.name || '').trim();

    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Valid email address required' });
    }
    if (!/^\d{4}$/.test(otp)) {
      return res.status(400).json({ success: false, message: 'A valid 4-digit OTP is required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const passwordCheck = validatePassword(password, normalizedEmail);
    if (!passwordCheck.valid) {
      return res.status(400).json({ success: false, message: passwordCheck.message });
    }

    const otpRecord = await OTP.findOne({ email: normalizedEmail });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ email: normalizedEmail });
      return res.status(429).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
    }

    const [salt, hash] = String(otpRecord.hashedOtp || '').split(':');
    if (!salt || !hash) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const verifyHash = crypto.pbkdf2Sync(otp, salt, 10000, 64, 'sha512').toString('hex');
    const isValidOtp = Buffer.from(hash, 'hex').length === Buffer.from(verifyHash, 'hex').length
      && crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));

    if (!isValidOtp) {
      await OTP.findOneAndUpdate({ email: normalizedEmail }, { $inc: { attempts: 1 } });
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    const hashedPassword = hashPassword(password);
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        uid: crypto.randomUUID(),
        name: name || createDisplayName(normalizedEmail),
        email: normalizedEmail,
        phone: null,
        photoURL: '',
        passwordHash: hashedPassword,
        passwordSetupAt: new Date(),
        emailVerifiedAt: new Date()
      });
    } else {
      user.passwordHash = hashedPassword;
      user.passwordSetupAt = new Date();
      user.emailVerifiedAt = user.emailVerifiedAt || new Date();
      if (!user.uid) user.uid = crypto.randomUUID();
      if (!user.name) user.name = name || createDisplayName(normalizedEmail);
      await user.save();
    }

    await OTP.deleteOne({ email: normalizedEmail });

    await createSession(req, res, {
      uid: user.uid,
      email: user.email,
      name: user.name || createDisplayName(normalizedEmail),
      role: 'customer'
    }, { rememberDevice });

    return res.json({ success: true, user: req.auth, mode: 'registered' });
  } catch (error) {
    console.error('auth/customer-register error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create password' });
  }
});

router.post('/customer-forgot-password', async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);
    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Valid email address required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.passwordHash) {
      return res.status(404).json({ success: false, message: 'No password-based account found for this email' });
    }

    return res.json({ success: true, message: 'OTP verification required to reset password' });
  } catch (error) {
    console.error('auth/customer-forgot-password error:', error);
    return res.status(500).json({ success: false, message: 'Failed to start password reset' });
  }
});

router.post('/customer-password-login', async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');
    const rememberDevice = req.body?.rememberDevice === true;

    if (!validateEmail(normalizedEmail) || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found for this email' });
    }
    if (!user.passwordHash) {
      return res.status(400).json({ success: false, message: 'This account needs OTP verification before creating a password', requiresOtpSetup: true });
    }
    if (!verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    await createSession(req, res, {
      uid: user.uid || crypto.randomUUID(),
      email: user.email,
      name: user.name || createDisplayName(normalizedEmail),
      role: 'customer'
    }, { rememberDevice });

    if (!user.uid) {
      user.uid = req.auth.uid;
      await user.save();
    }

    return res.json({ success: true, user: req.auth, mode: 'password' });
  } catch (error) {
    console.error('auth/customer-password-login error:', error);
    return res.status(500).json({ success: false, message: 'Failed to log in' });
  }
});

router.post('/customer-reset-password', async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || '').trim();
    const password = String(req.body?.password || '');
    const confirmPassword = String(req.body?.confirmPassword || '');
    const rememberDevice = req.body?.rememberDevice === true;

    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Valid email address required' });
    }
    if (!/^\d{4}$/.test(otp)) {
      return res.status(400).json({ success: false, message: 'A valid 4-digit OTP is required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const passwordCheck = validatePassword(password, normalizedEmail);
    if (!passwordCheck.valid) {
      return res.status(400).json({ success: false, message: passwordCheck.message });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found for this email' });
    }

    const otpRecord = await OTP.findOne({ email: normalizedEmail });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ email: normalizedEmail });
      return res.status(429).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
    }

    const [salt, hash] = String(otpRecord.hashedOtp || '').split(':');
    if (!salt || !hash) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const verifyHash = crypto.pbkdf2Sync(otp, salt, 10000, 64, 'sha512').toString('hex');
    const left = Buffer.from(hash, 'hex');
    const right = Buffer.from(verifyHash, 'hex');
    const isValidOtp = left.length === right.length && crypto.timingSafeEqual(left, right);

    if (!isValidOtp) {
      await OTP.findOneAndUpdate({ email: normalizedEmail }, { $inc: { attempts: 1 } });
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    user.passwordHash = hashPassword(password);
    user.passwordSetupAt = user.passwordSetupAt || new Date();
    user.emailVerifiedAt = user.emailVerifiedAt || new Date();
    if (!user.uid) user.uid = crypto.randomUUID();
    if (!user.name) user.name = createDisplayName(normalizedEmail);
    await user.save();

    await OTP.deleteOne({ email: normalizedEmail });

    await createSession(req, res, {
      uid: user.uid,
      email: user.email,
      name: user.name || createDisplayName(normalizedEmail),
      role: 'customer'
    }, { rememberDevice });

    return res.json({ success: true, user: req.auth, mode: 'reset' });
  } catch (error) {
    console.error('auth/customer-reset-password error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password' });
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
