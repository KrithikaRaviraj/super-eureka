require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const usersRouter = require('./routes/users');
const otpRouter = require('./routes/otp');
const appointmentsRouter = require('./routes/appointments');
const revenueRouter = require('./routes/revenue');
const servicesRouter = require('./routes/services');
const googleReviewsRouter = require('./routes/googleReviews');
const contactRouter = require('./routes/contact');
const securityRouter = require('./routes/security');
const authRouter = require('./routes/auth');
const SecurityLog = require('./models/SecurityLog');
const { extractClientIp } = require('./utils/accountEmails');
const { attachAuth } = require('./middleware/auth');
const { sanitizeRequest } = require('./middleware/sanitize');

const app = express();
app.set('trust proxy', 1);

const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_REQUESTS = 300;
const requestBuckets = new Map();

function hashIdentifier(identifier) {
  const salt = process.env.LOG_SALT || 'default-log-salt';
  return crypto.createHash('sha256').update(`${identifier}:${salt}`).digest('hex').slice(0, 16);
}

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use((req, res, next) => {
  const now = Date.now();
  const ip = extractClientIp(req) || req.ip || req.socket?.remoteAddress || 'unknown';
  const entry = requestBuckets.get(ip) || { count: 0, resetAt: now + RATE_WINDOW_MS };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + RATE_WINDOW_MS;
  }

  entry.count += 1;
  requestBuckets.set(ip, entry);

  if (entry.count > RATE_MAX_REQUESTS) {
    res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
    return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
  }

  return next();
});

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  return next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(sanitizeRequest);
app.use(attachAuth);

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

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  const ip = extractClientIp(req);
  SecurityLog.create({
    event: 'server_error',
    severity: 'critical',
    status: 'failed',
    ipHash: ip ? hashIdentifier(ip) : null,
    userAgent: req.get('user-agent') || null,
    details: {
      method: req.method,
      path: req.originalUrl,
      message: err?.message || 'Unknown server error'
    },
    metadata: {
      status: err?.status || 500
    }
  }).catch((logError) => {
    console.error('Failed to persist server error log:', logError);
  });
  console.error('Unhandled server error:', err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.expose ? err.message : 'Internal server error'
  });
});

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/super-eureka');

    const server = app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the existing process or set a different PORT.`);
      } else {
        console.error('Server listen error:', error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

startServer();
