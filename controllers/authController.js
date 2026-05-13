'use strict';

const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.getLogin = (req, res) => res.render('index', { error: null });

exports.postRegister = async (req, res) => {
  try {
    const { firstName, surname, phoneNumber, email, password } = req.body;

    if (!firstName || !surname || !email || !password) {
      return res.render('index', { error: 'Please fill in all required fields.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.render('index', { error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName: `${firstName} ${surname}`.trim(),
      email,
      passwordHash,
      role: 'user',
      phoneNumber
    });

    req.session.user = {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role
    };

    res.redirect('/events');

  } catch (error) {
    console.error('Register error:', error);
    res.render('index', { error: 'Registration failed. Please try again.' });
  }
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.render('index', { error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.render('index', { error: 'Invalid email or password.' });
    }

    req.session.user = {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role
    };

    if (user.role === 'admin') {
      return res.redirect('/admin/events');
    }

    return res.redirect('/events');
  } catch (error) {
    console.error('Login error:', error);
    res.render('index', { error: 'Login failed. Please try again.' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
