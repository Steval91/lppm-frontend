import React, { createContext, useState, useEffect, useContext } from "react";
import {
  getToken,
  getLocalUser,
  removeAuthData,
  setLocalUser,
  removeLocalUser,
} from "../utils/auth";
import { getLoginUser } from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const fetchUser = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const savedUser = getLocalUser();
      const response = await getLoginUser(savedUser.id);
      console.log("User data:", response.data);
      updateUser(response.data);
    } catch (err) {
      console.error("Gagal fetch user:", err);
      updateUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const updateUser = (data) => {
    setUser(data);
    if (data) {
      setLocalUser(data);
    } else {
      removeLocalUser();
    }
  };

  const logout = () => {
    removeAuthData();
    updateUser(null);
    setNotifications([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        updateUser,
        notifications,
        setNotifications,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
