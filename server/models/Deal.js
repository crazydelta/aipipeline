const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  contactName: {
    type: String,
    required: true,
    trim: true
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  stage: {
    type: String,
    enum: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
    default: 'Lead'
  },
  probability: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  notes: {
    type: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activities: [{
    type: {
      type: String,
      enum: ['call', 'email', 'meeting', 'note'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  expectedCloseDate: {
    type: Date
  }
}, { timestamps: true });

const Deal = mongoose.model('Deal', dealSchema);
module.exports = Deal;