import { customApi } from "./axios";

export const getUserNotifications = (userId) => {
  return customApi({
    "ngrok-skip-browser-warning": "any-value",
  }).get(`/notifications/${userId}`);
};

export const markNotificationReadApi = (notificationId) =>
  customApi({
    "ngrok-skip-browser-warning": "any-value",
  }).get(`/notifications/mark-read/${notificationId}`);
