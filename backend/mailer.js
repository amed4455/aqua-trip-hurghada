const nodemailer = require('nodemailer');

const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
const configured = Boolean(GMAIL_USER && GMAIL_APP_PASSWORD);

const transporter = configured
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    })
  : null;

if (!configured) {
  console.warn(
    'GMAIL_USER / GMAIL_APP_PASSWORD مش مضبوطين في .env — الإيميلات مش هتتبعت، والأكواد هتتكتب هنا في الكونسول بس.'
  );
}

// بيرجّع true لو الإيميل اتبعت فعلاً، و false لو Gmail مش مضبوط (وضع التطوير)
async function sendMail({ to, subject, text }) {
  if (!transporter) {
    console.log(`[DEV MAIL] to=${to}\n${subject}\n${text}\n`);
    return false;
  }
  await transporter.sendMail({
    from: `"Aqua Trip Hurghada" <${GMAIL_USER}>`,
    to,
    subject,
    text,
  });
  return true;
}

module.exports = { sendMail, configured };
