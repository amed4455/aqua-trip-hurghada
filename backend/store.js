// طبقة قاعدة البيانات - MySQL حقيقي (بيشتغل مع الداتابيز اللي بيدّيهالك Hostinger على الاستضافة المشتركة)
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aquatrip',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
});

// بينشئ الجداول أول مرة بس لو مش موجودة، من غير ما يلمس بيانات موجودة
async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      email VARCHAR(254) PRIMARY KEY,
      name VARCHAR(100) NULL,
      phone VARCHAR(30) NULL,
      created_at DATETIME NOT NULL,
      verified_at DATETIME NULL
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
      history JSON NOT NULL
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
      created_at DATETIME NOT NULL
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
    history: JSON.parse(row.history),
  };
}

module.exports = {
  ready: readyPromise,

  async getUser(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
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
      await pool.query('UPDATE users SET name = ?, phone = ?, verified_at = ? WHERE email = ?', [
        merged.name || null,
        merged.phone || null,
        merged.verifiedAt,
        email,
      ]);
    } else {
      await pool.query(
        'INSERT INTO users (email, name, phone, created_at, verified_at) VALUES (?, ?, ?, ?, ?)',
        [email, merged.name || null, merged.phone || null, new Date(), merged.verifiedAt]
      );
    }
    return this.getUser(email);
  },

  async getCode(email) {
    const [rows] = await pool.query('SELECT * FROM codes WHERE email = ?', [email]);
    return rowToCode(rows[0]);
  },

  async setCode(email, code) {
    await pool.query(
      `INSERT INTO codes (email, hash, salt, expires_at, attempts, sent_at, history)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE hash = VALUES(hash), salt = VALUES(salt), expires_at = VALUES(expires_at),
         attempts = VALUES(attempts), sent_at = VALUES(sent_at), history = VALUES(history)`,
      [email, code.hash, code.salt, code.expiresAt, code.attempts, code.sentAt, JSON.stringify(code.history)]
    );
  },

  async incrementCodeAttempts(email) {
    await pool.query('UPDATE codes SET attempts = attempts + 1 WHERE email = ?', [email]);
  },

  async deleteCode(email) {
    await pool.query('DELETE FROM codes WHERE email = ?', [email]);
  },

  async getSession(key) {
    const [rows] = await pool.query('SELECT * FROM sessions WHERE session_key = ?', [key]);
    if (!rows[0]) return null;
    return { email: rows[0].email, expiresAt: Number(rows[0].expires_at) };
  },

  async setSession(key, session) {
    await pool.query('INSERT INTO sessions (session_key, email, expires_at) VALUES (?, ?, ?)', [
      key,
      session.email,
      session.expiresAt,
    ]);
  },

  async deleteSession(key) {
    await pool.query('DELETE FROM sessions WHERE session_key = ?', [key]);
  },

  async prune() {
    const now = Date.now();
    await pool.query('DELETE FROM sessions WHERE expires_at < ?', [now]);
    await pool.query('DELETE FROM codes WHERE expires_at < ? AND ? - sent_at > 3600000', [now, now]);
  },

  async refExists(ref) {
    const [rows] = await pool.query('SELECT 1 FROM bookings WHERE ref = ? LIMIT 1', [ref]);
    return rows.length > 0;
  },

  async addBooking(booking) {
    await pool.query(
      `INSERT INTO bookings (id, ref, email, name, phone, destination, date_time, persons, category, request, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    const [rows] = await pool.query('SELECT * FROM bookings WHERE email = ? ORDER BY created_at DESC', [email]);
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
