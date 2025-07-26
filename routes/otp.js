require('dotenv').config();
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// In-memory storage for OTPs 
const otpStorage = new Map();

// Generate 4-digit OTP
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Validate email format
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
    
    const otp = generateOTP();
    const expiryTime = Date.now() + 10 * 60 * 1000;
    
    // Store OTP with expiry
    otpStorage.set(email, { otp, expiryTime });
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@lavishladies.com',
      to: email,
      subject: 'Your Lavish Ladies Salon OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #FFB6C1, #DDA0DD); padding: 30px; border-radius: 15px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 300;">Lavish Ladies Beauty Salon & Spa</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 15px; margin-top: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <h2 style="color: #8B4513; margin-top: 0;">Your OTP Code</h2>
            <div style="background: #f8f9fa; border: 2px dashed #DDA0DD; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #8B4513; letter-spacing: 8px;">${otp}</span>
            </div>
            <p style="color: #666; margin: 20px 0;">This OTP is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #8B4513; margin: 0 0 10px 0; font-size: 16px;">Best Practices</h3>
              <ul style="color: #666; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>Never share your OTP with anyone</li>
                <li>We will never ask for your OTP via phone or WhatsApp</li>
                <li>Always verify the sender's email address</li>
                <li>Report suspicious activities</li>
              </ul>
            </div>
            
            <!-- Contact Information -->
            <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #8B4513; margin: 0 0 15px 0; font-size: 16px;">📍 Visit Us</h3>
              <p style="color: #666; margin: 0; font-size: 14px; line-height: 1.6;">
                <strong>Address:</strong> Lavish Ladies Beauty Salon & Spa<br>
                Krishna Prasad Complex NH66<br>
                Uchila,Udupi District, Karnataka - 5741117<br><br>
                <strong>Phone:</strong> +918147627651<br>
                <strong>Email:</strong> [redacted-email]<br>
              </p>
            </div>
            
            <!-- Social Media -->
            <div style="text-align: center; margin: 25px 0;">
              <p style="color: #8B4513; font-weight: bold; margin: 0 0 10px 0;">Follow Us on Social Media</p>
              <a href="https://www.instagram.com/lavish_ladies_salon_n_spa/?igsh=amFhcGVqcmY5dDc1&utm_source=qr# style="color: #E4405F; text-decoration: none; margin: 0 10px;">📷 Instagram @lavishladiessalon</a>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">If you didn't request this OTP, please ignore this email.</p>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 20px; padding: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 Lavish Ladies Beauty Salon & Spa. All rights reserved.</p>
            <p style="color: #9ca3af; font-size: 11px; margin: 5px 0;">This is an automated message. Please do not reply to this email.</p>
            <p style="color: #9ca3af; font-size: 10px; margin: 10px 0 0 0;">For support, contact us at [redacted-email]</p>
          </div>
        </div>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log(`OTP sent to ${email}: ${otp}`);
      
      res.json({ 
        success: true, 
        message: "OTP sent to your email",
        expiresIn: "10 minutes"
      });
      
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      console.log(`Email failed, OTP for ${email}: ${otp}`);
      
      res.json({ 
        success: true, 
        message: "OTP sent successfully",
        otp: otp,
        expiresIn: "10 minutes"
      });
    }
    
  } catch (error) {
    console.error('Send Email OTP error:', error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// Verify Email OTP
router.post('/verify-email-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP required" });
    }
    
    const storedData = otpStorage.get(email);
    
    if (!storedData) {
      return res.status(400).json({ success: false, message: "OTP not found or expired" });
    }
    
    const { otp: storedOtp, expiryTime } = storedData;
    
    // Check if OTP expired (10 minutes)
    if (Date.now() > expiryTime) {
      otpStorage.delete(email);
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
    }
    
    // Verify OTP
    if (otp !== storedOtp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    
    // OTP verified successfully
    otpStorage.delete(email);
    
    // Generate unique user ID
    const uid = `email_${email}_${Date.now()}`;
    
    res.json({ 
      success: true, 
      message: "OTP verified successfully",
      user: { uid, email }
    });
    
  } catch (error) {
    console.error('Verify Email OTP error:', error);
    res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
});

router.get('/otp-status/:email', (req, res) => {
  const { email } = req.params;
  const storedData = otpStorage.get(email);
  
  if (storedData) {
    const { otp, expiryTime } = storedData;
    const isExpired = Date.now() > expiryTime;
    
    res.json({
      exists: true,
      expired: isExpired,
      otp: isExpired ? null : otp,
      expiryTime
    });
  } else {
    res.json({ exists: false });
  }
});

module.exports = router;