'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./models/User');
const Category = require('./models/Category');
const Event = require('./models/Event');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    await User.deleteMany({});
    await Category.deleteMany({});
    await Event.deleteMany({});

    const adminPasswordHash = await bcrypt.hash('admin123', 10);

    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      phoneNumber: '0123456789'
    });

    const categories = await Category.insertMany([
      { name: 'Outdoors', description: 'Outdoor events' },
      { name: 'Indoors', description: 'Indoor events' },
      { name: 'Quiet', description: 'Low-noise and relaxed events' },
      { name: 'Crowd', description: 'Large crowd events' }
    ]);

    const categoryMap = Object.fromEntries(categories.map(category => [category.name, category._id]));

    await Event.insertMany([
      {
        title: 'Mountain Lights',
        description: 'An outdoor evening event with scenic mountain views.',
        categoryId: categoryMap.Outdoors,
        venue: 'Pretoria Botanical Gardens',
        eventDate: new Date('2026-07-11'),
        startTime: '08:00',
        endTime: '18:30',
        price: 175.53,
        totalCapacity: 100,
        availableTickets: 89,
        status: 'active',
        imageUrl: '/images/boats.jpg',
        createdBy: admin._id
      },
      {
        title: 'Tech Innovation Conference',
        description: 'A professional technology conference for students and businesses.',
        categoryId: categoryMap.Indoors,
        venue: 'Pretoria Convention Centre',
        eventDate: new Date('2026-08-15'),
        startTime: '09:00',
        endTime: '16:00',
        price: 250,
        totalCapacity: 120,
        availableTickets: 120,
        status: 'active',
        imageUrl: '/images/boats.jpg',
        createdBy: admin._id
      }
    ]);

    console.log('Database seeded successfully');
    console.log('Admin login: admin@example.com / admin123');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();
