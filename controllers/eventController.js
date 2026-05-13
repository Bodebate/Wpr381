'use strict';

const Event = require('../models/Event');
const Category = require('../models/Category');

const formatDate = date => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
};

const mapEventForView = event => ({
  _id: event._id,
  title: event.title,
  description: event.description,
  category: event.categoryId?.name || 'Uncategorised',
  venue: event.venue,
  eventDate: formatDate(event.eventDate),
  startTime: event.startTime,
  endTime: event.endTime,
  price: event.price,
  totalCapacity: event.totalCapacity,
  availableTickets: event.availableTickets,
  status: event.status,
  imageUrl: event.imageUrl
});

const getOrCreateCategory = async categoryName => {
  const name = categoryName || 'General';

  return Category.findOneAndUpdate(
    { name },
    { $setOnInsert: { name, description: `${name} events` } },
    { upsert: true, new: true }
  );
};

exports.postEvents = async (req, res) => {
  try {
    const { search, category, from, to, minSeats } = req.query;
    const filter = { status: 'active' };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } }
      ];
    }

    if (from || to) {
      filter.eventDate = {};
      if (from) filter.eventDate.$gte = new Date(from);
      if (to) filter.eventDate.$lte = new Date(to);
    }

    const parsedSeats = Number(minSeats);
    if (minSeats && !isNaN(parsedSeats)) {
      filter.availableTickets = { $gte: parsedSeats };
    }

    let events = await Event.find(filter).populate('categoryId').sort({ eventDate: 1 });

    if (category) {
      events = events.filter(event => event.categoryId?.name === category);
    }
    res.render('events', {
      events: events.map(mapEventForView),
      filters: req.query
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).send('Could not load events.');
  }
};

exports.getEvents = async (req, res) => {
  try {
    const { search, category, from, to, minSeats } = req.query;
    const filter = { status: 'active' };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } }
      ];
    }

    if (from || to) {
      filter.eventDate = {};
      if (from) filter.eventDate.$gte = new Date(from);
      if (to) filter.eventDate.$lte = new Date(to);
    }

    if (minSeats) {
      filter.availableTickets = { $gte: Number(minSeats) };
    }

    let events = await Event.find(filter).populate('categoryId').sort({ eventDate: 1 });

    if (category) {
      events = events.filter(event => event.categoryId?.name === category);
    }
    res.render('events', {
      events: events.map(mapEventForView),
      filters: req.query
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).send('Could not load events.');
  }
};

exports.getAdminEvents = async (req, res) => {
  try {
    const { search, category, from, to, minSeats } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } }
      ];
    }

    if (from || to) {
      filter.eventDate = {};
      if (from) filter.eventDate.$gte = new Date(from);
      if (to) filter.eventDate.$lte = new Date(to);
    }

    const parsedSeats = Number(minSeats);
    if (minSeats && !isNaN(parsedSeats)) {
      filter.availableTickets = { $gte: parsedSeats };
    }

    let events = await Event.find(filter).populate('categoryId').sort({ createdAt: -1 });

    if (category) {
      events = events.filter(ev => ev.categoryId?.name === category);
    }

    res.render('admin-events', {
      events: events.map(mapEventForView),
      createError: null
    });
  } catch (error) {
    console.error('Get admin events error:', error);
    res.status(500).send('Could not load admin events.');
  }
};

exports.createEvent = async (req, res) => {
  try {
    const category = await getOrCreateCategory(req.body.categoryId);
    const totalCapacity = Number(req.body.totalCapacity);

    await Event.create({
      title: req.body.title,
      description: req.body.description || 'No description provided yet.',
      categoryId: category._id,
      venue: req.body.venue || 'TBA',
      eventDate: req.body.eventDate,
      startTime: req.body.startTime || '09:00',
      endTime: req.body.endTime || '17:00',
      price: Number(req.body.price),
      totalCapacity,
      availableTickets: totalCapacity,
      status: 'active',
      imageUrl: req.body.imageUrl || '/images/boats.jpg',
      createdBy: req.session.user._id
    });

    res.redirect('/admin/events');
  } catch (error) {
    console.error('Create event error:', error.message);
    const events = await Event.find().populate('categoryId').sort({ createdAt: -1 });
    res.render('admin-events', {
      events: events.map(mapEventForView),
      createError: error.message
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const update = {};
    const editableFields = ['title', 'description', 'venue', 'eventDate', 'startTime', 'endTime', 'price', 'totalCapacity', 'availableTickets', 'status', 'imageUrl'];

    editableFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== '') {
        update[field] = ['price', 'totalCapacity', 'availableTickets'].includes(field)
          ? Number(req.body[field])
          : req.body[field];
      }
    });

    if (req.body.categoryId) {
      const category = await getOrCreateCategory(req.body.categoryId);
      update.categoryId = category._id;
    }

    if (Object.keys(update).length > 0) {
      await Event.findByIdAndUpdate(req.params.id, update, { runValidators: true });
    }

    res.redirect('/admin/events');
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).send('Could not update event.');
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.redirect('/admin/events');
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).send('Could not delete event.');
  }
};
