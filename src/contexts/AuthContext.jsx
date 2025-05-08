import React, { createContext, useState, useEffect, useContext } from "react";
import { getLoginUser } from "../api/auth";
import {
  getToken,
  getLocalUser,
  removeAuthData,
  saveAuthData,
} from "../utils/auth";
import {
  getUserNotifications,
  markNotificationReadApi,
} from "../api/notification";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notificationSummary, setNotificationSummary] = useState({
    totalRead: 0,
    totalUnread: 0,
  });

  const fetchUser = async () => {
    try {
      setLoadingUser(true);
      const token = getToken();
      if (!token) return;

      const savedUser = getLocalUser();
      const response = await getLoginUser(savedUser.id);
      updateUser(response.data);
    } catch (err) {
      console.error("Gagal fetch user:", err);
      // updateUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchNotifications = async (userId) => {
    try {
      const res = await getUserNotifications(userId);
      const notif = res.data.notifications || [];
      setNotifications(notif);
      const totalUnread = notif.filter((n) => !n.read).length;
      const totalRead = notif.length - totalUnread;
      setNotificationSummary({ totalUnread, totalRead });
    } catch (err) {
      console.error("Gagal fetch notifikasi:", err);
    }
  };

  useEffect(() => {
    // fetchUser(); // fetch user awal

    if (!user?.id) return;

    fetchNotifications(user.id); // fetch awal

    const interval = setInterval(() => {
      fetchNotifications(user.id);
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  const updateUser = (data) => {
    setUser(data);
    if (data) {
      saveAuthData(getToken(), data);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await markNotificationReadApi(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setNotificationSummary((prev) => ({
        ...prev,
        totalUnread: prev.totalUnread - 1,
        totalRead: prev.totalRead + 1,
      }));
    } catch (err) {
      console.error("Gagal update notifikasi:", err);
    }
  };

  const logout = () => {
    removeAuthData();
    setUser(null);
    setNotifications([]);
    setNotificationSummary({ totalRead: 0, totalUnread: 0 });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loadingUser,
        updateUser,
        fetchNotifications,
        notifications,
        setNotifications,
        notificationSummary,
        setNotificationSummary,
        markNotificationAsRead,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
