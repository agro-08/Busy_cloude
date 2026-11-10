const HttpError = require('../utils/httpError');

function notFoundApi(req, res) {
  res.status(404).json({ error: 'API route not found.' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request body is too large (12 MB maximum).' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Request body must be valid JSON.' });
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  console.error('Request failed:', err);
  res.status(500).json({ error: 'Server error. Check server logs.' });
}

module.exports = { notFoundApi, errorHandler };
