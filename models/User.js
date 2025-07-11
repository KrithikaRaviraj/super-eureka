const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: String,           
  name: String,
  email: { type: String, required: true },
  phone: String,         
  photoURL: String,
});

module.exports = mongoose.model('User', userSchema);