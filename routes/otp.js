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
                            @lavish_ladies_salon_n_spa
                          </a>
                          <a href="https://wa.me/918147627651" style="display: inline-flex; align-items: center; text-decoration: none; color: #1f2937;">
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
                      <p style="margin: 0 0 8px 0; font-size: 11px; color: #9ca3af;">All rights reserved.</p>
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

// Send profile update confirmation email
router.post('/send-profile-update-email', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid email address required" 
      });
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@lavishladies.com',
      to: email,
      subject: 'Profile Updated - Lavish Ladies Salon',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Profile Updated - Lavish Ladies Salon</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Cormorant Garamond', serif; background: #ffffff; line-height: 1.6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; min-height: 100vh;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table width="100%" style="max-width: 600px; background: white; border: 1px solid #e5e7eb;">
                  
                  <tr>
                    <td style="padding: 40px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                      <h1 style="margin: 0; font-size: 32px; font-weight: 300; color: #1f2937; letter-spacing: 2px;">LAVISH LADIES BEUATY SALON & SPA</h1>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 400; color: #1f2937;">Profile Updated Successfully</h2>
                      
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #4b5563;">Hello ${name || 'Valued User'},</p>
                      
                      <p style="margin: 0 0 20px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">Your profile has been successfully updated with this email address (${email}) at Lavish Ladies Beauty Salon & Spa.</p>
                      
                      <div style="margin: 30px 0; padding: 20px; background: #f9fafb; border-left: 4px solid #1f2937;">
                        <p style="margin: 0; font-size: 14px; color: #4b5563;">If you did not make this change, please contact us immediately at [redacted-email] or +91 81476 27651.</p>
                      </div>
                      
                      <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">Thank you for choosing Lavish Ladies Beauty Salon & Spa.</p>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; background: #f9fafb;">
                      <p style="margin: 0 0 5px 0; font-size: 12px; color: #6b7280;">© 2025 Lavish Ladies Beauty Salon & Spa</p>
                      <p style="margin: 0; font-size: 11px; color: #9ca3af;">This is an automated message. Please do not reply.</p>
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
      console.log(`Profile update email sent to ${email}`);
      
      res.json({ 
        success: true, 
        message: "Profile update confirmation sent"
      });
      
    } catch (emailError) {
      console.error('Profile update email error:', emailError);
      res.json({ 
        success: true, 
        message: "Profile updated successfully"
      });
    }
    
  } catch (error) {
    console.error('Send profile update email error:', error);
    res.status(500).json({ success: false, message: "Failed to send confirmation" });
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