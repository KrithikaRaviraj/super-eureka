const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: String,           // Firebase UID or your own unique ID
  name: String,
  email: { type: String, required: true },
  phone: String,         // You can save phone number here
  photoURL: String,
});

module.exports = mongoose.model('User', userSchema);