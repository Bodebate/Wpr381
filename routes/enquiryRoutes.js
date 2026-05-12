'use strict';
const router = require('express').Router();
const ctrl   = require('../controllers/enquiryController');

router.get('/',  ctrl.getContact);
router.post('/', ctrl.postEnquiry);

module.exports = router;
