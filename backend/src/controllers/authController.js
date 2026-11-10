const auth = require('../services/authService');
const cookies = require('../utils/cookies');
const config = require('../config/env');

exports.session = (req, res) => res.json({ authenticated: auth.isValidSession(cookies.read(req)) });

exports.login = async (req, res) => {
  const token = await auth.login(req.socket.remoteAddress || 'unknown', req.body && req.body.password);
  cookies.set(req, res, token, config.sessionTtlMs / 1000);
  res.json({ ok: true });
};

exports.logout = (req, res) => {
  auth.logout(cookies.read(req));
  cookies.clear(req, res);
  res.json({ ok: true });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  await auth.changePassword(currentPassword, newPassword);
  res.json({ ok: true });
};
