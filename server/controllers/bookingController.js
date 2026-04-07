const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Waitlist = require('../models/Waitlist');
const { promoteFromWaitlist } = require('../utils/waitlistPromotion');

// @desc  Book tickets for an event
// @route POST /api/bookings
// @access Private (User)
const createBooking = async (req, res, next) => {
  try {
    const { eventId, tickets } = req.body;

    if (!eventId || !tickets) {
      return res.status(400).json({ success: false, message: 'eventId and tickets are required' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.isCancelled) return res.status(400).json({ success: false, message: 'Event is cancelled' });
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot book a past event' });
    }

    // Check for existing active booking
    const existingBooking = await Booking.findOne({
      user: req.user._id,
      event: eventId,
      status: 'confirmed',
    });
    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'You already have a booking for this event' });
    }

    // Check for existing waitlist entry
    const existingWaitlist = await Waitlist.findOne({ user: req.user._id, event: eventId });
    if (existingWaitlist) {
      return res.status(400).json({ success: false, message: 'You are already on the waitlist' });
    }

    // If seats not available → add to waitlist
    if (event.availableSeats < tickets) {
      const waitlistEntry = await Waitlist.create({
        user: req.user._id,
        event: eventId,
        tickets,
      });

      // Create booking record with waitlisted status
      const booking = await Booking.create({
        user: req.user._id,
        event: eventId,
        tickets,
        totalPrice: event.price * tickets,
        status: 'waitlisted',
      });

      return res.status(201).json({
        success: true,
        message: 'Event is full. You have been added to the waitlist.',
        booking,
        waitlist: waitlistEntry,
        isWaitlisted: true,
      });
    }

    // Create confirmed booking
    const booking = await Booking.create({
      user: req.user._id,
      event: eventId,
      tickets,
      totalPrice: event.price * tickets,
      status: 'confirmed',
    });

    // Decrement available seats
    event.availableSeats -= tickets;
    await event.save();

    res.status(201).json({
      success: true,
      message: 'Booking confirmed!',
      booking,
      isWaitlisted: false,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get user's bookings
// @route GET /api/bookings/my
// @access Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title date location price imageUrl category availableSeats totalSeats')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};

// @desc  Cancel a booking
// @route PUT /api/bookings/:id/cancel
// @access Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    const wasConfirmed = booking.status === 'confirmed';
    const wasWaitlisted = booking.status === 'waitlisted';

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    if (wasConfirmed) {
      // Restore seat(s)
      await Event.findByIdAndUpdate(booking.event, {
        $inc: { availableSeats: booking.tickets },
      });

      // Trigger waitlist promotion
      await promoteFromWaitlist(booking.event);
    }

    if (wasWaitlisted) {
      // Remove from waitlist collection too
      await Waitlist.findOneAndDelete({ user: booking.user, event: booking.event });
    }

    res.status(200).json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (error) {
    next(error);
  }
};

// @desc  Get bookings for a specific event (organizer)
// @route GET /api/bookings/event/:eventId
// @access Private (Organizer, Admin)
const getEventBookings = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const bookings = await Booking.find({ event: req.params.eventId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const waitlist = await Waitlist.find({ event: req.params.eventId })
      .populate('user', 'name email')
      .sort({ joinedAt: 1 });

    res.status(200).json({ success: true, bookings, waitlist });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getMyBookings, cancelBooking, getEventBookings };
