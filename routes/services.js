const express = require('express');
const router = express.Router();
const servicePricing = require('../config/servicePricing');

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = Object.keys(servicePricing).map(service => ({
      name: service,
      price: servicePricing[service]
    }));
    
    res.json({ success: true, services });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch services" });
  }
});

module.exports = router;