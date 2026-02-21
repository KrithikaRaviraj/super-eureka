const express = require('express');
const router = express.Router();
const SecurityLog = require('../models/SecurityLog');

// Get all security events
router.get('/events', async (req, res) => {
  try {
    const { limit = 100, skip = 0, event, severity, startDate, endDate } = req.query;

    const query = {};

    if (event) query.event = event;
    if (severity) query.severity = severity;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const events = await SecurityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await SecurityLog.countDocuments(query);

    res.status(200).json({
      success: true,
      events,
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching security events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security events'
    });
  }
});

// Get security summary
router.get('/summary', async (req, res) => {
  try {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const totalEvents = await SecurityLog.countDocuments();
    const events24h = await SecurityLog.countDocuments({ createdAt: { $gte: last24h } });
    const failedAttempts = await SecurityLog.countDocuments({ status: 'failed', createdAt: { $gte: last24h } });
    const criticalAlerts = await SecurityLog.countDocuments({ severity: 'critical', createdAt: { $gte: last24h } });

    // Event distribution
    const eventDistribution = await SecurityLog.aggregate([
      { $match: { createdAt: { $gte: last24h } } },
      { $group: { _id: '$event', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Severity distribution
    const severityDistribution = await SecurityLog.aggregate([
      { $match: { createdAt: { $gte: last24h } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      summary: {
        totalEvents,
        events24h,
        failedAttempts,
        criticalAlerts
      },
      eventDistribution,
      severityDistribution
    });
  } catch (error) {
    console.error('Error fetching security summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security summary'
    });
  }
});

// Get suspicious IPs/emails (with multiple failed attempts)
router.get('/suspicious', async (req, res) => {
  try {
    const last7days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const suspiciousIPs = await SecurityLog.aggregate([
      { $match: { createdAt: { $gte: last7days }, status: 'failed' } },
      { $group: { _id: '$ipHash', count: { $sum: 1 }, events: { $push: '$event' } } },
      { $match: { count: { $gt: 3 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    const suspiciousEmails = await SecurityLog.aggregate([
      { $match: { createdAt: { $gte: last7days }, status: 'failed' } },
      { $group: { _id: '$emailHash', count: { $sum: 1 }, events: { $push: '$event' } } },
      { $match: { count: { $gt: 3 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.status(200).json({
      success: true,
      suspiciousIPs,
      suspiciousEmails
    });
  } catch (error) {
    console.error('Error fetching suspicious activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suspicious activity'
    });
  }
});

// Log a security event (called from other routes)
router.post('/log', async (req, res) => {
  try {
    const { event, severity, emailHash, ipHash, details, duration, status, userAgent } = req.body;

    const log = new SecurityLog({
      event,
      severity: severity || 'info',
      emailHash,
      ipHash,
      details: details || {},
      duration,
      status: status || 'success',
      userAgent
    });

    await log.save();

    res.status(200).json({
      success: true,
      message: 'Security event logged'
    });
  } catch (error) {
    console.error('Error logging security event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log security event'
    });
  }
});

module.exports = router;
