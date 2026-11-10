const cookies = require('../utils/cookies');
const auth = require('../services/authService');

module.exports = function requireAdmin(req, res, next) {
  if (!auth.isValidSession(cookies.read(req))) return res.status(401).json({ error: 'Admin login required.' });
  next();
};
