import React, { createContext, useState, useEffect, useContext } from "react";
import { getToken, removeToken } from "../utils/auth";
import { api } from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const fetchUser = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await api.get("/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (err) {
      console.error("Gagal fetch user:", err);
      setUser(null);
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setNotifications([]);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, notifications, setNotifications, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
