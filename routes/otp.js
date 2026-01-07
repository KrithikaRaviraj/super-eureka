require('dotenv').config();
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const mongoose = require('mongoose');

// HTTPS enforcement with proper proxy trust check
router.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const isSecure = req.secure || req.get('x-forwarded-proto') === 'https' || req.get('x-forwarded-ssl') === 'on';
    if (!isSecure) {
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

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  hashedOtp: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: 600 }
});

const IpRateLimit = mongoose.model('IpRateLimit', ipRateLimitSchema);
const EmailRateLimit = mongoose.model('EmailRateLimit', emailRateLimitSchema);
const OTP = mongoose.model('OTP', otpSchema);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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
  return crypto.randomInt(100000, 999999).toString();
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

function normalizeIP(req) {
  const forwarded = req.get('x-forwarded-for') || req.get('x-real-ip');
  if (forwarded) {
    const ips = forwarded.split(',').map(ip => ip.trim());
    for (const ip of ips) {
      if (!ip.startsWith('10.') && !ip.startsWith('192.168.') && !ip.startsWith('172.')) {
        return ip;
      }
    }
    return ips[0];
  }
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
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
  const clientIP = normalizeIP(req);
  
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
      subject: 'Your Lavish Ladies Salon Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background: #ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <table width="100%" style="max-width: 700px; margin: auto; border: 1px solid #e5e7eb;">
                  <tr>
                    <td style="padding: 60px 40px; text-align: center; background: linear-gradient(135deg, #f9fafb, #f3f4f6);">
                      <h1 style="margin: 0; font-size: 36px; font-weight: 400; letter-spacing: 2px; color: #1f2937;">LAVISH LADIES SALON & SPA</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="text-align: center; font-size: 24px; margin-bottom: 30px;">Your Verification Code</h2>
                      <div style="text-align: center; margin-bottom: 40px;">
                        <div style="display: inline-block; padding: 30px 50px; background: #f9fafb; border: 2px solid #1f2937; border-radius: 8px;">
                          <span style="font-size: 48px; font-weight: bold; letter-spacing: 12px; font-family: monospace; color: #1f2937;">${otp}</span>
                        </div>
                        <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">This code is valid for 10 minutes.</p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: center; background: #f9fafb; padding: 30px;">
                      <p style="margin: 0; font-size: 12px; color: #6b7280;">© 2026 Lavish Ladies Beauty Salon & Spa</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
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
  const clientIP = normalizeIP(req);
  
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP required" });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Atomic OTP verification and attempt increment
    const otpRecord = await OTP.findOneAndUpdate(
      { email: normalizedEmail, attempts: { $lt: 3 } },
      { $inc: { attempts: 1 } },
      { new: false }
    );
    
    if (!otpRecord) {
      logSecurityEvent('otp_not_found_or_max_attempts', { ip: clientIP, email: normalizedEmail });
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
    
    const isValid = safeVerifyOTP(otp, otpRecord.hashedOtp);
    
    if (!isValid) {
      logSecurityEvent('otp_invalid', { ip: clientIP, email: normalizedEmail, attempts: otpRecord.attempts + 1 });
      return res.status(400).json({ 
        success: false, 
        message: "Invalid OTP"
      });
    }
    
    // Success - cleanup atomically
    await Promise.all([
      OTP.deleteOne({ email: normalizedEmail }),
      EmailRateLimit.deleteOne({ email: normalizedEmail }),
      IpRateLimit.deleteOne({ ip: clientIP })
    ]);
    
    logSecurityEvent('otp_verified', { ip: clientIP, email: normalizedEmail, duration: Date.now() - startTime });
    
    res.json({ 
      success: true, 
      message: "OTP verified successfully",
      user: { uid: generateUID(), email: normalizedEmail }
    });
    
  } catch (error) {
    logSecurityEvent('otp_verify_error', { ip: clientIP, error: error.code || 'unknown' });
    res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
});

router.get('/staff-data', (req, res) => {
  if (!isAuthorizedStaff(req)) {
    logSecurityEvent('unauthorized_staff_access', { ip: normalizeIP(req) });
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }
  
  res.json({ success: true, message: "Staff data accessed" });
});

module.exports = router;