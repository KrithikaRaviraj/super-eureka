const express = require('express');
const router = express.Router();
const servicePricing = require('../config/servicePricing');

// Unique icon paths per service
const SERVICE_ICONS = {
  "Hair Styling & Cuts": "M9.64 7.64a2.5 2.5 0 1 1-3.54 3.54 2.5 2.5 0 0 1 3.54-3.54zm0 5.72L12 15.72l2.36-2.36a2.5 2.5 0 1 1 1.41 1.41L13.41 17.13l2.36 2.36a1 1 0 0 1-1.41 1.41L12 18.54l-2.36 2.36a1 1 0 0 1-1.41-1.41l2.36-2.36-2.36-2.36a2.5 2.5 0 1 1 1.41-1.41zM7.87 9.41a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm8.26 4.18a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z",
  "Facial Treatments": "M12 2C8.14 2 5 5.14 5 9v2c0 2.97 1.61 5.57 4 6.96V21h6v-3.04c2.39-1.39 4-3.99 4-6.96V9c0-3.86-3.14-7-7-7zm-3 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-6.5 3h7a3.5 3.5 0 0 1-7 0z",
  "Spa & Massage": "M12 2c1.1 2.2 1.1 4.4 0 6.6C10.9 6.4 10.9 4.2 12 2zm-5 2.5c1.8 1.6 2.5 3.8 2.1 6-2-1-3.3-2.8-3.8-5 .5-.4 1.1-.7 1.7-1zm10 0c.6.3 1.2.6 1.7 1-.5 2.2-1.8 4-3.8 5-.4-2.2.3-4.4 2.1-6zM12 9c4.4 0 8 3.1 8 7 0 3.3-2.7 6-6 6h-4c-3.3 0-6-2.7-6-6 0-3.9 3.6-7 8-7zm-2 6a2 2 0 1 0 0 4h4a2 2 0 1 0 0-4h-4z",
  "Manicure & Pedicure": "M8 2c.6 0 1 .4 1 1v6a1 1 0 1 1-2 0V3c0-.6.4-1 1-1zm4 0c.6 0 1 .4 1 1v7a1 1 0 1 1-2 0V3c0-.6.4-1 1-1zm4 1c.6 0 1 .4 1 1v6a1 1 0 1 1-2 0V4c0-.6.4-1 1-1zM6 12h12l-1.2 7.1A3 3 0 0 1 13.8 22h-3.6a3 3 0 0 1-3-2.9L6 12zm3 3a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9z",
  "Hair Coloring": "M12 2c2.4 3.6 5 7.2 5 10.3A5 5 0 0 1 12 17a5 5 0 0 1-5-4.7C7 9.2 9.6 5.6 12 2zm0 17c3.9 0 7 1.6 7 3H5c0-1.4 3.1-3 7-3zm-2-6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  "Bridal Packages": "M12 2l2.3 4.7 5.2.8-3.8 3.7.9 5.3L12 14.8 7.4 16.5l.9-5.3L4.5 7.5l5.2-.8L12 2zm-6 18a6 6 0 0 1 12 0H6z",
  "Threading & Waxing": "M4 6h16l-3 5v7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-7L4 6zm5 7a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9zm-2-9h10l1.5 2h-13L7 4z",
  "Hair Treatments": "M12 2l1.2 2.6L16 5l-2.1 2 .5 2.9-2.4-1.3-2.4 1.3.5-2.9L8 5l2.8-.4L12 2zm-4 9h8a3 3 0 0 1 3 3v2a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6v-2a3 3 0 0 1 3-3zm1.5 4a1.5 1.5 0 1 0 3 0h-3zm5 0a1.5 1.5 0 1 0 3 0h-3z",
  "Makeup Services": "M6 3h12a1 1 0 0 1 1 1v3H5V4a1 1 0 0 1 1-1zm-1 6h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9zm4 3a2 2 0 1 0 0 4h6a2 2 0 1 0 0-4H9z"
};

// Service details with descriptions and durations
const serviceDetails = {
  "Hair Styling & Cuts": {
    description: "Professional haircuts, styling, and treatments for all hair types. From classic cuts to modern trends.",
    duration: "45-90 mins",
    icon: "Hair Styling & Cuts"
  },
  "Facial Treatments": {
    description: "Rejuvenating facials, deep cleansing, and anti-aging treatments for glowing, healthy skin.",
    duration: "60-90 mins",
    icon: "Facial Treatments"
  },
  "Spa & Massage": {
    description: "Relaxing massages and spa treatments to rejuvenate your body and mind.",
    duration: "60-120 mins",
    icon: "Spa & Massage"
  },
  "Manicure & Pedicure": {
    description: "Complete nail care services including manicures, pedicures, and nail art.",
    duration: "45-75 mins",
    icon: "Manicure & Pedicure"
  },
  "Hair Coloring": {
    description: "Professional hair coloring, highlights, and color correction services.",
    duration: "90-180 mins",
    icon: "Hair Coloring"
  },
  "Bridal Packages": {
    description: "Complete bridal makeover packages for your special day.",
    duration: "3-5 hours",
    icon: "Bridal Packages"
  },
  "Threading & Waxing": {
    description: "Professional threading and waxing services for smooth, hair-free skin.",
    duration: "15-60 mins",
    icon: "Threading & Waxing"
  },
  "Hair Treatments": {
    description: "Deep conditioning, keratin treatments, and hair repair services.",
    duration: "60-120 mins",
    icon: "Hair Treatments"
  },
  "Makeup Services": {
    description: "Professional makeup for parties, events, and special occasions.",
    duration: "60-90 mins",
    icon: "Makeup Services"
  }
};

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = Object.keys(servicePricing).map((service, index) => {
      const details = serviceDetails[service];
      const iconName = details?.icon || "Hair Styling & Cuts";
      
      return {
        id: index + 1,
        name: service,
        price: servicePricing[service],
        description: details?.description || "Premium beauty and wellness service",
        duration: details?.duration || "By appointment",
        icon: SERVICE_ICONS[iconName] || SERVICE_ICONS["Hair Styling & Cuts"]
      };
    });
    
    res.json({ success: true, services });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch services" });
  }
});

module.exports = router;
