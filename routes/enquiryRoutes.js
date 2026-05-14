'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/enquiryController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, ctrl.getContact);
router.post('/', requireAuth, ctrl.postEnquiry);

module.exports = router;
