import { api } from "./axios";

export const getUserNotifications = (userId) => {
  return api.get(`/notifications/${userId}`);
};

export const markNotificationReadApi = (notificationId) =>
  api.get(`/notifications/mark-read/${notificationId}`);
