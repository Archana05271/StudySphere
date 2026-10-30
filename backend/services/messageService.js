import mongoose from 'mongoose';
import Message from '../models/Message.js';
import User from '../models/User.js';
import httpError from '../utils/httpError.js';

export const shapeMessage = (m) => ({ id: String(m._id), sender: String(m.sender), recipient: String(m.recipient), text: m.text, createdAt: m.createdAt });

export async function sendMessage(io, senderId, recipientId, text) {
  if (!mongoose.isValidObjectId(recipientId)) throw httpError(400, 'Invalid recipient');
  if (typeof text !== 'string' || !text.trim() || text.trim().length > 2000) throw httpError(400, 'Message must be 1–2000 characters');
  if (String(senderId) === String(recipientId)) throw httpError(400, 'You cannot message yourself');
  if (!(await User.exists({ _id: recipientId }))) throw httpError(404, 'Recipient not found');
  const message = shapeMessage(await Message.create({ sender: senderId, recipient: recipientId, text: text.trim() }));
  // Deliver instantly to every open tab of both users – no page refresh needed.
  io?.to(`user:${recipientId}`).to(`user:${senderId}`).emit('receive_message', message);
  return message;
}

export async function getConversation(userId, otherId, limit = 100) {
  if (!mongoose.isValidObjectId(otherId)) throw httpError(400, 'Invalid user ID');
  const rows = await Message.find({
    $or: [{ sender: userId, recipient: otherId }, { sender: otherId, recipient: userId }]
  }).sort({ createdAt: -1 }).limit(limit).lean();
  return rows.reverse().map(shapeMessage);
}
