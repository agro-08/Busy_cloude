const config = require('../config/env');
const NAME = 'boc_admin';

function read(req) {
  const entry = String(req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(NAME + '='));
  return entry ? decodeURIComponent(entry.slice(NAME.length + 1)) : '';
}

function options(req) {
  const secure = config.secureCookies === 'true' || (config.secureCookies !== 'false' && req.secure);
  return `Path=/; HttpOnly; SameSite=Strict${secure ? '; Secure' : ''}`;
}

const set = (req, res, token, maxAgeSec) => res.setHeader('Set-Cookie', `${NAME}=${token}; ${options(req)}; Max-Age=${maxAgeSec}`);
const clear = (req, res) => set(req, res, '', 0);

module.exports = { read, set, clear };
