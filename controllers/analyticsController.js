'use strict';

exports.getAnalytics = (req, res) => {
    // TODO: fetch chart data and top events from DB
    res.render('analytics', { topEvents: [], statBookings: 0, statAvg: 0 });
};
