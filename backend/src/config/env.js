const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

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
    host: process.env.DB_HOST || process.env.DB_SERVER || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME || 'BusyOnCloud',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
  }
};
