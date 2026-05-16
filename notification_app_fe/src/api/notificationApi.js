import axios from 'axios';

const API_BASE = 'http://localhost:5000';
const TIMEOUT = 5000;

// Reusable axios instance
const api = axios.create({
  baseURL: API_BASE,
  timeout: TIMEOUT,
});

let cachedNotifications = null;
let cachedNotificationsPromise = null;

// Attach authorization automatically from REACT_APP_TOKEN
api.interceptors.request.use(
  (config) => {
    const token = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_TOKEN)
      ? process.env.REACT_APP_TOKEN
      : (typeof import.meta !== 'undefined' && import.meta.env)
        ? import.meta.env.VITE_NOTIFICATION_TOKEN || import.meta.env.VITE_BEARER_TOKEN || ''
        : '';
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Request started log
    console.info('[notificationApi] Request started', {
      method: config.method,
      url: config.url,
      params: config.params,
    });

    return config;
  },
  (error) => {
    console.error('[notificationApi] Request setup failed', error && error.message ? error.message : error);
    return Promise.reject(error);
  }
);

// Response logging
api.interceptors.response.use(
  (response) => {
    console.info('[notificationApi] Request success', {
      status: response.status,
      url: response.config && response.config.url,
    });
    return response;
  },
  (error) => {
    const meta = error && error.config ? { url: error.config.url, method: error.config.method } : {};
    console.error('[notificationApi] Request failure', meta, error && error.message ? error.message : error);
    return Promise.reject(error);
  }
);

function buildQueryParams(page = 1, limit = 10, notificationType) {
  const params = {};

  if (page !== undefined && page !== null && page !== '') params.page = page;
  if (limit !== undefined && limit !== null && limit !== '') params.limit = limit;
  if (notificationType) params.notification_type = notificationType;

  return params;
}

function normalizeNotifications(response) {
  console.log('RAW', response);

  const rawNotifications = Array.isArray(response?.notifications)
    ? response.notifications
    : Array.isArray(response?.data?.notifications)
      ? response.data.notifications
      : Array.isArray(response?.data)
        ? response.data
        : [];

  const normalized = rawNotifications.map((item) => ({
    id: item?.ID || '',
    type: item?.Type || 'Unknown',
    message: item?.Message || 'No message',
    timestamp: item?.Timestamp || null,
  }));

  console.log('NORMALIZED', normalized);

  return normalized;
}

function getTimestampValue(notification) {
  const rawValue = notification.timestamp || 0;

  if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
    return rawValue < 1000000000000 ? rawValue * 1000 : rawValue;
  }

  const parsed = Date.parse(rawValue);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getNotificationType(notification) {
  const rawType = notification.type || '';
  return String(rawType).trim();
}

function filterByType(notifications, type) {
  if (!type || type === 'All') {
    return [...notifications];
  }

  return notifications.filter((notification) => getNotificationType(notification).includes(type));
}

function sortByPriority(notifications) {
  const priorityOrder = {
    Placement: 3,
    Result: 2,
    Event: 1,
  };

  return [...notifications].sort((left, right) => {
    const leftType = getNotificationType(left);
    const rightType = getNotificationType(right);
    const leftScore = (priorityOrder[leftType] || 1) * 100000000 + getTimestampValue(left);
    const rightScore = (priorityOrder[rightType] || 1) * 100000000 + getTimestampValue(right);

    return rightScore - leftScore;
  });
}

function paginate(notifications, page = 1, limit = 10) {
  const startIndex = Math.max(0, (page - 1) * limit);
  return notifications.slice(startIndex, startIndex + limit);
}

async function fetchNotifications() {
  const response = await api.get(`${API_BASE}/notifications`);
  return normalizeNotifications(response?.data || response);
}

async function getAllNotificationsRaw() {
  if (Array.isArray(cachedNotifications)) {
    return cachedNotifications;
  }

  if (cachedNotificationsPromise) {
    return cachedNotificationsPromise;
  }

  cachedNotificationsPromise = fetchNotifications()
    .then((notifications) => {
      cachedNotifications = notifications;
      return notifications;
    })
    .catch((error) => {
      cachedNotifications = null;
      throw error;
    })
    .finally(() => {
      cachedNotificationsPromise = null;
    });

  return cachedNotificationsPromise;
}

export async function getNotifications(page = 1, limit = 10) {
  console.info(`[notificationApi] getNotifications: fetching page=${page} limit=${limit}`);

  try {
    const notifications = await getAllNotificationsRaw();
    const pagedNotifications = paginate(notifications, page, limit);
    console.info('[notificationApi] getNotifications: success', { count: pagedNotifications.length, total: notifications.length });
    return pagedNotifications;
  } catch (error) {
    console.error('[notificationApi] getNotifications: failed', error && error.message ? error.message : error);
    throw new Error('Unable to fetch notifications right now. Please try again.');
  }
}

export async function getFilteredNotifications(type, page = 1, limit = 10) {
  const cleanedType = typeof type === 'string' ? type.trim() : '';
  if (!cleanedType) throw new Error('notification_type is required for filtered notifications.');

  console.info(`[notificationApi] getFilteredNotifications: filter=${cleanedType} page=${page}`);

  try {
    const notifications = await getAllNotificationsRaw();
    const filteredNotifications = paginate(filterByType(notifications, cleanedType), page, limit);
    console.info('[notificationApi] getFilteredNotifications: success', { count: filteredNotifications.length, total: notifications.length });
    return filteredNotifications;
  } catch (error) {
    console.error('[notificationApi] getFilteredNotifications: failed', error && error.message ? error.message : error);
    throw new Error(`Unable to fetch ${cleanedType} notifications right now. Please try again.`);
  }
}

export async function getPriorityNotifications(limit = 10) {
  console.info('[notificationApi] getPriorityNotifications: fetching priority notifications');

  try {
    const notifications = await getAllNotificationsRaw();
    const sortedNotifications = sortByPriority(notifications).slice(0, limit);
    console.info('[notificationApi] getPriorityNotifications: success', { count: sortedNotifications.length, total: notifications.length });
    return sortedNotifications;
  } catch (error) {
    console.error('[notificationApi] getPriorityNotifications: failed', error && error.message ? error.message : error);
    throw new Error('Unable to fetch priority notifications right now. Please try again.');
  }
}
