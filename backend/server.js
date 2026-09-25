require('dotenv').config();
const { app, ready, errorHandler } = require('./app');
const { client, state, sendMessage } = require('./bot');

const PORT = process.env.PORT || 3001;
const OWNER_NUMBER = process.env.OWNER_NUMBER;

// الفرونت اند بيسأل هنا هل البوت متصل ولا لسه
app.get('/api/status', (req, res) => {
  res.json({ ready: state.ready });
});

// الفرونت اند بيعرض كود QR للمالك عشان يوصل البوت لأول مرة
app.get('/api/qr', (req, res) => {
  if (state.ready) {
    return res.json({ ready: true, qr: null });
  }
  res.json({ ready: false, qr: state.qrDataUrl });
});

// فورم التواصل في الصفحة بيبعت الرسالة هنا، والباك اند بيوصلها لصاحب الصفحة على واتساب
app.post('/api/contact', async (req, res) => {
  const { name, phone, message } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'الاسم ورقم الهاتف والرسالة مطلوبين' });
  }

  if (!OWNER_NUMBER) {
    return res.status(500).json({ error: 'رقم صاحب الصفحة غير مضبوط في إعدادات السيرفر (OWNER_NUMBER)' });
  }

  try {
    const text = `📩 رسالة جديدة من الموقع\nالاسم: ${name}\nالهاتف: ${phone}\nالرسالة: ${message}`;
    await sendMessage(OWNER_NUMBER, text);
    res.json({ success: true });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

app.use(errorHandler);

const whatsappEnabled = Boolean(process.env.WWEBJS_AUTH_PATH) || process.env.ENABLE_WHATSAPP === 'true';

ready
  .then(() => {
    app.listen(PORT, () => {
      console.log(`الباك اند شغال على http://localhost:${PORT}`);
    });
    if (whatsappEnabled) {
      client.initialize().catch((err) => {
        console.error('فشل تشغيل بوت الواتساب (السيرفر فاضل شغال عادي من غيره):', err.message);
      });
    } else {
      console.log('بوت الواتساب متعطل (مفيش WWEBJS_AUTH_PATH ولا ENABLE_WHATSAPP=true) — فورم "تواصل معنا" مش هيبعت واتساب لحد ما يتفعل.');
    }
  })
  .catch((err) => {
    console.error('فشل الاتصال بقاعدة بيانات Postgres (Supabase) — تأكد من إعداد DATABASE_URL في .env:', err.message);
    process.exit(1);
  });
