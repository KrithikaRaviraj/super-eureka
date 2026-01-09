const express = require('express');
const router = express.Router();
const servicePricing = require('../config/servicePricing');

// Icon paths matching frontend constants
const ICONS = {
  HAIR: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
  STAR: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  CIRCLE: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z",
  LOCATION: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
};

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
    const services = Object.keys(servicePricing).map((service, index) => {
      const details = serviceDetails[service];
      const iconName = details?.icon || "STAR";
      
      return {
        id: index + 1,
        name: service,
        price: servicePricing[service],
        description: details?.description || "Premium beauty and wellness service",
        duration: details?.duration || "By appointment",
        icon: ICONS[iconName] || ICONS.STAR
      };
    });
    
    res.json({ success: true, services });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch services" });
  }
});

module.exports = router;