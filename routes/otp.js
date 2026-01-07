require('dotenv').config();
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Trust proxy for proper IP detection
router.use((req, res, next) => {
  req.app.set('trust proxy', 1);
  next();
});

// HTTPS enforcement
router.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.status(403).json({ success: false, message: "HTTPS required" });
  }
  next();
});

const ipRateLimitSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: 3600 }
});

const emailRateLimitSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: 900 }
});

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
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

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

function hashOTP(otp) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(otp, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function safeVerifyOTP(otp, hashedOtp) {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const [salt, hash] = hashedOtp.split(':');
        const verifyHash = crypto.pbkdf2Sync(otp, salt, 10000, 64, 'sha512').toString('hex');
        resolve(hash === verifyHash);
      } catch {
        resolve(false);
      }
    }, 100); // Constant time delay
  });
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
  const forwarded = req.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection.remoteAddress || '127.0.0.1';
}

// Send Email OTP
router.post('/send-email-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const clientIP = normalizeIP(req);
    
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid email address required" 
      });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Atomic IP rate limiting
    const ipResult = await IpRateLimit.findOneAndUpdate(
      { ip: clientIP },
      { $inc: { attempts: 1 } },
      { upsert: true, new: true }
    );
    
    if (ipResult.attempts > 10) {
      return res.status(429).json({ 
        success: false, 
        message: "Too many requests from this IP. Please try again later." 
      });
    }
    
    // Atomic email rate limiting
    const emailResult = await EmailRateLimit.findOneAndUpdate(
      { email: normalizedEmail },
      { $inc: { attempts: 1 } },
      { upsert: true, new: true }
    );
    
    if (emailResult.attempts > 5) {
      return res.status(429).json({ 
        success: false, 
        message: "Too many requests. Please try again later." 
      });
    }
    
    await OTP.deleteMany({ email: normalizedEmail });
    
    const otp = generateOTP();
    const hashedOtp = hashOTP(otp);
    
    await new OTP({
      email: normalizedEmail,
      hashedOtp
    }).save();
    
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
    } catch (emailError) {
      console.error(`Email failed for ${normalizedEmail}:`, emailError.message);
    }
    
    res.json({ 
      success: true, 
      message: emailSent ? "OTP sent to your email" : "Request processed. If email exists, OTP will be sent.",
      expiresIn: "10 minutes"
    });
    
  } catch (error) {
    console.error('Send Email OTP error:', error);
    res.status(500).json({ success: false, message: "Failed to process request" });
  }
});

// Verify Email OTP
router.post('/verify-email-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP required" });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const otpRecord = await OTP.findOne({ email: normalizedEmail }).lean();
    
    if (!otpRecord) {
      // Constant time delay even for non-existent records
      await new Promise(resolve => setTimeout(resolve, 100));
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
    
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ email: normalizedEmail });
      return res.status(429).json({ success: false, message: "Too many failed attempts. Please request a new OTP." });
    }
    
    const isValid = await safeVerifyOTP(otp, otpRecord.hashedOtp);
    
    if (!isValid) {
      await OTP.updateOne({ email: normalizedEmail }, { $inc: { attempts: 1 } });
      return res.status(400).json({ 
        success: false, 
        message: "Invalid OTP"
      });
    }
    
    await OTP.deleteOne({ email: normalizedEmail });
    
    res.json({ 
      success: true, 
      message: "OTP verified successfully",
      user: { uid: generateUID(), email: normalizedEmail }
    });
    
  } catch (error) {
    console.error('Verify Email OTP error:', error);
    res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
});

router.get('/staff-data', (req, res) => {
  if (!isAuthorizedStaff(req)) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }
  
  res.json({ success: true, message: "Staff data accessed" });
});

module.exports = router;