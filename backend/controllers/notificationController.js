import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import httpError from '../utils/httpError.js';
import { notifyMany, shapeNotification } from '../services/notificationService.js';

export const listMine = asyncHandler(async (req, res) => {
  const rows = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(100).lean();
  const unread = rows.filter((n) => !n.isRead).length;
  res.json({ success: true, count: rows.length, unread, notifications: rows.map(shapeNotification) });
});

export const markRead = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(400, 'Invalid notification ID');
  const note = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { isRead: true }, { new: true });
  if (!note) throw httpError(404, 'Notification not found');
  res.json({ success: true, notification: shapeNotification(note) });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true, message: 'All notifications marked as read' });
});

// Admin announcement → saved for every student and pushed live to whoever is online.
export const broadcast = asyncHandler(async (req, res) => {
  const { title = 'Announcement', message } = req.body || {};
  if (typeof message !== 'string' || !message.trim() || message.trim().length > 500) throw httpError(400, 'Message is required (max 500 characters)');
  if (typeof title !== 'string' || title.length > 120) throw httpError(400, 'Title must be at most 120 characters');
  const students = await User.find({ role: 'student' }).select('_id').lean();
  const sent = await notifyMany(req.app.get('io'), students.map((s) => s._id), { title: title.trim() || 'Announcement', message: message.trim(), type: 'announcement' });
  res.status(201).json({ success: true, message: `Announcement sent to ${sent} student(s)`, sent });
});
