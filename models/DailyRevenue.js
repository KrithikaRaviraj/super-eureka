const mongoose = require('mongoose');

const dailyRevenueSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  cashRevenue: { type: Number, default: 0 },
  onlineRevenue: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  enteredBy: { type: String, required: true }
}, {
  timestamps: true
});

dailyRevenueSchema.pre('save', function(next) {
  this.totalRevenue = this.cashRevenue + this.onlineRevenue;
  next();
});

module.exports = mongoose.model('DailyRevenue', dailyRevenueSchema);