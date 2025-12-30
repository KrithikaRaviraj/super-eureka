const express = require('express');
const router = express.Router();
const DailyRevenue = require('../models/DailyRevenue');

// Add/Update daily revenue
router.post('/daily', async (req, res) => {
  try {
    const { cashRevenue, onlineRevenue, enteredBy } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingRevenue = await DailyRevenue.findOne({ date: today });
    
    if (existingRevenue) {
      existingRevenue.cashRevenue = cashRevenue;
      existingRevenue.onlineRevenue = onlineRevenue;
      existingRevenue.enteredBy = enteredBy;
      await existingRevenue.save();
      res.json({ success: true, revenue: existingRevenue });
    } else {
      const newRevenue = new DailyRevenue({
        date: today,
        cashRevenue,
        onlineRevenue,
        enteredBy
      });
      await newRevenue.save();
      res.json({ success: true, revenue: newRevenue });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get revenue analytics
router.get('/analytics', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const dailyRevenue = await DailyRevenue.findOne({ date: today });
    const weeklyRevenues = await DailyRevenue.find({ date: { $gte: weekStart, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } });
    const monthlyRevenues = await DailyRevenue.find({ date: { $gte: monthStart, $lt: new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1) } });

    const calculateTotals = (revenues) => {
      return revenues.reduce((acc, rev) => ({
        cash: acc.cash + rev.cashRevenue,
        online: acc.online + rev.onlineRevenue,
        total: acc.total + rev.totalRevenue
      }), { cash: 0, online: 0, total: 0 });
    };

    const analytics = {
      daily: dailyRevenue ? { cash: dailyRevenue.cashRevenue, online: dailyRevenue.onlineRevenue, total: dailyRevenue.totalRevenue } : { cash: 0, online: 0, total: 0 },
      weekly: calculateTotals(weeklyRevenues),
      monthly: calculateTotals(monthlyRevenues)
    };

    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;