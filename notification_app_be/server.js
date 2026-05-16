require('dotenv').config();
const express = require('express');
const notificationRoutes = require('./routes/notificationRoutes');
const priorityRoutes = require('./routes/priorityRoutes');
const Log = require('./logging_middleware/log');

const app = express();
const PORT = process.env.PORT || 5000;

function emitStartupLog(message) {
  Log('backend', 'info', 'route', message).catch(() => {});
}

function isAllowedDevOrigin(origin) {
  if (!origin) {
    return false;
  }

  try {
    const parsedOrigin = new URL(origin);
    return parsedOrigin.hostname === 'localhost' || parsedOrigin.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (isAllowedDevOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});

app.use(express.json());
app.use('/notifications', notificationRoutes);
emitStartupLog('Notification route mounted');
app.use('/priority', priorityRoutes);
emitStartupLog('Priority route mounted');

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'backend running',
  });
});

app.get('/test', (req, res) => {
  res.json({
    working: true,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    emitStartupLog(`Backend listening on port ${PORT}`);
  });
}

module.exports = app;