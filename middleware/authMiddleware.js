'use strict';

exports.requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/');
  }
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/');
  }

  if (req.session.user.role !== 'admin') {
    return res.status(403).send('403 — Admin access required');
  }

  next();
};
