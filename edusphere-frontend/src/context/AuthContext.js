import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5050';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // { id, email, name, role }
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);  // true while checking stored token

  // Set axios default header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // On mount / token change → fetch user info
  const fetchUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/api/auth/me`, {
        headers: { 'x-auth-token': token },
      });
      setUser(res.data);
    } catch (err) {
      // Token invalid/expired
      console.warn('Token invalid, clearing auth');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Login via OTP verification (receives token + role from backend)
  const loginWithOtp = useCallback(async (email, otp) => {
    const res = await axios.post(`${API_BASE}/api/otp/verify`, { email, otp });
    setToken(res.data.token);
    // role stored in token, user info fetched via /me
    return res.data;
  }, []);

  // Login via password (existing flow)
  const loginWithPassword = useCallback(async (email, password) => {
    const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
    setToken(res.data.token);
    return res.data;
  }, []);

  // Login via Google credential
  const loginWithGoogle = useCallback(async (credential) => {
    const res = await axios.post(`${API_BASE}/api/auth/google`, { credential });
    setToken(res.data.token);
    return res.data;
  }, []);

  // Request OTP
  const requestOtp = useCallback(async (email) => {
    const res = await axios.post(`${API_BASE}/api/otp/request`, { email });
    return res.data;
  }, []);

  // Register
  const register = useCallback(async (email, password, role) => {
    const res = await axios.post(`${API_BASE}/api/auth/register`, { email, password, role });
    setToken(res.data.token);
    return res.data;
  }, []);

  // Update Profile
  const updateProfile = useCallback(async (profileData) => {
    const res = await axios.put(`${API_BASE}/api/auth/profile`, profileData, {
      headers: { 'x-auth-token': token }
    });
    setUser(res.data);
    return res.data;
  }, [token]);

  // Logout
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }, []);

  const value = {
    user,
    token,
    loading,
    loginWithOtp,
    loginWithPassword,
    loginWithGoogle,
    requestOtp,
    register,
    updateProfile,
    refreshUser: fetchUser,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
