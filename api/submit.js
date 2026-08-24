const { createClient } = require('@libsql/client');

const db = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const REQUIRE = ['firstName', 'lastName', 'phone', 'email'];
const MAX_LEN = { firstName: 40, lastName: 40, phone: 20, email: 80, zip: 12, service: 40, referral: 40, message: 4000 };

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
    try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); } catch {}

    const data = {};
    for (const key of [...REQUIRE, 'zip', 'service', 'referral', 'message']) {
      data[key] = clean(body[key], key);
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    for (const key of REQUIRE) {
      if (!data[key]) return res.status(400).json({ error: `Missing required field: ${key}` });
    }

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