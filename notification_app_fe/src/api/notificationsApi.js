export * from './notificationApi';

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 5000,
});

function normalizeNotificationsResponse(response) {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response.data?.notifications)) {
    return response.data.notifications;
  }

  return [];
}

export async function fetchAllNotifications() {
  const response = await api.get('/notifications');
  return normalizeNotificationsResponse(response);
}

export async function fetchPriorityNotifications() {
  const response = await api.get('/priority');
  return normalizeNotificationsResponse(response);
}