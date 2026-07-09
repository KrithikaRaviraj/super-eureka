const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    sidHash: { type: String, required: true, unique: true, index: true },
    uid: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, default: '' },
    role: { type: String, enum: ['customer', 'staff'], default: 'customer' },
    rememberDevice: { type: Boolean, default: false },
    maxAgeMs: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
