const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Waitlist = require('../models/Waitlist');

/**
 * When seats become available, automatically promote the
 * oldest waitlist entry to a confirmed booking.
 */
const promoteFromWaitlist = async (eventId) => {
  try {
    // Sort by joinedAt ascending to get the oldest entry first
    const nextInLine = await Waitlist.findOne({ event: eventId }).sort({ joinedAt: 1 });

    if (!nextInLine) return; // No one waiting

    const event = await Event.findById(eventId);
    if (!event || event.availableSeats < nextInLine.tickets) return;

    // Create confirmed booking
    const booking = await Booking.create({
      user: nextInLine.user,
      event: eventId,
      tickets: nextInLine.tickets,
      totalPrice: event.price * nextInLine.tickets,
      status: 'confirmed',
    });

    // Decrement available seats
    event.availableSeats -= nextInLine.tickets;
    await event.save();

    // Remove from waitlist
    await Waitlist.findByIdAndDelete(nextInLine._id);

    console.log(`✅ Waitlist promotion: User ${nextInLine.user} promoted for event ${eventId}`);
    return booking;
  } catch (error) {
    console.error('Waitlist promotion error:', error.message);
  }
};

module.exports = { promoteFromWaitlist };
