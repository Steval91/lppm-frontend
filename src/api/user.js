import { api, customApi } from "./axios";

export const getRoles = () =>
  customApi({
    "ngrok-skip-browser-warning": "any-value",
  }).get("/roles");

export const getUsers = () =>
  customApi({
    "ngrok-skip-browser-warning": "any-value",
  }).get("/users");

// export const getRoles = () => api.get("/roles");

// export const getUsers = () => api.get("/users");

export const createUser = (data) => api.post("/users", data);

export const updateUser = (data) => api.put("/users", data);

export const deleteUser = (id) => api.delete(`/users/${id}`);
