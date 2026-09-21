require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { client, state, sendMessage } = require('./bot');

const app = express();
const PORT = process.env.PORT || 3001;
const OWNER_NUMBER = process.env.OWNER_NUMBER;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());
app.use('/api', require('./auth'));

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

app.listen(PORT, () => {
  console.log(`الباك اند شغال على http://localhost:${PORT}`);
});

client.initialize();
