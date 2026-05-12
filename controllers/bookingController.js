'use strict';

exports.getBookings = (req, res) => {
    // TODO: fetch booking history for current user
    res.render('bookings', { booking: null, history: [] });
};

exports.createBooking = (req, res) => {
    console.log('[STUB] Book tickets:', req.body);
    res.redirect('/bookings');
};
