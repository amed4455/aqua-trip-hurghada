// طبقة قاعدة البيانات - PostgreSQL (Supabase)
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// بينشئ الجداول أول مرة بس لو مش موجودة، من غير ما يلمس بيانات موجودة
async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      email VARCHAR(254) PRIMARY KEY,
      name VARCHAR(100) NULL,
      phone VARCHAR(30) NULL,
      created_at TIMESTAMP NOT NULL,
      verified_at TIMESTAMP NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS codes (
      email VARCHAR(254) PRIMARY KEY,
      hash CHAR(64) NOT NULL,
      salt VARCHAR(32) NOT NULL,
      expires_at BIGINT NOT NULL,
      attempts INT NOT NULL DEFAULT 0,
      sent_at BIGINT NOT NULL,
      history JSONB NOT NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      session_key CHAR(64) PRIMARY KEY,
      email VARCHAR(254) NOT NULL,
      expires_at BIGINT NOT NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id CHAR(36) PRIMARY KEY,
      ref VARCHAR(10) UNIQUE NOT NULL,
      email VARCHAR(254) NOT NULL,
      name VARCHAR(100) NULL,
      phone VARCHAR(30) NULL,
      destination VARCHAR(100) NOT NULL,
      date_time VARCHAR(40) NOT NULL,
      persons INT NOT NULL,
      category VARCHAR(50) NULL,
      request TEXT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
      created_at TIMESTAMP NOT NULL
    )
  `);
}

const readyPromise = init();

function rowToUser(row) {
  if (!row) return null;
  return {
    email: row.email,
    name: row.name || '',
    phone: row.phone || '',
    createdAt: row.created_at,
    verifiedAt: row.verified_at,
  };
}

function rowToCode(row) {
  if (!row) return null;
  return {
    hash: row.hash,
    salt: row.salt,
    expiresAt: Number(row.expires_at),
    attempts: row.attempts,
    sentAt: Number(row.sent_at),
    history: row.history, // jsonb - node-postgres بيرجّعه كـ array/object جاهز من غير JSON.parse
  };
}

module.exports = {
  ready: readyPromise,

  async getUser(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return rowToUser(rows[0]);
  },

  // بيعمل insert لو المستخدم مش موجود، أو update لو موجود
  async upsertUser(email, patch) {
    const existing = await this.getUser(email);
    const merged = {
      name: patch.name !== undefined ? patch.name : existing ? existing.name : '',
      phone: patch.phone !== undefined ? patch.phone : existing ? existing.phone : '',
      verifiedAt: patch.verifiedAt !== undefined ? patch.verifiedAt : existing ? existing.verifiedAt : null,
    };
    if (existing) {
      await pool.query('UPDATE users SET name = $1, phone = $2, verified_at = $3 WHERE email = $4', [
        merged.name || null,
        merged.phone || null,
        merged.verifiedAt,
        email,
      ]);
    } else {
      await pool.query(
        'INSERT INTO users (email, name, phone, created_at, verified_at) VALUES ($1, $2, $3, $4, $5)',
        [email, merged.name || null, merged.phone || null, new Date(), merged.verifiedAt]
      );
    }
    return this.getUser(email);
  },

  async getCode(email) {
    const { rows } = await pool.query('SELECT * FROM codes WHERE email = $1', [email]);
    return rowToCode(rows[0]);
  },

  async setCode(email, code) {
    await pool.query(
      `INSERT INTO codes (email, hash, salt, expires_at, attempts, sent_at, history)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO UPDATE SET hash = EXCLUDED.hash, salt = EXCLUDED.salt, expires_at = EXCLUDED.expires_at,
         attempts = EXCLUDED.attempts, sent_at = EXCLUDED.sent_at, history = EXCLUDED.history`,
      [email, code.hash, code.salt, code.expiresAt, code.attempts, code.sentAt, JSON.stringify(code.history)]
    );
  },

  async incrementCodeAttempts(email) {
    await pool.query('UPDATE codes SET attempts = attempts + 1 WHERE email = $1', [email]);
  },

  async deleteCode(email) {
    await pool.query('DELETE FROM codes WHERE email = $1', [email]);
  },

  async getSession(key) {
    const { rows } = await pool.query('SELECT * FROM sessions WHERE session_key = $1', [key]);
    if (!rows[0]) return null;
    return { email: rows[0].email, expiresAt: Number(rows[0].expires_at) };
  },

  async setSession(key, session) {
    await pool.query('INSERT INTO sessions (session_key, email, expires_at) VALUES ($1, $2, $3)', [
      key,
      session.email,
      session.expiresAt,
    ]);
  },

  async deleteSession(key) {
    await pool.query('DELETE FROM sessions WHERE session_key = $1', [key]);
  },

  async prune() {
    const now = Date.now();
    await pool.query('DELETE FROM sessions WHERE expires_at < $1', [now]);
    await pool.query('DELETE FROM codes WHERE expires_at < $1 AND $2 - sent_at > 3600000', [now, now]);
  },

  async refExists(ref) {
    const { rows } = await pool.query('SELECT 1 FROM bookings WHERE ref = $1 LIMIT 1', [ref]);
    return rows.length > 0;
  },

  async addBooking(booking) {
    await pool.query(
      `INSERT INTO bookings (id, ref, email, name, phone, destination, date_time, persons, category, request, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        booking.id,
        booking.ref,
        booking.email,
        booking.name || null,
        booking.phone || null,
        booking.destination,
        booking.dateTime,
        booking.persons,
        booking.category || null,
        booking.request || null,
        booking.status,
        new Date(booking.createdAt),
      ]
    );
  },

  async getBookingsByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM bookings WHERE email = $1 ORDER BY created_at DESC', [email]);
    return rows.map((r) => ({
      id: r.id,
      ref: r.ref,
      email: r.email,
      name: r.name || '',
      phone: r.phone || '',
      destination: r.destination,
      dateTime: r.date_time,
      persons: r.persons,
      category: r.category || '',
      request: r.request || '',
      status: r.status,
      createdAt: r.created_at,
    }));
  },
};
