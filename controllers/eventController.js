'use strict';

exports.getEvents = (req, res) => {
    // TODO: fetch events from DB with filters (req.query)
    res.render('events', { events: [] });
};

exports.getAdminEvents = (req, res) => {
    // TODO: fetch all events for admin
    res.render('admin-events', { events: [] });
};

exports.createEvent = (req, res) => {
    console.log('[STUB] Create event:', req.body);
    res.redirect('/admin/events');
};

exports.updateEvent = (req, res) => {
    console.log('[STUB] Update event:', req.params.id, req.body);
    res.redirect('/admin/events');
};

exports.deleteEvent = (req, res) => {
    console.log('[STUB] Delete event:', req.params.id);
    res.redirect('/admin/events');
};
