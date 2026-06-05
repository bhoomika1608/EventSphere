const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

// @desc  Get all users
// @route GET /api/admin/users
// @access Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query).select('-password').skip(skip).limit(Number(limit)).sort({ createdAt: -1 });

    res.status(200).json({ success: true, total, users });
  } catch (error) {
    next(error);
  }
};

// @desc  Update user role
// @route PUT /api/admin/users/:id/role
// @access Private (Admin)
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'organizer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: 'User role updated', user });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete user
// @route DELETE /api/admin/users/:id
// @access Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc  Get platform stats
// @route GET /api/admin/stats
// @access Private (Admin)
const getPlatformStats = async (req, res, next) => {
  try {
    const [totalUsers, totalEvents, totalBookings, revenueData] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalEvents,
        totalBookings,
        totalRevenue: revenueData[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Force delete any event (admin)
// @route DELETE /api/admin/events/:id
// @access Private (Admin)
const forceDeleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.status(200).json({ success: true, message: 'Event force deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all events (admin)
// @route GET /api/admin/events
// @access Private (Admin)
const getAllEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Event.countDocuments();
    const events = await Event.find()
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, events });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, updateUserRole, deleteUser, getPlatformStats, forceDeleteEvent, getAllEvents };
