'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/eventController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/', requireAuth, ctrl.postEvents);
router.get('/',requireAuth, ctrl.getEvents)

module.exports = router;
