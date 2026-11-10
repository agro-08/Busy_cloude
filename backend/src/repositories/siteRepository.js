const { getPool } = require('../config/db');

/** Read everything and rebuild the exact JSON shape the frontend expects. */
async function load() {
  const pool = await getPool();
  const [
    [settings],
    [images],
    [products],
    [features],
    [messages]
  ] = await Promise.all([
    pool.query('SELECT SettingKey, SettingValue FROM Settings'),
    pool.query('SELECT ImageKey, ImageData FROM SiteImages'),
    pool.query('SELECT * FROM Products ORDER BY SortOrder, CreatedAt'),
    pool.query('SELECT ProductId, FeatureText FROM ProductFeatures ORDER BY ProductId, SortOrder'),
    pool.query('SELECT * FROM Messages ORDER BY CreatedAt DESC')
  ]);

  if (!settings.length && !products.length) return null; // nothing saved yet

  const featMap = new Map();
  for (const f of features) {
    if (!featMap.has(f.ProductId)) featMap.set(f.ProductId, []);
    featMap.get(f.ProductId).push(f.FeatureText);
  }

  return {
    settings: Object.fromEntries(settings.map(r => [r.SettingKey, r.SettingValue ?? ''])),
    images: Object.fromEntries(images.map(r => [r.ImageKey, r.ImageData])),
    products: products.map(p => ({
      id: p.ProductId, type: p.ProductType, name: p.Name, price: p.Price, period: p.Period,
      badge: p.Badge, color: p.Color, image: p.Image, highlight: p.Highlight,
      features: featMap.get(p.ProductId) || [], usersLine: p.UsersLine, note: p.Note,
      link: p.Link, buttonText: p.ButtonText, visible: !!p.IsVisible
    })),
    messages: messages.map(m => ({
      id: m.MessageId, name: m.Name, phone: m.Phone, email: m.Email, product: m.Product,
      text: m.MessageText, read: !!m.IsRead,
      date: (m.CreatedAt instanceof Date ? m.CreatedAt : new Date(m.CreatedAt)).toISOString()
    }))
  };
}

/** Replace all site content atomically (the admin panel always sends the full state). */
async function replaceAll(data) {
  const pool = await getPool();
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    await conn.query('DELETE FROM ProductFeatures');
    await conn.query('DELETE FROM Products');
    await conn.query('DELETE FROM SiteImages');
    await conn.query('DELETE FROM Settings');
    await conn.query('DELETE FROM Messages');

    for (const [k, v] of Object.entries(data.settings)) {
      await conn.query('INSERT INTO Settings (SettingKey, SettingValue) VALUES (?, ?)', [k, v]);
    }
    for (const [k, v] of Object.entries(data.images)) {
      await conn.query('INSERT INTO SiteImages (ImageKey, ImageData) VALUES (?, ?)', [k, v]);
    }
    for (const [i, p] of data.products.entries()) {
      await conn.query(`INSERT INTO Products
        (ProductId, ProductType, Name, Price, Period, Badge, Color, Image, Highlight, UsersLine, Note, Link, ButtonText, IsVisible, SortOrder)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        p.id, p.type, p.name, p.price,
        p.period, p.badge, p.color,
        p.image, p.highlight,
        p.usersLine, p.note, p.link,
        p.buttonText, p.visible ? 1 : 0, i
      ]);
      for (const [j, f] of p.features.entries()) {
        await conn.query('INSERT INTO ProductFeatures (ProductId, FeatureText, SortOrder) VALUES (?, ?, ?)',
          [p.id, f, j]);
      }
    }
    for (const m of data.messages) {
      const msgDate = m.date instanceof Date ? m.date : new Date(m.date);
      await conn.query(`INSERT INTO Messages (MessageId, Name, Phone, Email, Product, MessageText, IsRead, CreatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
        m.id, m.name, m.phone, m.email,
        m.product, m.text, m.read ? 1 : 0,
        isNaN(msgDate.getTime()) ? new Date() : msgDate
      ]);
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { load, replaceAll };
