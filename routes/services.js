const express = require('express');
const router = express.Router();
const servicePricing = require('../config/servicePricing');

// Service details with descriptions and durations
const serviceDetails = {
  "Hair Styling & Cuts": {
    description: "Professional haircuts, styling, and treatments for all hair types. From classic cuts to modern trends.",
    duration: "45-90 mins",
    icon: "HAIR"
  },
  "Facial Treatments": {
    description: "Rejuvenating facials, deep cleansing, and anti-aging treatments for glowing, healthy skin.",
    duration: "60-90 mins",
    icon: "STAR"
  },
  "Spa & Massage": {
    description: "Relaxing massages and spa treatments to rejuvenate your body and mind.",
    duration: "60-120 mins",
    icon: "CIRCLE"
  },
  "Manicure & Pedicure": {
    description: "Complete nail care services including manicures, pedicures, and nail art.",
    duration: "45-75 mins",
    icon: "LOCATION"
  },
  "Hair Coloring": {
    description: "Professional hair coloring, highlights, and color correction services.",
    duration: "90-180 mins",
    icon: "STAR"
  },
  "Bridal Packages": {
    description: "Complete bridal makeover packages for your special day.",
    duration: "3-5 hours",
    icon: "CIRCLE"
  },
  "Threading & Waxing": {
    description: "Professional threading and waxing services for smooth, hair-free skin.",
    duration: "15-60 mins",
    icon: "HAIR"
  },
  "Hair Treatments": {
    description: "Deep conditioning, keratin treatments, and hair repair services.",
    duration: "60-120 mins",
    icon: "STAR"
  },
  "Makeup Services": {
    description: "Professional makeup for parties, events, and special occasions.",
    duration: "60-90 mins",
    icon: "CIRCLE"
  }
};

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = Object.keys(servicePricing).map((service, index) => ({
      id: index + 1,
      name: service,
      price: servicePricing[service],
      description: serviceDetails[service]?.description || "Premium beauty and wellness service",
      duration: serviceDetails[service]?.duration || "By appointment",
      icon: serviceDetails[service]?.icon || "STAR"
    }));
    
    res.json({ success: true, services });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch services" });
  }
});

module.exports = router;