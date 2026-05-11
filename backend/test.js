require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("./models/User");
const Category = require("./models/Category");
const Event = require("./models/Event");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await User.deleteMany();
    await Category.deleteMany();
    await Event.deleteMany();

     const passwordHash = await bcrypt.hash("admin123", 10);

    const admin = await User.create({
      fullName: "John Doe",
      email: "admin@bci.com",
      passwordHash,
      role: "admin",
      phoneNumber: "0123456789"
    });

    const category = await Category.create({
      name: "Conference",
      description: "Corporate and professional events"
    });

    await Event.create({
      title: "Tech Innovation Conference",
      description: "A professional technology conference.",
      categoryId: category._id,
      venue: "Smart City",
      eventDate: new Date("2026-06-15"),
      startTime: "09:00",
      endTime: "16:00",
      price: 250,
      totalCapacity: 100,
      availableTickets: 100,
      status: "active",
      imageUrl: "/images/event.jpg",
      createdBy: admin._id
    });

    console.log("Database seeded successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();