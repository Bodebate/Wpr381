'use strict';
const router = require('express').Router();
const ctrl   = require('../controllers/bookingController');

router.get('/',  ctrl.getBookings);
router.post('/', ctrl.createBooking);

module.exports = router;
