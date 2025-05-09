import React, { createContext, useState, useEffect, useCallback } from "react";
import {
  getToken,
  getLocalUser,
  removeAuthData,
  saveAuthData,
  isTokenValid,
} from "../utils/auth";
import { getUserNotifications } from "../api/notification";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    loading: true,
    error: null,
    notifications: [],
    notificationSummary: { totalRead: 0, totalUnread: 0 },
  });

  const fetchUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      // Tidak ada token, langsung matikan loading dan reset error
      setState((prev) => ({ ...prev, loading: false, error: null }));
      return null;
    }

    try {
      // Hanya set loading true kalau token ada
      setState((prev) => ({ ...prev, loading: true, error: null }));

      if (!isTokenValid(token)) {
        removeAuthData();
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Session expired. Please login again.",
        }));
        return null;
      }

      const localUser = getLocalUser();
      if (!localUser?.id) {
        removeAuthData();
        setState((prev) => ({ ...prev, loading: false }));
        return null;
      }

      // Tambahkan user ke state jika valid
      setState((prev) => ({
        ...prev,
        user: localUser,
        loading: false,
        error: null,
      }));

      return localUser;
    } catch (error) {
      console.error("Auth error:", error);
      removeAuthData();
      setState((prev) => ({
        ...prev,
        loading: false,
        error: null, // bisa juga set pesan error jika diperlukan
      }));
      return null;
    }
  }, []);

  const fetchNotifications = useCallback(async (userId) => {
    if (!userId) return;

    try {
      const res = await getUserNotifications(userId);
      const notifications = res.data.notifications || [];
      const totalUnread = notifications.filter((n) => !n.read).length;

      setState((prev) => ({
        ...prev,
        notifications,
        notificationSummary: {
          totalUnread,
          totalRead: notifications.length - totalUnread,
        },
      }));
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let notificationInterval;

    const initializeAuth = async () => {
      try {
        const user = await fetchUser();
        if (isMounted && user?.id) {
          await fetchNotifications(user.id);
          notificationInterval = setInterval(() => {
            fetchNotifications(user.id);
          }, 30000);
        }
      } catch (error) {
        // Tidak perlu set error di sini
        console.error("Initialization error:", error);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      clearInterval(notificationInterval);
    };
  }, [fetchUser, fetchNotifications]);

  const login = async (token, userData) => {
    try {
      if (!token || !userData) {
        throw new Error("Invalid login data");
      }

      // Validasi token sebelum menyimpan
      if (!isTokenValid(token)) {
        throw new Error("Invalid token format");
      }

      saveAuthData(token, userData);

      setState((prev) => ({
        ...prev,
        user: userData,
        loading: false,
        error: null,
      }));

      await fetchNotifications(userData.id);
      return true; // Return boolean untuk indikator sukses
    } catch (error) {
      console.error("Login failed:", error);
      removeAuthData();
      setState((prev) => ({
        ...prev,
        error: error.message || "Login failed",
      }));
      return false;
    }
  };

  const logout = () => {
    removeAuthData();
    setState({
      user: null,
      loading: false,
      error: null,
      notifications: [],
      notificationSummary: { totalRead: 0, totalUnread: 0 },
    });
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
        notificationSummary: {
          ...prev.notificationSummary,
          totalUnread: Math.max(0, prev.notificationSummary.totalUnread - 1),
          totalRead: prev.notificationSummary.totalRead + 1,
        },
      }));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const value = {
    ...state,
    login,
    logout,
    fetchUser,
    fetchNotifications,
    markNotificationAsRead,
  };

  return (
    <AuthContext.Provider value={value}>
      {state.loading ? (
        <div className="full-page-loader">
          {/* Add your loading spinner component here */}
          Loading...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
