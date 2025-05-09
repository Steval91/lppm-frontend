// Auth constants
const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

// Token operations
export const getToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const setToken = (token) => {
  if (!token) return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const removeToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

// User operations
export const getLocalUser = () => {
  const userJson = localStorage.getItem(AUTH_USER_KEY);
  try {
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error("Failed to parse user data:", error);
    return null;
  }
};

export const setLocalUser = (user) => {
  if (!user) return;

  // Only store essential user data
  const minimalUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    userType: user.userType,
    roles: user.roles,
    ...(user.dosen && {
      dosen: {
        id: user.dosen.id,
        name: user.dosen.name,
        nidn: user.dosen.nidn,
      },
    }),
    ...(user.student && {
      student: {
        id: user.student.id,
        name: user.student.name,
      },
    }),
  };

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(minimalUser));
};

export const removeLocalUser = () => {
  localStorage.removeItem(AUTH_USER_KEY);
};

// Combined operations
export const saveAuthData = (token, user) => {
  setToken(token);
  setLocalUser(user);
};

export const removeAuthData = () => {
  removeToken();
  removeLocalUser();
};

// Token validation
export const isTokenValid = (token) => {
  if (!token) return false;

  try {
    // Pastikan token memiliki 3 bagian yang dipisah titik
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const payload = JSON.parse(atob(parts[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    return !isExpired;
  } catch (error) {
    console.error("Token validation failed:", error);
    return false;
  }
};
