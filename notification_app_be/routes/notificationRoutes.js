const express = require('express');
const { getNotifications } = require('../controllers/priorityController');

const router = express.Router();

router.get('/', getNotifications);

module.exports = router;
