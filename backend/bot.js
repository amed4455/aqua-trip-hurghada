const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');

// حالة البوت اللي بيقرأها الباك اند لعرضها للفرونت اند
const state = {
  ready: false,
  qrDataUrl: null,
};

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

client.on('qr', async (qr) => {
  state.ready = false;
  qrcodeTerminal.generate(qr, { small: true });
  state.qrDataUrl = await QRCode.toDataURL(qr);
  console.log('امسح كود QR من واتساب على موبايلك (WhatsApp > الأجهزة المرتبطة) لتفعيل البوت.');
});

client.on('ready', () => {
  state.ready = true;
  state.qrDataUrl = null;
  console.log('البوت متصل وشغال دلوقتي.');
});

client.on('disconnected', (reason) => {
  state.ready = false;
  console.log('اتقطع الاتصال بالبوت:', reason);
});

// رد تلقائي بسيط على رسائل العملاء الجايه من الصفحة
client.on('message', async (msg) => {
  const text = (msg.body || '').trim().toLowerCase();

  if (text === 'menu' || text === 'قائمة' || text === 'مرحبا' || text === 'اهلا') {
    await msg.reply(
      'أهلاً بيك! 👋\nاختر رقم:\n1️⃣ الأسعار\n2️⃣ التواصل مع فريق الدعم\n3️⃣ ساعات العمل'
    );
    return;
  }

  if (text === '1') {
    await msg.reply('للأسعار والتفاصيل، تقدر تزور صفحتنا أو تسأل هنا مباشرة وهيتم الرد عليك.');
    return;
  }

  if (text === '2') {
    await msg.reply('تمام، فريق الدعم هيتواصل معاك في أقرب وقت. ممكن تكتب استفسارك دلوقتي؟');
    return;
  }

  if (text === '3') {
    await msg.reply('ساعات العمل: يوميًا من 9 صباحًا لـ 9 مساءً.');
    return;
  }
});

function sendMessage(phone, message) {
  if (!state.ready) {
    throw new Error('البوت لسه مش متصل بواتساب');
  }
  const chatId = `${phone}@c.us`;
  return client.sendMessage(chatId, message);
}

module.exports = { client, state, sendMessage };
