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
  subject: 'Your Lavish Ladies Salon Verification Code',
  html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Verification Code - Lavish Ladies Salon</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; color: #1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; min-height: 100vh;">
      <tr>
        <td>
          <table width="100%" style="max-width: 700px; margin: auto; border: 1px solid #e5e7eb; background: #ffffff;">
            <tr>
              <td style="padding: 60px 40px; text-align: center; background: linear-gradient(135deg, #f9fafb, #f3f4f6); border-bottom: 1px solid #e5e7eb;">
                <h1 style="margin: 0; font-size: 36px; font-weight: 400; letter-spacing: 2px; color: #1f2937;">LAVISH LADIES SALON & SPA</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px;">
                <h2 style="text-align: center; font-size: 24px; font-weight: 500; margin-bottom: 30px;">Your Verification Code</h2>
                <div style="text-align: center; margin-bottom: 40px;">
                  <div style="display: inline-block; padding: 30px 50px; background: #f9fafb; border: 2px solid #1f2937; border-radius: 8px;">
                    <span style="font-size: 48px; font-weight: bold; letter-spacing: 12px; font-family: monospace; color: #1f2937;">${otp}</span>
                  </div>
                  <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">This code is valid for 10 minutes.</p>
                </div>

                <div style="margin-top: 40px; padding: 20px; background: #f9fafb; border-left: 4px solid #1f2937;">
                  <h3 style="margin-top: 0; font-size: 18px;">Security Tips</h3>
                  <ul style="padding-left: 20px; font-size: 14px; color: #4b5563;">
                    <li>Do not share this code with anyone.</li>
                    <li>We will never ask for your code via phone or message.</li>
                    <li>Always verify the sender's email.</li>
                    <li>Report suspicious activity immediately.</li>
                  </ul>
                </div>

                <div style="margin-top: 50px; padding: 25px; background: #f9fafb; border: 1px solid #e5e7eb;">
                  <h3 style="text-align: center; font-size: 18px;">Visit Our Salon</h3>
                  <table style="width: 100%; font-size: 14px; color: #4b5563;">
                    <tr><td style="font-weight: 600; padding: 6px 0;">Address:</td><td>Krishna Prasad Complex, NH66, Uchila, Udupi District, Karnataka - 574117</td></tr>
                    <tr><td style="font-weight: 600; padding: 6px 0;">Phone:</td><td>+91 81476 27651</td></tr>
                    <tr><td style="font-weight: 600; padding: 6px 0;">Email:</td><td>[redacted-email]</td></tr>
                  </table>
                </div>

                <div style="text-align: center; margin-top: 40px;">
                  <h3 style="font-size: 16px; margin-bottom: 15px;">Connect With Us</h3>
                  <a href="https://www.instagram.com/lavish_ladies_salon_n_spa/" style="margin: 0 15px; font-size: 14px; color: #1f2937; text-decoration: none;">Instagram</a>
                  |
                  <a href="https://wa.me/918147627651" style="margin: 0 15px; font-size: 14px; color: #1f2937; text-decoration: none;">WhatsApp</a>
                </div>

                <div style="margin-top: 50px; border-top: 1px solid #e5e7eb; text-align: center; padding-top: 20px;">
                  <p style="font-size: 14px; color: #6b7280;">If you did not request this verification code, please ignore this email.</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 13px; color: #6b7280;">© 2025 Lavish Ladies Beauty Salon & Spa. All rights reserved.</p>
                <p style="margin: 5px 0 0 0; font-size: 13px; color: #9ca3af;">This is an automated message — please do not reply.</p>
                <p style="margin: 0; font-size: 13px; color: #9ca3af;">Need help? Email us at <strong>[redacted-email]</strong></p>
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

// Send Staff OTP
router.post('/send-staff-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid email address required" 
      });
    }
    
    // Check if email is authorized for staff access
    const authorizedEmails = process.env.REACT_APP_AUTHORIZED_STAFF_EMAILS?.split(',') || [];
    if (!authorizedEmails.includes(email)) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized email address" 
      });
    }
    
    const otp = generateOTP();
    const expiryTime = Date.now() + 10 * 60 * 1000;
    
    // Store OTP with expiry
    otpStorage.set(`staff_${email}`, { otp, expiryTime });
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@lavishladies.com',
      to: email,
      subject: 'Staff Login OTP - Lavish Ladies Salon',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Staff Login OTP - Lavish Ladies Salon</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; color: #1f2937;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; min-height: 100vh;">
            <tr>
              <td>
                <table width="100%" style="max-width: 600px; margin: auto; border: 1px solid #e5e7eb; background: #ffffff;">
                  <tr>
                    <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #f9fafb, #f3f4f6); border-bottom: 1px solid #e5e7eb;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 400; letter-spacing: 2px; color: #1f2937;">LAVISH LADIES SALON</h1>
                      <p style="margin: 10px 0 0 0; font-size: 16px; color: #6b7280;">Staff Dashboard Access</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="text-align: center; font-size: 24px; font-weight: 500; margin-bottom: 30px;">Your Staff Login OTP</h2>
                      <div style="text-align: center; margin-bottom: 40px;">
                        <div style="display: inline-block; padding: 25px 40px; background: #f9fafb; border: 2px solid #1f2937; border-radius: 8px;">
                          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: monospace; color: #1f2937;">${otp}</span>
                        </div>
                        <p style="margin-top: 15px; font-size: 14px; color: #6b7280;">This code is valid for 10 minutes.</p>
                      </div>
                      
                      <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-left: 4px solid #1f2937;">
                        <h3 style="margin-top: 0; font-size: 16px;">Security Notice</h3>
                        <p style="margin: 0; font-size: 14px; color: #4b5563;">This OTP is for staff dashboard access only. Do not share this code with anyone.</p>
                      </div>
                      
                      <div style="margin-top: 40px; border-top: 1px solid #e5e7eb; text-align: center; padding-top: 20px;">
                        <p style="font-size: 14px; color: #6b7280;">If you did not request this OTP, please ignore this email.</p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: center; background: #f9fafb; padding: 20px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; font-size: 12px; color: #6b7280;">© 2025 Lavish Ladies Beauty Salon. All rights reserved.</p>
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
      console.log(`Staff OTP sent to ${email}: ${otp}`);
      
      res.json({ 
        success: true, 
        message: "OTP sent to your email"
      });
      
    } catch (emailError) {
      console.error('Staff email sending error:', emailError);
      console.log('\n=== EMAIL FAILED - USING CONSOLE OTP ===');
      console.log(`EMAIL: ${email}`);
      console.log(`OTP: ${otp}`);
      console.log('=== USE THIS OTP TO LOGIN ===\n');
      
      res.json({ 
        success: true, 
        message: "OTP sent successfully (check console)",
        otp: otp
      });
    }
    
  } catch (error) {
    console.error('Send Staff OTP error:', error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// Verify Staff OTP
router.post('/verify-staff-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP required" });
    }
    
    // Check if email is authorized for staff access
    const authorizedEmails = process.env.REACT_APP_AUTHORIZED_STAFF_EMAILS?.split(',') || [];
    if (!authorizedEmails.includes(email)) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized email address" 
      });
    }
    
    const storedData = otpStorage.get(`staff_${email}`);
    
    if (!storedData) {
      return res.status(400).json({ success: false, message: "OTP not found or expired" });
    }
    
    const { otp: storedOtp, expiryTime } = storedData;
    
    // Check if OTP expired
    if (Date.now() > expiryTime) {
      otpStorage.delete(`staff_${email}`);
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
    }
    
    // Verify OTP
    if (otp !== storedOtp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    
    // OTP verified successfully
    otpStorage.delete(`staff_${email}`);
    
    res.json({ 
      success: true, 
      message: "Staff login successful",
      staff: { email }
    });
    
  } catch (error) {
    console.error('Verify Staff OTP error:', error);
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