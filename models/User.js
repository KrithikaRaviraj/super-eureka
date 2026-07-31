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
  lastLoginAt: { type: Date, default: null },
  lastLoginMethod: { type: String, default: '' },
  authProvider: { type: String, default: '' },
  lastLoginIp: { type: String, default: '' },
  lastLoginTimeZone: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
