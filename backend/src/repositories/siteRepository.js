const { sql, getPool } = require('../config/db');

const NV = (n) => sql.NVarChar(n);

/** Read everything and rebuild the exact JSON shape the frontend expects. */
async function load() {
  const pool = await getPool();
  const [settings, images, products, features, messages] = await Promise.all([
    pool.request().query('SELECT SettingKey, SettingValue FROM dbo.Settings'),
    pool.request().query('SELECT ImageKey, ImageData FROM dbo.SiteImages'),
    pool.request().query('SELECT * FROM dbo.Products ORDER BY SortOrder, CreatedAt'),
    pool.request().query('SELECT ProductId, FeatureText FROM dbo.ProductFeatures ORDER BY ProductId, SortOrder'),
    pool.request().query('SELECT * FROM dbo.Messages ORDER BY CreatedAt DESC')
  ]);

  if (!settings.recordset.length && !products.recordset.length) return null; // nothing saved yet

  const featMap = new Map();
  for (const f of features.recordset) {
    if (!featMap.has(f.ProductId)) featMap.set(f.ProductId, []);
    featMap.get(f.ProductId).push(f.FeatureText);
  }

  return {
    settings: Object.fromEntries(settings.recordset.map(r => [r.SettingKey, r.SettingValue ?? ''])),
    images: Object.fromEntries(images.recordset.map(r => [r.ImageKey, r.ImageData])),
    products: products.recordset.map(p => ({
      id: p.ProductId, type: p.ProductType, name: p.Name, price: p.Price, period: p.Period,
      badge: p.Badge, color: p.Color, image: p.Image, highlight: p.Highlight,
      features: featMap.get(p.ProductId) || [], usersLine: p.UsersLine, note: p.Note,
      link: p.Link, buttonText: p.ButtonText, visible: !!p.IsVisible
    })),
    messages: messages.recordset.map(m => ({
      id: m.MessageId, name: m.Name, phone: m.Phone, email: m.Email, product: m.Product,
      text: m.MessageText, read: !!m.IsRead, date: m.CreatedAt.toISOString()
    }))
  };
}

/** Replace all site content atomically (the admin panel always sends the full state). */
async function replaceAll(data) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const run = (q, params = []) => {
      const req = new sql.Request(tx);
      for (const [name, type, value] of params) req.input(name, type, value);
      return req.query(q);
    };

    await run('DELETE FROM dbo.ProductFeatures; DELETE FROM dbo.Products; DELETE FROM dbo.SiteImages; DELETE FROM dbo.Settings; DELETE FROM dbo.Messages;');

    for (const [k, v] of Object.entries(data.settings)) {
      await run('INSERT INTO dbo.Settings (SettingKey, SettingValue) VALUES (@k, @v)',
        [['k', NV(100), k], ['v', sql.NVarChar(sql.MAX), v]]);
    }
    for (const [k, v] of Object.entries(data.images)) {
      await run('INSERT INTO dbo.SiteImages (ImageKey, ImageData) VALUES (@k, @v)',
        [['k', NV(100), k], ['v', sql.NVarChar(sql.MAX), v]]);
    }
    for (const [i, p] of data.products.entries()) {
      await run(`INSERT INTO dbo.Products
        (ProductId, ProductType, Name, Price, Period, Badge, Color, Image, Highlight, UsersLine, Note, Link, ButtonText, IsVisible, SortOrder)
        VALUES (@id,@type,@name,@price,@period,@badge,@color,@image,@highlight,@usersLine,@note,@link,@buttonText,@visible,@sort)`, [
        ['id', NV(50), p.id], ['type', NV(20), p.type], ['name', NV(200), p.name], ['price', NV(100), p.price],
        ['period', NV(200), p.period], ['badge', NV(100), p.badge], ['color', NV(50), p.color],
        ['image', sql.NVarChar(sql.MAX), p.image], ['highlight', NV(300), p.highlight],
        ['usersLine', NV(200), p.usersLine], ['note', NV(500), p.note], ['link', NV(1000), p.link],
        ['buttonText', NV(100), p.buttonText], ['visible', sql.Bit, p.visible], ['sort', sql.Int, i]
      ]);
      for (const [j, f] of p.features.entries()) {
        await run('INSERT INTO dbo.ProductFeatures (ProductId, FeatureText, SortOrder) VALUES (@pid,@t,@s)',
          [['pid', NV(50), p.id], ['t', NV(300), f], ['s', sql.Int, j]]);
      }
    }
    for (const m of data.messages) {
      await run(`INSERT INTO dbo.Messages (MessageId, Name, Phone, Email, Product, MessageText, IsRead, CreatedAt)
                 VALUES (@id,@name,@phone,@email,@product,@text,@read,@date)`, [
        ['id', NV(50), m.id], ['name', NV(200), m.name], ['phone', NV(50), m.phone], ['email', NV(200), m.email],
        ['product', NV(200), m.product], ['text', sql.NVarChar(sql.MAX), m.text], ['read', sql.Bit, m.read],
        ['date', sql.DateTime2(0), m.date]
      ]);
    }
    await tx.commit();
  } catch (err) {
    await tx.rollback().catch(() => {});
    throw err;
  }
}

module.exports = { load, replaceAll };
