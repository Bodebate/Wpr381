'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/bookingController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/', ctrl.getBookings);
router.post('/', ctrl.createBooking);

module.exports = router;
