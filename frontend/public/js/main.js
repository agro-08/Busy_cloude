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
    document.documentElement.setAttribute('data-theme', S().theme === 'night' ? 'night' : 'sky');
    document.querySelectorAll('[data-set]').forEach(el => {
      const v = S()[el.dataset.set];
      if (v !== undefined && v !== '') el.textContent = v;
    });
    document.querySelectorAll('.js-demo').forEach(a => { a.href = BOC.demoUrl(); });
    document.getElementById('year').textContent = new Date().getFullYear();
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
  function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
  }
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', e => { if (e.target.closest('a,button')) setMenu(false); });
  window.addEventListener('resize', () => { if (innerWidth > 900) setMenu(false); });

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
