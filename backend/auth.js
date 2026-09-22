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

async function requireAuth(req, res, next) {
  try {
    const match = /^Bearer ([a-f0-9]{64})$/.exec(req.get('authorization') || '');
    if (!match) return res.status(401).json({ error: 'unauthorized' });
    const key = sha256(match[1]);
    const session = await store.getSession(key);
    if (!session || session.expiresAt < Date.now()) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    const user = await store.getUser(session.email);
    if (!user) return res.status(401).json({ error: 'unauthorized' });
    req.sessionKey = key;
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

router.post('/auth/request-code', rateLimit(10, 60 * 1000), async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) return res.status(400).json({ error: 'invalid_email' });

    const now = Date.now();
    const previous = await store.getCode(email);
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
        subject: 'Aqua Trip Hurghada - confirmation number',
        text:
          `Your Aqua Trip Hurghada confirmation number is: ${code}\n\n` +
          `It is valid for 10 minutes. If you did not ask for it, you can ignore this email.\n\n` +
          `رقم التأكيد الخاص بك في Aqua Trip Hurghada: ${code}\n` +
          `صالح لمدة 10 دقايق. لو مطلبتش الكود ده تجاهل الرسالة.`,
      });
    } catch (err) {
      console.error('فشل إرسال إيميل الكود:', err.message);
      return res.status(502).json({ error: 'mail_failed' });
    }

    const salt = crypto.randomBytes(8).toString('hex');
    await store.setCode(email, {
      hash: sha256(salt + code),
      salt,
      expiresAt: now + CODE_TTL_MS,
      attempts: 0,
      sentAt: now,
      history: [...history, now],
    });
    if (!configured) console.log(`[DEV] confirmation number for ${email}: ${code}`);
    await store.prune();
    res.json({ ok: true, dev: !configured });
  } catch (err) {
    next(err);
  }
});

router.post('/auth/verify', rateLimit(20, 60 * 1000), async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const code = typeof req.body.code === 'string' ? req.body.code.trim() : '';
    if (!email) return res.status(400).json({ error: 'invalid_email' });

    const record = await store.getCode(email);
    if (!record || record.expiresAt < Date.now() || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'invalid_code' });
    }
    if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
      return res.status(429).json({ error: 'too_many_attempts' });
    }

    await store.incrementCodeAttempts(email);
    const expected = Buffer.from(record.hash);
    const actual = Buffer.from(sha256(record.salt + code));
    if (!crypto.timingSafeEqual(expected, actual)) {
      return res.status(400).json({ error: 'invalid_code' });
    }
    await store.deleteCode(email);

    const now = new Date().toISOString();
    const name = cleanText(req.body.name, 100);
    const phone = cleanText(req.body.phone, 30);
    const patch = { verifiedAt: now };
    if (name) patch.name = name;
    if (phone && PHONE_RE.test(phone)) patch.phone = phone;
    const user = await store.upsertUser(email, patch);

    const token = crypto.randomBytes(32).toString('hex');
    await store.setSession(sha256(token), { email, expiresAt: Date.now() + SESSION_TTL_MS });
    await store.prune();
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

/* ---------- Social sign-in (Google / Facebook) ---------- */
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const oauthStates = new Map();
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:8082').replace(/\/$/, '');
const PUBLIC_BACKEND_URL = (process.env.PUBLIC_BACKEND_URL || `http://localhost:${process.env.PORT || 4001}`).replace(/\/$/, '');

function createOAuthState(returnPath) {
  const nonce = crypto.randomBytes(16).toString('hex');
  oauthStates.set(nonce, { returnPath, expiresAt: Date.now() + OAUTH_STATE_TTL_MS });
  if (oauthStates.size > 5000) oauthStates.clear();
  return nonce;
}

function consumeOAuthState(nonce) {
  const entry = oauthStates.get(nonce);
  if (!entry) return null;
  oauthStates.delete(nonce);
  return entry.expiresAt >= Date.now() ? entry : null;
}

// بيمنع الـ open redirect: يقبل بس مسار محلي زي /index.html
function safeReturnPath(raw) {
  const value = typeof raw === 'string' ? raw : '';
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('://')) return '/index.html';
  return value;
}

function redirectWithError(res, returnPath, code) {
  res.redirect(`${FRONTEND_URL}${returnPath}?authError=${encodeURIComponent(code)}`);
}

async function finishOAuthLogin(res, returnPath, email, name) {
  const now = new Date().toISOString();
  const patch = { verifiedAt: now };
  if (name) patch.name = name;
  await store.upsertUser(email, patch);
  const token = crypto.randomBytes(32).toString('hex');
  await store.setSession(sha256(token), { email, expiresAt: Date.now() + SESSION_TTL_MS });
  await store.prune();
  res.redirect(`${FRONTEND_URL}${returnPath}?authToken=${token}`);
}

router.get('/auth/google/start', (req, res) => {
  const returnPath = safeReturnPath(req.query.return);
  if (!process.env.GOOGLE_CLIENT_ID) return redirectWithError(res, returnPath, 'google_not_configured');
  const state = createOAuthState(returnPath);
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID);
  url.searchParams.set('redirect_uri', process.env.GOOGLE_REDIRECT_URI || `${PUBLIC_BACKEND_URL}/api/auth/google/callback`);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', state);
  url.searchParams.set('access_type', 'online');
  url.searchParams.set('prompt', 'select_account');
  res.redirect(url.toString());
});

router.get('/auth/google/callback', async (req, res, next) => {
  const entry = consumeOAuthState(req.query.state);
  const returnPath = entry ? entry.returnPath : '/index.html';
  try {
    if (!entry) return redirectWithError(res, returnPath, 'invalid_state');
    if (req.query.error) return redirectWithError(res, returnPath, 'google_denied');
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return redirectWithError(res, returnPath, 'google_not_configured');
    }
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${PUBLIC_BACKEND_URL}/api/auth/google/callback`;
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(req.query.code || ''),
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) return redirectWithError(res, returnPath, 'google_token_failed');

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();
    const email = normalizeEmail(profile.email);
    if (!profileRes.ok || !email || !profile.email_verified) {
      return redirectWithError(res, returnPath, 'google_no_email');
    }
    await finishOAuthLogin(res, returnPath, email, cleanText(profile.name || '', 100));
  } catch (err) {
    next(err);
  }
});

router.get('/auth/facebook/start', (req, res) => {
  const returnPath = safeReturnPath(req.query.return);
  if (!process.env.FACEBOOK_APP_ID) return redirectWithError(res, returnPath, 'facebook_not_configured');
  const state = createOAuthState(returnPath);
  const url = new URL('https://www.facebook.com/v20.0/dialog/oauth');
  url.searchParams.set('client_id', process.env.FACEBOOK_APP_ID);
  url.searchParams.set('redirect_uri', process.env.FACEBOOK_REDIRECT_URI || `${PUBLIC_BACKEND_URL}/api/auth/facebook/callback`);
  url.searchParams.set('state', state);
  url.searchParams.set('scope', 'email,public_profile');
  url.searchParams.set('response_type', 'code');
  res.redirect(url.toString());
});

router.get('/auth/facebook/callback', async (req, res, next) => {
  const entry = consumeOAuthState(req.query.state);
  const returnPath = entry ? entry.returnPath : '/index.html';
  try {
    if (!entry) return redirectWithError(res, returnPath, 'invalid_state');
    if (req.query.error) return redirectWithError(res, returnPath, 'facebook_denied');
    if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
      return redirectWithError(res, returnPath, 'facebook_not_configured');
    }
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI || `${PUBLIC_BACKEND_URL}/api/auth/facebook/callback`;
    const tokenUrl = new URL('https://graph.facebook.com/v20.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', process.env.FACEBOOK_APP_ID);
    tokenUrl.searchParams.set('client_secret', process.env.FACEBOOK_APP_SECRET);
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
    tokenUrl.searchParams.set('code', String(req.query.code || ''));
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) return redirectWithError(res, returnPath, 'facebook_token_failed');

    const profileRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(tokenData.access_token)}`
    );
    const profile = await profileRes.json();
    const email = normalizeEmail(profile.email);
    if (!profileRes.ok || !email) return redirectWithError(res, returnPath, 'facebook_no_email');
    await finishOAuthLogin(res, returnPath, email, cleanText(profile.name || '', 100));
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const name = cleanText(req.body.name, 100);
    const phone = cleanText(req.body.phone, 30);
    if (name === null || phone === null || (phone && !PHONE_RE.test(phone))) {
      return res.status(400).json({ error: 'invalid_input' });
    }
    const user = await store.upsertUser(req.user.email, { name, phone });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await store.deleteSession(req.sessionKey);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

async function newBookingRef() {
  for (;;) {
    let ref = 'MH-';
    for (let i = 0; i < 6; i++) ref += REF_ALPHABET[crypto.randomInt(REF_ALPHABET.length)];
    if (!(await store.refExists(ref))) return ref;
  }
}

router.post('/bookings', requireAuth, rateLimit(20, 60 * 1000), async (req, res, next) => {
  try {
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

    if (name && !req.user.name) {
      req.user = await store.upsertUser(req.user.email, { name });
    }

    const booking = {
      id: crypto.randomUUID(),
      ref: await newBookingRef(),
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
    await store.addBooking(booking);

    let emailSent = false;
    try {
      emailSent = await sendMail({
        to: booking.email,
        subject: `Aqua Trip Hurghada - booking ${booking.ref}`,
        text:
          `Your booking is confirmed.\n\nBooking number: ${booking.ref}\n` +
          `Destination: ${booking.destination}\nDate: ${booking.dateTime}\nPersons: ${booking.persons}\n\n` +
          `تم تأكيد حجزك. رقم الحجز: ${booking.ref}`,
      });
    } catch (err) {
      console.error('فشل إرسال إيميل تأكيد الحجز:', err.message);
    }
    res.status(201).json({ booking, emailSent });
  } catch (err) {
    next(err);
  }
});

router.get('/bookings', requireAuth, async (req, res, next) => {
  try {
    const mine = await store.getBookingsByEmail(req.user.email);
    res.json({ bookings: mine });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
