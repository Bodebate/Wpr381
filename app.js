'use strict';
const express = require('express');
const path    = require('path');

const app  = express();
const PORT = 6969;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/',          require('./routes/authRoutes'));
app.use('/events',    require('./routes/eventRoutes'));
app.use('/bookings',  require('./routes/bookingRoutes'));
app.use('/contact',   require('./routes/enquiryRoutes'));
app.use('/admin',     require('./routes/analyticsRoutes'));

app.use((req, res) => res.status(404).send('404 — Page not found'));

app.listen(PORT, '127.0.0.1', () =>
    console.log(`Server running at http://127.0.0.1:${PORT}/`)
);
