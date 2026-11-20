import React, { createContext, useState, useEffect } from "react";
import { authService } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Charger l'utilisateur depuis le localStorage au montage
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("access_token");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);

      try {
        const profileData = await authService.getProfile();
        localStorage.setItem("user", JSON.stringify(profileData));
        setUser(profileData);
        setToken(localStorage.getItem("access_token"));
        return { success: true, user: profileData };
      } catch (profileErr) {
        console.log("Could not fetch profile, using default");
        const basicUser = { email, ...response.user };
        localStorage.setItem("user", JSON.stringify(basicUser));
        setUser(basicUser);
        setToken(localStorage.getItem("access_token"));
        return { success: true, user: basicUser };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      
      if (response.access && response.refresh) {
        localStorage.setItem("access_token", response.access);
        localStorage.setItem("refresh_token", response.refresh);
        
        const user = response.user || userData;
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        setToken(response.access);
      }
      
      return { success: true, data: response };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.updateProfile(userData);
      const updatedUser = { ...user, ...response };
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

