const express = require('express');
const router = express.Router();

router.get('/google-reviews', async (req, res) => {
  try {
    const placeId = process.env.REACT_APP_GOOGLE_PLACE_ID || 'ChIJV5KqnQF3rjsRl6UlqJ0l-Zc';
    const apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
    
    if (!apiKey || apiKey === 'your-google-places-api-key') {
      return res.json({ reviews: [] });
    }
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.result && data.result.reviews) {
      const formattedReviews = data.result.reviews.map(review => ({
        userName: review.author_name,
        service: "Google Review",
        overallRating: review.rating,
        comments: review.text,
        createdAt: new Date(review.time * 1000).toISOString().split('T')[0],
        isGoogleReview: true,
        reviewSource: "Google"
      }));
      
      res.json({ reviews: formattedReviews });
    } else {
      res.json({ reviews: [] });
    }
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    res.json({ reviews: [] });
  }
});

module.exports = router;