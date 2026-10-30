import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

// Pops up when a real-time notification arrives.
export default function Toast() {
  const { toast, dismissToast } = useSocket();
  const { role } = useAuth();
  const navigate = useNavigate();
  if (!toast) return null;
  return (
    <div className="toast" role="status" onClick={() => { dismissToast(); navigate(role === 'admin' ? '/admin/notifications' : '/student/notifications'); }}>
      <strong>{toast.title}</strong>
      <small>{toast.message}</small>
    </div>
  );
}
