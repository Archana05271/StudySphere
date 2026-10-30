import { io } from 'socket.io-client';

// Socket.IO lives on the server root (not /api/v1).
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// The JWT is sent in the handshake; the server rejects unauthenticated sockets.
export function createSocket(token) {
  return io(SOCKET_URL, { auth: { token }, autoConnect: true, reconnectionAttempts: 5 });
}
