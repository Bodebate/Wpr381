'use strict';
const router     = require('express').Router();
const eventCtrl  = require('../controllers/eventController');
const enqCtrl    = require('../controllers/enquiryController');
const analytics  = require('../controllers/analyticsController');

router.get('/events',              eventCtrl.getAdminEvents);
router.post('/events',             eventCtrl.createEvent);
router.post('/events/:id/update',  eventCtrl.updateEvent);
router.post('/events/:id/delete',  eventCtrl.deleteEvent);

router.get('/enquiries',              enqCtrl.getAdminEnquiries);
router.post('/enquiries/:id/status',  enqCtrl.updateEnquiryStatus);
router.post('/enquiries/:id/delete',  enqCtrl.deleteEnquiry);

router.get('/analytics', analytics.getAnalytics);

module.exports = router;
