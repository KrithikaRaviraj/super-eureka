const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Save or update user
router.post('/', async (req, res) => {
  try {
    const { uid, name, email, phone, photoURL } = req.body;
    // Upsert user by email or uid
    const user = await User.findOneAndUpdate(
      { email }, // or { uid } if you want to use uid
      { uid, name, email, phone, photoURL },
      { upsert: true, new: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;