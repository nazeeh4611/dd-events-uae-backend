import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  location: {
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters']
    }
  },
  images: [{
    type: String, 
    required: [true, 'At least one image is required'],
    validate: {
      validator: function(images) {
        return images.length > 0;
      },
      message: 'At least one image is required'
    }
  }],
  clientName: {
    type: String,
    trim: true,
    maxlength: [200, 'Client name cannot exceed 200 characters']
  },
  eventType: {
    type: String,
    enum: {
      values: ['wedding', 'corporate', 'birthday', 'concert', 'conference', 'other'],
      message: '{VALUE} is not a valid event type'
    },
    default: 'wedding'
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'published', 'archived'],
      message: '{VALUE} is not a valid status'
    },
    default: 'published'
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

eventSchema.index({ title: 'text', description: 'text', clientName: 'text' });
eventSchema.index({ status: 1, featured: -1, date: -1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ 'location.city': 1, 'location.country': 1 });
eventSchema.index({ eventType: 1 });

eventSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

eventSchema.virtual('formattedLocation').get(function() {
  const parts = [];
  if (this.location.address) parts.push(this.location.address);
  if (this.location.city) parts.push(this.location.city);
  if (this.location.state) parts.push(this.location.state);
  if (this.location.country) parts.push(this.location.country);
  return parts.join(', ');
});

const Event = mongoose.model('Event', eventSchema);

export default Event;