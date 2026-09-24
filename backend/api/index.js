// نقطة الدخول لاستضافة Vercel (serverless) - بدون بوت الواتساب خالص، عشان مايتجرش Puppeteer في الحزمة
const { app, ready, errorHandler } = require('../app');

app.use(errorHandler);

module.exports = async (req, res) => {
  await ready;
  return app(req, res);
};
