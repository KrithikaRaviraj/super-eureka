const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { requireRole } = require('../middleware/auth');
const { buildEmailTemplate } = require('../utils/emailTemplate');
const { createMailTransport } = require('../utils/accountEmails');

const transporter = createMailTransport();

function buildDetailRow(label, value) {
  return `
    <tr>
      <td style="padding:12px 8px 12px 0;border-bottom:1px solid #e5e7eb;font-size:12px;font-weight:700;letter-spacing:0.4px;color:#6b7280;text-transform:uppercase;width:35%;max-width:160px;vertical-align:top;box-sizing:border-box;word-break:break-word;overflow-wrap:anywhere;">${label}</td>
      <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:15px;line-height:1.6;color:#374151;word-break:break-word;overflow-wrap:anywhere;box-sizing:border-box;">${value}</td>
    </tr>
  `;
}

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
          <p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:#374151;">Hi <strong>${name}</strong>, we received your message and our team will review it shortly.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;padding:0 16px;width:100%;box-sizing:border-box;">
            ${buildDetailRow('Subject', subject)}
            ${buildDetailRow('Email', email)}
            ${buildDetailRow('Phone', phone)}
          </table>
          <div style="margin-top:20px;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;box-sizing:border-box;">
            <div style="font-size:14px;line-height:1.7;color:#4b5563;">If your request is urgent, please call us directly at <strong style="color:#111827;">+91 81476 27651</strong>.</div>
          </div>
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
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;padding:0 16px;margin-bottom:20px;width:100%;box-sizing:border-box;">
            ${buildDetailRow('Name', name)}
            ${buildDetailRow('Email', email)}
            ${buildDetailRow('Phone', phone)}
            ${buildDetailRow('Subject', subject)}
          </table>
          <div style="padding:16px;background:#f9fafb;border:1px solid #e5e7eb;box-sizing:border-box;">
            <div style="font-size:12px;font-weight:700;letter-spacing:1px;color:#6b7280;text-transform:uppercase;margin-bottom:10px;">Message</div>
            <div style="font-size:15px;line-height:1.7;color:#374151;white-space:pre-wrap;">${message}</div>
          </div>
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
