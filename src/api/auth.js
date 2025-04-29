import { api } from "../api/axios"; // atau ganti sesuai lokasi axios instance kamu
import { setToken } from "../utils/auth";

export const loginApi = async (username, password) => {
  const response = await api.post(
    "/auth/login",
    { username, password },
    {
      withCredentials: true,
    }
  );

  console.log("Login response:", response.data); // Debugging log

  const { token, user, notifications } = response.data;
  // const { token, user, notifications } = response.data;

  setToken(token);
  return { user, notifications };
};

export const logoutApi = async () => {
  // Kalau backend kamu ada endpoint logout, bisa dipanggil di sini
  // await api.post("/logout");
  // Untuk sekarang cukup hapus token lokal saja
};
