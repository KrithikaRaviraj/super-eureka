require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const usersRouter = require('./routes/users');
const otpRouter = require('./routes/otp');
const appointmentsRouter = require('./routes/appointments');
const revenueRouter = require('./routes/revenue');
const servicesRouter = require('./routes/services');
const googleReviewsRouter = require('./routes/googleReviews');
const contactRouter = require('./routes/contact');
const securityRouter = require('./routes/security');
const authRouter = require('./routes/auth');
const { attachAuth } = require('./middleware/auth');
const { sanitizeRequest } = require('./middleware/sanitize');

const app = express();
app.set('trust proxy', 1);

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
  origin: frontendUrl,
  credentials: true
}));

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  return next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(sanitizeRequest);
app.use(attachAuth);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/super-eureka');

// API routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api', otpRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/revenue', revenueRouter);
app.use('/api/services', servicesRouter);
app.use('/api', googleReviewsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/security', securityRouter);

// Serve testimonial approval page
app.get('/approve-testimonial/:token', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/approve-testimonial/${req.params.token}?action=${req.query.action}`);
});

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});
