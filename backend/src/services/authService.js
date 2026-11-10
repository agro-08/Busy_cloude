const crypto = require('node:crypto');
const config = require('../config/env');
const HttpError = require('../utils/httpError');
const adminRepo = require('../repositories/adminRepository');
const { hashPassword, verifyPassword } = require('../utils/password');

/* Sessions live in memory (restart = admin logs in again). Move to a DB table / Redis if you run >1 server. */
const sessions = new Map();
const attempts = new Map();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

/** Create the admin row on first start. */
async function ensureAdmin() {
  if (await adminRepo.find()) return;
  if (config.isProd && !config.adminPassword) {
    throw new Error('Set BOC_ADMIN_PASSWORD before first start in production.');
  }
  await adminRepo.save(await hashPassword(config.adminPassword || 'admin123'));
}

function isValidSession(token) {
  const expiry = token && sessions.get(token);
  if (!expiry || expiry < Date.now()) { sessions.delete(token); return false; }
  return true;
}

async function login(ip, password) {
  const rec = attempts.get(ip);
  const state = rec && rec.resetAt > Date.now() ? rec : { count: 0, resetAt: Date.now() + WINDOW_MS };
  if (state.count >= MAX_ATTEMPTS) throw new HttpError(429, 'Bahut saare login attempts. 15 minute baad try karein.');

  const admin = await adminRepo.find();
  const ok = typeof password === 'string' && password.length <= 200 && admin && await verifyPassword(password, admin);
  if (!ok) {
    attempts.set(ip, { count: state.count + 1, resetAt: state.resetAt });
    throw new HttpError(401, 'Wrong password.');
  }
  attempts.delete(ip);
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + config.sessionTtlMs);
  return token;
}

const logout = (token) => sessions.delete(token);

async function changePassword(current, next) {
  const admin = await adminRepo.find();
  if (typeof current !== 'string' || !(await verifyPassword(current, admin))) {
    throw new HttpError(400, 'Current password galat hai.');
  }
  if (typeof next !== 'string' || next.length < 6 || next.length > 200) {
    throw new HttpError(400, 'New password 6 se 200 characters ke beech hona chahiye.');
  }
  await adminRepo.save(await hashPassword(next));
}

module.exports = { ensureAdmin, isValidSession, login, logout, changePassword };
