const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// In-memory storage for appointments (in production, use a database)
let appointments = [];
let appointmentIdCounter = 1;

// Create appointment
router.post('/', (req, res) => {
  try {
    const { service, date, time, notes, userEmail, userName } = req.body;
    
    if (!service || !date || !time || !userEmail || !userName) {
      return res.status(400).json({ 
        success: false, 
        message: "All required fields must be provided" 
      });
    }

    const appointment = {
      _id: appointmentIdCounter++,
      service,
      date,
      time,
      notes: notes || '',
      userEmail,
      userName,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    appointments.push(appointment);

    res.json({
      success: true,
      message: "Appointment booked successfully",
      appointment
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ success: false, message: "Failed to book appointment" });
  }
});

// Get user appointments
router.get('/user/:email', (req, res) => {
  try {
    const { email } = req.params;
    const userAppointments = appointments.filter(apt => apt.userEmail === email);
    
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
router.get('/all', (req, res) => {
  try {
    res.json({
      success: true,
      appointments: appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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
    
    const appointmentIndex = appointments.findIndex(apt => apt._id == id);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    appointments[appointmentIndex].status = status;
    appointments[appointmentIndex].updatedAt = new Date().toISOString();
    
    const appointment = appointments[appointmentIndex];

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
                          <div style="width: 80px; height: 80px; background: #10b981; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                            <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
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
                        
                        <div style="text-align: center; margin: 40px 0;">
                          <p style="font-size: 16px; color: #4b5563;">We look forward to seeing you!</p>
                          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">Lavish Ladies Beauty Salon & Spa<br>Krishna Prasad Complex, NH66, Uchila</p>
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

    res.json({
      success: true,
      message: "Appointment updated successfully",
      appointment: appointment
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ success: false, message: "Failed to update appointment" });
  }
});

module.exports = router;