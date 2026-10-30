import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

async function resetAdminPassword() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!process.env.MONGO_URI || !email || !password) {
    throw new Error('Check MONGO_URI, ADMIN_EMAIL and ADMIN_PASSWORD in .env');
  }

  if (password.length < 12) {
    throw new Error('Admin password must contain at least 12 characters');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const admin = await User.findOne({ email }).select('+password');

  if (!admin || admin.role !== 'admin') {
    throw new Error('Admin account not found');
  }

  admin.password = await bcrypt.hash(password, 12);
  await admin.save();

  console.log('Admin password updated successfully.');
}

resetAdminPassword()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
    }
  });
