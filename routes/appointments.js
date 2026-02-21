require('dotenv').config();
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const Feedback = require('../models/Feedback');
const servicePricing = require('../config/servicePricing');

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
      status: 'pending',
      price: servicePricing[service] || 0,
      paymentStatus: 'pending'
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

// Update appointment (full edit)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, service, date, time, userName, userEmail, userPhone, notes, price } = req.body;
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

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
    
    if (status === 'completed' && !appointment.feedbackToken) {
      appointment.feedbackToken = crypto.randomBytes(32).toString('hex');
    }
    
    await appointment.save();

    // Send confirmation email when appointment is confirmed
    if (status === 'confirmed') {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@lavishladies.com',
        to: appointment.userEmail,
        subject: 'Appointment Confirmed - Lavish Ladies Beauty Salon',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Appointment Confirmed - Lavish Ladies Beauty Salon</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            </style>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; line-height: 1.6;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; min-height: 100vh;">
              <tr>
                <td style="padding: 40px 20px;">
                  <table width="600" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center; position: relative;">
                        <div style="padding: 50px 40px; color: white;">
                          <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                            <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
                              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9H21ZM19 21H5V3H13V9H19V21Z"/>
                            </svg>
                          </div>
                          <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">LAVISH LADIES</h1>
                          <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9; font-weight: 300;">Beauty Salon & Spa</p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Success Icon -->
                    <tr>
                      <td style="padding: 40px 40px 20px; text-align: center;">
                        <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);">
                          <svg width="50" height="50" fill="white" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        </div>
                        <h2 style="margin: 25px 0 10px 0; font-size: 28px; font-weight: 600; color: #1f2937;">Appointment Confirmed!</h2>
                        <p style="margin: 0; font-size: 16px; color: #6b7280;">Your booking has been successfully confirmed</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 0 40px 40px;">
                        <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">Dear <strong>${appointment.userName}</strong>,</p>
                        
                        <p style="font-size: 16px; color: #6b7280; margin-bottom: 30px;">We're excited to confirm your upcoming appointment. Here are your booking details:</p>
                        
                        <!-- Appointment Details Card -->
                        <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; margin: 30px 0;">
                          <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1f2937; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Appointment Details</h3>
                          <table style="width: 100%; font-size: 16px;">
                            <tr><td style="padding: 12px 0; font-weight: 600; color: #374151; width: 120px;">Service:</td><td style="padding: 12px 0; color: #6b7280;">${appointment.service}</td></tr>
                            <tr><td style="padding: 12px 0; font-weight: 600; color: #374151;">Date:</td><td style="padding: 12px 0; color: #6b7280;">${new Date(appointment.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                            <tr><td style="padding: 12px 0; font-weight: 600; color: #374151;">Time:</td><td style="padding: 12px 0; color: #6b7280;">${appointment.time}</td></tr>
                            ${appointment.price ? `<tr><td style="padding: 12px 0; font-weight: 600; color: #374151;">Price:</td><td style="padding: 12px 0; color: #059669; font-weight: 600;">₹${appointment.price}</td></tr>` : ''}
                            ${appointment.notes ? `<tr><td style="padding: 12px 0; font-weight: 600; color: #374151; vertical-align: top;">Notes:</td><td style="padding: 12px 0; color: #6b7280;">${appointment.notes}</td></tr>` : ''}
                          </table>
                        </div>
                        
                        <!-- Important Notice -->
                        <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
                          <div style="display: flex; align-items: center; margin-bottom: 10px;">
                            <svg width="20" height="20" fill="#d97706" viewBox="0 0 24 24" style="margin-right: 10px;">
                              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                            </svg>
                            <strong style="color: #92400e; font-size: 16px;">Important Reminders</strong>
                          </div>
                          <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px;">
                            <li>Please arrive 10 minutes before your scheduled time</li>
                            <li>Bring a valid ID for verification</li>
                            <li>For rescheduling, contact us at least 24 hours in advance</li>
                          </ul>
                        </div>
                        
                        <!-- Contact Information -->
                        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 30px 0;">
                          <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1f2937;">📍 Visit Us</h3>
                          <div style="color: #6b7280; font-size: 15px; line-height: 1.6;">
                            <p style="margin: 0 0 15px 0;"><strong>Address:</strong><br>Krishna Prasad Complex, NH66<br>Uchila, Udupi District, Karnataka - 574117</p>
                            <p style="margin: 0 0 15px 0;"><strong>Phone:</strong> <a href="tel:+918147627651" style="color: #667eea; text-decoration: none;">+91 81476 27651</a></p>
                            <p style="margin: 0;"><strong>Email:</strong> <a href="mailto:[redacted-email]" style="color: #667eea; text-decoration: none;">[redacted-email]</a></p>
                          </div>
                        </div>
                        
                        <!-- Social Media -->
                        <div style="text-align: center; margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 12px;">
                          <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1f2937;">Stay Connected</h3>
                          <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                            <a href="https://www.instagram.com/lavish_ladies_salon_n_spa/" style="display: inline-flex; align-items: center; padding: 12px 20px; background: linear-gradient(135deg, #e1306c, #fd1d1d); color: white; text-decoration: none; border-radius: 25px; font-weight: 500; font-size: 14px;">
                              <svg width="18" height="18" fill="white" viewBox="0 0 24 24" style="margin-right: 8px;">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                              Instagram
                            </a>
                            <a href="https://wa.me/918147627651" style="display: inline-flex; align-items: center; padding: 12px 20px; background: linear-gradient(135deg, #25d366, #128c7e); color: white; text-decoration: none; border-radius: 25px; font-weight: 500; font-size: 14px;">
                              <svg width="18" height="18" fill="white" viewBox="0 0 24 24" style="margin-right: 8px;">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                              </svg>
                              WhatsApp
                            </a>
                          </div>
                        </div>
                        
                        <div style="text-align: center; margin: 40px 0 20px;">
                          <p style="font-size: 18px; color: #374151; font-weight: 500;">Thank you for choosing Lavish Ladies!</p>
                          <p style="font-size: 14px; color: #9ca3af; margin-top: 10px;">We can't wait to pamper you ✨</p>
                        </div>

                        <!-- Compliance & Trust -->
                        <div style="margin: 30px 0; padding: 18px 20px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; font-size: 12px; color: #6b7280; line-height: 1.7;">
                          <strong style="display: block; color: #374151; margin-bottom: 8px;">Why you received this email</strong>
                          You are receiving this confirmation because an appointment was scheduled with Lavish Ladies Beauty Salon & Spa using this email address. If this wasn't you, please reply to this email or call us at <a href="tel:+918147627651" style="color: #667eea; text-decoration: none;">+91 81476 27651</a> so we can help.
                          <div style="margin-top: 12px;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/privacy" style="color: #667eea; text-decoration: none; margin-right: 12px;">Privacy Policy</a>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/terms" style="color: #667eea; text-decoration: none;">Terms of Service</a>
                          </div>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <div style="margin-bottom: 20px;">
                          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/privacy" style="color: #6b7280; text-decoration: none; font-size: 12px; margin: 0 15px;">Privacy Policy</a>
                          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/terms" style="color: #6b7280; text-decoration: none; font-size: 12px; margin: 0 15px;">Terms of Service</a>
                          <a href="mailto:[redacted-email]" style="color: #6b7280; text-decoration: none; font-size: 12px; margin: 0 15px;">Contact Support</a>
                        </div>
                        <p style="margin: 0; font-size: 12px; color: #9ca3af;">© 2026 Lavish Ladies Beauty Salon. All rights reserved.</p>
                        <p style="margin: 5px 0 0 0; font-size: 11px; color: #d1d5db;">Krishna Prasad Complex, NH66, Uchila, Udupi District, Karnataka - 574117</p>
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
        subject: 'Share Your Experience - Lavish Ladies Beauty Salon',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Share Your Experience - Lavish Ladies Beauty Salon</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            </style>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; line-height: 1.6;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; min-height: 100vh;">
              <tr>
                <td style="padding: 40px 20px;">
                  <table width="600" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 0; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); text-align: center; position: relative;">
                        <div style="padding: 50px 40px; color: white;">
                          <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                            <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </div>
                          <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">LAVISH LADIES</h1>
                          <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9; font-weight: 300;">Beauty Salon & Spa</p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Feedback Icon -->
                    <tr>
                      <td style="padding: 40px 40px 20px; text-align: center;">
                        <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);">
                          <svg width="50" height="50" fill="white" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </div>
                        <h2 style="margin: 25px 0 10px 0; font-size: 28px; font-weight: 600; color: #1f2937;">How Was Your Experience?</h2>
                        <p style="margin: 0; font-size: 16px; color: #6b7280;">Your feedback helps us serve you better</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 0 40px 40px;">
                        <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">Dear <strong>${appointment.userName}</strong>,</p>
                        
                        <p style="font-size: 16px; color: #6b7280; margin-bottom: 20px;">Thank you for visiting us for your <strong style="color: #f59e0b;">${appointment.service}</strong> appointment. We hope you had a wonderful and relaxing experience!</p>
                        
                        <p style="font-size: 16px; color: #6b7280; margin-bottom: 30px;">Your feedback is incredibly valuable to us and helps us continuously improve our services. Could you spare just 2 minutes to share your thoughts?</p>
                        
                        <!-- Service Details Card -->
                        <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 1px solid #f59e0b; border-radius: 12px; padding: 25px; margin: 30px 0;">
                          <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #92400e;">Your Recent Visit</h3>
                          <div style="color: #92400e; font-size: 14px;">
                            <p style="margin: 5px 0;"><strong>Service:</strong> ${appointment.service}</p>
                            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.time}</p>
                          </div>
                        </div>
                        
                        <!-- CTA Button -->
                        <div style="text-align: center; margin: 40px 0;">
                          <a href="${feedbackUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3); transition: all 0.3s ease;">
                            ⭐ Share Your Feedback
                          </a>
                          <p style="margin: 15px 0 0 0; font-size: 12px; color: #9ca3af;">Takes less than 2 minutes</p>
                        </div>
                        
                        <!-- Benefits Section -->
                        <div style="background: linear-gradient(135deg, #ecfdf5, #d1fae5); border: 1px solid #10b981; border-radius: 12px; padding: 25px; margin: 30px 0;">
                          <div style="text-align: center; margin-bottom: 20px;">
                            <div style="width: 60px; height: 60px; background: #10b981; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                              <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                            </div>
                          </div>
                          <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #065f46; text-align: center;">Ready for Your Next Visit?</h3>
                          <p style="margin: 0 0 20px 0; font-size: 14px; color: #047857; text-align: center;">Book your next appointment and continue your beauty journey with us!</p>
                          <div style="text-align: center;">
                            <div style="margin-bottom: 10px;">
                              <a href="tel:+918147627651" style="display: inline-flex; align-items: center; padding: 10px 20px; background: #10b981; color: white; text-decoration: none; border-radius: 25px; font-weight: 500; font-size: 14px; margin: 5px;">
                                <svg width="16" height="16" fill="white" viewBox="0 0 24 24" style="margin-right: 8px;">
                                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                </svg>
                                Call Now
                              </a>
                              <a href="https://wa.me/918147627651" style="display: inline-flex; align-items: center; padding: 10px 20px; background: #25d366; color: white; text-decoration: none; border-radius: 25px; font-weight: 500; font-size: 14px; margin: 5px;">
                                <svg width="16" height="16" fill="white" viewBox="0 0 24 24" style="margin-right: 8px;">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                </svg>
                                WhatsApp
                              </a>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Contact Information -->
                        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 30px 0;">
                          <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1f2937; text-align: center;">📍 Visit Us Again</h3>
                          <div style="color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                            <p style="margin: 0 0 10px 0;">Krishna Prasad Complex, NH66<br>Uchila, Udupi District, Karnataka - 574117</p>
                            <p style="margin: 0;">Phone: <a href="tel:+918147627651" style="color: #f59e0b; text-decoration: none;">+91 81476 27651</a></p>
                          </div>
                        </div>
                        
                        <div style="text-align: center; margin: 40px 0 20px;">
                          <p style="font-size: 16px; color: #374151; font-weight: 500;">Thank you for choosing Lavish Ladies!</p>
                          <p style="font-size: 14px; color: #9ca3af; margin-top: 10px;">Your satisfaction is our priority ❤️</p>
                        </div>

                        <!-- Compliance & Trust -->
                        <div style="margin: 30px 0; padding: 18px 20px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; font-size: 12px; color: #6b7280; line-height: 1.7;">
                          <strong style="display: block; color: #374151; margin-bottom: 8px;">Why you received this email</strong>
                          You are receiving this message because you recently completed a service with Lavish Ladies Beauty Salon using this email address. If this wasn't you, please reply to this email or call us at <a href="tel:+918147627651" style="color: #f59e0b; text-decoration: none;">+91 81476 27651</a> so we can assist.
                          <div style="margin-top: 12px;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/privacy" style="color: #f59e0b; text-decoration: none; margin-right: 12px;">Privacy Policy</a>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/terms" style="color: #f59e0b; text-decoration: none;">Terms of Service</a>
                          </div>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <div style="margin-bottom: 20px;">
                          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/privacy" style="color: #6b7280; text-decoration: none; font-size: 12px; margin: 0 15px;">Privacy Policy</a>
                          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/terms" style="color: #6b7280; text-decoration: none; font-size: 12px; margin: 0 15px;">Terms of Service</a>
                          <a href="mailto:[redacted-email]" style="color: #6b7280; text-decoration: none; font-size: 12px; margin: 0 15px;">Contact Support</a>
                        </div>
                        <p style="margin: 0; font-size: 12px; color: #9ca3af;">© 2026 Lavish Ladies Beauty Salon. All rights reserved.</p>
                        <p style="margin: 5px 0 0 0; font-size: 11px; color: #d1d5db;">Krishna Prasad Complex, NH66, Uchila, Udupi District, Karnataka - 574117</p>
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
      
      const approvalEmails = process.env.APPROVAL_EMAILS ? process.env.APPROVAL_EMAILS.split(',') : ['[redacted-email]', '[redacted-email]'];
      
      for (const email of approvalEmails) {
        const approvalMailOptions = {
          from: process.env.EMAIL_USER || 'noreply@lavishladies.com',
          to: email,
          subject: 'New Testimonial for Review - Lavish Ladies Beauty Salon',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Testimonial Review - Lavish Ladies Beauty Salon</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
              </style>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; line-height: 1.6;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; min-height: 100vh;">
                <tr>
                  <td style="padding: 40px 20px;">
                    <table width="600" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden;">
                      <!-- Header -->
                      <tr>
                        <td style="padding: 0; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); text-align: center; position: relative;">
                          <div style="padding: 50px 40px; color: white;">
                            <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                              <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                            </div>
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">TESTIMONIAL REVIEW</h1>
                            <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9; font-weight: 300;">Lavish Ladies Beauty Salon & Spa</p>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <div style="text-align: center; margin-bottom: 30px;">
                            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);">
                              <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
                                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                              </svg>
                            </div>
                            <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600; color: #1f2937;">New Customer Feedback</h2>
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Ready for your review and approval</p>
                          </div>
                          
                          <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">A new customer feedback has been submitted with excellent ratings and is ready for your review:</p>
                          
                          <!-- Customer Details Card -->
                          <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; margin: 30px 0;">
                            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                              <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                                <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                              </div>
                              <div>
                                <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">${feedback.userName}</h3>
                                <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">Verified Customer</p>
                              </div>
                            </div>
                            
                            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                              <table style="width: 100%; font-size: 14px;">
                                <tr><td style="padding: 8px 0; font-weight: 600; color: #374151; width: 100px;">Service:</td><td style="padding: 8px 0; color: #6b7280;">${feedback.service}</td></tr>
                                <tr><td style="padding: 8px 0; font-weight: 600; color: #374151;">Rating:</td><td style="padding: 8px 0;"><span style="color: #f59e0b; font-weight: 600; font-size: 16px;">${feedback.overallRating}/5 ⭐</span></td></tr>
                                <tr><td style="padding: 8px 0; font-weight: 600; color: #374151;">Date:</td><td style="padding: 8px 0; color: #6b7280;">${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                              </table>
                            </div>
                            
                            <div style="margin-top: 20px;">
                              <h4 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #1f2937;">Customer Comments:</h4>
                              <div style="background: white; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; font-style: italic; color: #374151; line-height: 1.6;">
                                "${comments}"
                              </div>
                            </div>
                          </div>
                          
                          <!-- Action Buttons -->
                          <div style="text-align: center; margin: 40px 0;">
                            <p style="font-size: 16px; color: #374151; margin-bottom: 25px; font-weight: 500;">Would you like to display this testimonial on your website?</p>
                            <div style="margin: 25px 0;">
                              <a href="${approveUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; margin: 0 10px 10px 10px; box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);">
                                ✓ Approve Testimonial
                              </a>
                              <a href="${rejectUrl}" style="display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; margin: 0 10px 10px 10px; box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);">
                                ✗ Reject Testimonial
                              </a>
                            </div>
                            <p style="margin: 20px 0 0 0; font-size: 12px; color: #9ca3af;">Click the buttons above to make your decision</p>
                          </div>
                          
                          <!-- Info Notice -->
                          <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 30px 0;">
                            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                              <svg width="20" height="20" fill="#d97706" viewBox="0 0 24 24" style="margin-right: 10px;">
                                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                              <strong style="color: #92400e; font-size: 14px;">Quality Control</strong>
                            </div>
                            <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">Only approved testimonials will appear on your website. This helps maintain quality, relevance, and builds trust with potential customers.</p>
                          </div>
                          
                          <!-- Contact Info -->
                          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
                            <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #1f2937;">Need Help?</h3>
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Contact us at <a href="mailto:[redacted-email]" style="color: #8b5cf6; text-decoration: none;">[redacted-email]</a></p>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                          <div style="margin-bottom: 20px;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/privacy" style="color: #6b7280; text-decoration: none; font-size: 12px; margin: 0 15px;">Privacy Policy</a>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/terms" style="color: #6b7280; text-decoration: none; font-size: 12px; margin: 0 15px;">Terms of Service</a>
                            <a href="mailto:[redacted-email]" style="color: #6b7280; text-decoration: none; font-size: 12px; margin: 0 15px;">Contact Support</a>
                          </div>
                          <p style="margin: 0; font-size: 12px; color: #9ca3af;">© 2026 Lavish Ladies Beauty Salon. All rights reserved.</p>
                          <p style="margin: 5px 0 0 0; font-size: 11px; color: #d1d5db;">Krishna Prasad Complex, NH66, Uchila, Udupi District, Karnataka - 574117</p>
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

// Revenue Analytics
router.get('/revenue-analytics', async (req, res) => {
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

module.exports = router;
