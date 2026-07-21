import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nivaas_token') || '');
  const [loading, setLoading] = useState(true);

  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getMe();
      setUser(data.user);
    } catch (err) {
      console.error('Failed to fetch user session:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await api.login(email, password);
    const { token: authToken, user: userData } = data;
    localStorage.setItem('nivaas_token', authToken);
    setToken(authToken);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const data = await api.register(formData);
    const { token: authToken, user: userData } = data;
    localStorage.setItem('nivaas_token', authToken);
    setToken(authToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('nivaas_token');
    localStorage.removeItem('nivaas_current_user');
    setToken('');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
