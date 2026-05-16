const axios = require('axios');
const Log = require('../logging_middleware/log');

const NOTIFICATIONS_ENDPOINT = 'http://4.224.186.213/evaluation-service/notifications';
const SCORE_MULTIPLIER = 100000000;
const PRIORITY_WEIGHTS = {
  placement: 3,
  result: 2,
  event: 1,
};

function getToken() {
  return process.env.NOTIFICATIONS_BEARER_TOKEN || process.env.NOTIFICATION_BEARER_TOKEN || process.env.BEARER_TOKEN || '';
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function getTimestamp(notification) {
  const rawValue = notification.timestamp || notification.createdAt || notification.created_at || notification.timeStamp || notification.time || notification.date || notification.updatedAt;

  if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
    return rawValue < 1000000000000 ? rawValue * 1000 : rawValue;
  }

  const parsed = Date.parse(rawValue);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getNotificationType(notification) {
  const candidateFields = [
    notification.priority,
    notification.type,
    notification.category,
    notification.name,
    notification.title,
    notification.label,
    notification.message,
  ];

  for (const field of candidateFields) {
    const normalized = normalizeString(field);

    if (normalized.includes('placement')) {
      return 'placement';
    }

    if (normalized.includes('result')) {
      return 'result';
    }

    if (normalized.includes('event')) {
      return 'event';
    }
  }

  return 'event';
}

function scoreNotification(notification) {
  const type = getNotificationType(notification);
  const weight = PRIORITY_WEIGHTS[type] || 1;
  const timestamp = getTimestamp(notification);

  return (weight * SCORE_MULTIPLIER) + timestamp;
}

async function fetchPriorityNotifications() {
  const token = getToken();

  if (!token) {
    await Log('backend', 'fatal', 'service', 'Missing notifications bearer token');
    const error = new Error('Missing bearer token for notifications API');
    error.statusCode = 500;
    throw error;
  }

  await Log('backend', 'info', 'service', 'Fetch start for notifications API');

  try {
    const response = await axios.get(NOTIFICATIONS_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 5000,
    });

    const notifications = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.notifications)
        ? response.data.notifications
        : [];

    const sortedNotifications = notifications
      .map((notification) => ({
        ...notification,
        score: scoreNotification(notification),
      }))
      .sort((left, right) => right.score - left.score)
      .slice(0, 10);

    await Log('backend', 'info', 'service', 'Fetch success for notifications API');

    return sortedNotifications;
  } catch (error) {
    await Log('backend', 'error', 'service', error.message || 'Failed to fetch notifications');

    const wrappedError = new Error('Unable to fetch priority notifications');
    wrappedError.statusCode = error.response ? 502 : 500;
    throw wrappedError;
  }
}

module.exports = {
  fetchPriorityNotifications,
  scoreNotification,
};