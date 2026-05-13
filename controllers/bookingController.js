'use strict';

const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');

const formatDate = date => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
};

exports.getBookings = async (req, res) => {
  try {
    let booking = null;

    if (req.query.eventId) {
      const event = await Event.findById(req.query.eventId);

      if (event) {
        booking = {
          eventId: event._id,
          eventName: event.title,
          pricePerTicket: event.price
        };
      }
    }

    const userBookings = await Booking.find({ userId: req.session.user._id })
      .populate('eventId')
      .sort({ createdAt: -1 });

    const history = userBookings.map(item => ({
      _id: item._id,
      eventTitle: item.eventId?.title || 'Deleted event',
      eventDate: formatDate(item.eventId?.eventDate),
      createdAt: formatDate(item.createdAt),
      quantity: item.quantity,
      totalAmount: item.totalAmount
    }));

    res.render('bookings', { booking, history });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).send('Could not load bookings.');
  }
};

exports.createBooking = async (req, res) => {
  try {
    const eventId = req.body.eventId;
    const quantity = Math.max(1, Number(req.body.quantity));

    const event = await Event.findOneAndUpdate(
      {
        _id: eventId,
        status: 'active',
        availableTickets: { $gte: quantity }
      },
      {
        $inc: { availableTickets: -quantity }
      },
      { new: true }
    );

    if (!event) {
      return res.status(400).send('Not enough tickets available or event is not active.');
    }

    const booking = await Booking.create({
      userId: req.session.user._id,
      eventId: event._id,
      bookingReference: `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      quantity,
      totalAmount: event.price * quantity,
      status: 'confirmed'
    });

    const tickets = Array.from({ length: quantity }, (_, index) => ({
      bookingId: booking._id,
      eventId: event._id,
      userId: req.session.user._id,
      ticketCode: `TCK-${Date.now()}-${index + 1}-${Math.floor(Math.random() * 1000)}`,
      status: 'valid'
    }));

    await Ticket.insertMany(tickets);

    res.status(201).json({redirect:'/bookings',success: true});
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).send('Booking failed.');
  }
};
