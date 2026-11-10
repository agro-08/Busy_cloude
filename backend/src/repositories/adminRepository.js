const { sql, getPool } = require('../config/db');

const USERNAME = 'admin';

async function find() {
  const pool = await getPool();
  const r = await pool.request()
    .input('u', sql.NVarChar(100), USERNAME)
    .query('SELECT PasswordSalt AS salt, PasswordHash AS hash FROM dbo.AdminUsers WHERE Username = @u');
  return r.recordset[0] || null;
}

async function save({ salt, hash }) {
  const pool = await getPool();
  await pool.request()
    .input('u', sql.NVarChar(100), USERNAME)
    .input('s', sql.VarChar(64), salt)
    .input('h', sql.VarChar(256), hash)
    .query(`MERGE dbo.AdminUsers AS t
            USING (SELECT @u AS Username) AS s ON t.Username = s.Username
            WHEN MATCHED THEN UPDATE SET PasswordSalt = @s, PasswordHash = @h, UpdatedAt = SYSUTCDATETIME()
            WHEN NOT MATCHED THEN INSERT (Username, PasswordSalt, PasswordHash) VALUES (@u, @s, @h);`);
}

module.exports = { find, save };
