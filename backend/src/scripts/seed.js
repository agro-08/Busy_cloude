/* Loads database/seed/initial-site-data.json into SQL Server (only if the DB has no content yet).
   Use:  npm run db:seed          (add --force to overwrite existing content) */
const fs = require('node:fs');
const path = require('node:path');
const { getPool, closePool } = require('../config/db');
const siteRepo = require('../repositories/siteRepository');
const site = require('../services/siteService');
const auth = require('../services/authService');

(async () => {
  await getPool();
  await auth.ensureAdmin();
  const force = process.argv.includes('--force');
  if (!force && await siteRepo.load()) {
    console.log('Database already has content. Use --force to overwrite.');
    return;
  }
  const file = path.resolve(__dirname, '..', '..', '..', 'database', 'seed', 'initial-site-data.json');
  await siteRepo.replaceAll(site.normalize(JSON.parse(fs.readFileSync(file, 'utf8'))));
  console.log('Seed data loaded.');
})().catch(e => { console.error('Seed failed:', e.message); process.exitCode = 1; }).finally(closePool);
