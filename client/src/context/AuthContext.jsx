import React, { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('janvoice_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const persistSession = (data) => {
    const { token, ...userData } = data;
    localStorage.setItem('janvoice_token', token);
    localStorage.setItem('janvoice_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const login = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      return persistSession(data);
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (payload) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { data } = await api.post('/auth/register', payload);
      return persistSession(data);
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('janvoice_token');
    localStorage.removeItem('janvoice_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, authLoading, authError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);