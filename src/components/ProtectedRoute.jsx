import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Blocks a route group unless the user is logged in with the required role.
export default function ProtectedRoute({ role }) {
  const { isAuthenticated, role: userRole } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to={role === 'admin' ? '/auth/admin-login' : '/auth/login'} replace state={{ from: location }} />;
  if (role && userRole !== role) return <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  return <Outlet />;
}
