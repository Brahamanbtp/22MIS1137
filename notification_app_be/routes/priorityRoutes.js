const express = require('express');
const { getPriorityNotifications } = require('../controllers/priorityController');

const router = express.Router();

router.get('/', getPriorityNotifications);

module.exports = router;