'use strict';

require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 6969;

connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 2
    }
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use('/', require('./routes/authRoutes'));
app.use('/events', require('./routes/eventRoutes'));
app.use('/bookings', require('./routes/bookingRoutes'));
app.use('/contact', require('./routes/enquiryRoutes'));
app.use('/admin', require('./routes/analyticsRoutes'));

app.use((req, res) => res.status(404).send('404 — Page not found'));

app.listen(PORT, '127.0.0.1', () =>
  console.log(`Server running at http://127.0.0.1:${PORT}/`)
);
