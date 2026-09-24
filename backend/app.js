// إعداد Express الأساسي (بدون بوت الواتساب) - مستخدم من server.js (استضافة تقليدية) وapi/index.js (Vercel)
const express = require('express');
const cors = require('cors');
const store = require('./store');

const app = express();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());
app.use('/api', require('./auth'));

function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: 'server_error' });
}

module.exports = { app, ready: store.ready, errorHandler };
