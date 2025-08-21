const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const Feedback = require('../models/Feedback');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

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

    const appointment = new Appointment({
      service,
      date,
      time,
      notes: notes || '',
      userEmail,
      userName,
      userPhone: phone || userPhone,
      status: 'pending'
    });

    await appointment.save();
    
    const googleCalendarUrl = generateGoogleCalendarUrl(appointment);

    res.json({
      success: true,
      message: "Appointment booked successfully",
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
      text: `${appointment.service} - Lavish Ladies Salon`,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: `Service: ${appointment.service}\nSalon: Lavish Ladies Beauty Salon & Spa\nAddress: Krishna Prasad Complex, NH66, Uchila, Udupi District, Karnataka - 574117\nPhone: +91 81476 27651`,
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
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
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
router.get('/all', async (req, res) => {
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

// Update appointment status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    appointment.status = status;
    
    if (status === 'completed') {
      appointment.feedbackToken = crypto.randomBytes(32).toString('hex');
    }
    
    await appointment.save();

    // Send confirmation email when appointment is confirmed
    if (status === 'confirmed') {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@lavishladies.com',
        to: appointment.userEmail,
        subject: 'Appointment Confirmed - Lavish Ladies Salon',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Appointment Confirmed</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background: #ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; min-height: 100vh;">
              <tr>
                <td style="padding: 0;">
                  <table width="100%" style="background: white; border: 1px solid #e5e7eb;">
                    <tr>
                      <td style="padding: 60px 40px; text-align: center; background: linear-gradient(135deg, #f9fafb, #f3f4f6); border-bottom: 1px solid #e5e7eb;">
                        <h1 style="margin: 0; font-size: 36px; font-weight: 400; letter-spacing: 2px; color: #1f2937;">LAVISH LADIES SALON & SPA</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                          <div style="margin-bottom: 20px;">
                            <svg width="80" height="80" fill="#10b981" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          </div>
                          <h2 style="margin: 0; font-size: 28px; font-weight: 500; color: #1f2937;">Appointment Confirmed!</h2>
                        </div>
                        
                        <p style="font-size: 16px; color: #4b5563; margin-bottom: 30px;">Hello ${appointment.userName},</p>
                        
                        <p style="font-size: 16px; color: #4b5563; margin-bottom: 30px;">Great news! Your appointment has been confirmed. Here are the details:</p>
                        
                        <div style="background: #f9fafb; padding: 30px; border-radius: 8px; margin: 30px 0;">
                          <table style="width: 100%; font-size: 16px; color: #4b5563;">
                            <tr><td style="padding: 8px 0; font-weight: 600;">Service:</td><td style="padding: 8px 0;">${appointment.service}</td></tr>
                            <tr><td style="padding: 8px 0; font-weight: 600;">Date:</td><td style="padding: 8px 0;">${new Date(appointment.date).toLocaleDateString()}</td></tr>
                            <tr><td style="padding: 8px 0; font-weight: 600;">Time:</td><td style="padding: 8px 0;">${appointment.time}</td></tr>
                            ${appointment.notes ? `<tr><td style="padding: 8px 0; font-weight: 600;">Notes:</td><td style="padding: 8px 0;">${appointment.notes}</td></tr>` : ''}
                          </table>
                        </div>
                        
                        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
                          <p style="margin: 0; font-size: 14px; color: #92400e;">Please arrive 10 minutes early for your appointment. If you need to reschedule, contact us at +91 81476 27651.</p>
                        </div>
                        
                        <div style="text-align: center; margin: 40px 0; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb;">
                          <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1f2937;">Contact Information</h3>
                          <table style="width: 100%; font-size: 14px; color: #4b5563;">
                            <tr><td style="padding: 8px 0; font-weight: 600; width: 100px;">Address:</td><td style="padding: 8px 0;">Krishna Prasad Complex, NH66<br>Uchila, Udupi District, Karnataka - 574117</td></tr>
                            <tr><td style="padding: 8px 0; font-weight: 600;">Phone:</td><td style="padding: 8px 0;">+91 81476 27651</td></tr>
                            <tr><td style="padding: 8px 0; font-weight: 600;">Email:</td><td style="padding: 8px 0;">[redacted-email]</td></tr>
                          </table>
                        </div>
                        
                        <div style="text-align: center; margin: 40px 0; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px;">
                          <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1f2937;">Connect With Us</h3>
                          <div style="text-align: center;">
                            <div style="margin-bottom: 15px;">
                              <a href="https://www.instagram.com/lavish_ladies_salon_n_spa/" style="display: inline-block; text-decoration: none; color: #1f2937; font-size: 16px;">
                                Instagram: @lavish_ladies_salon_n_spa
                              </a>
                            </div>
                            <div>
                              <a href="https://wa.me/918147627651" style="display: inline-block; text-decoration: none; color: #1f2937; font-size: 16px;">
                                WhatsApp: +91 81476 27651
                              </a>
                            </div>
                          </div>
                        </div>
                        
                        <div style="text-align: center; margin: 40px 0;">
                          <p style="font-size: 16px; color: #4b5563;">We look forward to seeing you!</p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: center; background: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 12px; color: #6b7280;">© 2025 Lavish Ladies Beauty Salon & Spa</p>
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
        console.log(`Confirmation email sent to ${appointment.userEmail}`);
      } catch (emailError) {
        console.error('Email sending error:', emailError);
      }
    }
    
    // Send feedback form when appointment is completed
    if (status === 'completed') {
      const feedbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/feedback/${appointment.feedbackToken}`;
      
      const feedbackMailOptions = {
        from: process.env.EMAIL_USER || 'noreply@lavishladies.com',
        to: appointment.userEmail,
        subject: 'Share Your Experience - Lavish Ladies Salon',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Feedback Request</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background: #ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; min-height: 100vh;">
              <tr>
                <td style="padding: 0;">
                  <table width="100%" style="background: white; border: 1px solid #e5e7eb;">
                    <tr>
                      <td style="padding: 60px 40px; text-align: center; background: linear-gradient(135deg, #f9fafb, #f3f4f6); border-bottom: 1px solid #e5e7eb;">
                        <h1 style="margin: 0; font-size: 36px; font-weight: 400; letter-spacing: 2px; color: #1f2937;">LAVISH LADIES SALON & SPA</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                          <div style="margin-bottom: 20px;">
                            <svg width="80" height="80" fill="#f59e0b" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </div>
                          <h2 style="margin: 0; font-size: 28px; font-weight: 500; color: #1f2937;">How Was Your Experience?</h2>
                        </div>
                        
                        <p style="font-size: 16px; color: #4b5563; margin-bottom: 30px;">Hello ${appointment.userName},</p>
                        
                        <p style="font-size: 16px; color: #4b5563; margin-bottom: 30px;">Thank you for visiting us for your <strong>${appointment.service}</strong> appointment. We hope you had a wonderful experience!</p>
                        
                        <p style="font-size: 16px; color: #4b5563; margin-bottom: 30px;">Could you spare 2 minutes to share your feedback? Your opinion helps us improve our services.</p>
                        
                        <div style="text-align: center; margin: 40px 0;">
                          <a href="${feedbackUrl}" style="display: inline-block; background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Share Your Feedback</a>
                        </div>
                        
                        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
                          <p style="margin: 0; font-size: 16px; color: #065f46;"><strong>Book Your Next Appointment!</strong></p>
                          <p style="margin: 10px 0 0 0; font-size: 14px; color: #047857;">Call us at +91 81476 27651 or WhatsApp us to schedule your next visit.</p>
                        </div>
                        
                        <div style="text-align: center; margin: 40px 0;">
                          <p style="font-size: 14px; color: #6b7280;">Thank you for choosing Lavish Ladies Beauty Salon & Spa!</p>
                          <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">Krishna Prasad Complex, NH66, Uchila, Udupi District, Karnataka - 574117</p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: center; background: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 12px; color: #6b7280;">© 2025 Lavish Ladies Beauty Salon & Spa</p>
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
    const { serviceQuality, staffFriendliness, salonCleanliness, recommendation, comments, isAnonymous } = req.body;
    
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
      
      const approvalEmails = ['[redacted-email]', '[redacted-email]'];
      
      for (const email of approvalEmails) {
        const approvalMailOptions = {
          from: process.env.EMAIL_USER || 'noreply@lavishladies.com',
          to: email,
          subject: 'New Testimonial for Review - Lavish Ladies Salon',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Testimonial Review</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background: #ffffff;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff;">
                <tr>
                  <td style="padding: 0;">
                    <table width="100%" style="background: white; border: 1px solid #e5e7eb;">
                      <tr>
                        <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #f9fafb, #f3f4f6); border-bottom: 1px solid #e5e7eb;">
                          <h1 style="margin: 0; font-size: 28px; font-weight: 500; color: #1f2937;">New Testimonial Review</h1>
                          <p style="margin: 10px 0 0 0; color: #6b7280;">Lavish Ladies Beauty Salon & Spa</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 30px;">
                          <p style="font-size: 16px; color: #4b5563; margin-bottom: 20px;">A new customer feedback has been submitted and is ready for review:</p>
                          
                          <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #1f2937;">Customer: ${feedback.userName}</h3>
                            <p style="margin: 5px 0; color: #6b7280;"><strong>Service:</strong> ${feedback.service}</p>
                            <p style="margin: 5px 0; color: #6b7280;"><strong>Overall Rating:</strong> ${feedback.overallRating}/5 stars</p>
                            <p style="margin: 15px 0 5px 0; color: #1f2937; font-weight: 600;">Customer Comments:</p>
                            <p style="margin: 0; color: #4b5563; font-style: italic; background: white; padding: 15px; border-radius: 6px;">"${comments}"</p>
                          </div>
                          
                          <div style="text-align: center; margin: 30px 0;">
                            <p style="font-size: 16px; color: #4b5563; margin-bottom: 20px;">Would you like to display this testimonial on the website?</p>
                            <div style="margin: 20px 0;">
                              <a href="${approveUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 0 10px;">Approve</a>
                              <a href="${rejectUrl}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 0 10px;">Reject</a>
                            </div>
                          </div>
                          
                          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 14px; color: #92400e;">Only approved testimonials will appear on the website. This helps maintain quality and relevance.</p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="text-align: center; background: #f9fafb; padding: 20px; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280;">© 2025 Lavish Ladies Beauty Salon & Spa</p>
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
router.get('/feedback', async (req, res) => {
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

module.exports = router;