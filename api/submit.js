const { createClient } = require('@libsql/client');

const REQUIRE = ['firstName', 'lastName', 'phone', 'email', 'zip'];
const MAX_LEN = { firstName: 40, lastName: 40, phone: 20, email: 80, zip: 12, service: 40, referral: 40, message: 4000 };

let db = null;
function getDb() {
  if (db) return db;
  if (!process.env.TURSO_URL || !process.env.TURSO_AUTH_TOKEN) return null;
  db = createClient({ url: process.env.TURSO_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  return db;
}

function clean(value, key) {
  return String(value == null ? '' : value).trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, MAX_LEN[key]);
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    let body = {};
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    } catch {}
    if (!body || typeof body !== 'object' || Array.isArray(body)) body = {};

    const data = {};
    for (const key of [...REQUIRE, 'service', 'referral', 'message']) {
      data[key] = clean(body[key], key);
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    for (const key of REQUIRE) {
      if (!data[key]) return res.status(400).json({ error: `Missing required field: ${key}` });
    }

    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Server configuration error: TURSO_URL and TURSO_AUTH_TOKEN must be set' });
    }

    await db.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        zip TEXT,
        service TEXT,
        referral TEXT,
        message TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    await db.execute({
      sql: `
        INSERT INTO leads (first_name, last_name, phone, email, zip, service, referral, message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [data.firstName, data.lastName, data.phone, data.email, data.zip, data.service, data.referral, data.message],
    });

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  }
};
