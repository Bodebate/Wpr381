'use strict';

const Booking = require('../models/Booking');
const Event = require('../models/Event');

exports.getAnalytics = async (req, res) => {
  try {
    const statBookings = await Booking.countDocuments({ status: 'confirmed' });

    const topEventsData = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: '$eventId',
          ticketsSold: { $sum: '$quantity' },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { ticketsSold: -1 } },
      { $limit: 5 }
    ]);

    const topEvents = [];

    for (const item of topEventsData) {
      const event = await Event.findById(item._id).populate('categoryId');
      if (event) {
        topEvents.push({
          title: event.title,
          category: event.categoryId?.name || 'Uncategorised',
          ticketsSold: item.ticketsSold,
          revenue: item.revenue
        });
      }
    }

    const events = await Event.find();
    const usageValues = events.map(event => {
      if (!event.totalCapacity) return 0;
      return ((event.totalCapacity - event.availableTickets) / event.totalCapacity) * 100;
    });

    const statAvg = usageValues.length
      ? Math.round(usageValues.reduce((sum, value) => sum + value, 0) / usageValues.length)
      : 0;

    res.render('analytics', { topEvents, statBookings, statAvg });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).send('Could not load analytics.');
  }
};
