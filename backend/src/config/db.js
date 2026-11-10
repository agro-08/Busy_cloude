const mysql = require('mysql2/promise');
const config = require('./env');

let pool;

/** One shared connection pool for the whole app. */
async function getPool() {
  if (!pool) {
    const p = mysql.createPool(config.db);
    // Verify connection immediately so we fail fast if MySQL is unreachable
    const conn = await p.getConnection();
    conn.release();
    pool = p;
  }
  return pool;
}

async function closePool() {
  if (pool) {
    const p = pool;
    pool = undefined;
    await p.end();
  }
}

module.exports = { getPool, closePool };
