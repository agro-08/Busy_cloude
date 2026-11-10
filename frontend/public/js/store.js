/* ==========================================================
   store.js  -  Shared data layer (website + admin dono use karte hain)
   Data server par share hota hai aur browser me backup cache rehta hai.
   ========================================================== */
const BOC = (() => {
  const KEY = 'boc_data_v1';
  const P = 'assets/img/';

  /* Har image jo admin badal sakta hai */
  const IMAGE_REGISTRY = [
    { key: 'logo',             label: 'Website Logo',                 where: 'Header + Footer + Browser tab icon', def: P + 'Busy-on-cloud-micro-e1629081008400.png' },
    { key: 'hero',             label: 'Hero Image (devices)',         where: 'Home section - right side badi image', def: P + 'busyonclouds.png' },
    { key: 'feat_speed',       label: 'Feature icon: Speed',          where: 'Features section - Speed & Reliability card', def: P + 'speed.png' },
    { key: 'feat_secure',      label: 'Feature icon: Secured',        where: 'Features section - Secured BUSY Data card', def: P + 'secured.png' },
    { key: 'feat_eco',         label: 'Feature icon: Economical',     where: 'Features section - Economical card', def: P + 'economical.png' },
    { key: 'feat_backup',      label: 'Feature icon: Local Backup',   where: 'Features section - Local Backup card', def: P + 'backup-1.png' },
    { key: 'feat_multi',       label: 'Feature icon: Multi-User',     where: 'Features section - Multi-User card', def: P + 'multiuser.png' },
    { key: 'feat_infra',       label: 'Features big picture',         where: 'Features section - right side badi image', def: P + 'speedsecurity-1.png' },
    { key: 'feat_local',       label: 'Features small picture',       where: 'Features section - badi image ke neeche', def: P + 'local-backup-1-300x226.png' },
    { key: 'badge_basic',      label: 'Badge: BUSY Basic',            where: 'Supported Versions strip', def: P + 'BusyBasic1-150x150.png' },
    { key: 'badge_standard',   label: 'Badge: BUSY Standard',         where: 'Supported Versions strip', def: P + 'BusyStandard-150x150.png' },
    { key: 'badge_enterprise', label: 'Badge: BUSY Enterprise',       where: 'Supported Versions strip', def: P + 'BusyEnterprise-150x150.png' },
    { key: 'badge_du',         label: 'Badge: Dual User',             where: 'Supported Versions strip', def: P + 'DU-150x150.png' },
    { key: 'badge_browser',    label: 'Badge: HTML5 Browser',         where: 'Supported Versions strip', def: P + 'BROWSER-150x150.png' },
    { key: 'relax',            label: 'Why Choose Us picture',        where: 'Why Choose Us section - right side', def: P + 'relax.png' },
    { key: 'support',          label: 'Support icon: 24x7 Team',      where: 'Support cards - Back End Team', def: P + 'support.png' },
    { key: 'uptime',           label: 'Support icon: Uptime',         where: 'Support cards - Maximum Uptime', def: P + 'uptime.png' },
    { key: 'shot_browser',     label: 'Screenshot: Browser Edition',  where: 'Interface Preview - left screenshot', def: P + 'browser-edition.jpg' },
    { key: 'shot_rdp',         label: 'Screenshot: RDP Edition',      where: 'Interface Preview - right screenshot', def: P + 'rdp-edition.jpg' }
  ];

  const baseFeatures = ['HTML5- WebAccess', 'RDP- Access', 'Unlimited Monthly Bandwidth', 'Local Printer Support', 'Online Support', 'Virus Protection', 'Scheduled Backups'];
  const yearly = 'Price Applicable Only On Yearly Subscription';
  const vmFeat = (bw) => ['HTML5- WebAccess & RDP', bw, '2016 Windows Server (Ev)', 'Local Printer Supported', 'Backups & Virus Protection'];

  const defaults = {
    settings: {
      theme: 'sky',
      brandName: 'Busy On Cloud',
      whatsapp: '919999999999',
      demoMessage: 'Hello, I want a quick demo of Busy On Cloud.',
      demoButtonText: 'Quick Demo',
      phone: '+91 99999 99999',
      email: 'support@busyoncloud.com',
      heroLine1: 'Busy On Cloud',
      heroText: 'Run BUSY Accounting Software anytime, anywhere, on any device or operating system, with security, stability, privacy and reliability.',
      stat1n: '20',   stat1l: 'Partners',
      stat2n: '150',  stat2l: 'Projects',
      stat3n: '3000', stat3l: 'Happy Clients'
    },
    images: {},
    products: [
      { id: 'p1', type: 'user', name: 'BOC Basic', price: '₹ 1,250.00', period: 'Per Month Per User', badge: '', color: 'sky',
        image: P + 'BusyBasic1-150x150.png', highlight: '', features: baseFeatures, usersLine: 'Single User', note: yearly, link: '', buttonText: 'Select BOC Basic', visible: true },
      { id: 'p2', type: 'user', name: 'BOC Standard', price: '₹ 1,000.00', period: 'Per Month Per User', badge: '', color: 'ocean',
        image: P + 'BusyStandard-150x150.png', highlight: '', features: baseFeatures, usersLine: 'Minimum 2 Users', note: yearly, link: '', buttonText: 'Select BOC Standard', visible: true },
      { id: 'p3', type: 'user', name: 'BOC Business', price: '₹ 850.00', period: 'Per Month Per User', badge: 'Most Popular', color: 'midnight',
        image: P + 'BusyEnterprise-150x150.png', highlight: '', features: baseFeatures, usersLine: 'Minimum 4 Users', note: yearly, link: '', buttonText: 'Select BOC Business', visible: true },
      { id: 'p4', type: 'vm', name: 'BUSY Ready VM Economy', price: '₹ 4,000.00', period: 'Per Month (Billed Yearly)', badge: '', color: 'sky',
        image: P + 'server.png', highlight: '2 Core CPU, 4 GB RAM, 80 GB SSD', features: vmFeat('500 GB @ 10 Gbps Bandwidth'), usersLine: 'Up to 5 Concurrent Users', note: '', link: '', buttonText: 'Order VM Economy', visible: true },
      { id: 'p5', type: 'vm', name: 'BUSY Ready VM Business', price: '₹ 7,500.00', period: 'Per Month (Billed Yearly)', badge: '', color: 'sun',
        image: P + 'vps-400x400.png', highlight: '4 Core CPU, 6 GB RAM, 120 GB SSD', features: vmFeat('1.5 TB @ 10 Gbps Bandwidth'), usersLine: 'Up to 10 Concurrent Users', note: '', link: '', buttonText: 'Order VM Business', visible: true },
      { id: 'p6', type: 'vm', name: 'BUSY Ready VM Enterprise', price: '₹ 14,000.00', period: 'Per Month (Billed Yearly)', badge: 'Dedicated Server', color: 'midnight',
        image: P + 'server.png', highlight: '4 Core CPU, 8 GB RAM, 150 GB SSD', features: vmFeat('2 TB @ 10 Gbps Bandwidth'), usersLine: 'Up to 20 Concurrent Users', note: '', link: '', buttonText: 'Order VM Enterprise', visible: true }
    ],
    messages: []
  };

  const clone = (o) => JSON.parse(JSON.stringify(o));

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        return {
          settings: Object.assign({}, defaults.settings, d.settings || {}),
          images: d.images || {},
          products: Array.isArray(d.products) ? d.products : clone(defaults.products),
          messages: Array.isArray(d.messages) ? d.messages : []
        };
      }
    } catch (e) { /* corrupted / blocked storage: defaults use honge */ }
    return clone(defaults);
  }

  let data = load();
  delete data.settings.adminPassword;
  delete data.settings.webhookUrl;
  try {
    const cached = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (cached && cached.settings && (cached.settings.adminPassword || cached.settings.webhookUrl)) {
      delete cached.settings.adminPassword;
      delete cached.settings.webhookUrl;
      localStorage.setItem(KEY, JSON.stringify(cached));
    }
  } catch (error) { console.warn('Could not remove the old browser-stored admin password:', error); }

  function normalize(d) {
    const next = {
      settings: Object.assign({}, defaults.settings, d.settings || {}),
      images: d.images && typeof d.images === 'object' ? d.images : {},
      products: Array.isArray(d.products) ? d.products : clone(defaults.products),
      messages: Array.isArray(d.messages) ? d.messages : []
    };
    delete next.settings.adminPassword;
    delete next.settings.webhookUrl;
    return next;
  }

  function notifyDataChanged() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('boc:data-updated'));
    }
  }

  function setData(d) {
    data = normalize(d);
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      notifyDataChanged();
    }
    catch (error) { console.warn('Server data loaded, but local browser cache could not be updated:', error); }
  }

  async function request(url, options) {
    let response;
    try {
      response = await fetch(url, Object.assign({ credentials: 'same-origin' }, options));
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Backend se connection nahi hua. Terminal mein npm start chalayein aur http://localhost:3000/admin.html se kholein; file:// ya Live Server URL use na karein.');
      }
      throw error;
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Server request failed (' + response.status + ').');
    return result;
  }

  function save() {
    try {
      delete data.settings.adminPassword;
      localStorage.setItem(KEY, JSON.stringify(data));
      notifyDataChanged();
      return true;
    }
    catch (e) { return false; }
  }

  function saveRemote() {
    return request('/api/admin/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  async function loadRemote(admin) {
    const result = await request(admin ? '/api/admin/data' : '/api/data');
    if (result.data) {
      setData(Object.assign({}, data, result.data));
      return true;
    }
    if (admin) await saveRemote();
    return false;
  }

  function replaceAll(d) {
    setData(d);
  }

  function login(password) {
    return request('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
  }

  function logout() {
    return request('/api/logout', { method: 'POST' });
  }

  function checkSession() {
    return request('/api/admin/session');
  }

  function changePassword(currentPassword, newPassword) {
    return request('/api/admin/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  /* Sirf http, https, tel, mailto links allow - javascript: jaisi links block */
  function safeUrl(u) {
    u = String(u || '').trim();
    return /^(https?:|tel:|mailto:)/i.test(u) ? u : '';
  }

  function demoUrl() {
    const n = String(data.settings.whatsapp || '').replace(/\D/g, '');
    return 'https://wa.me/' + n + '?text=' + encodeURIComponent(data.settings.demoMessage || '');
  }

  return {
    KEY, IMAGE_REGISTRY, defaults,
    get data() { return data; },
    reload() { data = normalize(load()); return data; },
    save, saveRemote, loadRemote, replaceAll, login, logout, checkSession, changePassword, safeUrl, demoUrl, clone,
    img(key) {
      const r = IMAGE_REGISTRY.find(x => x.key === key);
      return data.images[key] || (r ? r.def : '');
    },
    esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
  };
})();
