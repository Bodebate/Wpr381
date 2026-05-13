'use strict';
const router = require('express').Router();
const ctrl   = require('../controllers/authController');

router.get('/',         ctrl.getLogin);
router.post('/register', ctrl.postRegister);
router.post('/login',    ctrl.postLogin);
router.get('/logout',    ctrl.logout);

module.exports = router;
