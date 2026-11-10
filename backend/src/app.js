const express = require('express');
const config = require('./config/env');
const security = require('./middleware/security');
const { notFoundApi, errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1); // behind nginx / hosting proxy

app.use(security);
app.use('/api', express.json({ limit: config.maxBody }), routes, notFoundApi);

// Frontend (static). Dotfiles are never served.
app.use(express.static(config.staticDir, { dotfiles: 'ignore', index: 'index.html', setHeaders: res => res.setHeader('Cache-Control', 'no-cache') }));

app.use(errorHandler);
module.exports = app;
