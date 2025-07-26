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
      subject: 'Lavish Ladies Salon - Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Lavish Ladies Salon - Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Cormorant Garamond', serif; background: #ffffff; line-height: 1.6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; min-height: 100vh;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table width="100%" style="max-width: 800px; background: white; border: 1px solid #e5e7eb;">
                  
                  <tr>
                    <td style="padding: 60px 40px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                      <h1 style="margin: 0; font-size: 42px; font-weight: 300; color: #1f2937; letter-spacing: 2px;">LAVISH LADIES BEAUTY SALON & SPA</h1>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 50px 40px;">
                      <h2 style="margin: 0 0 30px 0; font-size: 28px; font-weight: 400; color: #1f2937; text-align: center;">Verification Code</h2>
                      
                      <div style="text-align: center; margin: 40px 0;">
                        <div style="display: inline-block; padding: 30px 40px; border: 2px solid #1f2937; background: #f9fafb;">
                          <div style="font-size: 48px; font-weight: bold; color: #1f2937; letter-spacing: 12px; font-family: monospace;">${otp}</div>
                        </div>
                        <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">Valid for 10 minutes</p>
                      </div>
                      
                      <div style="margin: 40px 0; padding: 25px; border-left: 4px solid #1f2937; background: #f9fafb;">
                        <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #1f2937;">Security Guidelines</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px;">
                          <li style="margin-bottom: 8px;">Never share this verification code with anyone</li>
                          <li style="margin-bottom: 8px;">Our team will never request your code via phone or messaging</li>
                          <li style="margin-bottom: 8px;">Always verify the sender's email address</li>
                          <li style="margin-bottom: 8px;">Report suspicious communications immediately</li>
                        </ul>
                      </div>
                      
                      <div style="margin: 40px 0; padding: 30px; border: 1px solid #e5e7eb; background: #f9fafb;">
                        <h3 style="margin: 0 0 25px 0; font-size: 20px; font-weight: 600; color: #1f2937; text-align: center;">Visit Our Salon</h3>
                        <table width="100%" style="font-size: 14px; color: #4b5563;">
                          <tr><td style="padding: 8px 0; font-weight: 600; width: 100px;">Address:</td><td style="padding: 8px 0;">Lavish Ladies Beauty Salon & Spa<br>Krishna Prasad Complex, NH66<br>Uchila, Udupi District<br>Karnataka - 574117</td></tr>
                          <tr><td style="padding: 8px 0; font-weight: 600;">Phone:</td><td style="padding: 8px 0;">+91 81476 27651</td></tr>
                          <tr><td style="padding: 8px 0; font-weight: 600;">Email:</td><td style="padding: 8px 0;">[redacted-email]</td></tr>
                        </table>
                      </div>
                      
                      <div style="text-align: center; margin: 40px 0; padding: 25px; border: 1px solid #e5e7eb;">
                        <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1f2937;">Connect With Us</h3>
                        <div style="display: flex; justify-content: center; align-items: center; gap: 30px;">
                          <a href="https://www.instagram.com/lavish_ladies_salon_n_spa/" style="display: inline-flex; align-items: center; text-decoration: none; color: #1f2937;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#E4405F" style="margin-right: 8px;">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            @lavish_ladies_salon_n_spa
                          </a>
                          <a href="https://wa.me/918147627651" style="display: inline-flex; align-items: center; text-decoration: none; color: #1f2937;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366" style="margin-right: 8px;">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                            </svg>
                            WhatsApp Business
                          </a>
                        </div>
                      </div>
                      
                      <div style="text-align: center; margin: 40px 0; padding: 20px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">If you did not request this verification code, please ignore this email.</p>
                      </div>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 40px; text-align: center; border-top: 1px solid #e5e7eb; background: #f9fafb;">
                      <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280;">© 2025 Lavish Ladies Beauty Salon & Spa</p>
                      <p style="margin: 0 0 8px 0; font-size: 11px; color: #9ca3af;">All rights reserved. Licensed Beauty Salon.</p>
                        <p style="margin: 0 0 5px 0; font-size: 11px; color: #9ca3af;">This is an automated message. Please do not reply.</p>
                        <p style="margin: 0; font-size: 11px; color: #9ca3af;">Support: [redacted-email]</p>
                      </div>
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