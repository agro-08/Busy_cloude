const express = require('express');
const requireAdmin = require('../middleware/requireAdmin');
const site = require('../controllers/siteController');
const authC = require('../controllers/authController');

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const router = express.Router();

// public
router.get('/data', wrap(site.getPublic));
router.post('/login', wrap(authC.login));
router.post('/logout', authC.logout);
router.get('/admin/session', authC.session);

// admin only
router.use('/admin', requireAdmin);
router.get('/admin/data', wrap(site.getAdmin));
router.put('/admin/data', wrap(site.saveAdmin));
router.post('/admin/password', wrap(authC.changePassword));

module.exports = router;
