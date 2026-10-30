import Notification from '../models/Notification.js';

const shape = (n) => ({ id: String(n._id), title: n.title, message: n.message, type: n.type, isRead: n.isRead, createdAt: n.createdAt });

// Saves a notification and pushes it live to the recipient's socket room (if online).
export async function notifyUser(io, recipientId, { title = 'Notification', message, type = 'info' }) {
  const note = await Notification.create({ recipient: recipientId, title, message, type });
  io?.to(`user:${recipientId}`).emit('notification', shape(note));
  return note;
}

export async function notifyMany(io, recipientIds, payload) {
  const docs = await Notification.insertMany(recipientIds.map((recipient) => ({ recipient, ...payload })));
  docs.forEach((note) => io?.to(`user:${note.recipient}`).emit('notification', shape(note)));
  return docs.length;
}

export { shape as shapeNotification };
