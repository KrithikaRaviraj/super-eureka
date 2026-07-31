require('dotenv').config();
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const { createSession } = require('../middleware/auth');
const { buildEmailTemplate } = require('../utils/emailTemplate');
const OTP = require('../models/OTP');
const { buildAuthUrl, buildPrimaryButton, createMailTransport, extractClientIp, sendLoginSuccessEmail } = require('../utils/accountEmails');
const { upsertUserProfile } = require('../utils/userPersistence');

function buildDetailRow(label, value, emphasize = false) {
  return `
    <tr>
      <td style="padding:13px 0;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:700;letter-spacing:0.4px;color:#6b7280;text-transform:uppercase;width:170px;vertical-align:top;">${label}</td>
      <td style="padding:13px 0;border-bottom:1px solid #e5e7eb;font-size:15px;line-height:1.6;color:${emphasize ? '#111827' : '#374151'};font-weight:${emphasize ? '700' : '500'};">${value}</td>
    </tr>
  `;
}

// HTTPS enforcement with strict validation
router.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // Only trust req.secure (requires proper trust proxy configuration)
    if (!req.secure) {
      logSecurityEvent('https_required', { ip: extractClientIp(req) });
      return res.status(403).json({ success: false, message: "HTTPS required" });
    }
  }
  next();
});

const ipRateLimitSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: 3600 }
});
ipRateLimitSchema.index({ ip: 1 }, { unique: true });

const emailRateLimitSchema = new mongoose.Schema({
  email: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: 900 }
});
emailRateLimitSchema.index({ email: 1 }, { unique: true });

const IpRateLimit = mongoose.model('IpRateLimit', ipRateLimitSchema);
const EmailRateLimit = mongoose.model('EmailRateLimit', emailRateLimitSchema);

const transporter = createMailTransport();

// Hash function for user identifiers
function hashIdentifier(identifier) {
  return crypto.createHash('sha256').update(identifier + process.env.LOG_SALT || 'default').digest('hex').slice(0, 8);
}

// Safe monitoring with Node.js compatibility
function logSecurityEvent(event, data) {
  const safeData = { ...data };
  
  // Hash all user identifiers
  if (safeData.email) {
    safeData.emailHash = hashIdentifier(safeData.email);
    delete safeData.email;
  }
  if (safeData.ip && safeData.ip !== '127.0.0.1') {
    safeData.ipHash = hashIdentifier(safeData.ip);
    delete safeData.ip;
  }
  
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    ...safeData
  };
  
  console.log('SECURITY_EVENT:', JSON.stringify(logData));
  
  // Node.js compatible HTTP request
  if (process.env.WEBHOOK_URL) {
    const url = require('url');
    const https = require('https');
    const http = require('http');
    
    const parsedUrl = url.parse(process.env.WEBHOOK_URL);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const postData = JSON.stringify(logData);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000
    };
    
    const req = client.request(options, () => {});
    req.on('error', () => {});
    req.on('timeout', () => req.destroy());
    req.write(postData);
    req.end();
  }
}

function generateOTP() {
  // 4-digit OTP for shorter entry while keeping leading zeros intact
  return crypto.randomInt(1000, 9999).toString();
}

function hashOTP(otp) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(otp, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function safeVerifyOTP(otp, hashedOtp) {
  try {
    const [salt, hash] = hashedOtp.split(':');
    if (!salt || !hash) return false;
    
    const verifyHash = crypto.pbkdf2Sync(otp, salt, 10000, 64, 'sha512').toString('hex');
    const hashBuffer = Buffer.from(hash, 'hex');
    const verifyBuffer = Buffer.from(verifyHash, 'hex');
    
    if (hashBuffer.length !== verifyBuffer.length) return false;
    return crypto.timingSafeEqual(hashBuffer, verifyBuffer);
  } catch {
    return false;
  }
}

function generateUID() {
  return crypto.randomUUID();
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isAuthorizedStaff(req) {
  const authHeader = req.headers['x-staff-authorization'];
  const currentKey = process.env.STAFF_SECRET_KEY;
  const rotatedKey = process.env.STAFF_SECRET_KEY_ROTATED;
  return authHeader === currentKey || (rotatedKey && authHeader === rotatedKey);
}

function isAuthorizedStaffEmail(email) {
  const configured =
    process.env.AUTHORIZED_STAFF_EMAILS ||
    process.env.REACT_APP_AUTHORIZED_STAFF_EMAILS ||
    process.env.ADMIN_EMAIL ||
    '';
  const allowed = configured.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(String(email || '').toLowerCase());
}

async function checkRateLimit(Model, query, limit, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await Model.findOneAndUpdate(
        query,
        { $inc: { attempts: 1 } },
        { upsert: true, new: true }
      );
      return result;
    } catch (error) {
      if (error.code === 11000 && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        continue;
      }
      throw error;
    }
  }
}

// Send Email OTP
router.post('/send-email-otp', async (req, res) => {
  const startTime = Date.now();
  const clientIP = extractClientIp(req);
  
  try {
    const { email } = req.body;
    
    if (!email || !validateEmail(email)) {
      logSecurityEvent('invalid_email_attempt', { ip: clientIP });
      return res.status(400).json({ 
        success: false, 
        message: "Valid email address required" 
      });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    const [ipResult, emailResult] = await Promise.all([
      checkRateLimit(IpRateLimit, { ip: clientIP }, 10),
      checkRateLimit(EmailRateLimit, { email: normalizedEmail }, 5)
    ]);
    
    if (ipResult.attempts > 10) {
      logSecurityEvent('ip_rate_limit_exceeded', { ip: clientIP, attempts: ipResult.attempts });
      return res.status(429).json({ 
        success: false, 
        message: "Too many requests from this IP. Please try again later." 
      });
    }
    
    if (emailResult.attempts > 5) {
      logSecurityEvent('email_rate_limit_exceeded', { ip: clientIP, email: normalizedEmail, attempts: emailResult.attempts });
      return res.status(429).json({ 
        success: false, 
        message: "Too many requests. Please try again later." 
      });
    }
    
    const otp = generateOTP();
    const hashedOtp = hashOTP(otp);
    
    // Atomic OTP creation/update
    await OTP.findOneAndUpdate(
      { email: normalizedEmail },
      { hashedOtp, attempts: 0, createdAt: new Date() },
      { upsert: true }
    );
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: 'Your Lavish Ladies Beauty Salon Verification Code',
      html: buildEmailTemplate({
        title: 'Security Code',
        subtitle: 'Your sign-in request is ready. Use the verification code below to continue securely.',
        contentHtml: `
          <p style="margin:0 0 20px 0;font-size:16px;line-height:1.7;color:#374151;">Dear Guest, we received a request to sign in to Lavish Ladies Beauty Salon using this email address.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;padding:0 20px;margin-bottom:22px;">
            ${buildDetailRow('Verification Code', `<span style="font-family:'Courier New',monospace;font-size:30px;letter-spacing:8px;">${otp}</span>`, true)}
            ${buildDetailRow('Valid For', '10 minutes')}
            ${buildDetailRow('Requested For', normalizedEmail)}
          </table>
          <div style="margin:0 0 22px 0;padding:18px 20px;background:#f9fafb;border:1px solid #e5e7eb;">
            <div style="font-size:14px;line-height:1.8;color:#4b5563;">
              <strong style="color:#111827;">Security reminder:</strong> never share this code with anyone. Our team will never ask for your OTP by phone, chat, or email.
            </div>
          </div>
          <p style="margin:0 0 18px 0;font-size:14px;line-height:1.7;color:#6b7280;">If you did not request this sign-in, you can safely ignore this email and no changes will be made to your account.</p>
          <p style="margin:0;text-align:center;">
            ${buildPrimaryButton(buildAuthUrl('signin', normalizedEmail), 'Continue Sign-In')}
          </p>
        `
      })
    };
    
    let emailSent = false;
    try {
      await transporter.sendMail(mailOptions);
      emailSent = true;
      logSecurityEvent('otp_sent', { ip: clientIP, email: normalizedEmail, duration: Date.now() - startTime });
    } catch (emailError) {
      logSecurityEvent('email_send_failed', { ip: clientIP, email: normalizedEmail, error: emailError.code || 'unknown' });
    }
    
    res.json({ 
      success: true, 
      message: emailSent ? "OTP sent to your email" : "Request processed. If email exists, OTP will be sent.",
      expiresIn: "10 minutes"
    });
    
  } catch (error) {
    logSecurityEvent('otp_send_error', { ip: clientIP, error: error.code || 'unknown' });
    res.status(500).json({ success: false, message: "Failed to process request" });
  }
});

// Verify Email OTP
router.post('/verify-email-otp', async (req, res) => {
  const startTime = Date.now();
  const clientIP = extractClientIp(req);
  
  try {
    const { email, otp, asStaff } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP required" });
    }

    const otpRegex = /^\d{4}$/;
    if (!otpRegex.test(String(otp))) {
      return res.status(400).json({ success: false, message: "Invalid OTP format" });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "Invalid email address" });
    }
    
    // Simple non-transactional OTP verification for reliability
    let isValid = false;
    let currentAttempts = 0;
    
    const otpRecord = await OTP.findOne({ email: normalizedEmail });
    
    if (!otpRecord) {
      logSecurityEvent('otp_not_found', { ip: clientIP, email: normalizedEmail });
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
    
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ email: normalizedEmail });
      logSecurityEvent('otp_max_attempts', { ip: clientIP, email: normalizedEmail });
      return res.status(429).json({ success: false, message: "Too many failed attempts. Please request a new OTP." });
    }
    
    // Verify OTP
    try {
      isValid = safeVerifyOTP(otp, otpRecord.hashedOtp);
      currentAttempts = otpRecord.attempts;
    } catch (verifyError) {
      console.error('OTP verification error:', verifyError);
      logSecurityEvent('otp_verification_error', { ip: clientIP, email: normalizedEmail, error: verifyError.message });
      currentAttempts = otpRecord.attempts + 1;
      isValid = false;
    }
    
    if (!isValid) {
      await OTP.findOneAndUpdate(
        { email: normalizedEmail },
        { $inc: { attempts: 1 } }
      );
      currentAttempts += 1;
      logSecurityEvent('otp_invalid', { ip: clientIP, email: normalizedEmail, attempts: currentAttempts });
      return res.status(400).json({ 
        success: false, 
        message: "Invalid OTP"
      });
    }
    
    // Success - cleanup
    try {
      await Promise.all([
        OTP.deleteOne({ email: normalizedEmail }),
        EmailRateLimit.deleteOne({ email: normalizedEmail }),
        IpRateLimit.deleteOne({ ip: clientIP })
      ]);
    } catch (cleanupError) {
      console.error('Cleanup error (non-critical):', cleanupError);
    }
    
    logSecurityEvent('otp_verified', { ip: clientIP, email: normalizedEmail, duration: Date.now() - startTime });

    const role = asStaff === true ? 'staff' : 'customer';
    if (role === 'staff' && !isAuthorizedStaffEmail(normalizedEmail)) {
      logSecurityEvent('unauthorized_staff_access', { ip: clientIP, email: normalizedEmail });
      return res.status(403).json({ success: false, message: "Unauthorized staff login attempt" });
    }

    const generatedUid = generateUID();
    const safeName = normalizedEmail.split('@')[0] || 'Client';
    await createSession(req, res, {
      uid: generatedUid,
      email: normalizedEmail,
      name: safeName.charAt(0).toUpperCase() + safeName.slice(1),
      role
    });

    await upsertUserProfile({
      uid: generatedUid,
      email: normalizedEmail,
      name: safeName.charAt(0).toUpperCase() + safeName.slice(1),
      lastLoginAt: new Date(),
      lastLoginMethod: 'Email OTP',
      authProvider: 'Email OTP',
      lastLoginIp: clientIP,
      lastLoginTimeZone: req.body?.clientTimezone
    });

    sendLoginSuccessEmail({
      email: normalizedEmail,
      name: safeName.charAt(0).toUpperCase() + safeName.slice(1),
      loginMethod: 'Email OTP',
      authProvider: 'Email OTP',
      rememberDevice: false,
      clientIp: req.body?.clientIp || clientIP
    }, req).catch((error) => {
      console.error('otp login notification email error:', error);
    });
    
    res.json({ 
      success: true, 
      message: "OTP verified successfully",
      user: { uid: generatedUid, email: normalizedEmail, role }
    });
    
  } catch (error) {
    console.error('OTP verification endpoint error:', error);
    logSecurityEvent('otp_verify_error', { ip: clientIP, error: error.code || error.message || 'unknown' });
    res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
});

router.get('/staff-data', (req, res) => {
  if (!isAuthorizedStaff(req)) {
    logSecurityEvent('unauthorized_staff_access', { ip: extractClientIp(req) });
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }
  
  res.json({ success: true, message: "Staff data accessed" });
});

module.exports = router;
