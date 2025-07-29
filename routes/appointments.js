const express = require('express');
const router = express.Router();

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
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const appointmentIndex = appointments.findIndex(apt => apt._id == id);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    appointments[appointmentIndex].status = status;
    appointments[appointmentIndex].updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: "Appointment updated successfully",
      appointment: appointments[appointmentIndex]
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ success: false, message: "Failed to update appointment" });
  }
});

module.exports = router;