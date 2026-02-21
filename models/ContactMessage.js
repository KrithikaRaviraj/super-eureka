const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied'],
      default: 'new'
    },
    repliedMessage: {
      type: String,
      default: null
    },
    repliedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
