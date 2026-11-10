/* ==========================================================
   admin.js  -  Admin panel logic
   ========================================================== */
(function () {
  const { esc, safeUrl } = BOC;
  const $ = (id) => document.getElementById(id);
  const D = () => BOC.data;

  /* ---------- helpers ---------- */
  let toastTimer;
  function toast(msg, bad) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.toggle('bad', !!bad);
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  }
  async function persist(okMsg) {
    try {
      await BOC.saveRemote();
      if (!BOC.save()) toast('Server save succeeded, but the browser cache is full.', true);
      else if (okMsg) toast(okMsg);
      return true;
    } catch (err) {
      toast('Server save failed: ' + err.message, true);
      return false;
    }
  }
  function openDlg(d) { if (d.showModal) d.showModal(); else d.setAttribute('open', ''); }
  function closeDlg(d) { if (d.close) d.close(); else d.removeAttribute('open'); }

  function confirmBox(title, text, yesLabel) {
    return new Promise(res => {
      const d = $('cDialog');
      $('cTitle').textContent = title;
      $('cText').textContent = text;
      $('cYes').textContent = yesLabel || 'Yes, continue';
      const done = (v) => { $('cYes').onclick = $('cNo').onclick = null; d.onclose = null; closeDlg(d); res(v); };
      $('cYes').onclick = () => done(true);
      $('cNo').onclick = () => done(false);
      d.onclose = () => res(false);
      openDlg(d);
    });
  }

  /* Image file -> chhota (max 1200px) data URL, taaki storage full na ho */
  function fileToDataURL(file, max) {
    max = max || 1200;
    return new Promise((resolve, reject) => {
      if (!file || !/^image\//.test(file.type)) return reject(new Error('Sirf image file chuno.'));
      const r = new FileReader();
      r.onerror = () => reject(new Error('Unable to read the file.'));
      r.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('This image could not be loaded.'));
        img.onload = () => {
          const s = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(img.width * s));
          c.height = Math.max(1, Math.round(img.height * s));
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL('image/webp', 0.85));
        };
        img.src = r.result;
      };
      r.readAsDataURL(file);
    });
  }

  /* ---------- login ---------- */
  const SESSION = 'boc_admin_ok';
  async function showApp() {
    try {
      await BOC.loadRemote(true);
    } catch (err) {
      $('loginErr').textContent = 'Could not connect to the server: ' + err.message;
      $('loginErr').hidden = false;
      return;
    }
    $('login').hidden = true;
    $('app').hidden = false;
    go(location.hash.replace('#', '') || 'dashboard');
  }
  $('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    try {
      await BOC.login($('loginPass').value);
      sessionStorage.setItem(SESSION, '1');
      $('loginErr').hidden = true;
      $('loginPass').value = '';
      await showApp();
    } catch (err) {
      $('loginErr').textContent = err.message;
      $('loginErr').hidden = false;
    }
  });
  $('logout').addEventListener('click', async () => {
    try { await BOC.logout(); } catch (err) { console.error('Admin logout failed:', err); }
    sessionStorage.removeItem(SESSION);
    $('app').hidden = true;
    $('login').hidden = false;
    $('loginPass').focus();
  });

  /* ---------- navigation ---------- */
  const TITLES = { dashboard: 'Dashboard', products: 'Products', images: 'Site Images', settings: 'Demo & Contact', messages: 'Messages', security: 'Security & Backup' };
  function go(view) {
    if (!TITLES[view]) view = 'dashboard';
    document.querySelectorAll('.view').forEach(v => v.hidden = v.id !== 'view-' + view);
    document.querySelectorAll('.side-nav button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    $('viewTitle').textContent = TITLES[view];
    history.replaceState(null, '', '#' + view);
    ({ dashboard: renderDash, products: renderProducts, images: renderImages, settings: renderSettings, messages: renderMessages, security: () => {} })[view]();
    setSide(false);
    window.scrollTo(0, 0);
  }
  document.querySelector('.side-nav').addEventListener('click', e => { const b = e.target.closest('button[data-view]'); if (b) go(b.dataset.view); });
  document.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); });
  function setSide(open) { $('side').classList.toggle('open', open); $('scrim').classList.toggle('show', open); }
  $('menuBtn').addEventListener('click', () => setSide(true));
  $('scrim').addEventListener('click', () => setSide(false));

  function updateBadge() {
    const n = D().messages.filter(m => !m.read).length;
    const b = $('msgCount');
    b.textContent = n;
    b.hidden = n === 0;
  }

  /* ---------- dashboard ---------- */
  function renderDash() {
    const d = D();
    const used = Math.round(JSON.stringify(d).length / 1024);
    const withLink = d.products.filter(p => safeUrl(p.link)).length;
    $('dashCards').innerHTML = [
      [d.products.length, 'Total products'],
      [d.products.filter(p => p.visible !== false).length, 'Visible on website'],
      [withLink, 'Products with link'],
      [d.messages.filter(m => !m.read).length, 'Unread messages'],
      [Object.keys(d.images).length, 'Custom images'],
      [used + ' KB', 'Storage used (limit ~5000 KB)']
    ].map(([n, l]) => `<div class="stat"><b>${esc(n)}</b><span>${esc(l)}</span></div>`).join('');
    updateBadge();
  }

  /* ---------- products ---------- */
  function renderProducts() {
    const list = D().products;
    const el = $('productList');
    if (!list.length) { el.innerHTML = '<div class="empty-box">No products yet. Click "Add new product".</div>'; return; }
    el.innerHTML = list.map((p, i) => {
      const link = safeUrl(p.link);
      const sameType = list.map((x, k) => x.type === p.type ? k : -1).filter(k => k >= 0);
      const pos = sameType.indexOf(i);
      return `
      <div class="prow${p.visible === false ? ' off' : ''}" data-id="${esc(p.id)}">
        <div class="pimg">${p.image ? `<img src="${esc(p.image)}" alt="">` : '<i class="fa-solid fa-cloud"></i>'}</div>
        <div>
          <h3>${esc(p.name)}</h3>
          <div class="meta">
            <span>${esc(p.price)} <small>${esc(p.period)}</small></span>
            <span class="tag ${p.type === 'vm' ? 'vm' : ''}">${p.type === 'vm' ? 'Dedicated VM' : 'Per User'}</span>
            ${p.visible === false ? '<span class="tag off">Hidden</span>' : ''}
            ${link ? `<a class="tag link" href="${esc(link)}" target="_blank" rel="noopener"><i class="fa-solid fa-link"></i> Link set</a>` : '<span class="tag nolink">No link: opens WhatsApp demo</span>'}
          </div>
        </div>
        <div class="pact">
          <button class="iconbtn" data-act="up" title="Move up" ${pos === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-up"></i></button>
          <button class="iconbtn" data-act="down" title="Move down" ${pos === sameType.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-down"></i></button>
          <button class="btn btn-ghost sm" data-act="edit"><i class="fa-solid fa-pen"></i> Edit</button>
          <button class="iconbtn del" data-act="del" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>`;
    }).join('');
  }

  $('productList').addEventListener('click', async e => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const id = btn.closest('.prow').dataset.id;
    const list = D().products;
    const i = list.findIndex(p => p.id === id);
    if (i < 0) return;
    const act = btn.dataset.act;
    if (act === 'edit') return openProduct(list[i]);
    if (act === 'del') {
      if (await confirmBox('Delete product?', `"${list[i].name}" will be removed from the website permanently.`, 'Yes, delete')) {
        list.splice(i, 1);
        if (await persist('Product deleted')) renderProducts();
      }
      return;
    }
    // move within same type
    const dir = act === 'up' ? -1 : 1;
    let k = i + dir;
    while (k >= 0 && k < list.length && list[k].type !== list[i].type) k += dir;
    if (k < 0 || k >= list.length) return;
    [list[i], list[k]] = [list[k], list[i]];
    if (await persist()) renderProducts();
  });

  /* product editor */
  let editingId = null;
  let fImage = '';
  const F = {
    type: $('fType'), color: $('fColor'), name: $('fName'), price: $('fPrice'), period: $('fPeriod'), badge: $('fBadge'),
    highlight: $('fHighlight'), features: $('fFeatures'), users: $('fUsers'), note: $('fNote'), btn: $('fBtn'), link: $('fLink'), visible: $('fVisible')
  };
  function setFormImage(src) {
    fImage = src || '';
    const prev = $('fImgPrev');
    prev.src = fImage;
    prev.hidden = !fImage;
    $('fImgNone').hidden = !!fImage;
    $('fImgUrl').value = /^data:/.test(fImage) ? '' : fImage;
  }
  function openProduct(p) {
    editingId = p ? p.id : null;
    $('pDlgTitle').textContent = p ? 'Edit product' : 'Add product';
    $('pErr').hidden = true;
    const v = p || { type: 'user', color: 'sky', name: '', price: '', period: 'Per Month Per User', badge: '', highlight: '', features: [], usersLine: '', note: '', buttonText: 'Select plan', link: '', visible: true, image: '' };
    F.type.value = v.type; F.color.value = v.color || 'sky'; F.name.value = v.name; F.price.value = v.price; F.period.value = v.period || '';
    F.badge.value = v.badge || ''; F.highlight.value = v.highlight || ''; F.features.value = (v.features || []).join('\n');
    F.users.value = v.usersLine || ''; F.note.value = v.note || ''; F.btn.value = v.buttonText || ''; F.link.value = v.link || '';
    F.visible.checked = v.visible !== false;
    setFormImage(v.image);
    openDlg($('pDialog'));
  }
  $('addProduct').addEventListener('click', () => openProduct(null));
  $('fImgFile').addEventListener('change', async e => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    try { setFormImage(await fileToDataURL(f, 500)); } catch (err) { toast(err.message, true); }
  });
  $('fImgUrl').addEventListener('change', e => setFormImage(safeUrl(e.target.value) || (/^assets\//.test(e.target.value.trim()) ? e.target.value.trim() : '')));
  $('fImgClear').addEventListener('click', () => setFormImage(''));
  $('pForm').addEventListener('submit', async e => {
    e.preventDefault();
    const name = F.name.value.trim(), price = F.price.value.trim();
    const err = $('pErr');
    if (!name || !price) { err.textContent = 'Product name and price are required.'; err.hidden = false; return; }
    let link = F.link.value.trim();
    if (link && !/^(https?:|tel:|mailto:)/i.test(link)) link = 'https://' + link;
    if (link && !safeUrl(link)) { err.textContent = 'The link is invalid.'; err.hidden = false; return; }
    const p = {
      id: editingId || 'p' + Date.now(),
      type: F.type.value, color: F.color.value, name, price, period: F.period.value.trim(), badge: F.badge.value.trim(),
      image: fImage, highlight: F.highlight.value.trim(),
      features: F.features.value.split('\n').map(s => s.trim()).filter(Boolean),
      usersLine: F.users.value.trim(), note: F.note.value.trim(),
      buttonText: F.btn.value.trim() || 'Select plan', link, visible: F.visible.checked
    };
    const list = D().products;
    const i = list.findIndex(x => x.id === p.id);
    if (i >= 0) list[i] = p; else list.push(p);
    if (await persist(i >= 0 ? 'Product updated' : 'Product added')) { closeDlg($('pDialog')); renderProducts(); }
  });
  $('pDialog').addEventListener('click', e => { if (e.target.closest('[data-close]')) closeDlg($('pDialog')); });

  /* ---------- site images ---------- */
  function renderImages() {
    $('imageGrid').innerHTML = BOC.IMAGE_REGISTRY.map(r => {
      const custom = !!D().images[r.key];
      const urlVal = custom && !/^data:/.test(D().images[r.key]) ? D().images[r.key] : '';
      return `
      <div class="icard" data-key="${esc(r.key)}">
        <div class="prev"><img src="${esc(BOC.img(r.key))}" alt=""></div>
        <h3>${esc(r.label)} ${custom ? '<span class="custom-tag">(custom)</span>' : ''}</h3>
        <p class="where"><i class="fa-solid fa-location-dot"></i>${esc(r.where)}</p>
        <div class="bar-actions tight">
          <label class="btn btn-primary sm" for="up-${esc(r.key)}"><i class="fa-solid fa-upload"></i> Upload</label>
          <input type="file" id="up-${esc(r.key)}" data-file accept="image/*" hidden>
          <button class="btn btn-ghost sm" data-reset ${custom ? '' : 'disabled'}>Reset</button>
        </div>
        <input class="url" data-url placeholder="or paste an image URL" value="${esc(urlVal)}">
      </div>`;
    }).join('');
  }
  $('imageGrid').addEventListener('change', async e => {
    const card = e.target.closest('.icard'); if (!card) return;
    const key = card.dataset.key;
    if (e.target.matches('[data-file]')) {
      const f = e.target.files[0]; if (!f) return;
      try {
        D().images[key] = await fileToDataURL(f, key.startsWith('shot_') ? 1600 : 1000);
        if (await persist('Image updated')) renderImages(); else { delete D().images[key]; }
      } catch (err) { toast(err.message, true); }
    } else if (e.target.matches('[data-url]')) {
      const u = safeUrl(e.target.value);
      if (!e.target.value.trim()) return;
      if (!u) { toast('URL must start with http:// or https://.', true); return; }
      D().images[key] = u;
      if (await persist('Image updated')) renderImages();
    }
  });
  $('imageGrid').addEventListener('click', async e => {
    const b = e.target.closest('[data-reset]'); if (!b) return;
    delete D().images[b.closest('.icard').dataset.key];
    if (await persist('Original image restored')) renderImages();
  });

  /* ---------- settings ---------- */
  const SETTINGS = [
    { group: 'Website design', note: 'Change the overall look of the website here. Save and refresh the site to see the update.', fields: [
      { k: 'theme', l: 'Design', h: 'Sky Bubble = white + sky blue with rounded cards and coral button. Night Neon = dark futuristic.', opts: [['sky', 'Sky Bubble (light)'], ['night', 'Night Neon (dark futuristic)']] }
    ] },
    { group: 'Quick Demo (WhatsApp)', note: 'The website’s “Quick Demo” buttons (Home + Contact section) open WhatsApp when clicked.', fields: [
      { k: 'demoButtonText', l: 'Demo button text', h: 'This text appears on the buttons in the Home and Contact sections' },
      { k: 'whatsapp', l: 'WhatsApp number', h: 'Use country code and no + or spaces. Example: 919876543210', tel: true },
      { k: 'demoMessage', l: 'WhatsApp pre-filled message', h: 'This message is automatically pre-written in the user’s WhatsApp', area: true }
    ] },
    { group: 'Contact details', note: 'These appear in the Contact section below.', fields: [
      { k: 'phone', l: 'Phone number', h: 'Shown in the contact section' },
      { k: 'email', l: 'Email', h: 'Shown in the contact section' },
    ] },
    { group: 'Home (hero) text', note: 'The main large text shown at the top of the website.', fields: [
      { k: 'heroLine1', l: 'Main heading', h: 'Main text at the top of the Home section' },
      { k: 'heroText', l: 'Paragraph', h: 'Text shown below the heading', area: true },
      { k: 'brandName', l: 'Brand name', h: 'Shown with the footer copyright text' }
    ] },
    { group: 'Numbers strip', note: 'Three numbers shown in the blue strip below pricing.', fields: [
      { k: 'stat1n', l: 'Number 1', h: 'e.g. 20' }, { k: 'stat1l', l: 'Label 1', h: 'e.g. Partners' },
      { k: 'stat2n', l: 'Number 2', h: 'e.g. 150' }, { k: 'stat2l', l: 'Label 2', h: 'e.g. Projects' },
      { k: 'stat3n', l: 'Number 3', h: 'e.g. 3000' }, { k: 'stat3l', l: 'Label 3', h: 'e.g. Happy Clients' }
    ] }
  ];
  function renderSettings() {
    const s = D().settings;
    $('settingsForm').innerHTML = SETTINGS.map(g => `
      <div class="group">
        <h2>${esc(g.group)}</h2>
        <p class="muted">${esc(g.note)}</p>
        <div class="grid2" style="margin-top:12px">
          ${g.fields.map(f => `<label ${f.area ? 'style="grid-column:1/-1"' : ''}>${esc(f.l)} <small>${esc(f.h)}</small>
            ${f.opts ? `<select name="${f.k}">${f.opts.map(o => `<option value="${o[0]}"${s[f.k] === o[0] ? ' selected' : ''}>${o[1]}</option>`).join('')}</select>` : f.area ? `<textarea name="${f.k}" rows="3">${esc(s[f.k])}</textarea>` : `<input name="${f.k}" value="${esc(s[f.k])}" ${f.tel ? 'inputmode="numeric"' : ''}>`}</label>`).join('')}
        </div>
      </div>`).join('<hr style="border:0;border-top:1px solid var(--line);width:100%">') +
      `<div class="bar-actions"><button class="btn btn-primary" type="submit"><i class="fa-solid fa-floppy-disk"></i> Save settings</button>
       <a class="btn btn-ghost" id="testDemo" href="#" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> Test demo button</a></div>`;
  }
  $('settingsForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData($('settingsForm'));
    const s = D().settings;
    for (const [k, v] of fd.entries()) s[k] = String(v).trim();
    s.whatsapp = s.whatsapp.replace(/\D/g, '');
    if (await persist('Settings saved')) renderSettings();
  });
  $('settingsForm').addEventListener('click', e => {
    const t = e.target.closest('#testDemo'); if (!t) return;
    const n = String(new FormData($('settingsForm')).get('whatsapp') || '').replace(/\D/g, '');
    const m = new FormData($('settingsForm')).get('demoMessage') || '';
    t.href = 'https://wa.me/' + n + '?text=' + encodeURIComponent(m);
  });

  /* ---------- messages ---------- */
  function fmtDate(iso) { try { return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return iso; } }
  function renderMessages() {
    const list = D().messages;
    updateBadge();
    $('msgList').innerHTML = list.length ? list.map(m => {
      const num = String(m.phone || '').replace(/\D/g, '');
      return `
      <article class="msg${m.read ? '' : ' unread'}" data-id="${esc(m.id)}">
        <div class="msg-top"><h3>${esc(m.name)} ${m.read ? '' : '<span class="count">New</span>'}</h3><time>${esc(fmtDate(m.date))}</time></div>
        <div class="info">
          <span><i class="fa-solid fa-phone"></i> <a href="tel:${esc(num)}">${esc(m.phone)}</a></span>
          ${m.email ? `<span><i class="fa-solid fa-envelope"></i> <a href="mailto:${esc(m.email)}">${esc(m.email)}</a></span>` : ''}
          <span><i class="fa-solid fa-tag"></i> ${esc(m.product || 'General enquiry')}</span>
        </div>
        <p>${esc(m.text)}</p>
        <div class="bar-actions tight">
          <a class="btn btn-ghost sm" href="https://wa.me/${esc(num)}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> Reply on WhatsApp</a>
          <button class="btn btn-ghost sm" data-m="read">${m.read ? 'Mark unread' : 'Mark read'}</button>
          <button class="btn btn-danger-ghost sm" data-m="del"><i class="fa-solid fa-trash"></i> Delete</button>
        </div>
      </article>`;
    }).join('') : '<div class="empty-box"><i class="fa-solid fa-inbox"></i><br>No messages yet.</div>';
  }
  $('msgList').addEventListener('click', async e => {
    const b = e.target.closest('[data-m]'); if (!b) return;
    const id = b.closest('.msg').dataset.id;
    const list = D().messages;
    const i = list.findIndex(m => m.id === id);
    if (i < 0) return;
    if (b.dataset.m === 'read') list[i].read = !list[i].read;
    else if (await confirmBox('Delete message?', 'This message will be deleted permanently.', 'Yes, delete')) list.splice(i, 1);
    else return;
    if (await persist()) renderMessages();
  });
  $('markAll').addEventListener('click', async () => { D().messages.forEach(m => m.read = true); if (await persist('All marked as read')) renderMessages(); });
  $('clearMsgs').addEventListener('click', async () => {
    if (!D().messages.length) return;
    if (await confirmBox('Delete all messages?', 'All messages will be deleted permanently.', 'Yes, delete all')) {
      D().messages = []; if (await persist('All messages deleted')) renderMessages();
    }
  });

  /* ---------- security + backup ---------- */
  $('passForm').addEventListener('submit', async e => {
    e.preventDefault();
    const err = $('passErr'), cur = $('pCur').value, n1 = $('pNew').value, n2 = $('pNew2').value;
    const bad = (m) => { err.textContent = m; err.hidden = false; };
    if (n1.length < 6) return bad('New password must be at least 6 characters long.');
    if (n1 !== n2) return bad('New password and confirm password do not match.');
    if (n1 === cur) return bad('New password must be different from the current one.');
    err.hidden = true;
    try {
      await BOC.changePassword(cur, n1);
      toast('Password changed');
      $('passForm').reset();
    } catch (error) { bad(error.message); }
  });
  $('exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(D(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'busy-on-cloud-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $('importFile').addEventListener('change', async e => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    try {
      const d = JSON.parse(await f.text());
      if (!d || !Array.isArray(d.products) || typeof d.settings !== 'object') throw new Error('bad');
      if (!(await confirmBox('Restore backup?', 'The current website data will be replaced with this backup. The admin password will not be changed.', 'Yes, restore'))) return;
      BOC.replaceAll(d);
      if (await persist('Backup restored')) go('dashboard');
    } catch (err) { toast('This is not a valid backup file.', true); }
  });
  $('resetAll').addEventListener('click', async () => {
    if (await confirmBox('Reset website data?', 'All products, images, settings, and messages will return to their original state. The admin password will not change. Please back up first.', 'Yes, reset')) {
      BOC.replaceAll(BOC.clone(BOC.defaults));
      if (await persist('Website data reset. Admin password unchanged.')) go('dashboard');
    }
  });

  /* ---------- start ---------- */
  if (sessionStorage.getItem(SESSION) === '1') {
    BOC.checkSession().then(result => {
      if (result.authenticated) showApp();
      else sessionStorage.removeItem(SESSION);
    }).catch(error => {
      console.error('Admin session check failed:', error);
      sessionStorage.removeItem(SESSION);
    });
  }
})();
