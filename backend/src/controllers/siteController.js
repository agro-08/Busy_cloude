const site = require('../services/siteService');

exports.getPublic = async (req, res) => res.json({ data: await site.getPublic() });
exports.getAdmin = async (req, res) => res.json({ data: await site.getAdmin() });
exports.saveAdmin = async (req, res) => { await site.saveAdmin(req.body); res.json({ ok: true }); };
