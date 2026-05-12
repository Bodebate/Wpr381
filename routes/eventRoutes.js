'use strict';
const router = require('express').Router();
const ctrl   = require('../controllers/eventController');

router.get('/',         ctrl.getEvents);

module.exports = router;
