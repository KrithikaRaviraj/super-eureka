require('dotenv').config();
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const mongoose = require('mongoose');

// HTTPS enforcement with strict validation
router.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // Only trust req.secure (requires proper trust proxy configuration)
    if (!req.secure) {
      logSecurityEvent('https_required', { ip: normalizeIP(req) });
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
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; background: #f8fafc; font-family: 'Segoe UI', Arial, sans-serif; color: #111827;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc;">
            <tr>
              <td style="padding: 28px 16px;">
                <table width="100%" style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); overflow: hidden; border: 1px solid #e5e7eb;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 32px 32px 28px 32px; background: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%); color: #ffffff; text-align: left;">
                      <div style="font-size: 13px; letter-spacing: 1.2px; opacity: 0.9; text-transform: uppercase;">Lavish Ladies Salon & Spa</div>
                      <div style="font-size: 26px; font-weight: 700; margin-top: 6px;">Secure verification code</div>
                      <div style="font-size: 14px; opacity: 0.9; margin-top: 6px;">Use this one-time code to continue. Do not share it with anyone.</div>
                    </td>
                  </tr>

                  <!-- Code Block -->
                  <tr>
                    <td style="padding: 32px 32px 10px 32px;">
                      <div style="text-align: center; margin-bottom: 20px;">
                        <div style="display: inline-block; padding: 26px 44px; background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 12px;">
                          <span style="font-size: 46px; font-weight: 700; letter-spacing: 12px; font-family: 'Courier New', monospace; color: #be185d;">${otp}</span>
                        </div>
                        <p style="margin: 18px 0 6px 0; font-size: 14px; color: #4b5563;">This code expires in 10 minutes.</p>
                        <p style="margin: 0; font-size: 13px; color: #6b7280;">If you did not request this, please ignore this email.</p>
                      </div>

                      <div style="margin-top: 28px; padding: 18px 16px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #111827;">How to use your code</h3>
                        <ul style="margin: 0; padding-left: 18px; color: #4b5563; font-size: 14px; line-height: 1.6;">
                          <li>Enter this code on the verification screen within 10 minutes.</li>
                          <li>For your security, never share this code with anyone.</li>
                          <li>If you did not request this code, your account is still safe—no action is needed.</li>
                        </ul>
                      </div>
                    </td>
                  </tr>

                  <!-- Support + Compliance -->
                  <tr>
                    <td style="padding: 10px 32px 28px 32px;">
                      <div style="margin-top: 16px; padding: 16px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; font-size: 13px; color: #7c2d12;">
                        <strong style="display: block; margin-bottom: 6px; color: #7c2d12;">Why you received this email</strong>
                        A verification code was requested for this email address on Lavish Ladies Salon & Spa. If this wasn't you, ignore this message or contact us so we can help secure your account.
                      </div>

                      <div style="margin-top: 18px; text-align: center; font-size: 14px; color: #374151;">
                        Need help? Email us at <a href="mailto:[redacted-email]" style="color: #ec4899; text-decoration: none; font-weight: 600;">[redacted-email]</a>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 22px 32px 26px 32px; background: #f8fafc; text-align: center; border-top: 1px solid #e5e7eb;">
                      <div style="margin-bottom: 10px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/privacy" style="color: #6b7280; text-decoration: none; font-size: 12px; margin: 0 10px;">Privacy Policy</a>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/terms" style="color: #6b7280; text-decoration: none; font-size: 12px; margin: 0 10px;">Terms of Service</a>
                        <a href="mailto:[redacted-email]" style="color: #6b7280; text-decoration: none; font-size: 12px; margin: 0 10px;">Contact Support</a>
                      </div>
                      <p style="margin: 6px 0 0 0; font-size: 12px; color: #9ca3af;">© 2026 Lavish Ladies Beauty Salon & Spa. All rights reserved.</p>
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
    
    // Atomic OTP verification - single hash computation
    const session = await mongoose.startSession();
    let isValid = false;
    let currentAttempts = 0;
    
    try {
      await session.withTransaction(async () => {
        const otpRecord = await OTP.findOne({ email: normalizedEmail }).session(session);
        
        if (!otpRecord || otpRecord.attempts >= 3) {
          return;
        }
        
        isValid = safeVerifyOTP(otp, otpRecord.hashedOtp);
        currentAttempts = otpRecord.attempts;
        
        if (!isValid) {
          await OTP.updateOne(
            { email: normalizedEmail },
            { $inc: { attempts: 1 } },
            { session }
          );
          currentAttempts += 1;
        }
      });
    } finally {
      await session.endSession();
    }
    
    // Check if OTP exists and hasn't exceeded attempts
    const otpExists = currentAttempts > 0 || isValid;
    if (!otpExists) {
      logSecurityEvent('otp_not_found', { ip: clientIP, email: normalizedEmail });
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
    
    if (currentAttempts >= 3) {
      await OTP.deleteOne({ email: normalizedEmail });
      logSecurityEvent('otp_max_attempts', { ip: clientIP, email: normalizedEmail });
      return res.status(429).json({ success: false, message: "Too many failed attempts. Please request a new OTP." });
    }
    
    if (!isValid) {
      logSecurityEvent('otp_invalid', { ip: clientIP, email: normalizedEmail, attempts: currentAttempts });
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