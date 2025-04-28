import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const createAxiosInstance = (config = {}) => {
  return axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    ...config,
  });
};

// Default instance: JSON + optional token
export const api = createAxiosInstance();

// Form-data instance: For file uploads
export const formApi = createAxiosInstance({
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// Authenticated instance
export const authApi = (token) =>
  createAxiosInstance({
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

// Custom header usage (e.g., with locale or role info)
export const customApi = (headers) =>
  createAxiosInstance({
    headers,
  });
