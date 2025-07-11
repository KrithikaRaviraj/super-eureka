const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Save or update user
router.post('/', async (req, res) => {
  try {
    console.log(req.body); 
    const { uid, name, email, phone, photoURL } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ $or: [{ uid }, { email }] });
    
    if (user) {
      // Only update fields that are provided and not empty
      const updateData = {};
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;
      if (photoURL && photoURL.trim() !== '') updateData.photoURL = photoURL;
      
      user = await User.findOneAndUpdate(
        { $or: [{ uid }, { email }] },
        updateData,
        { new: true }
      );
    } else {
      // Create new user
      user = await User.create({ uid, name, email, phone, photoURL });
    }
    
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });
  const user = await User.findOne({ email });
  res.json({ user });
});
module.exports = router;