require('dotenv').config();
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const Feedback = require('../models/Feedback');
const servicePricing = require('../config/servicePricing');
const { requireAuth, requireRole } = require('../middleware/auth');
const { buildEmailTemplate } = require('../utils/emailTemplate');
const { createMailTransport } = require('../utils/accountEmails');

const STAFF_APPOINTMENT_RECIPIENTS = [
  'kavithasaliank@gmail.com',
  'saliankrithika1@gmail.com',
  'lavishladiessalonuchila@gmail.com'
];

function formatAppointmentDate(dateValue) {
  return new Date(dateValue).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function escapeHtml(value = '') {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildDetailRow(label, value, emphasize = false) {
  return `
    <tr>
      <td style="padding:12px 8px 12px 0;border-bottom:1px solid #e5e7eb;font-size:12px;font-weight:700;letter-spacing:0.4px;color:#6b7280;text-transform:uppercase;width:35%;max-width:160px;vertical-align:top;box-sizing:border-box;word-break:break-word;overflow-wrap:anywhere;">${label}</td>
      <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:15px;line-height:1.6;color:${emphasize ? '#111827' : '#374151'};font-weight:${emphasize ? '700' : '500'};word-break:break-word;overflow-wrap:anywhere;box-sizing:border-box;">${value}</td>
    </tr>
  `;
}

function buildPrimaryButton(href, label, background = '#111827') {
  return `
    <a href="${href}" style="display:inline-block;background:${background};color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:0.2px;max-width:100%;box-sizing:border-box;word-break:break-word;">${label}</a>
  `;
}

// Email configuration
const transporter = createMailTransport();

// Helper: Send Customer Appointment Request Email (Pending Review)
async function sendCustomerRequestEmail(appointment) {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@lavishladies.com',
    to: appointment.userEmail,
    subject: 'Appointment Request Received - Lavish Ladies Beauty Salon',
    html: buildEmailTemplate({
      title: 'Appointment Request Received',
      subtitle: 'Your appointment request has been received. Our staff will review your requested date and time.',
      contentHtml: `
        <p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:#374151;">Dear <strong>${appointment.userName}</strong>, thank you for choosing Lavish Ladies Beauty Salon.</p>
        <p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:#374151;">Your appointment request has been received. Our staff will review your requested date and time. Once a staff member confirms your appointment, you will receive a separate confirmation email.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;padding:0 16px;width:100%;box-sizing:border-box;">
          ${buildDetailRow('Service', appointment.service, true)}
          ${buildDetailRow('Requested Date', formatAppointmentDate(appointment.date))}
          ${buildDetailRow('Requested Time', appointment.time)}
          ${buildDetailRow('Status', '<span style="display:inline-block;padding:3px 8px;background:#fef3c7;color:#92400e;border-radius:4px;font-size:12px;font-weight:700;">Pending Review</span>')}
          ${appointment.price ? buildDetailRow('Estimated Price', `Rs. ${appointment.price}`, true) : ''}
          ${appointment.notes ? buildDetailRow('Notes', appointment.notes) : ''}
        </table>
        <div style="margin-top:20px;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;box-sizing:border-box;word-break:break-word;overflow-wrap:anywhere;">
          <div style="font-size:12px;font-weight:700;letter-spacing:1px;color:#6b7280;text-transform:uppercase;margin-bottom:6px;">Salon Location & Contact</div>
          <div style="font-size:14px;line-height:1.7;color:#4b5563;">
            Krishna Prasad Complex, NH66, Uchila, Udupi District, Karnataka - 574117<br/>
            Phone: <strong style="color:#111827;">+91 81476 27651</strong>
          </div>
        </div>
      `
    })
  };

  await transporter.sendMail(mailOptions);
  console.log(`Customer request email sent to ${appointment.userEmail}`);
}

// Helper: Send Staff Appointment Approval/Review Email (To all 3 staff members)
async function sendStaffAppointmentReviewEmails(appointment) {
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
  const acceptUrl = `${frontendUrl}/appointment-decision/${appointment.approvalToken}?action=accept`;
  const rejectUrl = `${frontendUrl}/appointment-decision/${appointment.approvalToken}?action=reject`;

  const staffRecipients = process.env.APPROVAL_EMAILS
    ? process.env.APPROVAL_EMAILS.split(',').map(e => e.trim()).filter(Boolean)
    : STAFF_APPOINTMENT_RECIPIENTS;

  for (const staffEmail of staffRecipients) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@lavishladies.com',
        to: staffEmail,
        subject: `New Appointment Request: ${appointment.service} - ${appointment.userName}`,
        html: buildEmailTemplate({
          title: 'New Appointment Request',
          subtitle: 'A new customer appointment request requires staff review and confirmation.',
          contentHtml: `
            <p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:#374151;">A new appointment request has been submitted by <strong>${appointment.userName}</strong>. Please accept or reject below:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;padding:0 16px;margin-bottom:20px;width:100%;box-sizing:border-box;">
              ${buildDetailRow('Customer Name', appointment.userName)}
              ${buildDetailRow('Customer Email', appointment.userEmail)}
              ${buildDetailRow('Customer Phone', appointment.userPhone || 'Not provided')}
              ${buildDetailRow('Service', appointment.service, true)}
              ${buildDetailRow('Requested Date', formatAppointmentDate(appointment.date))}
              ${buildDetailRow('Requested Time', appointment.time)}
              ${buildDetailRow('Price', appointment.price ? `Rs. ${appointment.price}` : 'Rs. 0')}
              ${buildDetailRow('Notes', appointment.notes || 'None')}
              ${buildDetailRow('Reference ID', String(appointment._id))}
            </table>
            <div style="margin:20px 0;text-align:center;">
              ${buildPrimaryButton(acceptUrl, 'Accept Appointment', '#059669')}
              <span style="display:inline-block;width:12px;height:12px;"></span>
              ${buildPrimaryButton(rejectUrl, 'Reject Appointment', '#dc2626')}
            </div>
            <p style="margin:16px 0 0 0;font-size:13px;line-height:1.6;color:#6b7280;text-align:center;">
              Clicking Accept will immediately confirm the booking and send a confirmation email to the customer. Rejecting will prompt for a reason before notifying the customer.
            </p>
          `
        })
      };

      await transporter.sendMail(mailOptions);
      console.log(`Staff appointment review email sent to ${staffEmail}`);
    } catch (err) {
      console.error(`Failed to send staff appointment email to ${staffEmail}:`, err);
    }
  }
}

// Helper: Send Customer Confirmation Email (Confirmed by Staff)
async function sendCustomerConfirmationEmail(appointment) {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@lavishladies.com',
    to: appointment.userEmail,
    subject: 'Appointment Confirmed - Lavish Ladies Beauty Salon',
    html: buildEmailTemplate({
      title: 'Appointment Confirmed',
      subtitle: 'Your appointment has been confirmed by our staff. We look forward to seeing you.',
      contentHtml: `
        <p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:#374151;">Dear <strong>${appointment.userName}</strong>, your appointment has been confirmed by our staff. We look forward to welcoming you to the salon.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;padding:0 16px;width:100%;box-sizing:border-box;">
          ${buildDetailRow('Service', appointment.service, true)}
          ${buildDetailRow('Confirmed Date', formatAppointmentDate(appointment.date))}
          ${buildDetailRow('Confirmed Time', appointment.time)}
          ${buildDetailRow('Status', '<span style="display:inline-block;padding:3px 8px;background:#d1fae5;color:#065f46;border-radius:4px;font-size:12px;font-weight:700;">Confirmed</span>')}
          ${appointment.price ? buildDetailRow('Price', `Rs. ${appointment.price}`, true) : ''}
          ${appointment.notes ? buildDetailRow('Notes', appointment.notes) : ''}
        </table>
        <div style="margin-top:20px;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;box-sizing:border-box;word-break:break-word;overflow-wrap:anywhere;">
          <div style="font-size:12px;font-weight:700;letter-spacing:1px;color:#6b7280;text-transform:uppercase;margin-bottom:6px;">Arrival & Check-in Details</div>
          <div style="font-size:14px;line-height:1.7;color:#4b5563;">
            Please arrive 10 minutes early for a smooth check-in. If you need to make any changes or reschedule, please contact us at <strong style="color:#111827;">+91 81476 27651</strong>.<br/>
            Location: Krishna Prasad Complex, NH66, Uchila, Udupi District, Karnataka - 574117
          </div>
        </div>
      `
    })
  };

  await transporter.sendMail(mailOptions);
  console.log(`Confirmation email sent to ${appointment.userEmail}`);
}

// Helper: Send Customer Rejection Email (Declined with Reason)
async function sendCustomerRejectionEmail(appointment, reason) {
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
  const bookAgainUrl = `${frontendUrl}/book-appointment`;

  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@lavishladies.com',
    to: appointment.userEmail,
    subject: 'Update on Your Appointment Request - Lavish Ladies Beauty Salon',
    html: buildEmailTemplate({
      title: 'Appointment Request Update',
      subtitle: 'We are unable to confirm your requested appointment time.',
      contentHtml: `
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#374151;">Dear <strong>${appointment.userName}</strong>,</p>
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#374151;">We're sorry, but we were unable to confirm your appointment for <strong>${formatAppointmentDate(appointment.date)}</strong> at <strong>${appointment.time}</strong>.</p>
        
        <div style="margin:18px 0;padding:16px;background:#fef2f2;border:1px solid #fecaca;border-radius:6px;box-sizing:border-box;word-break:break-word;overflow-wrap:anywhere;">
          <div style="font-size:12px;font-weight:700;letter-spacing:1px;color:#991b1b;text-transform:uppercase;margin-bottom:6px;">Reason</div>
          <div style="font-size:15px;line-height:1.6;color:#b91c1c;font-weight:600;">${escapeHtml(reason)}</div>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;padding:0 16px;margin-bottom:20px;width:100%;box-sizing:border-box;">
          ${buildDetailRow('Service', appointment.service)}
          ${buildDetailRow('Requested Date', formatAppointmentDate(appointment.date))}
          ${buildDetailRow('Requested Time', appointment.time)}
          ${buildDetailRow('Status', '<span style="display:inline-block;padding:3px 8px;background:#fee2e2;color:#991b1b;border-radius:4px;font-size:12px;font-weight:700;">Declined</span>')}
        </table>

        <p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:#4b5563;">
          Please feel free to choose another available date or time that suits your schedule. We would love the opportunity to welcome you.
        </p>
        <div style="margin:20px 0;text-align:center;">
          ${buildPrimaryButton(bookAgainUrl, 'Book Another Date / Time', '#111827')}
        </div>
        <p style="margin:16px 0 0 0;font-size:13px;line-height:1.6;color:#6b7280;text-align:center;">
          If you have questions, please contact us at +91 81476 27651 or reply to this email.
        </p>
      `
    })
  };

  await transporter.sendMail(mailOptions);
  console.log(`Rejection email sent to ${appointment.userEmail}`);
}

// Create appointment
router.post('/', async (req, res) => {
  try {
    const { service, date, time, phone, notes, userEmail, userName, userPhone } = req.body;
    
    if (!service || !date || !time || !userEmail || !userName || !(phone || userPhone)) {
      return res.status(400).json({ 
        success: false, 
        message: "All required fields must be provided" 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const parsedDate = new Date(date);
    if (!emailRegex.test(String(userEmail)) || Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment input"
      });
    }

    if (String(service).length > 120 || String(userName).length > 120 || String(notes || '').length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Input exceeds allowed length"
      });
    }

    const approvalToken = crypto.randomBytes(32).toString('hex');

    const appointment = new Appointment({
      service,
      date,
      time,
      notes: notes || '',
      userEmail,
      userName,
      userPhone: phone || userPhone,
      status: 'pending',
      approvalToken,
      price: servicePricing[service] || 0,
      paymentStatus: 'pending'
    });

    await appointment.save();
    
    const googleCalendarUrl = generateGoogleCalendarUrl(appointment);

    // Send customer request email and staff review emails in background
    Promise.all([
      sendCustomerRequestEmail(appointment).catch(err => console.error('Customer request email error:', err)),
      sendStaffAppointmentReviewEmails(appointment).catch(err => console.error('Staff appointment review email error:', err))
    ]).catch(err => console.error('Appointment email dispatch error:', err));

    res.json({
      success: true,
      message: "Appointment request received successfully",
      appointment,
      ...(googleCalendarUrl && { googleCalendarUrl })
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ success: false, message: "Failed to book appointment" });
  }
});

// Generate Google Calendar URL
function generateGoogleCalendarUrl(appointment) {
  try {
    const appointmentDate = new Date(appointment.date);
    const time24 = convertTo24Hour(appointment.time);
    
    if (!time24) {
      console.error('Invalid time format:', appointment.time);
      return null;
    }
    
    const [hours, minutes] = time24.split(':');
    const startDate = new Date(appointmentDate);
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
    
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${appointment.service} - Lavish Ladies Beauty Salon`,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: `Service: ${appointment.service}\\nSalon: Lavish Ladies Beauty Salon \\nAddress: Krishna Prasad Complex, NH66, Uchila, Udupi District, Karnataka - 574117\\nPhone: +91 81476 27651`,
      location: 'Krishna Prasad Complex, NH66, Uchila, Udupi District, Karnataka - 574117'
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  } catch (error) {
    console.error('Error generating Google Calendar URL:', error);
    return null;
  }
}

// Convert 12-hour time to 24-hour format
function convertTo24Hour(time12h) {
  try {
    if (!time12h || typeof time12h !== 'string') {
      return null;
    }
    
    const timeParts = time12h.trim().split(' ');
    if (timeParts.length !== 2) {
      return null;
    }
    
    const [time, modifier] = timeParts;
    const [hours, minutes] = time.split(':');
    
    if (!hours || !minutes || !modifier) {
      return null;
    }
    
    let hour24 = parseInt(hours, 10);
    
    if (modifier.toUpperCase() === 'AM') {
      if (hour24 === 12) hour24 = 0;
    } else if (modifier.toUpperCase() === 'PM') {
      if (hour24 !== 12) hour24 += 12;
    } else {
      return null;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  } catch (error) {
    console.error('Error converting time:', error);
    return null;
  }
}

// Get user appointments
router.get('/user/:email', requireAuth, async (req, res) => {
  try {
    const { email } = req.params;
    const isStaff = req.auth?.role === 'staff';
    if (!isStaff && req.auth?.email !== email) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const userAppointments = await Appointment.find({ userEmail: email }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      appointments: userAppointments
    });

  } catch (error) {
    console.error('Get user appointments error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch appointments" });
  }
});

// Get all appointments (for staff)
router.get('/all', requireRole('staff'), async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      appointments
    });

  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch appointments" });
  }
});

// Update appointment (full edit)
router.put('/:id', requireRole('staff'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, service, date, time, userName, userEmail, userPhone, notes, price } = req.body;
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    const previousStatus = appointment.status;

    // Update all provided fields
    if (status !== undefined) appointment.status = status;
    if (service !== undefined) appointment.service = service;
    if (date !== undefined) appointment.date = date;
    if (time !== undefined) appointment.time = time;
    if (userName !== undefined) appointment.userName = userName;
    if (userEmail !== undefined) appointment.userEmail = userEmail;
    if (userPhone !== undefined) appointment.userPhone = userPhone;
    if (notes !== undefined) appointment.notes = notes;
    if (price !== undefined) appointment.price = price;
    if (req.body.rejectionReason !== undefined) appointment.rejectionReason = req.body.rejectionReason;
    
    if (status === 'completed' && !appointment.feedbackToken) {
      appointment.feedbackToken = crypto.randomBytes(32).toString('hex');
    }
    
    await appointment.save();

    // Send confirmation email if newly confirmed
    if (status === 'confirmed' && previousStatus !== 'confirmed') {
      try {
        await sendCustomerConfirmationEmail(appointment);
      } catch (emailError) {
        console.error('Confirmation email sending error:', emailError);
      }
    }

    // Send rejection email if newly cancelled/rejected
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      try {
        await sendCustomerRejectionEmail(appointment, appointment.rejectionReason || 'Declined by salon staff');
      } catch (emailError) {
        console.error('Rejection email sending error:', emailError);
      }
    }
    
    // Send feedback form when appointment is completed
    if (status === 'completed') {
      const feedbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/feedback/${appointment.feedbackToken}`;
      
      const feedbackMailOptions = {
        from: process.env.EMAIL_USER || 'noreply@lavishladies.com',
        to: appointment.userEmail,
        subject: 'Share Your Experience - Lavish Ladies Beauty Salon',
        html: buildEmailTemplate({
          title: 'Share Your Experience',
          subtitle: 'Thank you for visiting us. Your feedback helps us improve the experience we provide.',
          contentHtml: `
            <p style="margin:0 0 16px 0;font-size:16px;line-height:1.7;color:#374151;">Dear <strong>${appointment.userName}</strong>, thank you for choosing Lavish Ladies Beauty Salon for your <strong>${appointment.service}</strong>.</p>
            <div style="margin:0 0 20px 0;padding:16px;background:#ffffff;border:1px solid #e5e7eb;box-sizing:border-box;word-break:break-word;overflow-wrap:anywhere;">
              <div style="font-size:12px;font-weight:700;letter-spacing:1px;color:#6b7280;text-transform:uppercase;margin-bottom:8px;">Visit Summary</div>
              <div style="font-size:15px;line-height:1.7;color:#374151;word-break:break-word;overflow-wrap:anywhere;">${formatAppointmentDate(appointment.date)} at ${appointment.time}</div>
            </div>
            <p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:#4b5563;">If you have 2 minutes, we would love to hear how your visit went.</p>
            <p style="margin:0 0 18px 0;text-align:center;">
              ${buildPrimaryButton(feedbackUrl, 'Share Feedback')}
            </p>
            <p style="margin:0;font-size:13px;line-height:1.7;color:#6b7280;text-align:center;">Your feedback is reviewed personally and helps us refine the experience for every guest.</p>
          `
        })
      };
      try {
        await transporter.sendMail(feedbackMailOptions);
        console.log(`Feedback form sent to ${appointment.userEmail}`);
      } catch (emailError) {
        console.error('Feedback email sending error:', emailError);
      }
    }

    res.json({
      success: true,
      message: "Appointment updated successfully",
      appointment
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ success: false, message: "Failed to update appointment" });
  }
});

// Get feedback form
router.get('/feedback/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const appointment = await Appointment.findOne({ feedbackToken: token });
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Feedback form not found" });
    }
    
    if (appointment.feedbackSubmitted) {
      return res.status(400).json({ success: false, message: "Feedback already submitted" });
    }
    
    res.json({ success: true, appointment });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ success: false, message: "Failed to get feedback form" });
  }
});

// Submit feedback
router.post('/feedback/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { serviceQuality, staffFriendliness, salonCleanliness, recommendation, comments } = req.body;
    
    const appointment = await Appointment.findOne({ feedbackToken: token });
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Feedback form not found" });
    }
    
    if (appointment.feedbackSubmitted) {
      return res.status(400).json({ success: false, message: "Feedback already submitted" });
    }
    
    const approvalToken = crypto.randomBytes(32).toString('hex');
    
    const feedback = new Feedback({
      appointmentId: appointment._id,
      userEmail: appointment.userEmail,
      userName: appointment.userName,
      service: appointment.service,
      serviceQuality,
      staffFriendliness,
      salonCleanliness,
      recommendation,
      comments,
      approvalToken,
      isAnonymous: req.body.isAnonymous || false
    });
    
    await feedback.save();
    
    appointment.feedbackSubmitted = true;
    await appointment.save();
    
    // Send approval email to salon owners if feedback has comments and good rating
    if (comments && comments.trim() && feedback.overallRating >= 4) {
      const approveUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/approve-testimonial/${approvalToken}?action=approve`;
      const rejectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/approve-testimonial/${approvalToken}?action=reject`;
      
      const approvalEmails = process.env.APPROVAL_EMAILS ? process.env.APPROVAL_EMAILS.split(',') : ['lavishladiessalonuchila@gmail.com'];
      
      for (const email of approvalEmails) {
        const approvalMailOptions = {
          from: process.env.EMAIL_USER || 'noreply@lavishladies.com',
          to: email,
          subject: 'New Testimonial for Review - Lavish Ladies Beauty Salon',
          html: buildEmailTemplate({
            title: 'Testimonial Review',
            subtitle: 'A new testimonial is awaiting your decision.',
            contentHtml: `
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;padding:0 16px;margin-bottom:20px;width:100%;box-sizing:border-box;">
                ${buildDetailRow('Customer', feedback.userName)}
                ${buildDetailRow('Service', feedback.service)}
                ${buildDetailRow('Rating', `${feedback.overallRating}/5`, true)}
                ${buildDetailRow('Comment', `"${comments}"`)}
              </table>
              <p style="margin:12px 0;text-align:center;">
                ${buildPrimaryButton(approveUrl, 'Approve', '#111827')}
                <span style="display:inline-block;width:10px;"></span>
                ${buildPrimaryButton(rejectUrl, 'Reject', '#4b5563')}
              </p>
            `
          })
        };
        
        try {
          await transporter.sendMail(approvalMailOptions);
          console.log(`Approval email sent to ${email}`);
        } catch (emailError) {
          console.error('Approval email error:', emailError);
        }
      }
    }
    
    res.json({ success: true, message: "Feedback submitted successfully" });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ success: false, message: "Failed to submit feedback" });
  }
});

// Get all feedback (for staff)
router.get('/feedback', requireRole('staff'), async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json({ success: true, feedback });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ success: false, message: "Failed to get feedback" });
  }
});

// Approve/Reject testimonial
router.get('/testimonial/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { action } = req.query;
    
    const feedback = await Feedback.findOne({ approvalToken: token });
    
    if (!feedback) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }
    
    if (feedback.approvalStatus !== 'pending') {
      return res.status(400).json({ success: false, message: "Testimonial already processed" });
    }
    
    if (action === 'approve') {
      feedback.approvalStatus = 'approved';
      feedback.showAsTestimonial = true;
    } else if (action === 'reject') {
      feedback.approvalStatus = 'rejected';
      feedback.showAsTestimonial = false;
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }
    
    await feedback.save();
    
    res.json({ 
      success: true, 
      message: `Testimonial ${action}d successfully`,
      feedback: {
        userName: feedback.userName,
        service: feedback.service,
        overallRating: feedback.overallRating,
        comments: feedback.comments,
        approvalStatus: feedback.approvalStatus
      }
    });
  } catch (error) {
    console.error('Testimonial approval error:', error);
    res.status(500).json({ success: false, message: "Failed to process testimonial" });
  }
});

// Get approved testimonials for homepage
router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await Feedback.find({ 
      showAsTestimonial: true,
      approvalStatus: 'approved',
      comments: { $ne: '' }
    })
    .select('userName service overallRating comments createdAt isAnonymous')
    .sort({ createdAt: -1 })
    .limit(6);
    
    res.json({ success: true, testimonials });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ success: false, message: "Failed to get testimonials" });
  }
});

// Revenue Analytics
router.get('/revenue-analytics', requireRole('staff'), async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Daily Revenue
    const dailyAppointments = await Appointment.find({
      status: 'completed',
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });
    
    // Weekly Revenue
    const weeklyAppointments = await Appointment.find({
      status: 'completed',
      date: { $gte: weekStart, $lt: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000) }
    });
    
    // Monthly Revenue
    const monthlyAppointments = await Appointment.find({
      status: 'completed',
      date: { $gte: monthStart, $lt: new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1) }
    });
    
    const calculateStats = (appointments) => {
      const revenue = appointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
      const count = appointments.length;
      const avgTransaction = count > 0 ? revenue / count : 0;
      return { revenue, appointments: count, avgTransaction };
    };
    
    const analytics = {
      daily: calculateStats(dailyAppointments),
      weekly: calculateStats(weeklyAppointments),
      monthly: calculateStats(monthlyAppointments)
    };
    
    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ success: false, message: "Failed to get revenue analytics" });
  }
});

// Get appointment details for decision link (Accept/Reject from staff email)
router.get('/decision/:token', async (req, res) => {
  try {
    const { token } = req.params;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid appointment token" });
    }

    const appointment = await Appointment.findOne({ approvalToken: token });
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found or link has expired" });
    }

    res.json({
      success: true,
      appointment: {
        id: appointment._id,
        service: appointment.service,
        date: appointment.date,
        time: appointment.time,
        userName: appointment.userName,
        userEmail: appointment.userEmail,
        userPhone: appointment.userPhone,
        notes: appointment.notes,
        price: appointment.price,
        status: appointment.status,
        rejectionReason: appointment.rejectionReason,
        actionProcessedAt: appointment.actionProcessedAt
      }
    });
  } catch (error) {
    console.error('Get appointment decision error:', error);
    res.status(500).json({ success: false, message: "Failed to load appointment details" });
  }
});

// Process staff appointment decision (Accept or Reject)
router.post('/decision/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { action, reason } = req.body || {};

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid appointment token" });
    }

    if (action !== 'accept' && action !== 'reject') {
      return res.status(400).json({ success: false, message: "Invalid decision action" });
    }

    const existing = await Appointment.findOne({ approvalToken: token });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Appointment not found or link has expired" });
    }

    if (existing.status !== 'pending') {
      const alreadyMessage = existing.status === 'confirmed'
        ? 'This appointment has already been confirmed.'
        : `This appointment has already been rejected${existing.rejectionReason ? `: "${existing.rejectionReason}"` : '.'}`;

      return res.status(200).json({
        success: true,
        alreadyProcessed: true,
        currentStatus: existing.status,
        message: alreadyMessage,
        appointment: {
          id: existing._id,
          service: existing.service,
          date: existing.date,
          time: existing.time,
          userName: existing.userName,
          userEmail: existing.userEmail,
          status: existing.status,
          rejectionReason: existing.rejectionReason,
          actionProcessedAt: existing.actionProcessedAt
        }
      });
    }

    if (action === 'accept') {
      const updated = await Appointment.findOneAndUpdate(
        { approvalToken: token, status: 'pending' },
        { status: 'confirmed', actionProcessedAt: new Date() },
        { new: true }
      );

      if (!updated) {
        const current = await Appointment.findOne({ approvalToken: token });
        return res.status(200).json({
          success: true,
          alreadyProcessed: true,
          currentStatus: current?.status,
          message: current?.status === 'confirmed'
            ? 'This appointment has already been confirmed.'
            : 'This appointment has already been processed.'
        });
      }

      try {
        await sendCustomerConfirmationEmail(updated);
      } catch (mailErr) {
        console.error('Customer confirmation email error:', mailErr);
      }

      return res.json({
        success: true,
        message: "Appointment confirmed successfully",
        appointment: {
          id: updated._id,
          service: updated.service,
          date: updated.date,
          time: updated.time,
          userName: updated.userName,
          userEmail: updated.userEmail,
          status: updated.status,
          actionProcessedAt: updated.actionProcessedAt
        }
      });
    }

    if (action === 'reject') {
      const rejectionReasonText = String(reason || '').trim() || 'Not available at the requested time';

      const updated = await Appointment.findOneAndUpdate(
        { approvalToken: token, status: 'pending' },
        { status: 'cancelled', rejectionReason: rejectionReasonText, actionProcessedAt: new Date() },
        { new: true }
      );

      if (!updated) {
        const current = await Appointment.findOne({ approvalToken: token });
        return res.status(200).json({
          success: true,
          alreadyProcessed: true,
          currentStatus: current?.status,
          message: current?.status === 'confirmed'
            ? 'This appointment has already been confirmed.'
            : 'This appointment has already been processed.'
        });
      }

      try {
        await sendCustomerRejectionEmail(updated, rejectionReasonText);
      } catch (mailErr) {
        console.error('Customer rejection email error:', mailErr);
      }

      return res.json({
        success: true,
        message: "Appointment rejected successfully",
        appointment: {
          id: updated._id,
          service: updated.service,
          date: updated.date,
          time: updated.time,
          userName: updated.userName,
          userEmail: updated.userEmail,
          status: updated.status,
          rejectionReason: updated.rejectionReason,
          actionProcessedAt: updated.actionProcessedAt
        }
      });
    }
  } catch (error) {
    console.error('Process appointment decision error:', error);
    res.status(500).json({ success: false, message: "Failed to process appointment decision" });
  }
});

module.exports = router;
