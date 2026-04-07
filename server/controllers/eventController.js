const Event = require('../models/Event');
const Booking = require('../models/Booking');

// @desc  Get all events with search, filter, sort, pagination
// @route GET /api/events
// @access Public
const getEvents = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      startDate,
      endDate,
      sort = '-createdAt',
      page = 1,
      limit = 9,
    } = req.query;

    const query = { isCancelled: false };

    // Text search (case-insensitive)
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (category) query.category = category;

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Sorting
    let sortObj = {};
    switch (sort) {
      case 'price_asc':
        sortObj = { price: 1 };
        break;
      case 'price_desc':
        sortObj = { price: -1 };
        break;
      case 'date_asc':
        sortObj = { date: 1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single event
// @route GET /api/events/:id
// @access Public
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Basic analytics
    const totalBookings = await Booking.countDocuments({ event: event._id, status: 'confirmed' });
    const revenue = totalBookings > 0
      ? await Booking.aggregate([
          { $match: { event: event._id, status: 'confirmed' } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ])
      : [{ total: 0 }];

    res.status(200).json({
      success: true,
      event,
      analytics: { totalBookings, revenue: revenue[0]?.total || 0 },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Create event
// @route POST /api/events
// @access Private (Organizer, Admin)
const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id });
    res.status(201).json({ success: true, message: 'Event created successfully', event });
  } catch (error) {
    next(error);
  }
};

// @desc  Update event
// @route PUT /api/events/:id
// @access Private (Owner or Admin)
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }

    // Recalculate availableSeats if totalSeats changed
    if (req.body.totalSeats) {
      const diff = req.body.totalSeats - event.totalSeats;
      req.body.availableSeats = Math.max(0, event.availableSeats + diff);
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Event updated successfully', event: updated });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete event
// @route DELETE /api/events/:id
// @access Private (Owner or Admin)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc  Get organizer's own events with analytics
// @route GET /api/events/organizer/my
// @access Private (Organizer)
const getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort({ createdAt: -1 });

    const eventsWithAnalytics = await Promise.all(
      events.map(async (event) => {
        const bookings = await Booking.find({ event: event._id, status: 'confirmed' });
        const totalBookings = bookings.length;
        const revenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
        return { ...event.toObject(), analytics: { totalBookings, revenue } };
      })
    );

    res.status(200).json({ success: true, events: eventsWithAnalytics });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent, getMyEvents };
