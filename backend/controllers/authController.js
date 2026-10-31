
import jwt from 'jsonwebtoken';
import * as authService from '../services/authService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerStudent(req.body);

  res.status(201).json({
    success: true,
    message: 'Student registered successfully',
    user,
    student: user
  });
});

export const login = asyncHandler(async (req, res) => {
  const user = await authService.loginStudent(req.body);
  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

  const token = jwt.sign(
    { role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { subject: user.id, expiresIn }
  );

  res.json({
    success: true,
    message: 'Login successful',
    token,
    tokenType: 'Bearer',
    expiresIn,
    user,
    student: user
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: authService.publicUser(req.user)
  });
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(
    req.user._id,
    req.body || {}
  );

  res.json({
    success: true,
    message: 'Profile updated',
    user
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(
    req.user._id,
    req.body?.currentPassword,
    req.body?.newPassword
  );

  res.json({
    success: true,
    message: 'Password changed'
  });
});

// Forgot password using registered email and new password.
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body || {};

  if (
    typeof confirmPassword !== 'string' ||
    newPassword !== confirmPassword
  ) {
    const error = new Error('New password and confirm password do not match');
    error.statusCode = 400;
    throw error;
  }

  const result = await authService.resetStudentPassword(
    email,
    newPassword
  );

  res.json(result);
});
