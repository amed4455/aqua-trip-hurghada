// نقطة الدخول لاستضافة Vercel (serverless) - بدون بوت الواتساب خالص، عشان مايتجرش Puppeteer في الحزمة
const { app, waitReady, errorHandler } = require('../app');

app.use(errorHandler);

module.exports = async (req, res) => {
  await waitReady();
  return app(req, res);
};
