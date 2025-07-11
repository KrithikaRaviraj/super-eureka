const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Save or update user
router.post('/', async (req, res) => {
  try {
    const { uid, name, email, phone, photoURL } = req.body;
    // Upsert user by email or uid
    const user = await User.findOneAndUpdate(
      { email }, 
      { uid, name, email, phone, photoURL },
      { upsert: true, new: true }
    );
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