const sql = require('mssql');
const config = require('./env');

let poolPromise;

/** One shared connection pool for the whole app. */
function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config.db).connect().catch(err => {
      poolPromise = undefined;
      throw err;
    });
  }
  return poolPromise;
}

async function closePool() {
  if (poolPromise) { const p = await poolPromise; await p.close(); poolPromise = undefined; }
}

module.exports = { sql, getPool, closePool };
