require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const usersRouter = require('./routes/users');
const otpRouter = require('./routes/otp');
const appointmentsRouter = require('./routes/appointments');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/super-eureka');

// API routes
app.use('/api/users', usersRouter);
app.use('/api', otpRouter);
app.use('/api/appointments', appointmentsRouter);

// Serve testimonial approval page
app.get('/approve-testimonial/:token', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/approve-testimonial/${req.params.token}?action=${req.query.action}`);
});

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});