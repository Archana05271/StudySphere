import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
dotenv.config();

async function main() {
  const name = process.env.ADMIN_NAME?.trim() || 'StudySphere Administrator';
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!process.env.MONGO_URI || !email || !password || password.length < 12) {
    throw new Error('Set MONGO_URI, ADMIN_EMAIL, and ADMIN_PASSWORD (at least 12 characters) in backend/.env');
  }
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') throw new Error('ADMIN_EMAIL already belongs to a non-admin account');
    console.log('An administrator with this email already exists; no changes made.');
    return;
  }
  await User.create({ name, email, password: await bcrypt.hash(password, 12), role: 'admin' });
  console.log('Administrator created successfully. Keep the credentials private.');
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(async () => { if (mongoose.connection.readyState) await mongoose.disconnect(); });
