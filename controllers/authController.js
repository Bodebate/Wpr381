'use strict';

exports.getLogin = (req, res) => res.render('index');

exports.postRegister = (req, res) => {
    // TODO: hash password, save user to DB
    console.log('[STUB] Register:', req.body);
    res.redirect('/events');
};

exports.postLogin = (req, res) => {
    // TODO: verify credentials, set session
    console.log('[STUB] Login:', req.body);
    res.redirect('/events');
};

exports.logout = (req, res) => res.redirect('/');
