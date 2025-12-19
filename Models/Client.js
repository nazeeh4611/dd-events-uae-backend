import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  company: {
    type: String,
    trim: true
  },
  eventType: {
    type: String,
    enum: ['wedding', 'corporate', 'birthday', 'concert', 'conference', 'other'],
    default: 'wedding'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'lead', 'converted'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true
  },
  lastContacted: {
    type: Date
  },
  nextFollowUp: {
    type: Date
  },
  budget: {
    type: Number,
    min: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  source: {
    type: String,
    enum: ['website', 'referral', 'social', 'event', 'other'],
    default: 'website'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

clientSchema.index({ name: 1 });
clientSchema.index({ email: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ eventType: 1 });
clientSchema.index({ createdAt: -1 });

clientSchema.pre('save', function(next) {
  if (this.isModified('email') || this.isModified('phone')) {
    this.lastContacted = new Date();
  }
  next();
});

const Client = mongoose.model('Client', clientSchema);

export default Client;