const express = require('express');
const router = express.Router();
const User = require('../models/User');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Save or update user
router.post('/', async (req, res) => {
  try {
    console.log(req.body); 
    const { uid, name, email, phone, photoURL } = req.body;
    
    // Check if user exists by uid
    let user = await User.findOne({ uid });
    
    if (user) {
      // Only update fields that are provided and not empty
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;
      if (photoURL && photoURL.trim() !== '') updateData.photoURL = photoURL;
      
      user = await User.findOneAndUpdate(
        { uid },
        updateData,
        { new: true }
      );
    } else {
      // Create new user - store phone OR email, not both
      const userData = {
        uid,
        name: name || 'Client',
        photoURL: photoURL || ''
      };
      
      if (phone) {
        userData.phone = phone;
        userData.email = null;
      } else if (email) {
        userData.email = email;
        userData.phone = null;
      }
      
      user = await User.create(userData);
    }
    
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
module.exports = router;