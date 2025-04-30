export const getToken = () => localStorage.getItem("token");

export const setToken = (token) => {
  localStorage.setItem("token", token);
};

export const removeToken = () => {
  localStorage.removeItem("token");
};

export const saveAuthData = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const removeAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const setLocalUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getLocalUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const removeLocalUser = () => {
  localStorage.removeItem("user");
};
