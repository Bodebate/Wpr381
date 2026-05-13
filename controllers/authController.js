'use strict';

const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.getLogin = (req, res) => res.render('index');

exports.postRegister = async (req, res) => {
  try {
    const { firstName, surname, phoneNumber, email, password } = req.body;

    if (!firstName || !surname || !email || !password) {
      return res.status(401).send('Please fill in all required fields.');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(402).send('An account with this email already exists.');
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

    res.status(200).json({redirect:'/events',success:true});

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({message:'Registration failed.',success:false});
  }
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).send('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).send('Invalid email or password.');
    }

    req.session.user = {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role
    };

    if (user.role === 'admin') {
      return res.status(200).json({redirect:'/admin/events',success:true});
    }

    return res.status(200).json({redirect:'/events',success:true});
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({success:false,message:'Login failed.'});
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
