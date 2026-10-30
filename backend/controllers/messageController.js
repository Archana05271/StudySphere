import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendMessage, getConversation } from '../services/messageService.js';

export const contacts = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select('name role department').sort({ name: 1 }).limit(200).lean();
  res.json({ success: true, contacts: users.map((u) => ({ id: String(u._id), name: u.name, role: u.role, department: u.department || '' })) });
});

export const history = asyncHandler(async (req, res) => {
  res.json({ success: true, messages: await getConversation(req.user._id, req.params.userId) });
});

// REST fallback for sending (the chat UI uses the socket); both share the same service.
export const send = asyncHandler(async (req, res) => {
  const message = await sendMessage(req.app.get('io'), req.user._id, req.body?.to, req.body?.text);
  res.status(201).json({ success: true, message });
});
