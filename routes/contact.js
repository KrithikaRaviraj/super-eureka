const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');

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
router.get('/messages', async (req, res) => {
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
