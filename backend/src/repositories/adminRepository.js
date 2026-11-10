const { getPool } = require('../config/db');

const USERNAME = 'admin';

async function find() {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT PasswordSalt AS salt, PasswordHash AS hash FROM AdminUsers WHERE Username = ? LIMIT 1',
    [USERNAME]
  );
  return rows[0] || null;
}

async function save({ salt, hash }) {
  const pool = await getPool();
  await pool.query(
    `INSERT INTO AdminUsers (Username, PasswordSalt, PasswordHash)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       PasswordSalt = VALUES(PasswordSalt),
       PasswordHash = VALUES(PasswordHash),
       UpdatedAt = CURRENT_TIMESTAMP(0)`,
    [USERNAME, salt, hash]
  );
}

module.exports = { find, save };
