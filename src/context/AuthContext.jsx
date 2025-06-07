// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to load/refresh user data
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // This endpoint should return the authenticated user's details based on the token
        const res = await api.get('/auth/me'); // Example: Your backend should have an /auth/me or /user/me endpoint
        setUser(res.data.user);
      } catch (error) {
        console.error("Failed to load user from token:", error);
        localStorage.removeItem('token');
        setUser(null);
        toast.error("Session expired or invalid. Please log in again.");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser(); // Load user on initial mount
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password }); // Adjust your auth endpoint
      localStorage.setItem('token', res.data.token);
      // Immediately load the user's data after successful login to get all details
      await loadUser(); // Use loadUser to get the full user object
      toast.success("Logged in successfully!");
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error.response?.data?.message || "Login failed!");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success("Logged out successfully!");
  };

  if (loading) {
    return <div>Loading authentication...</div>; // Or a proper loading spinner
  }

  return (
    // Provide `loadUser` (or `refreshUser`) to children if components need to trigger a refresh
    <AuthContext.Provider value={{ user, login, logout, refreshUser: loadUser }}> 
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);