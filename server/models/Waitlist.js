const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    tickets: {
      type: Number,
      required: true,
      min: [1, 'Must request at least 1 ticket'],
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// One waitlist entry per user per event
waitlistSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Waitlist', waitlistSchema);
