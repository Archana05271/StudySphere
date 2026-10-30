
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import httpError from '../utils/httpError.js';

// Return public user details without exposing the password.
export const publicUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department || '',
  phone: user.phone || ''
});

// Register a new student account.
export async function register(userData) {
  const name = userData?.name?.trim();
  const email = userData?.email?.trim().toLowerCase();
  const password = userData?.password;

  if (!name || !email || typeof password !== 'string') {
    throw httpError(400, 'Name, email and password are required');
  }

  if (name.length < 2 || name.length > 100) {
    throw httpError(400, 'Name must be 2–100 characters');
  }

  if (
    password.length < 8 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    throw httpError(
      400,
      'Password must be at least 8 characters and at most 72 bytes'
    );
  }

  if (await User.exists({ email })) {
    throw httpError(409, 'An account with this email already exists');
  }

  // Hash the password before storing it.
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    department: userData?.department?.trim() || '',
    phone: userData?.phone?.trim() || '',
    role: 'student'
  });

  return publicUser(user);
}

// Maintain compatibility with the existing auth controller.
export const registerStudent = register;

// Authenticate a student using email and password.
export async function loginStudent(credentials) {
  const email = credentials?.email?.trim().toLowerCase();
  const password = credentials?.password;

  if (!email || typeof password !== 'string') {
    throw httpError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw httpError(401, 'Invalid email or password');
  }

  return publicUser(user);
}

// Update editable profile information.
export async function updateProfile(userId, fields = {}) {
  const update = {};

  if (fields.name !== undefined) {
    if (
      typeof fields.name !== 'string' ||
      fields.name.trim().length < 2 ||
      fields.name.trim().length > 100
    ) {
      throw httpError(400, 'Name must be 2–100 characters');
    }

    update.name = fields.name.trim();
  }

  if (fields.department !== undefined) {
    if (
      typeof fields.department !== 'string' ||
      fields.department.trim().length > 100
    ) {
      throw httpError(400, 'Department must be at most 100 characters');
    }

    update.department = fields.department.trim();
  }

  if (fields.phone !== undefined) {
    if (typeof fields.phone !== 'string') {
      throw httpError(400, 'Phone number is invalid');
    }

    const phone = fields.phone.trim();
    const phonePattern = /^[0-9+()\-\s]{7,15}$/;

    if (phone && !phonePattern.test(phone)) {
      throw httpError(400, 'Phone number is invalid');
    }

    update.phone = phone;
  }

  if (!Object.keys(update).length) {
    throw httpError(400, 'No editable fields supplied');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw httpError(404, 'User account not found');
  }

  // Only explicitly permitted profile fields are updated.
  user.set(update);
  await user.save();

  return publicUser(user);
}

// Change password after verifying the current password.
export async function changePassword(
  userId,
  currentPassword,
  newPassword
) {
  if (
    typeof newPassword !== 'string' ||
    newPassword.length < 8 ||
    Buffer.byteLength(newPassword, 'utf8') > 72
  ) {
    throw httpError(
      400,
      'New password must be at least 8 characters and at most 72 bytes'
    );
  }

  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw httpError(404, 'User account not found');
  }

  if (
    typeof currentPassword !== 'string' ||
    !(await bcrypt.compare(currentPassword, user.password))
  ) {
    throw httpError(401, 'Current password is incorrect');
  }

  // Hash the new password before saving.
  user.password = await bcrypt.hash(newPassword, 12);

  await user.save();
}
