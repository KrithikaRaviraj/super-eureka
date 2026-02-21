const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      enum: [
        'otp_sent',
        'otp_verified',
        'otp_failed',
        'staff_login',
        'staff_logout',
        'invalid_otp_attempt',
        'rate_limit_exceeded',
        'suspicious_activity',
        'contact_form_submitted',
        'appointment_created',
        'appointment_modified',
        'appointment_cancelled'
      ],
      required: true
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info'
    },
    emailHash: {
      type: String,
      default: null
    },
    ipHash: {
      type: String,
      default: null
    },
    details: {
      type: Object,
      default: {}
    },
    duration: {
      type: Number,
      default: null
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'attempted'],
      default: 'success'
    },
    userAgent: {
      type: String,
      default: null
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
securityLogSchema.index({ createdAt: -1 });
securityLogSchema.index({ event: 1, createdAt: -1 });
securityLogSchema.index({ severity: 1, createdAt: -1 });
securityLogSchema.index({ emailHash: 1, createdAt: -1 });
securityLogSchema.index({ ipHash: 1, createdAt: -1 });

module.exports = mongoose.model('SecurityLog', securityLogSchema);
