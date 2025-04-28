import { api, formApi, authApi, customApi } from "./axios";

// Default JSON usage
export const getProposals = () => api.get("/proposals");

// Upload proposal document (file)
export const uploadProposalFile = (formData) =>
  formApi.post("/proposals/upload", formData);

// Update proposal with auth token
export const updateProposalSecure = (id, data, token) =>
  authApi(token).put(`/proposals/${id}`, data);

// Custom header: locale, tenant, etc
export const getWithLocale = (locale = "id-ID") =>
  customApi({ "Accept-Language": locale }).get("/proposals");

// src/api/User.js
export const getUsers = () => api.get("/users");
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post("/users", data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
