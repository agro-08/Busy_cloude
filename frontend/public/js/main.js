/* ==========================================================
   main.js  -  Website: admin ka data page par lagata hai
   ========================================================== */
(function () {
  const { esc, safeUrl } = BOC;
  const S = () => BOC.data.settings;

  /* ---------- Images (admin se badli hui) ---------- */
  function applyImages() {
    document.querySelectorAll('[data-img]').forEach(el => { el.src = BOC.img(el.dataset.img); });
    const fav = document.querySelector('[data-favicon]');
    if (fav) fav.href = BOC.img('logo');
  }

  /* ---------- Text settings ---------- */
  function applySettings() {
    document.documentElement.setAttribute('data-theme', /^(sky|night|ledger)$/.test(S().theme) ? S().theme : 'sky');
    document.querySelectorAll('[data-set]').forEach(el => {
      const v = S()[el.dataset.set];
      if (v !== undefined && v !== '') el.textContent = v;
    });
    document.querySelectorAll('.js-demo').forEach(a => { a.href = BOC.demoUrl(); });
    document.getElementById('year').textContent = new Date().getFullYear();
    renderTicker();
    document.getElementById('footer').classList.toggle('no-anim', S().footerAnim === 'off');
    buildFooterScene();
    countUpAll(false);
  }

  /* ---------- Announcement ticker (admin: Ticker settings) ---------- */
  let tickerSig = '';
  function renderTicker() {
    const box = document.getElementById('ticker');
    const items = String(S().tickerItems || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean);
    const on = S().tickerOn !== 'off' && items.length > 0;
    box.hidden = !on;
    const sig = on ? items.join('|') : '';
    if (!on || sig === tickerSig) return;
    tickerSig = sig;
    const one = items.map(t => `<span class="tk"><i class="tk-dot" aria-hidden="true"></i>${esc(t)}</span>`).join('');
    /* 2 same halves + CSS translateX(-50%) = seamless loop; repeat enough to cover wide screens */
    const half = one.repeat(Math.max(1, Math.ceil(10 / items.length)));
    document.getElementById('tickerTrack').innerHTML = `<div class="tk-set">${half}</div><div class="tk-set" aria-hidden="true">${half}</div>`;
  }

  /* ---------- Footer scene: servers send data packets up to the cloud ---------- */
  let sceneBuilt = false;
  function buildFooterScene() {
    if (sceneBuilt) return;
    sceneBuilt = true;
    const scene = document.getElementById('footScene');
    const racks = [[10, 70], [19, 104], [28, 58], [37, 88], [63, 96], [72, 62], [81, 110], [90, 76]];
    let h = '<div class="fs-cloud fc1"></div><div class="fs-cloud fc2"></div><div class="fs-cloud fc3"></div>';
    h += '<div class="fs-main"><i class="fs-ring"></i><i class="fs-ring r2"></i><div class="fs-cloud-big"></div><i class="fa-solid fa-arrow-up fs-arrow"></i></div>';
    h += '<div class="fs-dots">';
    const glyph = ['\u20b9', '0', '1', '%', '+'];
    for (let i = 0; i < 22; i++) {
      const sz = 3 + Math.random() * 5;
      h += `<i style="left:${(Math.random() * 100).toFixed(1)}%;--s:${sz.toFixed(1)}px;--y:${(Math.random() * 62).toFixed(0)}%;--d:${(6 + Math.random() * 9).toFixed(1)}s;--w:${(-Math.random() * 14).toFixed(1)}s" data-g="${glyph[i % glyph.length]}"></i>`;
    }
    h += '</div><div class="fs-packets">';
    racks.forEach(([x], i) => {
      for (let k = 0; k < 2; k++) {
        h += `<i class="pkt" style="left:${x}%;--dx:${((50 - x) * 0.9).toFixed(1)}vw;--h:${racks[i][1]}px;--rise:${190 - racks[i][1]}px;--t:${(3.2 + (i % 4) * .5).toFixed(1)}s;--w:${(-(i * .55 + k * 1.7)).toFixed(2)}s"></i>`;
      }
    });
    h += '</div><div class="fs-racks">';
    racks.forEach(([x, ht], i) => {
      const slots = Math.round(ht / 17);
      h += `<b class="rack" style="left:${x}%;--h:${ht}px">` + Array.from({ length: slots }, (_, j) => `<i style="--b:${(((i * 7 + j * 3) % 10) / 4).toFixed(2)}s"></i>`).join('') + '</b>';
    });
    h += '</div><div class="fs-ground"></div>';
    scene.innerHTML = h;
  }

  /* ---------- Numbers count up when they scroll into view ---------- */
  let countObserver;
  function countUpAll(force) {
    const els = document.querySelectorAll('.stat-card b');
    els.forEach(el => {
      const txt = el.textContent.trim();
      const m = txt.match(/^([^\d]*)([\d][\d,\.]*)(.*)$/);
      el.dataset.final = txt;
      if (!m || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      el.dataset.pre = m[1]; el.dataset.num = m[2].replace(/,/g, ''); el.dataset.post = m[3];
    });
    if (!('IntersectionObserver' in window)) return;
    if (countObserver) countObserver.disconnect();
    countObserver = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      countObserver.unobserve(en.target);
      runCount(en.target);
    }), { threshold: .5 });
    els.forEach(el => { if (el.dataset.num) countObserver.observe(el); });
  }
  function runCount(el) {
    const end = parseFloat(el.dataset.num), dec = (el.dataset.num.split('.')[1] || '').length;
    const t0 = performance.now(), dur = 1400;
    (function tick(t) {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = el.dataset.pre + (end * e).toFixed(dec) + el.dataset.post;
      if (k < 1) requestAnimationFrame(tick); else el.textContent = el.dataset.final;
    })(t0);
  }

  function refreshSiteData() {
    BOC.reload();
    applyImages();
    applySettings();
    renderPlans();
  }

  /* ---------- Pricing cards ---------- */
  function planCard(p) {
    const link = safeUrl(p.link);
    const features = (p.features || []).map(f => `<li><i class="fa-solid fa-circle-check"></i>${esc(f)}</li>`).join('');
    const cta = link
      ? `<a class="btn plan-btn" href="${esc(link)}" target="_blank" rel="noopener">${esc(p.buttonText || 'Select plan')}</a>`
      : `<a class="btn plan-btn js-demo" href="${esc(BOC.demoUrl())}" target="_blank" rel="noopener">${esc(p.buttonText || 'Select plan')}</a>`;
    const img = p.image
      ? `<span class="plan-ico"><img src="${esc(p.image)}" alt="" loading="lazy"></span>`
      : `<span class="plan-ico"><i class="fa-solid ${p.type === 'vm' ? 'fa-server' : 'fa-user'}"></i></span>`;
    return `
    <article class="plan c-${esc(p.color || 'sky')}${p.badge ? ' has-badge' : ''}">
      <div class="plan-top">
        ${p.badge ? `<span class="plan-badge">${esc(p.badge)}</span>` : ''}
        <h4>${esc(p.name)}</h4>
        ${img}
        <p class="plan-price">${esc(p.price)}</p>
        <p class="plan-period">${esc(p.period)}</p>
      </div>
      <div class="plan-body">
        ${p.highlight ? `<p class="chip chip-spec"><i class="fa-solid fa-microchip"></i>${esc(p.highlight)}</p>` : ''}
        <ul class="plan-list">${features}</ul>
        ${p.usersLine ? `<p class="chip chip-users"><i class="fa-solid fa-users"></i>${esc(p.usersLine)}</p>` : ''}
        ${p.note ? `<p class="plan-note">${esc(p.note)}</p>` : ''}
        ${cta}
      </div>
    </article>`;
  }

  function renderPlans() {
    const list = BOC.data.products.filter(p => p.visible !== false);
    const users = list.filter(p => p.type !== 'vm');
    const vms = list.filter(p => p.type === 'vm');
    const uEl = document.getElementById('userPlans');
    const vEl = document.getElementById('vmPlans');
    uEl.innerHTML = users.map(planCard).join('');
    vEl.innerHTML = vms.map(planCard).join('');
    uEl.previousElementSibling.hidden = !users.length;
    uEl.hidden = !users.length;
    vEl.previousElementSibling.hidden = !vms.length;
    vEl.hidden = !vms.length;
    document.getElementById('plansEmpty').hidden = list.length > 0;
  }

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const mq = matchMedia('(max-width: 900px)');
  function syncNavA11y() {
    /* closed drawer par links tab se na khulen: sirf mobile me inert */
    const closed = mq.matches && !nav.classList.contains('open');
    if (closed) nav.setAttribute('inert', ''); else nav.removeAttribute('inert');
  }
  function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('no-scroll', open);
    syncNavA11y();
  }
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', e => { if (e.target.closest('a,button')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); burger.focus(); } });
  const onMq = () => { if (!mq.matches) setMenu(false); syncNavA11y(); };
  mq.addEventListener ? mq.addEventListener('change', onMq) : mq.addListener(onMq);
  syncNavA11y();

  /* ---------- Header shadow on scroll + back to top ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  document.getElementById('toTop').addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Start ---------- */
  BOC.loadRemote(false).catch(error => {
    console.error('Shared site data load nahi ho paya:', error);
  }).finally(() => {
    refreshSiteData();
  });

  window.addEventListener('storage', event => {
    if (event.key === BOC.KEY) refreshSiteData();
  });
  window.addEventListener('boc:data-updated', refreshSiteData);

  /* ---------- Interface Preview: Auto-sliding Carousel ---------- */
  (function initSlider() {
    const slider = document.querySelector('.shots-slider');
    if (!slider) return;
    const track = slider.querySelector('.shots-track');
    const slides = slider.querySelectorAll('.shot-slide');
    const dotsWrap = slider.querySelector('.shot-dots');
    const prevBtn = slider.querySelector('.shot-prev');
    const nextBtn = slider.querySelector('.shot-next');
    let current = 0;
    const total = slides.length;
    const AUTO_MS = 3500; // 3.5 seconds auto-slide
    let timer;

    // Create dots
    for (let i = 0; i < total; i++) {
      const d = document.createElement('button');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(d);
    }
    const dots = dotsWrap.querySelectorAll('.dot');

    function goTo(idx) {
      current = ((idx % total) + total) % total;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
      resetTimer();
    }

    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(function () { goTo(current + 1); }, AUTO_MS);
    }

    prevBtn.addEventListener('click', function () { goTo(current - 1); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); });

    // Swipe support
    var sx = 0;
    slider.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; });
    slider.addEventListener('touchend', function (e) {
      var diff = sx - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
    });

    // Pause on hover
    slider.addEventListener('mouseenter', function () { clearInterval(timer); });
    slider.addEventListener('mouseleave', function () { resetTimer(); });

    resetTimer();
  })();
})();
