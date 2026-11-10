const crypto = require('node:crypto');

const scrypt = (password, salt) => new Promise((resolve, reject) => {
  crypto.scrypt(password, salt, 64, (e, key) => (e ? reject(e) : resolve(key.toString('hex'))));
});

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return { salt, hash: await scrypt(password, salt) };
}

async function verifyPassword(password, record) {
  const hash = await scrypt(password, record.salt);
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(record.hash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { hashPassword, verifyPassword };
