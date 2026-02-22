const express = require('express');
const router = express.Router();
const User = require('../models/User');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Save or update user
router.post('/', async (req, res) => {
  try {
    const { uid, name, email, phone, photoURL } = req.body;
    
    // Check if user exists by uid
    let user = await User.findOne({ uid });
    
    if (user) {
      // Only update fields that are provided and not empty
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;
      if (photoURL && photoURL.trim() !== '') updateData.photoURL = photoURL;
      
      user = await User.findOneAndUpdate(
        { uid },
        updateData,
        { new: true }
      );
    } else {
      // Create new user - store phone OR email, not both
      const userData = {
        uid,
        name: name || 'Client',
        photoURL: photoURL || ''
      };
      
      if (phone) {
        userData.phone = phone;
        userData.email = null;
      } else if (email) {
        userData.email = email;
        userData.phone = null;
      }
      
      user = await User.create(userData);
    }
    
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/', async (req, res) => {
  const { email, phone, uid } = req.query;
  
  let user = null;
  
  if (uid) {
    user = await User.findOne({ uid });
  } else if (email) {
    user = await User.findOne({ email });
  } else if (phone) {
    user = await User.findOne({ phone });
  } else {
    return res.status(400).json({ error: "Email, phone, or uid required" });
  }
  
  res.json({ user });
});

// Send profile update email
router.post('/send-profile-update-email', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Profile Updated - Lavish Ladies Beauty Salon',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Profile Updated</title>
        </head>
        <body style="margin: 0; padding: 0; background: #fafaf9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #fafaf9;">
            <tr>
              <td style="padding: 28px 16px;">
                <table width="100%" style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); overflow: hidden; border: 1px solid #e5e7eb;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 32px 32px 28px 32px; background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); color: #ffffff; text-align: left;">
                      <div style="font-size: 13px; letter-spacing: 1.2px; opacity: 0.9; text-transform: uppercase;">Lavish Ladies Beauty Salon</div>
                      <div style="font-size: 26px; font-weight: 700; margin-top: 6px;">Profile Updated Successfully</div>
                      <div style="font-size: 14px; opacity: 0.9; margin-top: 6px;">Your account information has been updated.</div>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #374151;">
                        Hi ${name || 'there'},
                      </p>
                      <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">
                        Your profile has been successfully updated. If you did not make these changes, please contact us immediately at <a href="mailto:[redacted-email]" style="color: #e11d48; text-decoration: none; font-weight: 600;">[redacted-email]</a>.
                      </p>

                      <div style="margin: 24px 0; padding: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;">
                        <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #065f46;">Updated Information</h3>
                        <p style="margin: 0; font-size: 14px; color: #047857;">Email: <strong>${email}</strong></p>
                      </div>

                      <p style="margin: 24px 0 0 0; font-size: 14px; color: #6b7280;">
                        If you have any questions, please don't hesitate to reach out to our team.
                      </p>
                    </td>
                  </tr>

                  <!-- Support + Compliance -->
                  <tr>
                    <td style="padding: 10px 32px 28px 32px;">
                      <div style="margin-top: 16px; padding: 16px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; font-size: 13px; color: #7c2d12;">
                        <strong style="display: block; margin-bottom: 6px; color: #7c2d12;">Account Security</strong>
                        Please review your account settings regularly. Your account is important to us, and we take security seriously.
                      </div>

                      <div style="margin-top: 18px; text-align: center; font-size: 14px; color: #374151;">
                        Questions? Email us at <a href="mailto:[redacted-email]" style="color: #e11d48; text-decoration: none; font-weight: 600;">[redacted-email]</a>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 22px 32px 26px 32px; background: #fafaf9; text-align: center; border-top: 1px solid #e5e7eb;">
                      <div style="margin-bottom: 10px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/privacy" style="color: #6b7280; text-decoration: none; font-size: 12px; margin: 0 10px;">Privacy Policy</a>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/terms" style="color: #6b7280; text-decoration: none; font-size: 12px; margin: 0 10px;">Terms of Service</a>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/contact" style="color: #6b7280; text-decoration: none; font-size: 12px; margin: 0 10px;">Contact</a>
                      </div>
                      <p style="margin: 6px 0 0 0; font-size: 12px; color: #9ca3af;">&copy; 2026 Lavish Ladies Beauty Salon. All rights reserved.</p>
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
      res.json({ success: true, message: "Profile update email sent" });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({ success: false, message: "Failed to send email" });
    }
  } catch (error) {
    console.error('Profile update email error:', error);
    res.status(500).json({ success: false, message: "Failed to process request" });
  }
});

module.exports = router;
