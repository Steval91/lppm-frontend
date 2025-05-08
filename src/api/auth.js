import { api, customApi } from "../api/axios"; // atau ganti sesuai lokasi axios instance kamu

export const loginApi = (data) =>
  customApi({
    "ngrok-skip-browser-warning": "any-value",
  }).post("/auth/login", data);

export const logoutApi = () => api.post("/logout");

export const getLoginUser = (id) =>
  customApi({
    "ngrok-skip-browser-warning": "any-value",
  }).get(`/users/${id}`);
