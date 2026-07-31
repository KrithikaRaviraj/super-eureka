const express = require('express');
const router = express.Router();
const User = require('../models/User');
require('dotenv').config();
const { buildEmailTemplate } = require('../utils/emailTemplate');
const { createMailTransport } = require('../utils/accountEmails');
const { upsertUserProfile } = require('../utils/userPersistence');

// Email configuration
const transporter = createMailTransport();

function buildDetailRow(label, value) {
  return `
    <tr>
      <td style="padding:13px 0;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:700;letter-spacing:0.4px;color:#6b7280;text-transform:uppercase;width:150px;vertical-align:top;">${label}</td>
      <td style="padding:13px 0;border-bottom:1px solid #e5e7eb;font-size:15px;line-height:1.6;color:#374151;">${value}</td>
    </tr>
  `;
}

// Save or update user
router.post('/', async (req, res) => {
  try {
    const { uid, name, email, phone, photoURL } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const user = await upsertUserProfile({
      uid,
      name: name || 'Client',
      email,
      phone,
      photoURL
    });
    
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
      html: buildEmailTemplate({
        title: 'Profile Updated',
        subtitle: 'Your account details were updated successfully.',
        contentHtml: `
          <p style="margin:0 0 18px 0;font-size:16px;line-height:1.7;color:#374151;">Hi ${name || 'there'}, this is a confirmation that your profile information was updated.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;padding:0 20px;">
            ${buildDetailRow('Updated Email', email)}
          </table>
          <div style="margin-top:20px;padding:18px 20px;background:#f9fafb;border:1px solid #e5e7eb;">
            <div style="font-size:14px;line-height:1.7;color:#4b5563;">If this was not you, contact us immediately at <strong style="color:#111827;">lavishladiessalonuchila@gmail.com</strong>.</div>
          </div>
        `
      })
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
