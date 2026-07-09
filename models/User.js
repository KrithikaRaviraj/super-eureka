const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: String,           
  name: String,
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  phone: String,         
  photoURL: String,
  passwordHash: { type: String, default: '' },
  passwordSetupAt: { type: Date, default: null },
  emailVerifiedAt: { type: Date, default: null },
});

module.exports = mongoose.model('User', userSchema);
