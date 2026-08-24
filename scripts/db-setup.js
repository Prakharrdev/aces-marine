const fs = require('fs');
const { createClient } = require('@libsql/client');

for (const line of fs.readFileSync('.env', 'utf-8').split('\n')) {
  const i = line.indexOf('=');
  if (i > 0 && !process.env[line.slice(0, i)]) process.env[line.slice(0, i)] = line.slice(i + 1);
}

const db = createClient({ url: process.env.TURSO_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function main() {
  const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  console.log('TABLES:', tables.rows.map(r => r.name));

  await db.execute('DROP TABLE IF EXISTS scores');

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
  const after = await db.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  console.log('AFTER:', after.rows.map(r => r.name));
}

main().catch(e => { console.error(e); process.exit(1); });