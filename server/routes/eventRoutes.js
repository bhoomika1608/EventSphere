const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// Public
router.get('/', getEvents);
router.get('/organizer/my', protect, authorize('organizer', 'admin'), getMyEvents);
router.get('/:id', getEventById);

// Protected
router.post('/', protect, authorize('organizer', 'admin'), createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;
