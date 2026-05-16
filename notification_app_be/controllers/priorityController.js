const Log = require('../logging_middleware/log');
const { fetchPriorityNotifications } = require('../services/priorityService');
const { fetchNotifications } = require('../services/notificationService');

function normalizeNotificationsResponse(notifications) {
  return {
    success: true,
    count: notifications.length,
    data: notifications,
  };
}

async function getPriorityNotifications(req, res) {
  await Log('backend', 'info', 'controller', 'GET /priority request received');

  try {
    const notifications = await fetchPriorityNotifications();

    return res.status(200).json(normalizeNotificationsResponse(notifications));
  } catch (error) {
    await Log('backend', 'error', 'controller', error.message || 'Failed to handle GET /priority');

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Unable to fetch priority notifications',
    });
  }
}

async function getNotifications(req, res) {
  await Log('backend', 'info', 'controller', 'GET /notifications request received');

  try {
    const notifications = await fetchNotifications();

    return res.status(200).json(normalizeNotificationsResponse(notifications));
  } catch (error) {
    await Log('backend', 'error', 'controller', error.message || 'Failed to handle GET /notifications');

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Unable to fetch notifications',
    });
  }
}

module.exports = {
  getPriorityNotifications,
  getNotifications,
};