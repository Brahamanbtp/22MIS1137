require('dotenv').config();
const axios = require('axios');
const Log = require('../logging_middleware/log');

const NOTIFICATIONS_ENDPOINT = 'http://4.224.186.213/evaluation-service/notifications';

async function fetchNotifications() {
  const token = process.env.TOKEN || '';

  await Log('backend', 'info', 'service', 'Fetching notifications');

  if (!token) {
    await Log('backend', 'fatal', 'service', 'Missing TOKEN in environment');
    const err = new Error('Missing TOKEN in environment');
    err.statusCode = 500;
    throw err;
  }

  try {
    const response = await axios.get(NOTIFICATIONS_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 5000,
    });

    await Log('backend', 'info', 'service', 'Fetching notifications success');

    const notifications = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.notifications)
        ? response.data.notifications
        : [];

    return notifications;
  } catch (error) {
    await Log('backend', 'error', 'service', error.message || 'Failed to fetch notifications');

    const wrapped = new Error('Unable to fetch notifications');
    wrapped.statusCode = error.response ? error.response.status : 502;
    throw wrapped;
  }
}

module.exports = {
  fetchNotifications,
};
