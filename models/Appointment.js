const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  service: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  notes: { type: String, default: '' },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  userPhone: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  approvalToken: { type: String },
  rejectionReason: { type: String, default: '' },
  actionProcessedAt: { type: Date },
  feedbackToken: { type: String },
  feedbackSubmitted: { type: Boolean, default: false },
  googleCalendarEventId: { type: String },
  price: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'online'], default: 'cash' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);