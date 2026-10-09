const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding users');

    const users = [
      { email: 'jimitsinhataliya25@gmail.com', role: 'admin' },
      { email: '2403031057005@parulunivesity.ac.in', role: 'student' },
    ];

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (exists) {
        console.log(`User ${u.email} already exists, skipping.`);
        continue;
      }
      const hashed = await bcrypt.hash('123456', 10);
      const newUser = new User({
        email: u.email,
        password: hashed,
        role: u.role,
        name: u.email.split('@')[0],
      });
      await newUser.save();
      console.log(`Created ${u.role} user: ${u.email}`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
