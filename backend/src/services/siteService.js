const crypto = require('node:crypto');
const HttpError = require('../utils/httpError');
const siteRepo = require('../repositories/siteRepository');

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const str = (v, max) => String(v == null ? '' : v).slice(0, max);
const newId = (prefix) => prefix + crypto.randomBytes(6).toString('hex');

/** Validate + trim incoming data to what the DB columns can hold. */
function normalize(value) {
  if (!isObj(value) || !isObj(value.settings) || !isObj(value.images) ||
      !Array.isArray(value.products) || !Array.isArray(value.messages)) {
    throw new HttpError(400, 'Invalid site data.');
  }

  const settings = {};
  for (const [k, v] of Object.entries(value.settings)) {
    if (k === 'adminPassword' || k === 'webhookUrl') continue; // never stored
    settings[str(k, 100)] = str(v, 4000);
  }

  const images = {};
  for (const [k, v] of Object.entries(value.images)) {
    if (typeof v === 'string' && v) images[str(k, 100)] = v;
  }

  const seen = new Set();
  const products = [];
  for (const p of value.products) {
    if (!isObj(p)) continue;
    let id = str(p.id, 50) || newId('p');
    if (seen.has(id)) id = newId('p');
    seen.add(id);
    products.push({
      id, type: p.type === 'vm' ? 'vm' : 'user', name: str(p.name, 200) || 'Untitled plan',
      price: str(p.price, 100), period: str(p.period, 200), badge: str(p.badge, 100),
      color: str(p.color, 50) || 'sky', image: str(p.image, 20 * 1024 * 1024),
      highlight: str(p.highlight, 300), usersLine: str(p.usersLine, 200), note: str(p.note, 500),
      link: str(p.link, 1000), buttonText: str(p.buttonText, 100), visible: p.visible !== false,
      features: (Array.isArray(p.features) ? p.features : []).map(f => str(f, 300)).filter(Boolean)
    });
  }

  const seenM = new Set();
  const messages = [];
  for (const m of value.messages) {
    if (!isObj(m)) continue;
    let id = str(m.id, 50) || newId('m');
    if (seenM.has(id)) id = newId('m');
    seenM.add(id);
    const date = new Date(m.date);
    messages.push({
      id, name: str(m.name, 200), phone: str(m.phone, 50), email: str(m.email, 200),
      product: str(m.product, 200), text: str(m.text, 10000), read: !!m.read,
      date: isNaN(date) ? new Date() : date
    });
  }
  return { settings, images, products, messages };
}

/** Public website: everything except admin-only messages. */
async function getPublic() {
  const data = await siteRepo.load();
  if (!data) return null;
  const { messages, ...pub } = data;
  return pub;
}

const getAdmin = () => siteRepo.load();

async function saveAdmin(body) {
  await siteRepo.replaceAll(normalize(body));
}

module.exports = { getPublic, getAdmin, saveAdmin, normalize };
