const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const bool = (v, d = false) => (v === undefined || v === '' ? d : String(v).toLowerCase() === 'true');

module.exports = {
  isProd: process.env.NODE_ENV === 'production',
  host: process.env.HOST || '127.0.0.1',
  port: Number(process.env.PORT || 3000),
  staticDir: path.resolve(__dirname, '..', '..', '..', 'frontend', 'public'),
  adminPassword: process.env.BOC_ADMIN_PASSWORD || '',
  secureCookies: process.env.BOC_SECURE_COOKIES, // 'true' | 'false' | undefined (auto)
  maxBody: '12mb',
  sessionTtlMs: 12 * 60 * 60 * 1000,
  db: {
    server: process.env.DB_SERVER || 'localhost',
    port: Number(process.env.DB_PORT || 1433),
    database: process.env.DB_NAME || 'BusyOnCloud',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: bool(process.env.DB_ENCRYPT, false),
      trustServerCertificate: bool(process.env.DB_TRUST_SERVER_CERT, true)
    },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
  }
};
