const config = require('./config/env');
const app = require('./app');
const { getPool, closePool } = require('./config/db');
const auth = require('./services/authService');

async function main() {
  if (!['127.0.0.1', 'localhost'].includes(config.host) && !config.adminPassword) {
    throw new Error('Set BOC_ADMIN_PASSWORD before binding the backend to a network interface.');
  }
  await getPool();            // fail fast if SQL Server is unreachable
  await auth.ensureAdmin();   // first start: create admin login
  const server = app.listen(config.port, config.host, () =>
    console.log(`Busy On Cloud running at http://${config.host}:${config.port}`));

  const stop = () => server.close(() => closePool().finally(() => process.exit(0)));
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main().catch(err => { console.error('Startup failed:', err.message); process.exit(1); });
