require('dotenv').config();
const express = require('express');
const notificationRoutes = require('./routes/notificationRoutes');
const priorityRoutes = require('./routes/priorityRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.has(origin)) {
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
app.use('/priority', priorityRoutes);

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
    console.log(`Backend listening on port ${PORT}`);
  });
}

module.exports = app;