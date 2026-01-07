require('dotenv').config();
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Rate limiting schema
const rateLimitSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  attempts: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now, expires: 900 } // 15 minutes
});

// OTP Schema with TTL only
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  hashedOtp: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: 600 } // 10 minutes TTL
});

const RateLimit = mongoose.model('RateLimit', rateLimitSchema);
const OTP = mongoose.model('OTP', otpSchema);

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
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

function verifyOTP(otp, hashedOtp) {
  const [salt, hash] = hashedOtp.split(':');
  const verifyHash = crypto.pbkdf2Sync(otp, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
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
  return authHeader === process.env.STAFF_SECRET_KEY;
}

// Send Email OTP
router.post('/send-email-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid email address required" 
      });
    }
    
    // Rate limiting check
    const rateLimit = await RateLimit.findOne({ email }).lean();
    if (rateLimit && rateLimit.attempts >= 5) {
      return res.status(429).json({ 
        success: false, 
        message: "Too many requests. Please try again later." 
      });
    }
    
    // Update rate limit
    await RateLimit.findOneAndUpdate(
      { email },
      { $inc: { attempts: 1 } },
      { upsert: true }
    );
    
    // Delete existing OTP
    await OTP.deleteMany({ email });
    
    const otp = generateOTP();
    const hashedOtp = hashOTP(otp);
    
    await new OTP({
      email,
      hashedOtp
    }).save();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@lavishladies.com',
      to: email,
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
    
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }
    
    // Always return success to prevent email enumeration
    res.json({ 
      success: true, 
      message: "If the email exists, an OTP has been sent",
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
    
    const otpRecord = await OTP.findOne({ email }).lean();
    
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
    
    // Check attempt limit
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ email });
      return res.status(429).json({ success: false, message: "Too many failed attempts. Please request a new OTP." });
    }
    
    // Verify OTP
    if (!verifyOTP(otp, otpRecord.hashedOtp)) {
      await OTP.updateOne({ email }, { $inc: { attempts: 1 } });
      return res.status(400).json({ 
        success: false, 
        message: "Invalid OTP"
      });
    }
    
    // Success
    await OTP.deleteOne({ email });
    
    res.json({ 
      success: true, 
      message: "OTP verified successfully",
      user: { uid: generateUID(), email }
    });
    
  } catch (error) {
    console.error('Verify Email OTP error:', error);
    res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
});

// Staff-only route
router.get('/staff-data', (req, res) => {
  if (!isAuthorizedStaff(req)) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }
  
  res.json({ success: true, message: "Staff data accessed" });
});

module.exports = router;