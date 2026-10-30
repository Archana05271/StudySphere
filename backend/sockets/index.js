import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendMessage } from '../services/messageService.js';

// userId -> number of open sockets (a user may have several tabs open)
const online = new Map();
const onlineIds = () => [...online.keys()];

export function initSockets(httpServer, origins) {
  const io = new Server(httpServer, { cors: { origin: origins, methods: ['GET', 'POST'] } });

  // Only authenticated users may connect: the JWT travels in the socket handshake.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.sub).select('name role');
      if (!user) return next(new Error('Account no longer exists'));
      socket.data.user = { id: String(user._id), name: user.name, role: user.role };
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const { id } = socket.data.user;
    socket.join(`user:${id}`);
    online.set(id, (online.get(id) || 0) + 1);
    socket.emit('connection_status', { connected: true, userId: id });
    io.emit('presence', { online: onlineIds() });

    socket.on('send_message', async (payload, ack) => {
      try {
        const message = await sendMessage(io, id, payload?.to, payload?.text);
        ack?.({ ok: true, message });
      } catch (error) {
        ack?.({ ok: false, message: error.status ? error.message : 'Could not send message' });
      }
    });

    socket.on('typing', ({ to } = {}) => { if (typeof to === 'string') io.to(`user:${to}`).emit('typing', { from: id }); });

    socket.on('disconnect', () => {
      const left = (online.get(id) || 1) - 1;
      if (left <= 0) online.delete(id); else online.set(id, left);
      io.emit('presence', { online: onlineIds() });
    });
  });

  return io;
}
