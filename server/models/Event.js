const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Tech', 'Music', 'Sports', 'Art', 'Food', 'Business', 'Health', 'Education', 'Other'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats are required'],
      min: [1, 'Total seats must be at least 1'],
    },
    availableSeats: {
      type: Number,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Set availableSeats to totalSeats on creation
eventSchema.pre('save', function (next) {
  if (this.isNew) {
    this.availableSeats = this.totalSeats;
  }
  next();
});

// Virtual: isSoldOut
eventSchema.virtual('isSoldOut').get(function () {
  return this.availableSeats === 0;
});

// Indexes for search and filter
eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ category: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ price: 1 });

module.exports = mongoose.model('Event', eventSchema);
