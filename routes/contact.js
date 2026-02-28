const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const ContactMessage = require('../models/ContactMessage');
const { requireRole } = require('../middleware/auth');
const { buildEmailTemplate } = require('../utils/emailTemplate');

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
      html: buildEmailTemplate({
        title: 'Message Received',
        subtitle: 'Thank you for contacting us. Our team will respond within 24 hours.',
        contentHtml: `
          <p style="margin:0 0 14px 0;font-size:15px;color:#4b5563;">Hi <strong>${name}</strong>,</p>
          <p style="margin:0 0 14px 0;font-size:15px;color:#4b5563;">
            We received your inquiry about <strong>${subject}</strong>.
          </p>
          <p style="margin:0 0 8px 0;font-size:14px;color:#4b5563;"><strong>Email:</strong> ${email}</p>
          <p style="margin:0 0 8px 0;font-size:14px;color:#4b5563;"><strong>Phone:</strong> ${phone}</p>
          <p style="margin:0;font-size:14px;color:#6b7280;">If urgent, call us at +91 8147627651.</p>
        `
      })
    };

    // Send admin notification
    const adminMailOptions = {
      from: process.env.EMAIL_USER || 'noreply@lavishladies.com',
      to: process.env.ADMIN_EMAIL || 'lavishladiessalonuchila@gmail.com',
      subject: `New Contact Form Submission: ${subject}`,
      html: buildEmailTemplate({
        title: 'New Contact Message',
        subtitle: 'A customer submitted a new inquiry.',
        contentHtml: `
          <p style="margin:0 0 10px 0;color:#374151;"><strong>Name:</strong> ${name}</p>
          <p style="margin:0 0 10px 0;color:#374151;"><strong>Email:</strong> ${email}</p>
          <p style="margin:0 0 10px 0;color:#374151;"><strong>Phone:</strong> ${phone}</p>
          <p style="margin:0 0 10px 0;color:#374151;"><strong>Subject:</strong> ${subject}</p>
          <p style="margin:12px 0 6px 0;color:#374151;"><strong>Message:</strong></p>
          <p style="margin:0;color:#4b5563;line-height:1.6;white-space:pre-wrap;">${message}</p>
        `
      })
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
