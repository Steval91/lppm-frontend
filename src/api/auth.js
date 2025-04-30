import { api } from "../api/axios"; // atau ganti sesuai lokasi axios instance kamu

export const loginApi = (data) => api.post("/auth/login", data);

export const logoutApi = () => api.post("/logout");

export const getLoginUser = (id) => api.get(`/users/${id}`);
