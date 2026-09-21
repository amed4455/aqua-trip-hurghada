const express = require('express');
const crypto = require('crypto');
const store = require('./store');
const { sendMail, configured } = require('./mailer');

const router = express.Router();

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_CODES_PER_HOUR = 5;
const MAX_VERIFY_ATTEMPTS = 5;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-()]{6,30}$/;

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

function normalizeEmail(value) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && EMAIL_RE.test(email) ? email : null;
}

// بيرجّع نص بعد التقليم، أو null لو مش نص أو أطول من الحد
function cleanText(value, max) {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text.length <= max ? text : null;
}

const hits = new Map();
function rateLimit(limit, windowMs) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) return res.status(429).json({ error: 'rate_limited' });
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) hits.clear();
    next();
  };
}

function publicUser(user) {
  return { email: user.email, name: user.name || '', phone: user.phone || '' };
}

function prune() {
  const now = Date.now();
  const { db } = store;
  for (const key of Object.keys(db.sessions)) {
    if (db.sessions[key].expiresAt < now) delete db.sessions[key];
  }
  for (const key of Object.keys(db.codes)) {
    if (db.codes[key].expiresAt < now && now - db.codes[key].sentAt > 3600 * 1000) delete db.codes[key];
  }
}

function requireAuth(req, res, next) {
  const match = /^Bearer ([a-f0-9]{64})$/.exec(req.get('authorization') || '');
  if (!match) return res.status(401).json({ error: 'unauthorized' });
  const key = sha256(match[1]);
  const session = store.db.sessions[key];
  if (!session || session.expiresAt < Date.now() || !store.db.users[session.email]) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  req.sessionKey = key;
  req.user = store.db.users[session.email];
  next();
}

router.post('/auth/request-code', rateLimit(10, 60 * 1000), async (req, res) => {
  const email = normalizeEmail(req.body.email);
  if (!email) return res.status(400).json({ error: 'invalid_email' });

  const { db } = store;
  const now = Date.now();
  const previous = db.codes[email];
  if (previous && now - previous.sentAt < RESEND_COOLDOWN_MS) {
    return res.status(429).json({ error: 'cooldown' });
  }
  const history = ((previous && previous.history) || []).filter((t) => now - t < 3600 * 1000);
  if (history.length >= MAX_CODES_PER_HOUR) {
    return res.status(429).json({ error: 'too_many_requests' });
  }

  const code = String(crypto.randomInt(100000, 1000000));
  try {
    await sendMail({
      to: email,
      subject: 'MarineHub Hurghada - confirmation number',
      text:
        `Your MarineHub Hurghada confirmation number is: ${code}\n\n` +
        `It is valid for 10 minutes. If you did not ask for it, you can ignore this email.\n\n` +
        `رقم التأكيد الخاص بك في MarineHub Hurghada: ${code}\n` +
        `صالح لمدة 10 دقايق. لو مطلبتش الكود ده تجاهل الرسالة.`,
    });
  } catch (err) {
    console.error('فشل إرسال إيميل الكود:', err.message);
    return res.status(502).json({ error: 'mail_failed' });
  }

  const salt = crypto.randomBytes(8).toString('hex');
  db.codes[email] = {
    hash: sha256(salt + code),
    salt,
    expiresAt: now + CODE_TTL_MS,
    attempts: 0,
    sentAt: now,
    history: [...history, now],
  };
  if (!configured) console.log(`[DEV] confirmation number for ${email}: ${code}`);
  prune();
  store.save();
  res.json({ ok: true, dev: !configured });
});

router.post('/auth/verify', rateLimit(20, 60 * 1000), (req, res) => {
  const email = normalizeEmail(req.body.email);
  const code = typeof req.body.code === 'string' ? req.body.code.trim() : '';
  if (!email) return res.status(400).json({ error: 'invalid_email' });

  const { db } = store;
  const record = db.codes[email];
  if (!record || record.expiresAt < Date.now() || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'invalid_code' });
  }
  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    return res.status(429).json({ error: 'too_many_attempts' });
  }

  record.attempts += 1;
  const expected = Buffer.from(record.hash);
  const actual = Buffer.from(sha256(record.salt + code));
  if (!crypto.timingSafeEqual(expected, actual)) {
    store.save();
    return res.status(400).json({ error: 'invalid_code' });
  }
  delete db.codes[email];

  const now = new Date().toISOString();
  const user = db.users[email] || (db.users[email] = { email, createdAt: now });
  user.verifiedAt = now;
  const name = cleanText(req.body.name, 100);
  const phone = cleanText(req.body.phone, 30);
  if (name) user.name = name;
  if (phone && PHONE_RE.test(phone)) user.phone = phone;

  const token = crypto.randomBytes(32).toString('hex');
  db.sessions[sha256(token)] = { email, expiresAt: Date.now() + SESSION_TTL_MS };
  prune();
  store.save();
  res.json({ token, user: publicUser(user) });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.patch('/me', requireAuth, (req, res) => {
  const name = cleanText(req.body.name, 100);
  const phone = cleanText(req.body.phone, 30);
  if (name === null || phone === null || (phone && !PHONE_RE.test(phone))) {
    return res.status(400).json({ error: 'invalid_input' });
  }
  req.user.name = name;
  req.user.phone = phone;
  store.save();
  res.json({ user: publicUser(req.user) });
});

router.post('/logout', requireAuth, (req, res) => {
  delete store.db.sessions[req.sessionKey];
  store.save();
  res.json({ ok: true });
});

function newBookingRef(bookings) {
  for (;;) {
    let ref = 'MH-';
    for (let i = 0; i < 6; i++) ref += REF_ALPHABET[crypto.randomInt(REF_ALPHABET.length)];
    if (!bookings.some((b) => b.ref === ref)) return ref;
  }
}

router.post('/bookings', requireAuth, rateLimit(20, 60 * 1000), async (req, res) => {
  const destination = cleanText(req.body.destination, 100);
  const dateTime = cleanText(req.body.dateTime, 40);
  const category = cleanText(req.body.category || '', 50);
  const request = cleanText(req.body.request || '', 1000);
  const name = cleanText(req.body.name || '', 100);
  const persons = Number(req.body.persons);

  const when = dateTime ? Date.parse(dateTime) : NaN;
  if (
    !destination ||
    Number.isNaN(when) ||
    when < Date.now() ||
    !Number.isInteger(persons) ||
    persons < 1 ||
    persons > 50 ||
    category === null ||
    request === null ||
    name === null
  ) {
    return res.status(400).json({ error: 'invalid_input' });
  }

  const { db, save } = store;
  if (name && !req.user.name) req.user.name = name;

  const booking = {
    id: crypto.randomUUID(),
    ref: newBookingRef(db.bookings),
    email: req.user.email,
    name: name || req.user.name || '',
    phone: req.user.phone || '',
    destination,
    dateTime,
    persons,
    category,
    request,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  db.bookings.push(booking);
  save();

  let emailSent = false;
  try {
    emailSent = await sendMail({
      to: booking.email,
      subject: `MarineHub Hurghada - booking ${booking.ref}`,
      text:
        `Your booking is confirmed.\n\nBooking number: ${booking.ref}\n` +
        `Destination: ${booking.destination}\nDate: ${booking.dateTime}\nPersons: ${booking.persons}\n\n` +
        `تم تأكيد حجزك. رقم الحجز: ${booking.ref}`,
    });
  } catch (err) {
    console.error('فشل إرسال إيميل تأكيد الحجز:', err.message);
  }
  res.status(201).json({ booking, emailSent });
});

router.get('/bookings', requireAuth, (req, res) => {
  const mine = store.db.bookings
    .filter((b) => b.email === req.user.email)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ bookings: mine });
});

module.exports = router;
