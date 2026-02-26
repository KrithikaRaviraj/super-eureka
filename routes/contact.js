const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const ContactMessage = require('../models/ContactMessage');
const { requireRole } = require('../middleware/auth');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'noreply@lavishladies.com',
    pass: process.env.EMAIL_PASS || ''
  }
});

// Submit contact form
router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || String(name).length > 100 || String(subject).length > 150 || String(message).length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact form input'
      });
    }

    // Create new contact message
    const contactMessage = new ContactMessage({
      name,
      email,
      phone,
      subject,
      message,
      status: 'new'
    });

    await contactMessage.save();

    // Send confirmation email to user
    const userMailOptions = {
      from: process.env.EMAIL_USER || 'noreply@lavishladies.com',
      to: email,
      subject: 'We Received Your Message - Lavish Ladies Beauty Salon',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Message Received - Lavish Ladies Beauty Salon</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fafaf9; line-height: 1.6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #fafaf9; min-height: 100vh;">
            <tr>
              <td style="padding: 40px 20px;">
                <table width="600" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px; background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); color: white; text-align: center;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 700; font-family: 'Cormorant Garamond', serif;">LAVISH LADIES</h1>
                      <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Beauty Salon</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #1f2937; font-family: 'Cormorant Garamond', serif;">Thank You for Reaching Out!</h2>
                      <p style="margin: 0 0 20px 0; font-size: 15px; color: #4b5563; line-height: 1.7;">
                        Hi <strong>${name}</strong>,
                      </p>
                      <p style="margin: 0 0 20px 0; font-size: 15px; color: #4b5563; line-height: 1.7;">
                        We have received your inquiry regarding <strong>${subject}</strong> and appreciate you contacting us. Our team will review your message and get back to you within 24 hours at the phone number or email address you provided.
                      </p>

                      <div style="margin: 28px 0; padding: 20px; background: #fff1f2; border-left: 4px solid #f43f5e; border-radius: 8px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #9f1239; font-weight: 600;">Your Contact Information</h3>
                        <p style="margin: 0 0 6px 0; font-size: 13px; color: #9f1239;"><strong>Email:</strong> ${email}</p>
                        <p style="margin: 0 0 6px 0; font-size: 13px; color: #9f1239;"><strong>Phone:</strong> ${phone}</p>
                        <p style="margin: 0; font-size: 13px; color: #9f1239;"><strong>Subject:</strong> ${subject}</p>
                      </div>

                      <p style="margin: 20px 0 0 0; font-size: 15px; color: #4b5563; line-height: 1.7;">
                        If you have any urgent concerns, please don't hesitate to call us directly.
                      </p>

                      <div style="margin: 20px 0 0 0; padding: 16px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 10px;">
                        <p style="margin: 0 0 8px 0; font-size: 13px; color: #9f1239; font-weight: 600;">Direct Salon Contact</p>
                        <p style="margin: 0 0 6px 0; font-size: 13px; color: #9f1239;">
                          Email: <a href="mailto:lavishladiessalonuchila@gmail.com" style="color: #e11d48; text-decoration: none; font-weight: 600;">lavishladiessalonuchila@gmail.com</a>
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #9f1239;">
                          Phone: <a href="tel:+918147627651" style="color: #e11d48; text-decoration: none; font-weight: 600;">+91 8147627651</a>
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Trust & Compliance -->
                  <tr>
                    <td style="padding: 0 40px 28px 40px;">
                      <div style="margin-top: 20px; padding: 16px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 12px; color: #6b7280; line-height: 1.6;">
                        Your privacy is important to us. For more information about how we handle your data, please review our <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/privacy" style="color: #f43f5e; text-decoration: none;">Privacy Policy</a> and <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/terms" style="color: #f43f5e; text-decoration: none;">Terms of Service</a>.
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; background: #fafaf9; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
                      <div style="margin-bottom: 12px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/privacy" style="color: #6b7280; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
                        <span style="color: #d1d5db;">|</span>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/terms" style="color: #6b7280; text-decoration: none; margin: 0 10px;">Terms of Service</a>
                        <span style="color: #d1d5db;">|</span>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/contact" style="color: #6b7280; text-decoration: none; margin: 0 10px;">Contact</a>
                      </div>
                      <p style="margin: 6px 0 0 0;">&copy; 2026 Lavish Ladies Beauty Salon. All rights reserved.</p>
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

    // Send admin notification
    const adminMailOptions = {
      from: process.env.EMAIL_USER || 'noreply@lavishladies.com',
      to: process.env.ADMIN_EMAIL || 'lavishladiessalonuchila@gmail.com',
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Message - Admin</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fafaf9;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #fafaf9;">
            <tr>
              <td style="padding: 20px;">
                <table width="600" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 24px; background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); color: white;">
                      <h2 style="margin: 0; font-size: 20px; letter-spacing: 0.3px;">NEW CONTACT MESSAGE</h2>
                      <p style="margin: 6px 0 0 0; font-size: 12px; opacity: 0.9;">Lavish Ladies Beauty Salon</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 24px;">
                      <p style="margin: 0 0 12px 0; color: #374151;"><strong>Name:</strong> ${name}</p>
                      <p style="margin: 0 0 12px 0; color: #374151;"><strong>Email:</strong> ${email}</p>
                      <p style="margin: 0 0 12px 0; color: #374151;"><strong>Phone:</strong> ${phone}</p>
                      <p style="margin: 0 0 12px 0; color: #374151;"><strong>Subject:</strong> ${subject}</p>
                      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;">
                      <p style="margin: 0 0 12px 0; color: #374151;"><strong>Message:</strong></p>
                      <p style="margin: 0; color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 16px 24px; background: #fafaf9; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
                      <p style="margin: 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/privacy" style="color: #1f2937; text-decoration: none; margin-right: 12px;">Privacy</a>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/terms" style="color: #1f2937; text-decoration: none;">Terms</a>
                      </p>
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
      await transporter.sendMail(userMailOptions);
      await transporter.sendMail(adminMailOptions);
      console.log('Contact confirmation emails sent');
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Contact message received successfully'
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form'
    });
  }
});

// Get all contact messages (for admin)
router.get('/messages', requireRole('staff'), async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages'
    });
  }
});

module.exports = router;
