import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, session } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => session.read());

  const logout = useCallback(() => {
    session.clear();
    setAuth({ token: null, user: null });
  }, []);

  // apiClient fires this when the server answers 401 to a protected call.
  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, [logout]);

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    session.save(data);
    setAuth({ token: data.token, user: data.user });
    return data.user;
  }, []);

  const register = useCallback((values) => authApi.register(values), []);

  const updateProfile = useCallback(async (fields) => {
    const user = await authApi.updateProfile(fields);
    sessionStorage.setItem('user', JSON.stringify(user));
    setAuth((prev) => ({ ...prev, user }));
    return user;
  }, []);

  const value = useMemo(() => ({
    user: auth.user,
    token: auth.token,
    role: auth.user?.role || null,
    isAuthenticated: Boolean(auth.token && auth.user),
    login, register, logout, updateProfile
  }), [auth, login, register, logout, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
