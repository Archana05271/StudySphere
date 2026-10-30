import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createSocket } from '../api/socketClient';
import { notificationService } from '../api/notificationService';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

// One authenticated socket per logged-in user: connection status, who is online,
// and live notifications (no page refresh needed).
export function SocketProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [onlineIds, setOnlineIds] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let active = true;
    notificationService.list().then((d) => active && setNotifications(d.notifications)).catch(() => {});

    const socket = createSocket(token);
    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));
    socket.on('presence', ({ online }) => setOnlineIds(online));
    socket.on('notification', (note) => {
      setNotifications((prev) => [note, ...prev]);
      setToast(note);
    });
    return () => {
      active = false;
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
      setOnlineIds([]);
      setNotifications([]);
    };
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const markRead = useCallback(async (id) => {
    await notificationService.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const value = useMemo(() => ({
    socketRef, connected, onlineIds, notifications,
    unread: notifications.filter((n) => !n.isRead).length,
    markRead, markAllRead, toast, dismissToast: () => setToast(null)
  }), [connected, onlineIds, notifications, markRead, markAllRead, toast]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside <SocketProvider>');
  return ctx;
};
