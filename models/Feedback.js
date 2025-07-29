const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  service: { type: String, required: true },
  serviceQuality: { type: Number, min: 1, max: 5, required: true },
  staffFriendliness: { type: Number, min: 1, max: 5, required: true },
  salonCleanliness: { type: Number, min: 1, max: 5, required: true },
  recommendation: { type: Number, min: 1, max: 5, required: true },
  comments: { type: String, default: '' },
  overallRating: { type: Number, min: 1, max: 5 }
}, {
  timestamps: true
});

feedbackSchema.pre('save', function(next) {
  this.overallRating = Math.round((this.serviceQuality + this.staffFriendliness + this.salonCleanliness + this.recommendation) / 4);
  next();
});

module.exports = mongoose.model('Feedback', feedbackSchema);